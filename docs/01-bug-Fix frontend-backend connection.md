---
name: Fix frontend-backend connection
overview: Diagnose why the Next.js frontend can’t reach the Express/Socket.io backend, then fix URL/port + CORS mismatches so chat SSE (`/api/chat/stream`) and dashboard Socket.io both work in local dev and Replit.
todos:
  - id: diagnose-network-target
    content: Confirm whether `/api/chat/stream` is hitting Next (404) vs backend (200/500) via browser Network + backend `/health`.
    status: pending
  - id: fix-api-url-config
    content: Correct `NEXT_PUBLIC_API_URL` (especially in `.replit`) so it points to the backend origin including port 3001 and https where needed.
    status: pending
  - id: fix-socketio-cors
    content: "Update backend Socket.io CORS (`src/backend/src/websocket/socket.ts`) to allow the real frontend origin (port 5000 + Replit https domain), ideally via `origin: true` or an env-driven allowlist."
    status: pending
  - id: harden-backend-port-binding
    content: Make backend use `BACKEND_PORT ?? PORT ?? 3001` to avoid binding to the wrong port in some environments.
    status: pending
  - id: verify-end-to-end
    content: Restart servers cleanly, then verify chat SSE and dashboard Socket.io connectivity using `/health` and the UI.
    status: pending
isProject: false
---

# Fix frontend↔backend connectivity (chat + dashboard)

## What’s happening (based on current code/config)

- **Chat failure is most likely a bad API base URL**.
- Frontend chat calls `POST ${API_BASE_URL}/api/chat/stream` in [`src/frontend/src/components/chat/MainContainer.tsx`](src/frontend/src/components/chat/MainContainer.tsx).
- `API_BASE_URL` is `process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"`.
- In Replit, `.replit` currently sets `NEXT_PUBLIC_API_URL` to the *frontend* URL **without `:3001`**, so the request goes to the Next.js server (port 80/443) instead of the backend (port 3001) → likely `404`/failure → frontend shows the generic “backend server is running” error.

- **Dashboard live updates will also fail due to Socket.io CORS**.
- Backend Socket.io CORS allowlist is hardcoded to `http://localhost:3000` + `http://127.0.0.1:3000` in [`src/backend/src/websocket/socket.ts`](src/backend/src/websocket/socket.ts).
- Frontend actually runs on **port 5000** (see [`src/frontend/package.json`](src/frontend/package.json)), and on Replit it’s **https + a replit.dev domain**, so Socket.io handshake will be rejected.

## Plan

- **1) Confirm the failure mode (fast, high-signal)**
- In browser devtools **Network**, inspect the failing request to `/api/chat/stream`:
  - verify the **full URL** it’s hitting (host + port)
  - note the **status** (common outcomes: `404` if it hit Next, or network error/CORS if it can’t reach backend)
- Hit backend health endpoint directly: `GET <backendOrigin>/health` (backend provides this in [`src/backend/src/index.ts`](src/backend/src/index.ts)).

- **2) Fix the frontend→backend base URL (chat + Socket.io)**
- Make `NEXT_PUBLIC_API_URL` point to the **backend origin**, including port **3001**.
  - Replit-style example: `https://<your-replit-domain>:3001`
  - Local example: `http://localhost:3001`
- Update Replit config in [`.replit`](.replit) accordingly and update docs in [`replit.md`](replit.md).

- **3) Fix Socket.io CORS to match the real frontend origin**
- Update [`src/backend/src/websocket/socket.ts`](src/backend/src/websocket/socket.ts) so Socket.io accepts:
  - `http://localhost:5000` / `http://127.0.0.1:5000`
  - your Replit https origin
- Preferred approach for this demo (lowest friction): set Socket.io CORS to **`origin: true`** (mirrors Express CORS in [`src/backend/src/index.ts`](src/backend/src/index.ts)).
- If you want stricter security, instead read an allowlist from an env var like `FRONTEND_ORIGIN` and keep localhost defaults.

- **4) Make backend port binding more deployment-safe (prevents “backend not running” in some hosts)**
- In [`src/backend/src/index.ts`](src/backend/src/index.ts), resolve port as:
  - `process.env.BACKEND_PORT ?? process.env.PORT ?? 3001`
- This supports environments that only set `PORT`.

- **5) Reduce duplication + avoid repeating this misconfig (small frontend refactor)**
- Centralize the API base URL logic used by both:
  - [`src/frontend/src/components/chat/MainContainer.tsx`](src/frontend/src/components/chat/MainContainer.tsx)
  - [`src/frontend/src/hooks/useWebSocket.ts`](src/frontend/src/hooks/useWebSocket.ts)
- Put it in a tiny helper (e.g. `src/frontend/src/lib/apiBaseUrl.ts`) so chat + dashboard always share the same correct origin.

- **6) Verification (after changes)**
- Kill any running dev servers using ports **3001** and **5000**, then start fresh.
- Validate:
  - `GET <backendOrigin>/health` returns `{ status: "ok" ... }`
  - chat streaming works (no generic error message)
  - dashboard Socket.io connects (`connectedClients` increments in `/health`)