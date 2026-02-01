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
adcp-demo/
├── src/
│   ├── frontend/          # Next.js 14 chat interface
│   │   └── src/
│   │       ├── app/       # Next.js pages
│   │       └── components/
│   │           ├── chat/  # Chat UI components
│   │           └── ui/    # Shared UI components
│   └── backend/           # Express + Claude API server
│       └── src/
│           ├── routes/    # API endpoints
│           ├── tools/     # 7 AdCP tools
│           └── data/      # Data loader
├── data/
│   └── adcp_demo_complete_data.json  # Mock campaign data
└── package.json           # Workspace root
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

- **Streaming Responses** - Real-time Claude responses via WebSocket
- **Model Selection** - Choose between Sonnet 4.5, Opus 4.5, or Haiku 4.5
- **Markdown Rendering** - Rich formatted responses with tables
- **Artifact Panel** - Side panel for tables and reports
- **Conversation History** - Persistent chat sessions
- **Dark/Light Mode** - Theme toggle support

## Architecture

```
┌─────────────────┐     WebSocket     ┌─────────────────┐
│                 │◄──────────────────│                 │
│  Next.js 14     │                   │  Express API    │
│  Frontend       │───────────────────►│  Backend        │
│  (Port 5000)    │      REST API     │  (Port 3001)    │
│                 │                   │                 │
└─────────────────┘                   └────────┬────────┘
                                               │
                                               │ Claude API
                                               ▼
                                      ┌─────────────────┐
                                      │                 │
                                      │  Anthropic      │
                                      │  Claude API     │
                                      │                 │
                                      └─────────────────┘
```

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

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | - | Your Anthropic API key |
| `BACKEND_PORT` | No | 3001 | Backend server port |

## Troubleshooting

### "ANTHROPIC_API_KEY is not set"
Create `src/backend/.env` with your API key.

### Frontend can't connect to backend
Ensure both servers are running. Check that ports 5000 and 3001 are available.

### Tool responses are empty
Verify the mock data file exists at `data/adcp_demo_complete_data.json`.

## License

MIT
