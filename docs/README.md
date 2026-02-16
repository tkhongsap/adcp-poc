# ADCP Demo Documentation Index

This `docs/` directory uses a standard structure and naming convention.

## Naming convention

- Lowercase `kebab-case` filenames
- Markdown docs end with `.md`
- Documents are grouped by topic folder

## Structure

- `architecture/`
  - `architecture-analysis.md`
  - `system-overview.md`
  - `realtime-events.md`
- `api/`
  - `api-contracts.md`
  - `tool-contract-details.md`
- `operations/`
  - `deployment-runbook.md`
  - `frontend-backend-connection-fix-plan.md`
  - `dashboard-fix-plan.md`
- `product/`
  - `prd-s42-lab-adcp-sales-demo.md`
  - `prd-adcp-sales-demo-comprehensive.md`
  - `adcp-notification-agents-spec-v2.md`
- `research/`
  - `adcp-overview-reference.md`
  - `ai-in-advertising-adcp-vs-artf.md`
- `assets/`
  - `adcp-sales-agent-demo-prd-v4.docx`
  - `ai-in-advertising-adcp-vs-artf.pdf`

## Recommended reading order

1. `architecture/system-overview.md`
2. `api/api-contracts.md`
3. `api/tool-contract-details.md`
4. `architecture/realtime-events.md`
5. `operations/deployment-runbook.md`

## Runtime entry points

- Frontend app: `npm run dev:frontend`
- Backend app: `npm run dev:backend`
- Both: `npm run dev`

## Backend endpoints to know

- Chat: `/api/chat`, `/api/chat/stream`, `/api/chat/conversations`
- Tools: `/api/tools`, `/api/tools/:toolName`
- Notifications: `/api/notifications/*`
- Health: `/health`

## Realtime events to know

- Server to client: `initial_state`, `media_buy_updated`, `media_buy_created`, `feedback_submitted`
- Client to server: `request_state`
