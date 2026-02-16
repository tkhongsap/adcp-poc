# Deployment / Runbook

Use this for running the ADCP demo locally and preparing a clean smoke check.

## 1) Prerequisites

- Node.js `>=18`
- npm available (workspace scripts used)
- `ANTHROPIC_API_KEY` for real LLM responses

## 2) Install

From repo root:

```bash
npm install
```

This resolves workspace dependencies for both `src/frontend` and `src/backend`.

## 3) Environment

Create `.env` inside `src/backend`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
# optional
BACKEND_PORT=3001
SLACK_WEBHOOK_URL=...
SLACK_CHANNEL_NAME=...
RESEND_API_KEY=...
EMAIL_FROM=no-reply@...
DEMO_EMAIL_RECIPIENT=demo@example.com
DASHBOARD_URL=...
```

Frontend optional env:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 4) Start services

At repo root:

```bash
npm run dev
```

This launches:
- backend: `http://localhost:3001`
- frontend: `http://localhost:5000`

Alternative single-service starts:

```bash
npm run dev:backend
npm run dev:frontend
```

## 5) Smoke verification

### API health

```bash
curl -s http://localhost:3001/health | jq
```

Expect:
- `status: "ok"`
- `dataLoaded: true`
- websocket initialized metadata present

### Tool list

```bash
curl -s http://localhost:3001/api/tools | jq
```

Expect 7 tools including:
`get_products`, `list_creative_formats`, `list_authorized_properties`, `create_media_buy`, `get_media_buy_delivery`, `update_media_buy`, `provide_performance_feedback`.

### Chat stream (basic)

```bash
curl -N \
  -H "Content-Type: application/json" \
  --data '{"message":"Show me available display products","model":"claude-sonnet-4-5-20250929"}' \
  http://localhost:3001/api/chat/stream
```

Expect SSE `start`, `text`, and `done` events.

## 6) UI checks

- Open `http://localhost:5000`
- Open dashboard `http://localhost:5000/dashboard`
- Confirm:
  - sidebar appears
  - message compose and send works
  - campaign cards/table render
  - websocket shows connected status
  - websocket updates appear after mutation-like operations

## 7) Testing

Use provided Playwright suites:

```bash
npm test
```

Important test groups:
- API contract tests: `tests/api.spec.ts`
- Tool tests: `tests/tools.spec.ts`
- Chat UI smoke: `tests/chat.spec.ts`
- Dashboard UI smoke: `tests/dashboard.spec.ts`

## 8) Common run issues

- **Anthropic key missing**
  - chat tool output may fail or return auth-like errors.
  - Configure `ANTHROPIC_API_KEY` in `src/backend/.env`.
- **Frontend cannot reach backend**
  - confirm `NEXT_PUBLIC_API_URL` points to backend host
  - ensure both servers running
- **No websocket updates**
  - check browser console for socket connection errors
  - ensure CORS policy allows dev host; backend currently allows origin `true` in Express + Socket.io.
- **Notification actions seem missing**
  - they require optional env vars; otherwise simulated/disabled behavior is expected.

## 9) Production-oriented notes

- Chat history is stored in `data/conversations/*.json` and survives process restarts.
- Campaign data (`media_buys`, `delivery_metrics`) is in-memory and is reloaded from seed JSON on start.
- Slack/email services are optional; failures in notification channels should not block successful campaign updates.

## 10) Useful operational commands

- Rebuild:
  ```bash
  npm run build
  ```
- Typecheck:
  ```bash
  npm run typecheck
  ```
- Lint frontend:
  ```bash
  npm run lint
  ```

