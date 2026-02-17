# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ADCP Sales Demo — a Claude-powered AI sales agent for programmatic advertising campaign management. Built for Signal42.ai to demonstrate AI-driven media buying through the Ad Context Protocol (AdCP). The agent supports three phases: DISCOVER (inventory), MONITOR (performance), and OPTIMISE (adjustments).

**Scale:** 6 advertising platforms, 27 campaigns across 9 brands, 47 products.

## Development Commands

```bash
npm install                # Install all dependencies (both workspaces)
npm run dev                # Start frontend + backend concurrently
npm run dev:frontend       # Frontend only (Next.js on port 5000)
npm run dev:backend        # Backend only (Express on port 3001)
npm run build              # Build both workspaces
npm run typecheck          # TypeScript strict check for frontend + backend
npm run lint               # ESLint for frontend only

# Testing (Playwright)
npm run test               # Run all tests
npm run test:tools         # Tool integration tests only
npm run test:chat          # Chat UI tests only
npm run test:dashboard     # Dashboard tests only
npm run test:api           # API tests only
npm run test:report        # View test report in browser
npx playwright test tests/multi-platform.spec.ts  # Multi-platform tests
```

Backend uses `tsx watch` for dev hot-reload.

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
- **`tools/`** — Each tool in its own file, exported from `index.ts`. All tools support platform filtering via optional `platform` parameter.
- **`data/loader.ts`** — Loads multi-platform data from `data/platforms/*.json` files on startup. Supports platform filtering via `getProductsByPlatform()` and `getDeliveryMetrics(mediaBuyId, platform)`. Falls back to legacy `data/adcp_demo_complete_data.json` if platform files don't exist.
- **`data/conversationStore.ts`** — Persists conversations to `data/conversations/` on disk.
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

## Multi-Platform Data Architecture

### Platform Structure

Data is organized in `data/platforms/` with one JSON file per platform:
- `display_programmatic.json` — Original 5 campaigns, 10 products (programmatic display/video)
- `facebook_ads.json` — 5 campaigns, 8 products (Facebook/Instagram ads)
- `google_ads.json` — 5 campaigns, 9 products (Google Ads, YouTube, Discovery)
- `social_influencer.json` — 4 campaigns, 6 products (influencer partnerships)
- `car_sales.json` — 4 campaigns, 7 products (car dealership advertising)
- `crm_data.json` — 4 campaigns, 7 products (CRM outcomes/attribution)

**Total:** 27 campaigns, 47 products across 6 platforms

### Platform-Specific Metrics

Each platform includes `platform_specific_metrics` in delivery data:
- **Facebook:** `roas`, `engagement_rate`, `frequency`, `reach`, `cost_per_lead`
- **Google Ads:** `quality_score`, `impression_share`, `search_ctr`, `youtube_view_rate`
- **Influencer:** `influencer_tier`, `follower_count`, `engagement_rate`, `audience_demographics`
- **CRM:** `lead_quality_score`, `attribution_source`, `email_open_rate`, `landing_page_conversion`

### Data Loading

The loader (`data/loader.ts`):
1. Checks for `data/platforms/` directory
2. Loads all 6 platform JSON files and merges them
3. Deduplicates creative formats and properties
4. Computes portfolio aggregations (spend by platform, spend by brand)
5. Falls back to legacy single-file data if platform directory doesn't exist

**Key functions:**
- `getProductsByPlatform(platform)` — Filter products by platform
- `getDeliveryMetrics(mediaBuyId?, platform?)` — Filter campaigns by platform
- `getAggregations()` — Portfolio totals with platform/brand breakdowns

## Tool Capabilities

All 7 tools support platform filtering:

| Tool | Platform Filter | Description |
|------|-----------------|-------------|
| `get_products` | ✅ Yes | Browse inventory by platform (e.g., `platform: "facebook_ads"`) |
| `list_creative_formats` | ✅ Yes | View ad formats filtered by platform |
| `list_authorized_properties` | ✅ Yes | See properties filtered by platform |
| `get_media_buy_delivery` | ✅ Yes | Check performance by platform or media_buy_id |
| `create_media_buy` | Optional | Create campaigns (platform auto-detected from product) |
| `update_media_buy` | N/A | Adjust campaigns by media_buy_id |
| `provide_performance_feedback` | N/A | Submit conversion data by media_buy_id |

**Platform values:** `display_programmatic`, `facebook_ads`, `google_ads`, `social_influencer`, `car_sales`, `crm_data`

## Testing Infrastructure

### Playwright Tests

Located in `tests/` directory:
- **`api.spec.ts`** — API endpoint tests
- **`chat.spec.ts`** — Chat UI E2E tests (requires frontend server)
- **`dashboard.spec.ts`** — Dashboard UI E2E tests (requires frontend server)
- **`tools.spec.ts`** — Tool integration tests (12 tests covering all 7 tools)
- **`multi-platform.spec.ts`** — Multi-platform data tests (25 tests covering platform filtering, backward compatibility, cross-platform queries)

**Running tests:** Backend server must be running on port 3001 for tool/API tests. Frontend on port 5000 for UI tests.

**Test categories:**
1. Platform filtering (products and delivery metrics)
2. Backward compatibility (original 5 campaigns still work)
3. Cross-platform brand queries (aggregate by brand)
4. Platform-specific metrics validation
5. Data integrity (uniqueness, platform fields)

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

## Brand-to-Campaign Mappings

The system prompt includes mappings for natural language brand resolution. Key campaigns:

**Multi-platform brands:**
- **Apex Motors** — Display (`mb_apex_motors_q1`), Facebook (`mb_fb_apex_motors`), Google (`mb_gads_apex_motors`), Car Sales (`mb_car_apex_motors`, `mb_car_apex_service`)
- **TechFlow SaaS** — Display (`mb_techflow_saas`), Google (`mb_gads_techflow`), CRM (`mb_crm_techflow`)
- **FinanceFirst Bank** — Display (`mb_financefirst_bank`), Google (`mb_gads_financefirst`), CRM (`mb_crm_financefirst`)

**Single/dual platform brands:**
- **SportMax Apparel** — Display (`mb_sportmax_apparel`), Facebook (`mb_fb_sportmax`), Influencer (`mb_infl_sportmax_micro`, `mb_infl_sportmax_macro`)
- **GreenEnergy Co** — Display (`mb_greenenergy`), Facebook (`mb_fb_greenenergy`), Car Sales (`mb_car_greenenergy`)
- **FreshBite Foods** — Facebook (`mb_fb_freshbite`), Google (`mb_gads_freshbite`), Influencer (`mb_infl_freshbite`)
- **LuxeBeauty** — Facebook (`mb_fb_luxebeauty`), Influencer (`mb_infl_luxebeauty`), CRM (`mb_crm_luxebeauty`)
- **UrbanLiving Real Estate** — Google (`mb_gads_urbanliving`), Car Sales (`mb_car_urbanliving`), CRM (`mb_crm_urbanliving`)

**Note:** When user says "Apex Motors campaign" without platform specification, resolves to `mb_apex_motors_q1` (display) for backward compatibility.

## Embedded Optimization Opportunities

The synthetic data includes deliberate inefficiencies for the AI to discover:

1. **Apex Motors Facebook** (`mb_fb_apex_motors`) — Audience Network underperforming vs Feed/Stories
2. **TechFlow Google** (`mb_gads_techflow`) — Broad match keywords with low quality score (3-4) consuming 40% budget at $354 CPA, while exact match delivers $68.50 CPA
3. **SportMax Influencer** — Macro influencer campaign less efficient than micro ($176 vs $113 CPA)
4. **FinanceFirst CRM** — High email open rate (32%) but low conversion (2.8%) suggests landing page issues
5. **GreenEnergy Facebook** — Video ads (Reels) significantly outperforming static (Feed)

## Project Documentation

Key documents in `tasks/`:
- **`001-prd-adcp-sales-demo.md`** — Original PRD for the ADCP demo
- **`002-prd-notification-agents.md`** — Notification system design
- **`007-prd-multi-platform-data-scale-up.md`** — Multi-platform expansion PRD
- **`README.md`** — Tasks inventory and progress tracking

## TypeScript Types

Key types in `src/backend/src/types/data.ts`:
- `Platform` — Enum of 6 platform values
- `Product` — Inventory items with `platform` field
- `MediaBuy` — Campaigns with `platform` field
- `DeliveryMetrics` — Performance data with `platform` and `platform_specific_metrics`
- `PlatformSpecificMetrics` — Union type of platform-specific metric interfaces

When adding new platforms or extending data, update these types first and run `npm run typecheck` to ensure type safety.

## Performance Characteristics

- **Data loading:** ~2-3ms (all 6 platforms, 47 products, 27 campaigns)
- **Platform filtering:** <0.01ms per query
- **Tool execution:** 50-200ms (includes Claude API call)
- **WebSocket broadcast:** <10ms
- **SSE streaming:** Real-time

The in-memory data architecture ensures sub-millisecond query performance even with 50+ campaigns.

## Git Commit Conventions

When creating commit messages:
- Use clear, descriptive commit messages in imperative mood (e.g., "Add multi-platform testing suite" not "Added tests")
- **DO NOT** include `🤖 Generated with [Claude Code](https://claude.com/claude-code)` attribution in commit messages
- **DO NOT** include `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>` trailer in commits
- Follow existing commit style (see `git log` for examples)
- Keep subject line under 72 characters
- Use blank line between subject and body if adding details

## Development Workflow

When modifying the data layer:
1. Update TypeScript types in `src/backend/src/types/data.ts`
2. Run `npm run typecheck` to verify type safety
3. Update platform JSON files in `data/platforms/`
4. Run tool integration tests: `npm run test:tools`
5. Run multi-platform tests: `npx playwright test tests/multi-platform.spec.ts`
6. Test manually via chat UI with platform-specific queries

When modifying tools:
1. Update tool implementation in `src/backend/src/tools/`
2. Update tool schema in `src/backend/src/claude/client.ts` if signature changes
3. Update system prompt in `src/backend/src/claude/client.ts` if behavior changes
4. Run `npm run test:tools` to verify backward compatibility
5. Test with Claude via chat UI

## Ralph Loop (Autonomous Agent)

The `scripts/ralph/` directory contains configuration for an autonomous coding agent that iterates through user stories in `prd.json`. Progress is tracked in `progress.txt` (read the "Codebase Patterns" section at the top before starting work).
