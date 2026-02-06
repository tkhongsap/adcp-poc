# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ADCP Sales Demo — a Claude-powered AI sales agent for programmatic advertising campaign management. Built for Signal42.ai to demonstrate AI-driven media buying through the Ad Context Protocol (AdCP). The agent supports three phases: DISCOVER (inventory), MONITOR (performance), and OPTIMISE (adjustments).

## Development Commands

```bash
npm install                # Install all dependencies (both workspaces)
npm run dev                # Start frontend + backend concurrently
npm run dev:frontend       # Frontend only (Next.js on port 5000)
npm run dev:backend        # Backend only (Express on port 3001)
npm run build              # Build both workspaces
npm run typecheck          # TypeScript strict check for frontend + backend
npm run lint               # ESLint for frontend only
```

Backend uses `tsx watch` for dev hot-reload. No test runner is configured — use `node test-queries.mjs` for manual API smoke tests.

## Architecture

**npm workspaces** monorepo with two packages:
- `src/frontend` — Next.js 14 (App Router), Tailwind CSS, Socket.io client
- `src/backend` — Express + TypeScript, Claude API (`@anthropic-ai/sdk`), Socket.io server

### Data Flow

```
User → Chat UI → POST /api/chat/stream (SSE) → Claude API (with 7 tools)
                                                      ↓
                                               Tool execution
                                                      ↓
                                          WebSocket broadcast → Dashboard + Chat UI
```

1. Frontend sends user message to `/api/chat/stream` with optional `model` and `conversationId`
2. Backend streams Claude's response via SSE, executing tools iteratively until `stop_reason !== 'tool_use'`
3. Tool side effects (create/update campaigns) trigger Socket.io broadcasts (`media_buy_updated`, `media_buy_created`)
4. Frontend receives real-time updates via `useWebSocket` hook
5. `artifactDetection.ts` decides whether tool results render as a table artifact, report artifact, or inline

### Backend Key Modules

- **`claude/client.ts`** — Claude API integration with streaming. Defines all 7 tool schemas, system prompt, and the tool execution loop. Models: Sonnet 4.5 (default), Opus 4.5, Haiku 4.5.
- **`tools/`** — Each tool in its own file, exported from `index.ts`. Tools operate on in-memory data loaded from `data/adcp_demo_complete_data.json`.
- **`data/loader.ts`** — Loads mock JSON data on startup into memory. `conversationStore.ts` persists conversations to `data/conversations/` on disk.
- **`services/`** — `notificationService.ts` orchestrates Slack webhook + Resend email notifications, triggered by `update_media_buy`.
- **`websocket/socket.ts`** — Socket.io server; use `getIO()` to access the instance from anywhere in backend code.

### Frontend Key Modules

- **`components/chat/MainContainer.tsx`** — Top-level orchestrator managing chat state, WebSocket, artifact panel, and conversation history.
- **`hooks/useWebSocket.ts`** — Connects to backend Socket.io, receives `initial_state` on connect, then live campaign updates.
- **`hooks/useChatHistory.ts`** — Persists/loads conversations from backend API.
- **`utils/artifactDetection.ts`** — Maps tool call names to artifact types: `get_products`/`list_creative_formats`/`list_authorized_properties` → table; `get_media_buy_delivery` (single) → report; mutations → inline.
- **`components/artifacts/`** — `TableArtifact` and `ReportArtifact` renderers with pacing bars, health badges, sorting.

### Styling

Claude.ai-inspired color palette defined in `tailwind.config.ts`: cream (#F5F4EF), orange (#DA7756), border (#E5E4DF), text-primary (#1A1915). Dark mode via `next-themes`. Fonts: Geist Sans/Mono (local).

## Environment Variables

Backend reads from `src/backend/.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `BACKEND_PORT` | No | Backend port (default 3001) |
| `SLACK_WEBHOOK_URL` | No | Slack incoming webhook |
| `RESEND_API_KEY` | No | Resend email API key |
| `EMAIL_FROM` | No | Sender email address |
| `DEMO_EMAIL_RECIPIENT` | No | Recipient for notification emails |
| `DASHBOARD_URL` | No | Dashboard URL included in Slack messages |

## Campaign ID Mappings

Hardcoded brand-to-ID mappings used by the system prompt and tools:
- Apex Motors → `mb_apex_motors_q1`
- TechFlow → `mb_techflow_saas`
- SportMax → `mb_sportmax_apparel`
- FinanceFirst → `mb_financefirst_bank`
- GreenEnergy → `mb_greenenergy`

## Ralph Loop (Autonomous Agent)

The `scripts/ralph/` directory contains configuration for an autonomous coding agent that iterates through user stories in `prd.json`. Progress is tracked in `progress.txt` (read the "Codebase Patterns" section at the top before starting work).
