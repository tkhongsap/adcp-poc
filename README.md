# ADCP Sales Agent Demo

A Claude-powered AI sales agent for programmatic advertising campaign management. Built for Signal42.ai to demonstrate AI-driven media buying through the Ad Context Protocol (AdCP).

## Overview

This demo showcases an intelligent conversational interface for managing digital advertising campaigns across the complete lifecycle:

- **DISCOVER** - Explore available inventory, creative formats, and publisher properties
- **MONITOR** - Track campaign performance, delivery metrics, and pacing
- **OPTIMISE** - Adjust bids, targeting, and budgets in real-time

## Prerequisites

- **Node.js 18+** (check with `node --version`)
- **npm** (comes with Node.js)
- **Anthropic API Key** (get one at https://console.anthropic.com)

## Quick Start

### 1. Clone and Install

```bash
# Install all dependencies (frontend + backend)
npm install
```

### 2. Configure Environment

Create a `.env` file in the `src/backend` directory:

```bash
# src/backend/.env
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 3. Run the Application

```bash
# Start both frontend and backend concurrently
npm run dev
```

This launches:
- **Frontend**: http://localhost:5000
- **Backend**: http://localhost:3001

## Project Structure

```
adcp-poc/
├── src/
│   ├── frontend/              # Next.js 14 (App Router)
│   │   └── src/
│   │       ├── app/           # Pages: /, /dashboard
│   │       ├── components/
│   │       │   ├── chat/      # Chat UI (MainContainer, ConversationView, MessageInput, etc.)
│   │       │   ├── dashboard/ # Live dashboard (DashboardLayout, MediaBuysTable, CampaignCard, etc.)
│   │       │   ├── artifacts/ # TableArtifact, ReportArtifact renderers
│   │       │   ├── ui/        # Shared components (HealthBadge, BudgetBar, GeoChips, etc.)
│   │       │   └── providers/ # ThemeProvider
│   │       ├── hooks/         # useWebSocket, useChatHistory
│   │       ├── utils/         # artifactDetection (maps tool calls → artifact types)
│   │       └── types/         # Message, Artifact, TableArtifactData, ReportArtifactData
│   │
│   └── backend/               # Express + TypeScript
│       └── src/
│           ├── claude/        # Claude API client, tool definitions, streaming
│           ├── routes/        # /api/chat, /api/tools, /api/notifications
│           ├── tools/         # 7 AdCP tools (one file each)
│           ├── services/      # Slack webhook + Resend email notifications
│           ├── websocket/     # Socket.io server for real-time broadcasts
│           ├── data/          # JSON data loader + conversation persistence
│           └── types/         # Product, MediaBuy, DeliveryMetrics, etc.
│
├── data/
│   ├── adcp_demo_complete_data.json  # Mock campaign data
│   └── conversations/                # Persisted chat sessions
└── package.json                      # npm workspaces root
```

## Available Tools

The agent has access to 7 tools for campaign management:

| Tool | Phase | Description |
|------|-------|-------------|
| `get_products` | DISCOVER | Browse available inventory and pricing |
| `list_creative_formats` | DISCOVER | View supported ad formats and specs |
| `list_authorized_properties` | DISCOVER | See accessible publisher properties |
| `create_media_buy` | DISCOVER→BUY | Create new campaigns |
| `get_media_buy_delivery` | MONITOR | Check campaign performance |
| `update_media_buy` | OPTIMISE | Adjust bids, targeting, budgets |
| `provide_performance_feedback` | OPTIMISE | Submit conversion data |

## Demo Walkthrough

### Phase 1: DISCOVER

Explore available inventory and capabilities:

```
"What sports inventory do you have?"
"Find inventory under $20 CPM"
"What video formats do you support?"
"What publishers can I access?"
```

### Phase 2: MONITOR

Check campaign performance and health:

```
"Show me all active campaigns"
"How is Apex Motors performing?"
"Break down Apex by device"
"Which campaigns are underperforming?"
```

### Phase 3: OPTIMISE

Make adjustments based on performance:

```
"Reduce Apex mobile bid by 20%"
"Pause Germany targeting for Apex"
"Submit our conversion data for Apex"
```

## Demo Campaigns

The demo includes 5 pre-configured active campaigns:

| Campaign | Brand | Budget | Status |
|----------|-------|--------|--------|
| Apex Motors Q1 | Apex Motors | $50,000 | Active (Poor pacing) |
| TechFlow SaaS | TechFlow | $25,000 | Active (Overspending) |
| SportMax Spring | SportMax Apparel | $35,000 | Active (On track) |
| FinanceFirst Q1 | FinanceFirst Bank | $40,000 | Active (On track) |
| GreenEnergy 2026 | GreenEnergy Co | $20,000 | Active (On track) |

## Features

- **Streaming Responses** - Real-time Claude responses via Server-Sent Events (SSE)
- **Model Selection** - Choose between Sonnet 4.5, Opus 4.5, or Haiku 4.5
- **Artifact Panel** - Side panel with auto-detected table and report artifacts based on tool calls
- **Live Dashboard** - Real-time campaign monitoring at `/dashboard` with cards/table views, pacing bars, and health badges, updated via WebSocket (Socket.io)
- **Notifications** - Slack webhook and email (Resend) notifications triggered on campaign updates
- **Conversation History** - Persistent chat sessions saved to disk
- **Markdown Rendering** - Rich formatted responses with GFM tables
- **Dark/Light Mode** - Theme toggle support

## Architecture

```
┌─────────────────┐  Socket.io (live) ┌─────────────────┐
│                 │◄──────────────────│                 │
│  Next.js 14     │                   │  Express API    │──────► Slack Webhook
│  Frontend       │──── SSE stream ──►│  Backend        │──────► Resend Email
│  (Port 5000)    │  POST /api/chat   │  (Port 3001)    │
│                 │                   │                 │
│  /  (Chat)      │                   └────────┬────────┘
│  /dashboard     │                            │
└─────────────────┘                            │ Claude API
                                               ▼
                                      ┌─────────────────┐
                                      │  Anthropic      │
                                      │  Claude API     │
                                      │  (with 7 tools) │
                                      └─────────────────┘
```

- **Chat streaming**: Frontend sends messages via `POST /api/chat/stream`, backend streams Claude's response as SSE, executing tools iteratively until complete
- **Real-time updates**: Campaign mutations (create/update) broadcast via Socket.io to all connected clients (chat UI + dashboard)
- **Notifications**: `update_media_buy` triggers Slack and email notifications via backend services

## Development Commands

```bash
# Run both frontend and backend
npm run dev

# Run only frontend
npm run dev:frontend

# Run only backend
npm run dev:backend

# Build for production
npm run build

# Type checking
npm run typecheck

# Lint frontend
npm run lint
```

## Environment Variables

Configure in `src/backend/.env`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | - | Your Anthropic API key |
| `BACKEND_PORT` | No | 3001 | Backend server port |
| `SLACK_WEBHOOK_URL` | No | - | Slack incoming webhook for campaign notifications |
| `SLACK_CHANNEL_NAME` | No | #adcp-demo | Target Slack channel |
| `RESEND_API_KEY` | No | - | Resend API key for email notifications |
| `EMAIL_FROM` | No | - | Sender email address |
| `DEMO_EMAIL_RECIPIENT` | No | - | Recipient for notification emails |
| `DASHBOARD_URL` | No | - | Dashboard URL included in Slack messages |

## Troubleshooting

### "ANTHROPIC_API_KEY is not set"
Create `src/backend/.env` with your API key.

### Frontend can't connect to backend
Ensure both servers are running. Check that ports 5000 and 3001 are available.

### Tool responses are empty
Verify the mock data file exists at `data/adcp_demo_complete_data.json`.

## License

MIT
