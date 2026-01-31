# S42 Labs: Product Requirements Document

## AdCP Sales Agent Demo — Comprehensive Specification

| Field | Value |
|-------|-------|
| **Product Name** | AdCP Sales Agent Demo |
| **Version** | 5.2 |
| **Status** | Final |
| **Priority** | #1 - Urgent |
| **Builder** | Ta Khongsap |
| **Author** | Jason Liew |
| **Created** | 2026-01-30 |
| **Updated** | 2026-01-31 |
| **Timeline** | 1-1.5 days |

---

## Table of Contents

1. [Industry Context](#1-industry-context)
2. [Product Summary](#2-product-summary)
3. [System Architecture](#3-system-architecture)
4. [Frontend Requirements](#4-frontend-requirements)
   - 4.1-4.6: Core Requirements
   - [4.7 Dashboard Design System](#47-dashboard-design-system) *(NEW in v5.2)*
5. [Backend / MCP Server Requirements](#5-backend--mcp-server-requirements)
6. [Demo Flow](#6-demo-flow-discover--monitor--optimise)
7. [Mock Data](#7-mock-data)
8. [Acceptance Criteria](#8-acceptance-criteria)
9. [Implementation Plan](#9-implementation-plan)
10. [Out of Scope](#10-out-of-scope)
11. [Deliverables](#11-deliverables)
12. [References](#12-references)

---

## 1. Industry Context

### 1.1 Background: The Advertising Ecosystem

Digital advertising connects brands (advertisers) with audiences through technology platforms:

| Player | What They Do | Example |
|--------|--------------|---------|
| **Advertisers** | Brands that want to show ads | Nike, Toyota, Netflix |
| **Publishers** | Websites/apps that show ads | ESPN, CNN, Weather.com |
| **DSPs** | Demand-Side Platforms - tech that helps buyers purchase ads programmatically | Adform, The Trade Desk, DV360 |
| **Media Buyers** | Agencies/brands who use DSPs to buy ads | Agency traders, brand teams |

### 1.2 The Problem (for DSPs like Adform)

**AI agents are coming to buy and manage media, and DSPs need to be ready.**

AI assistants (like Claude, ChatGPT, etc.) are increasingly being used by agencies and brands to automate media buying and campaign management. These AI agents need a standardized way to:

| Capability | What AI Agents Need To Do |
|------------|---------------------------|
| **Discover** | Find available inventory, query products, compare pricing and targeting options |
| **Buy** | Execute media buys, launch campaigns programmatically |
| **Monitor** | Check live campaign metrics - impressions, clicks, CTR, viewability, spend, pacing |
| **Optimise** | Adjust bids, budgets, and targeting based on real-time performance data |

**The risk**: DSPs without an AI-accessible interface will be bypassed. If an AI agent can't talk to your platform, it won't buy from you or manage campaigns on you.

### 1.3 The Solution (AdCP for DSPs)

**AdCP makes your platform fully accessible to AI agents through a single open standard.**

By implementing AdCP, a DSP like Adform enables AI agents to:
- Query available inventory and pricing through natural language
- Execute and modify media buys programmatically
- Pull real-time delivery metrics and performance data
- Make optimization decisions based on live campaign performance

Clients can ask their AI assistant: *"How is my Adform campaign performing?"* or *"Reduce mobile bids on underperforming geos"* - and it just works.

### 1.4 What is MCP?

**MCP (Model Context Protocol)** is Anthropic's open standard for connecting AI assistants to external tools and data sources. AdCP is built on MCP, meaning any AI assistant that supports MCP can interact with AdCP-compliant platforms.

### 1.5 What This Demo Shows

> *An AI agent querying inventory, monitoring live campaign performance, identifying issues, recommending optimizations, and executing changes — with **visual proof** that actions are taking effect in real-time.*

---

## 2. Product Summary

A demonstration system consisting of:
1. **Chat + Artifact Page** — Claude.ai-style interface with chat on left and artifact panel on right for rich outputs (reports, tables, visualizations)
2. **Live Dashboard Page** — Separate window showing real-time campaign cards, can be displayed on a second screen
3. **MCP Backend** — Server exposing 7 AdCP tools with WebSocket for real-time updates

This allows Tim to show Adform executives the full **Discover → Monitor → Optimise** lifecycle through natural language, with **visual confirmation** that changes are happening on a separate dashboard screen.

| Attribute | Detail |
|-----------|--------|
| **Product Type** | Demo/Proof of Concept (Frontend + Backend) |
| **Purpose** | Executive demonstration for Adform partnership meeting |
| **Demo User** | Tim (Signal42 co-founder) presenting to Adform executives |
| **Key Message** | "This is how your clients will interact with Adform in the AI era" |
| **Key Differentiator** | Two-window setup: Chat with artifacts + Live dashboard (dual-monitor friendly) |
| **UI Pattern** | Claude.ai-style artifact experience |
| **Uses AITWO OS?** | No - standalone demo |

### 2.1 The Visual Feedback Problem

**Current chat-only approach:**
```
Tim: "Pause Germany targeting"
Claude: "Done: Germany removed, est. savings $6,490"
Executive: "Did that actually change something? How do I know?"
```

**Better approach (chat + artifacts + live dashboard):**
```
Tim: "Pause Germany targeting"
Claude: "Done: Germany removed" (inline response)
Dashboard (separate screen): [Germany chip fades out, budget reflows, metrics update]
Executive: "Wow, I can literally watch the system respond on the other screen"
```

### 2.2 Why Two Windows?

| Benefit | Description |
|---------|-------------|
| **Full space for reports** | Chat artifacts (tables, reports) get the full right panel without competing with dashboard |
| **Optimal for dual monitors** | Tim works in chat on one screen, audience watches dashboard on projector/second screen |
| **Claude.ai familiar UX** | Users already know the artifact pattern from Claude.ai |
| **Each screen optimized** | Chat + artifacts for interaction, dashboard for visualization |

---

## 3. System Architecture

### 3.1 MCP → AdCP Architecture Mapping

| MCP Concept | Role | AdCP Demo Implementation |
|-------------|------|--------------------------|
| **MCP Host** | User-facing app that runs the AI | Chat + Artifact page (Claude.ai style) |
| **MCP Client** | Connection manager / protocol handler | Built into frontend, talks to Claude API |
| **MCP Server** | Exposes tools that AI can call | Backend with 7 AdCP tools + WebSocket |

### 3.2 Two-Window Architecture

The demo uses two separate browser windows/pages, both connected to the same backend via WebSocket:

```
┌─────────── WINDOW 1: Chat + Artifacts (Tim's Screen) ───────────────┐
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐ │
│  │  CHAT PANEL          │  │  ARTIFACT PANEL                      │ │
│  │  (Like Claude.ai)    │  │  (Shows when Claude generates        │ │
│  │                      │  │   rich output: tables, reports)      │ │
│  │  User: "Show me all  │  │                                      │ │
│  │  campaigns"          │  │  ┌────────────────────────────────┐ │ │
│  │                      │  │  │ 📊 Campaign Performance Report │ │ │
│  │  Claude: "Here's     │  │  │ ┌──────┬───────┬────────────┐ │ │ │
│  │  the overview →"     │  │  │ │Name  │CTR    │Status      │ │ │ │
│  │                      │  │  │ ├──────┼───────┼────────────┤ │ │ │
│  │  User: "Pause        │  │  │ │Apex  │0.12%  │Poor        │ │ │ │
│  │  Germany for Apex"   │  │  │ │Tech  │0.60%  │Warning     │ │ │ │
│  │                      │  │  │ └──────┴───────┴────────────┘ │ │ │
│  │  Claude: "Done:      │  │  └────────────────────────────────┘ │ │
│  │  Germany removed,    │  │                                      │ │
│  │  saving $6,490"      │  │  (Artifact persists until replaced)  │ │
│  │    ↑ inline response │  │                                      │ │
│  └──────────────────────┘  └──────────────────────────────────────┘ │
│            │                              │                          │
│            │ Claude API                   │ WebSocket                │
│            ↓                              ↓                          │
└────────────┼──────────────────────────────┼──────────────────────────┘
             │                              │
             │         ┌────────────────────┘
             │         │
             ↓         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        AdCP SERVER (Backend)                         │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     7 AdCP Tools                             │    │
│  │  get_products | list_formats | list_properties | create_buy  │    │
│  │  get_delivery | update_buy | provide_feedback                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │           Mock Data Layer (JSON)                             │    │
│  │   Products | Media Buys | Delivery Metrics | Feedback Log    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                    On tool execution:                                │
│                    → Update data                                     │
│                    → Broadcast to ALL connected clients via WebSocket│
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                               ↓
┌─────────── WINDOW 2: Live Dashboard (Audience Screen) ──────────────┐
│                                                                      │
│  LIVE CAMPAIGN DASHBOARD                        [Connected 🟢]      │
│                                                                      │
│  ┌─────────────────────────┐  ┌─────────────────────────┐           │
│  │ APEX MOTORS     [POOR]  │  │ TECHFLOW SAAS [WARNING] │           │
│  │                         │  │                         │           │
│  │ Budget: $50K            │  │ Budget: $25K            │           │
│  │ Spent:  $32K (65%)      │  │ Spent:  $28K (112%)     │           │
│  │ ████████████░░░░░░░     │  │ ████████████████████    │           │
│  │                         │  │                         │           │
│  │ Geos: [US] [UK] [DE]    │  │ Geos: [US]              │           │
│  │              ↑          │  │                         │           │
│  │         fades out when  │  └─────────────────────────┘           │
│  │         action happens  │                                        │
│  │                         │  ┌─────────────────────────┐           │
│  │ CTR: 0.12% | CPA: $721  │  │ SPORTMAX      [GOOD]    │           │
│  └─────────────────────────┘  │ ...                     │           │
│                               └─────────────────────────┘           │
│                                                                      │
│  Updates automatically via WebSocket when actions happen in chat     │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.3 Data Flow for OPTIMIZE Actions

```
1. User types in WINDOW 1: "Pause Germany targeting for Apex Motors"
2. Chat sends to Claude API with tool definitions
3. Claude calls: update_media_buy(campaign_id, { remove_geo: "Germany" })
4. Backend MCP Server:
   a. Updates mock data (Germany removed from targeting)
   b. Calculates impact (est. savings $6,490)
   c. Broadcasts state change via WebSocket to ALL connected clients
   d. Returns response to Claude
5. WINDOW 1: Claude responds inline: "Done: Germany removed, est. savings $6,490"
6. WINDOW 2: Receives WebSocket event → Germany chip animates out
7. Executive SEES: Dashboard on second screen updates in real-time
```

### 3.4 Artifact vs Dashboard Content

| Content Type | Where It Shows | Example |
|--------------|----------------|---------|
| **Simple responses** | Inline in chat | "Done: Germany removed" |
| **Rich reports/tables** | Artifact panel (Window 1 right side) | Campaign performance table |
| **Live campaign state** | Dashboard (Window 2) | Campaign cards with metrics |
| **Real-time updates** | Dashboard (Window 2) | Geo chips fading, budget bars moving |

### 3.4 Technical Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js + React | Chat + Dashboard UI |
| **Styling** | Tailwind CSS + shadcn/ui | Professional appearance |
| **Real-time** | Socket.io or native WebSocket | State synchronization |
| **Backend** | Node.js + Express | MCP Server + API |
| **AI** | Claude API (Anthropic) | Natural language processing |
| **Data** | JSON files | Mock advertising data |

---

## 4. Frontend Requirements

### 4.1 Two-Page Architecture

The frontend consists of two separate pages that can be opened in different browser windows:

| Page | URL | Purpose | Typical Display |
|------|-----|---------|-----------------|
| **Chat + Artifacts** | `/` or `/chat` | AI interaction with rich output display | Tim's laptop/main screen |
| **Live Dashboard** | `/dashboard` | Real-time campaign monitoring | Projector/second screen |

Both pages connect to the same backend WebSocket for synchronized state.

### 4.2 Page 1: Chat + Artifacts (Claude.ai Style)

#### Layout
```
┌────────────────────────────────────────────────────────────────────┐
│  CHAT (40%)                    │  ARTIFACT PANEL (60%)             │
│                                │  (appears when Claude generates   │
│  ┌──────────────────────────┐  │   rich content)                   │
│  │ Message history          │  │                                   │
│  │ - User messages          │  │  ┌─────────────────────────────┐ │
│  │ - Claude responses       │  │  │ Report / Table / Chart      │ │
│  │ - Inline simple answers  │  │  │                             │ │
│  └──────────────────────────┘  │  │ Persists until replaced     │ │
│                                │  │                             │ │
│  ┌──────────────────────────┐  │  └─────────────────────────────┘ │
│  │ [Type your message...]   │  │                                   │
│  └──────────────────────────┘  │  [Open Dashboard ↗] button        │
└────────────────────────────────────────────────────────────────────┘
```

#### Chat Panel Components

| Component | Requirements |
|-----------|--------------|
| **Text Input** | Clean input field with send button |
| **Message History** | Scrollable conversation with user/AI messages |
| **Typing Indicator** | Visual feedback while Claude processes |
| **Markdown Rendering** | Support tables, lists, code blocks in responses |
| **Loading States** | Spinner or typing animation during API calls |
| **Open Dashboard Button** | Link to open dashboard in new window |

#### Artifact Panel Components

| Component | Requirements |
|-----------|--------------|
| **Artifact Container** | Right-side panel that appears when Claude generates rich content |
| **Table Rendering** | Beautiful tables for campaign data, product listings |
| **Report Display** | Formatted reports with sections, metrics, recommendations |
| **Persistence** | Artifact stays visible until replaced by new artifact |
| **Empty State** | Subtle placeholder when no artifact is active |

#### When to Show Artifacts

| Query Type | Response Location |
|------------|-------------------|
| "Pause Germany" | **Inline** (simple confirmation) |
| "What's the CTR?" | **Inline** (single value) |
| "Show all campaigns" | **Artifact** (table) |
| "Give me a performance report" | **Artifact** (formatted report) |
| "Compare mobile vs desktop" | **Artifact** (comparison table) |
| "List available products" | **Artifact** (product table) |

### 4.3 Page 2: Live Dashboard

#### Layout
```
┌────────────────────────────────────────────────────────────────────┐
│  LIVE CAMPAIGN DASHBOARD                        [Connected 🟢]     │
│────────────────────────────────────────────────────────────────────│
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────┐ │
│  │ APEX MOTORS [POOR]  │  │ TECHFLOW    [WARN]  │  │ SPORTMAX   │ │
│  │ Budget: $50K        │  │ Budget: $25K        │  │ [GOOD]     │ │
│  │ Spent: $32K         │  │ Spent: $28K         │  │ ...        │ │
│  │ ████████░░░░        │  │ ████████████████    │  │            │ │
│  │ Geos: US UK [DE]    │  │ Geos: US            │  │            │ │
│  │ CTR: 0.12%          │  │ CTR: 0.60%          │  │            │ │
│  └─────────────────────┘  └─────────────────────┘  └────────────┘ │
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │ FINANCEFIRST [GOOD] │  │ GREENENERGY [GOOD]  │                  │
│  │ ...                 │  │ ...                 │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│                                                                     │
│  Last update: 2 seconds ago                                         │
└────────────────────────────────────────────────────────────────────┘
```

#### Dashboard Components

| Component | Requirements |
|-----------|--------------|
| **Connection Status** | Green dot when WebSocket connected, red when disconnected |
| **Campaign Cards** | One card per media buy showing key metrics |
| **Health Badges** | Green (good), Yellow (warning), Red (poor) status |
| **Geo Chips** | Visual pills showing targeted countries (animate on change) |
| **Device Chips** | Visual pills showing device targeting |
| **Budget Bars** | Progress bars showing spend vs. budget |
| **Metrics Display** | CTR, CPM, CPA, viewability, etc. |
| **Last Update** | Timestamp showing when last WebSocket event received |

### 4.4 Campaign Card Design

```
┌─────────────────────────────────────────────────┐
│ APEX MOTORS                            [POOR]   │
│─────────────────────────────────────────────────│
│ Budget: $50,000          Spent: $32,450 (65%)   │
│ ████████████████████░░░░░░░░░░                  │
│                                                 │
│ Geos: [US ✓] [UK ✓] [DE ✗]                     │
│ Devices: [Desktop ✓] [Mobile ✓]                 │
│                                                 │
│ CTR: 0.12%  |  CPM: $8.43  |  CPA: $721        │
│ Viewability: 68%  |  Pacing: Behind            │
└─────────────────────────────────────────────────┘
```

### 4.5 Visual Feedback Patterns (Dashboard)

| Optimization Action | Chat Response (Window 1) | Dashboard Update (Window 2) |
|---------------------|--------------------------|----------------------------|
| "Pause Germany" | Done: Germany removed (inline) | DE chip fades out with animation |
| "Reduce mobile bid 20%" | Done: $8.50 → $6.80 (inline) | Bid value highlights then updates |
| "Shift budget to desktop" | Done: Desktop 60% (inline) | Device allocation bar animates |
| "Cap daily budget" | Done: Cap set $568 (inline) | Budget card shows new cap |
| "Submit conversion data" | Feedback submitted (inline) | CPA metric updates with highlight |

### 4.6 Design Requirements

| Requirement | Detail |
|-------------|--------|
| **Appearance** | Professional, modern. Executive demo - must look polished. |
| **Branding** | Neutral/generic or subtle Signal42. NOT Adform branded. |
| **Responsiveness** | Desktop-focused (demo on large screens) |
| **Transitions** | Smooth 0.3s fade/slide when data changes on dashboard |
| **Toast Notifications** | Optional corner popups on dashboard for action confirmations |
| **Connection Indicator** | Clear visual when WebSocket is connected/disconnected |

### 4.7 Dashboard Design System

This section provides comprehensive design specifications for the dashboard, inspired by Claude.ai / Anthropic aesthetics combined with familiar DSP table-based interfaces.

#### 4.7.1 Design Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Branding** | Claude.ai / Anthropic inspired | Clean, warm, professional |
| **Layout Style** | Table-based data display | Familiar to DSP users |
| **Theme** | Warm beige/cream (Claude style) | Matches Claude.ai aesthetic |
| **Main View** | Campaigns table | Primary view for demo |
| **Animations** | Subtle | Professional, not distracting |

#### 4.7.2 Color System (Anthropic/Claude.ai Inspired)

##### Base Colors

```
Background
├── Primary:     #F5F4EF (warm cream/beige - Claude's signature)
├── Secondary:   #FFFFFF (cards, panels)
├── Tertiary:    #EEEEE8 (hover states, borders)
└── Page:        #FAF9F7 (lightest background)

Text
├── Primary:     #1A1915 (near black, warm)
├── Secondary:   #5D5D5A (medium gray)
├── Muted:       #8E8E89 (light gray)
└── Inverse:     #FFFFFF (on dark backgrounds)

Borders
├── Default:     #E5E4DF
├── Strong:      #D4D3CE
└── Subtle:      #EEEEE8
```

##### Accent Colors (Claude Orange)

```
Primary Accent
├── Default:     #DA7756 (Claude's signature coral/orange)
├── Hover:       #C96A4B
├── Light:       #DA7756/15% (subtle backgrounds)
└── Text:        #C45A3A (darker for accessibility)

Secondary Accent
├── Default:     #1A1915 (dark buttons)
├── Hover:       #2D2D29
```

##### Sidebar (Dark - Claude style)

```
Background:      #1A1915 (warm black)
Text Primary:    #FFFFFF
Text Secondary:  #A3A29D
Active Item:     #DA7756 text or subtle highlight
Hover:           rgba(255,255,255,0.05)
Divider:         rgba(255,255,255,0.08)
Logo:            Anthropic-style wordmark
```

##### Status Colors (Health Indicators)

```
Good (Green)
├── Dot:         #22863A
├── Background:  #22863A / 10%
└── Text:        #166534

Warning (Amber)
├── Dot:         #D97706
├── Pacing Bar:  #F59E0B
├── Background:  #FEF3C7
└── Text:        #B45309

Poor (Red)
├── Dot:         #DC2626
├── Background:  #FEE2E2
└── Text:        #B91C1C
```

##### Interactive States

```
Button Primary:
├── Default:     #DA7756 (Claude orange)
├── Hover:       #C96A4B
├── Active:      #B85E41
└── Text:        #FFFFFF

Button Secondary:
├── Default:     #1A1915
├── Hover:       #2D2D29
└── Text:        #FFFFFF

Row Hover:       #F5F4EF
Row Selected:    #DA7756 / 8%
Focus Ring:      #DA7756 / 40%
```

#### 4.7.3 Typography (Claude.ai Style)

```
Font Family:     "Söhne", -apple-system, system-ui, sans-serif
                 (fallback: Inter if Söhne unavailable)

Headings
├── Page Title:  24px / 500 weight / #1A1915
├── Section:     14px / 500 weight / #1A1915
└── Card Title:  16px / 500 weight / #1A1915

Body
├── Default:     14px / 400 weight / #1A1915
├── Small:       13px / 400 weight / #5D5D5A
└── Tiny:        12px / 400 weight / #8E8E89

Table
├── Header:      12px / 500 weight / uppercase / #5D5D5A / tracking 0.03em
├── Cell:        14px / 400 weight / #1A1915
└── Link:        14px / 400 weight / #DA7756 (hover: underline)

Sidebar
├── Nav Item:    14px / 400 weight / #FFFFFF
├── Nav Active:  14px / 500 weight / #DA7756
└── Section:     11px / 500 weight / uppercase / #A3A29D / tracking 0.05em
```

#### 4.7.4 Layout Structure (Claude.ai Inspired)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐  ┌──────────────────────────────────────────────────────────┐│
│ │░░░░░░░░░░│  │                                                          ││
│ │░ SIDEBAR ░│  │  Media Buys                            + New Media Buy  ││
│ │░ (dark)  ░│  │  ────────────────────────────────────────────────────── ││
│ │░░░░░░░░░░│  │                                                          ││
│ │          │  │  Search media buys...     [Advertiser ▼]  [Status ▼]     ││
│ │  AdCP    │  │  ────────────────────────────────────────────────────── ││
│ │  Demo    │  │                                                          ││
│ │          │  │  STATUS  ID   ADVERTISER    CAMPAIGN         SPEND      ││
│ │ ──────── │  │  ────────────────────────────────────────────────────── ││
│ │          │  │  [━○]    89   Apex Motors   Q1 Brand        $32K/$50K 🔴││
│ │  Trading │  │  [━○]    90   TechFlow      Lead Gen        $28K/$25K 🟡││
│ │  >Media  │  │  [━○]    91   SportMax      Spring          $22K/$30K 🟢││
│ │   Buys   │  │  [━○]    92   FinanceFirst  Retirement      $18K/$25K 🟢││
│ │          │  │  [━○]    93   GreenEnergy   Solar Promo     $27K/$40K 🟢││
│ │  Products│  │  ────────────────────────────────────────────────────── ││
│ │  Formats │  │  5 media buys                        Page 1 of 1  < >    ││
│ │          │  │                                                          ││
│ │ ──────── │  │  ┌────────────────────────────────────────────────────┐ ││
│ │  Settings│  │  │ Last updated: just now                Connected 🟢 │ ││
│ │          │  │  └────────────────────────────────────────────────────┘ ││
│ └──────────┘  └──────────────────────────────────────────────────────────┘│
│                     ▲ Warm cream background (#F5F4EF)                     │
└────────────────────────────────────────────────────────────────────────────┘

Layout Specs:
├── Sidebar Width:   220px
├── Content:         Remaining width, max 1200px
├── Background:      #F5F4EF (warm cream)
├── Cards/Tables:    #FFFFFF with subtle border
└── Padding:         24px
```

#### 4.7.5 Sidebar Navigation (Claude.ai Style)

```
Width:           220px (collapsible to 64px icons only)
Background:      #1A1915 (Claude's warm black)
Border Right:    none (clean edge)

Structure:
├── Logo/Brand (top, 20px padding)
│   └── "AdCP Demo" in #FFFFFF, 16px / 500 weight
│   └── Subtle divider below
│
├── Trading Section
│   ├── Section Label: "TRADING" / 11px / #A3A29D / uppercase
│   ├── Media Buys (active - #DA7756 text or left accent bar)
│   ├── Products
│   ├── Formats
│   └── Properties
│
├── Setup Section
│   ├── Section Label: "SETUP" / 11px / #A3A29D / uppercase
│   ├── Creatives
│   └── Advertisers
│
├── Spacer (flex-grow)
│
└── Footer (bottom)
    ├── Settings link
    └── User: "Tim" with avatar, #FFFFFF

Nav Item Specs:
├── Padding:       12px 16px
├── Text:          14px / 400 / #FFFFFF
├── Hover:         rgba(255,255,255,0.05) background
├── Active:        #DA7756 text OR 3px left border #DA7756
├── Icon:          20px, left of text, #A3A29D (active: #DA7756)
└── Radius:        6px (on hover background)
```

#### 4.7.6 Data Table Design (Claude.ai Style)

##### Table Container

```
Background:      #FFFFFF
Border:          1px solid #E5E4DF
Radius:          12px
Overflow:        hidden (clips border radius)
Shadow:          0 1px 3px rgba(0,0,0,0.04)
```

##### Table Header

```
┌──────────────────────────────────────────────────────────────────────────┐
│ STATUS    ID ↓   ADVERTISER    CAMPAIGN           SPEND/BUDGET   HEALTH │
└──────────────────────────────────────────────────────────────────────────┘

Header Specs:
├── Background:    #FAF9F7 (warm gray)
├── Text:          12px / 500 / uppercase / #5D5D5A / tracking 0.03em
├── Padding:       14px 16px
├── Border Bottom: 1px solid #E5E4DF
└── Sortable:      ↓ indicator, #DA7756 when active
```

##### Table Row

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [━○]    89    Apex Motors    Q1 Brand Awareness    $32,450 / $50,000  🔴 │
│                                                    ████████░░░  65%      │
└──────────────────────────────────────────────────────────────────────────┘

Row Specs:
├── Background:    #FFFFFF
├── Hover:         #F5F4EF (warm cream)
├── Selected:      #DA7756 / 8% background
├── Padding:       16px
├── Border Bottom: 1px solid #EEEEE8
├── Height:        60px
└── Transition:    background 150ms ease

Text:
├── Primary:       14px / 400 / #1A1915
├── Secondary:     13px / 400 / #5D5D5A
└── Link:          14px / 400 / #DA7756 (hover: underline)
```

##### Status Toggle (Claude.ai Style)

```
Active:     [━━━━━━○]  #DA7756 track (Claude orange), white knob
Paused:     [○━━━━━━]  #D4D3CE track (gray), white knob
Size:       40px × 22px
Radius:     11px (full round)
Knob:       18px circle, white, subtle shadow
Animation:  200ms ease-out
```

##### Pacing Bar

```
Container:   80px × 6px, rounded-full, #EEEEE8 background

Fill Colors:
├── 0-80%:   #22863A (green - on track)
├── 80-100%: #D97706 (amber - warning)
├── >100%:   #DC2626 (red - overspending)

Radius:      3px (full round)
Text:        13px / #5D5D5A, right of bar
```

##### Health Status Dots

```
🟢 Good:     #22863A, solid circle, 10px
🟡 Warning:  #D97706, solid circle, 10px
🔴 Poor:     #DC2626, solid circle, 10px

Placement:   Last column, centered
Tooltip:     "Good" / "Warning" / "Poor" on hover
```

#### 4.7.7 Filter Bar (Claude.ai Style)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search media buys...       [Advertiser ▼]  [Status ▼]   Clear filters │
└──────────────────────────────────────────────────────────────────────────┘

Search Input:
├── Width:        280px
├── Height:       40px
├── Background:   #FFFFFF
├── Border:       1px solid #E5E4DF
├── Radius:       8px
├── Icon:         🔍 #8E8E89, left-aligned
├── Placeholder:  "Search media buys..." / #8E8E89
└── Focus:        Border #DA7756

Filter Dropdowns:
├── Height:       40px
├── Background:   #FFFFFF
├── Border:       1px solid #E5E4DF
├── Radius:       8px
├── Text:         14px / #1A1915
├── Chevron:      ▼ #8E8E89, right-aligned
└── Hover:        Background #F5F4EF

Clear Link:
├── Text:         14px / #DA7756
├── Hover:        Underline
└── Style:        Text button, no border
```

#### 4.7.8 Action Button (Claude.ai Style)

```
+ New Media Buy

Primary Button (Orange):
├── Background:   #DA7756 (Claude orange)
├── Hover:        #C96A4B
├── Text:         14px / 500 / #FFFFFF
├── Padding:      10px 20px
├── Radius:       8px
├── Icon:         + left of text
└── Position:     Top right of content area

Secondary Button (Dark):
├── Background:   #1A1915
├── Hover:        #2D2D29
├── Text:         14px / 500 / #FFFFFF
├── Padding:      10px 20px
└── Radius:       8px

Ghost Button:
├── Background:   transparent
├── Border:       1px solid #E5E4DF
├── Hover:        #F5F4EF background
├── Text:         14px / 400 / #1A1915
└── Radius:       8px
```

#### 4.7.9 Animation Specifications (Real-time Updates)

| Element | Trigger | Animation | Duration |
|---------|---------|-----------|----------|
| **Row Update** | Any data change | Row background pulse (yellow→white) | 400ms |
| **Pacing Bar** | Spend changes | Width transition | 500ms ease |
| **Status Dot** | Health changes | Color crossfade | 300ms |
| **Toggle** | Status change | Slide + color | 150ms |
| **New Row** | `create_media_buy` | Slide down from top | 300ms |
| **Row Removal** | Geo paused (visual) | Row highlight red, then fade | 400ms |

##### Highlight Animation for Updates

```css
@keyframes rowUpdate {
  0%   { background-color: #FEF3C7; }
  100% { background-color: #FFFFFF; }
}

.row-updated {
  animation: rowUpdate 400ms ease-out;
}
```

#### 4.7.10 Connection Status Bar (Claude.ai Style)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Last updated: just now                                   Connected 🟢  │
└─────────────────────────────────────────────────────────────────────────┘

Position:    Fixed bottom of content area
Background:  #FAF9F7
Border Top:  1px solid #E5E4DF
Height:      44px
Padding:     0 24px

Text Styling:
├── "Last updated":  13px / #8E8E89
├── Timestamp:       13px / #5D5D5A
└── Status:          13px / #5D5D5A

Status States:
├── Connected:       "Connected" + 🟢 (#22863A dot, 8px)
├── Reconnecting:    "Reconnecting..." + 🟡 (#D97706 pulsing dot)
└── Disconnected:    "Connection lost" + 🔴 (#DC2626) + [Reconnect] link in #DA7756
```

#### 4.7.11 Chat + Artifacts Page Design (Claude.ai Style)

**Direct inspiration**: claude.ai chat interface

##### Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ┌─ Header ───────────────────────────────────────────────────────────┐   │
│  │  AdCP Sales Agent                              [Open Dashboard ↗]  │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌─ Chat (40%) ─────────────────┐  ┌─ Artifact Panel (60%) ───────────┐  │
│  │                              │  │                                   │  │
│  │  ┌────────────────────────┐  │  │  ┌─────────────────────────────┐ │  │
│  │  │ Show me all campaigns  │  │  │  │                             │ │  │
│  │  └────────────────────────┘  │  │  │  📊 Media Buy Performance   │ │  │
│  │              User message ↗  │  │  │                             │ │  │
│  │                              │  │  │  ┌───────┬───────┬────────┐│ │  │
│  │  ┌────────────────────────┐  │  │  │  │ Name  │ Spend │ Health ││ │  │
│  │  │ Here's an overview of  │  │  │  │  ├───────┼───────┼────────┤│ │  │
│  │  │ your 5 active media    │  │  │  │  │ Apex  │ $32K  │ 🔴 Poor││ │  │
│  │  │ buys →                 │  │  │  │  │ Tech  │ $28K  │ 🟡 Warn││ │  │
│  │  └────────────────────────┘  │  │  │  │ Sport │ $22K  │ 🟢 Good││ │  │
│  │  Claude response ↗           │  │  │  └───────┴───────┴────────┘│ │  │
│  │                              │  │  │                             │ │  │
│  │  ┌────────────────────────┐  │  │  │  (Persists until replaced)  │ │  │
│  │  │ Pause Germany for Apex │  │  │  └─────────────────────────────┘ │  │
│  │  └────────────────────────┘  │  │                                   │  │
│  │                              │  │  Empty state when no artifact:    │  │
│  │  ┌────────────────────────┐  │  │  "Ask about media buys, products, │  │
│  │  │ ✓ Done. Germany removed│  │  │   or request a report"           │  │
│  │  │ from Apex Motors.      │  │  │                                   │  │
│  │  │ Est. savings: $6,490   │  │  │                                   │  │
│  │  └────────────────────────┘  │  │                                   │  │
│  │                              │  │                                   │  │
│  │  ┌────────────────────────┐  │  └───────────────────────────────────┘  │
│  │  │ Message AdCP Agent...  │  │                                        │
│  │  │                     ⬆  │  │                                        │
│  │  └────────────────────────┘  │                                        │
│  └──────────────────────────────┘                                        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

##### Chat Panel Specs (Claude.ai Style)

```
Width:           40% of viewport (min 400px)
Background:      #FAF9F7 (Claude's warm white)
Border Right:    1px solid #E5E4DF

Message Bubbles (Claude.ai style):
├── User:        Right-aligned
│   ├── Background:  #F5F4EF (warm gray)
│   ├── Text:        #1A1915
│   └── Radius:      18px (smaller on bottom-right)
│
├── Claude:      Left-aligned
│   ├── Background:  transparent (no bubble)
│   ├── Text:        #1A1915
│   └── Avatar:      Claude icon on left
│
├── Max Width:   80% of chat panel
└── Padding:     12px 16px

Input Field (Claude.ai style):
├── Position:    Bottom of chat, sticky
├── Background:  #FFFFFF
├── Border:      1px solid #E5E4DF
├── Radius:      24px (pill shape)
├── Height:      52px
├── Padding:     14px 20px
├── Placeholder: "Message AdCP Agent..."
└── Send Button: #DA7756 (Claude orange), circular, inside right
```

##### Artifact Panel Specs (Claude.ai Style)

```
Width:           60% of viewport
Background:      #FFFFFF
Border Left:     1px solid #E5E4DF
Padding:         32px

Artifact Container:
├── Background:  #FFFFFF
├── Border:      1px solid #E5E4DF
├── Radius:      12px
├── Padding:     24px
├── Shadow:      0 2px 8px rgba(0,0,0,0.04)
└── Max Width:   800px (centered)

Artifact Header:
├── Icon:        📊 (or relevant icon)
├── Title:       16px / 500 weight / #1A1915
└── Border Bottom: 1px solid #E5E4DF

Empty State:
├── Centered vertically
├── Icon:        Subtle illustration or icon
├── Title:       "No artifact yet"
├── Subtitle:    "Ask about media buys, products, or request a report"
└── Color:       #8E8E89
```

##### Artifact Types

| Type | Trigger | Display |
|------|---------|---------|
| **Table** | "Show campaigns", "List products" | Formatted table (Claude.ai style) |
| **Report** | "Give me a report", "Analyze performance" | Sections with metrics, recommendations |
| **Comparison** | "Compare mobile vs desktop" | Side-by-side breakdown |
| **Simple** | "Pause Germany", single value queries | Inline in chat (no artifact) |

##### Artifact Table Style (Claude.ai aesthetic)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  📊 Media Buy Performance                                                │
├──────────────────────────────────────────────────────────────────────────┤
│  ADVERTISER       CAMPAIGN                SPEND          PACING   HEALTH │
│  ──────────────────────────────────────────────────────────────────────  │
│  Apex Motors      Q1 Brand Awareness      $32,450/$50K   ████░ 65%   🔴  │
│  TechFlow SaaS    Lead Gen Q1             $28,000/$25K   █████ 112%  🟡  │
│  SportMax         Spring Collection       $22,100/$30K   ████░ 73%   🟢  │
│  FinanceFirst     Retirement Campaign     $18,250/$25K   ████░ 72%   🟢  │
│  GreenEnergy      Solar Promo             $26,650/$40K   ████░ 68%   🟢  │
└──────────────────────────────────────────────────────────────────────────┘

Artifact Table Specs:
├── Container:     #FFFFFF, 12px radius, 1px #E5E4DF border
├── Header:        12px / 500 / uppercase / #5D5D5A
├── Rows:          14px / 400 / #1A1915
├── Row Divider:   1px solid #EEEEE8
├── Pacing bars:   6px height, colored by status
└── Health dots:   10px, colored (🟢 #22863A, 🟡 #D97706, 🔴 #DC2626)
```

#### 4.7.12 Responsive Behavior (for Demo)

```
Desktop (primary - demo):
├── Sidebar:     240px fixed
├── Content:     Remaining width
└── Table:       Full width with horizontal scroll if needed

Large Screen (projector):
├── Sidebar:     240px fixed
├── Content:     Max 1400px centered
└── Font Scale:  Can increase for visibility
```

---

## 5. Backend / MCP Server Requirements

### 5.1 The 7 AdCP Tools

Note: AdCP uses "media buy" not "campaign".

| # | Tool Name | Purpose | Demo Phase |
|---|-----------|---------|------------|
| 1 | `get_products` | Discover available inventory | DISCOVER |
| 2 | `list_creative_formats` | Get available ad format specs | DISCOVER |
| 3 | `list_authorized_properties` | Get accessible publishers | DISCOVER |
| 4 | `create_media_buy` | Launch a new campaign | BUY |
| 5 | `get_media_buy_delivery` | Get performance metrics | MONITOR |
| 6 | `update_media_buy` | Modify existing campaign | OPTIMISE |
| 7 | `provide_performance_feedback` | Submit conversion data | OPTIMISE |

### 5.2 Tool Specifications

#### Tool 1: `get_products`
```typescript
// Returns available advertising products/inventory
Parameters:
  - category?: string (Sports, News, Technology, etc.)
  - max_cpm?: number (filter by price)

Returns:
  - products[]: { product_id, name, description, category, pricing_options, formats, targeting_capabilities, minimum_budget }
```

#### Tool 2: `list_creative_formats`
```typescript
// Returns available ad format specifications
Parameters:
  - type?: string (display, video, native, audio)

Returns:
  - formats[]: { format_id, name, type, dimensions/duration, file_types, specs }
```

#### Tool 3: `list_authorized_properties`
```typescript
// Returns publisher properties available for advertising
Parameters: none

Returns:
  - properties[]: { property_id, name, domain, category, monthly_uniques, authorization_level, available_formats, audience }
```

#### Tool 4: `create_media_buy`
```typescript
// Creates a new media buy (campaign)
Parameters:
  - brand_name: string
  - product_id: string
  - budget: number
  - targeting: object
  - start_time: string
  - end_time: string

Returns:
  - media_buy_id: string
  - status: "submitted"
  - estimated_impressions: number
```

#### Tool 5: `get_media_buy_delivery`
```typescript
// Returns performance metrics for media buys
Parameters:
  - media_buy_id?: string (if omitted, returns all)

Returns:
  - media_buy: { total_budget, total_spend, pacing, health, summary, by_device, by_geo, recommendations }
```

#### Tool 6: `update_media_buy`
```typescript
// Modifies an existing media buy
Parameters:
  - media_buy_id: string
  - updates: {
      remove_geo?: string[]
      add_geo?: string[]
      adjust_bid?: { device: string, change_percent: number }
      set_daily_cap?: number
      shift_budget?: { from: string, to: string, percent: number }
    }

Returns:
  - success: boolean
  - changes_applied: string[]
  - estimated_impact: string

Side Effect:
  → Broadcasts WebSocket event for dashboard update
```

#### Tool 7: `provide_performance_feedback`
```typescript
// Submits conversion/performance data
Parameters:
  - media_buy_id: string
  - feedback_type: "conversion_data" | "lead_quality" | "brand_lift"
  - data: object

Returns:
  - feedback_id: string
  - status: "processed"
  - impact: string

Side Effect:
  → Broadcasts WebSocket event for dashboard update
```

### 5.3 WebSocket Events

The backend must broadcast state changes to connected clients:

| Event | Trigger | Payload |
|-------|---------|---------|
| `initial_state` | Client connects | Full media_buys + delivery_metrics |
| `media_buy_updated` | `update_media_buy` called | Updated media buy + metrics |
| `media_buy_created` | `create_media_buy` called | New media buy |
| `feedback_submitted` | `provide_performance_feedback` called | Updated metrics |

---

## 6. Demo Flow: Discover → Monitor → Optimise

### 6.1 DISCOVER — Finding the Right Inventory

*"I have a campaign coming up - what inventory options do I have?"*

| Tim Might Ask | Expected Response |
|---------------|-------------------|
| "What sports inventory do you have?" | ESPN ($18-35), Sports Illustrated ($15-20), Bleacher Report ($12-18) |
| "Find inventory under $20 CPM" | Weather.com ($8-12), SI ($15-20), Bleacher ($12-18) |
| "What's good for reaching tech executives?" | TechCrunch ($35-45), Forbes Executive ($38) |
| "What video formats do you support?" | Pre-roll 15s/30s, outstream, CTV 30s |
| "What publishers can I access?" | 10 properties: ESPN, CNN, Weather, TechCrunch... |
| "Which properties have premium deals?" | ESPN 15% discount, TechCrunch 12%, Forbes 8% |
| "What's the minimum budget for NYT?" | $15K for ROS, $25K for Section Sponsorship |
| "Launch a $5K test campaign on ESPN" | Created: media_buy_id mb_20260130_001, status: submitted |

### 6.2 MONITOR — Checking Live Performance

*"How are my campaigns performing right now?"*

| Tim Might Ask | Expected Response |
|---------------|-------------------|
| "Show me all active campaigns" | 5 campaigns: Apex, TechFlow, SportMax, FinanceFirst, GreenEnergy |
| "What's our total spend this month?" | $127,450 across 5 campaigns, $42,550 remaining |
| "How are we pacing against budgets?" | 3 on track, 1 warning (TechFlow), 1 poor (Apex) |
| "Which campaigns are underperforming?" | Apex Motors: CTR 0.12% vs 0.35% target |
| "How is Apex Motors performing?" | $32,450 spent, 3.85M impressions, 0.12% CTR |
| "Break down Apex by device" | Mobile: 0.08% CTR, Desktop: 0.18% CTR |
| "Show me performance by geo" | US: 0.14% CTR, UK: 0.14%, Germany: 0.04% |
| "What's our best performing campaign?" | TechFlow: 0.60% CTR, beating target |

### 6.3 OPTIMISE — Taking Action on Insights

*"Something's not working - help me fix it."*

| Tim Might Ask | Expected Response | Visual Update |
|---------------|-------------------|---------------|
| "Why is Apex Motors struggling?" | Mobile CTR 0.08% vs desktop 0.18%; Germany at 0.04% | — |
| "What optimizations would you recommend?" | 1. Reduce mobile bid 20%, 2. Pause Germany, 3. Shift budget to desktop | — |
| "Reduce Apex mobile bid by 20%" | Done: Mobile bid reduced $8.50 → $6.80 | Bid value updates |
| "Pause Germany targeting" | Done: Germany removed, est. savings $6,490 | **DE chip fades out** |
| "Shift 20% budget from mobile to desktop" | Done: Desktop allocation increased to 60% | Device bars animate |
| "TechFlow is overspending - cap the daily budget" | Done: Daily cap set to $568 | Budget card updates |
| "Submit our conversion data for Apex" | Feedback submitted: 25 conversions, $125K value | CPA metric updates |

---

## 7. Mock Data

**Data File**: `data/adcp_demo_complete_data.json` (already exists in project)

### 7.1 Data Summary

| Data Type | Count | Details |
|-----------|-------|---------|
| **Products** | 8 | ESPN, CNN, Weather, TechCrunch, SI, Bleacher, Forbes, Auto News |
| **Media Buys** | 5 | Apex Motors (poor), TechFlow (warning), SportMax, FinanceFirst, GreenEnergy |
| **Creative Formats** | 14 | Display (6), Video (4), Native (2), Audio (1), Rich Media (1) |
| **Properties** | 10 | With reach, formats, deals, audience segments |
| **Delivery Metrics** | 5 | Full breakdowns by device, geo, format |
| **Aggregations** | Portfolio summary, spend by category/format/device/geo |
| **Query Examples** | 50+ demo questions with expected responses |

### 7.2 Key Demo Scenario

**Apex Motors** is intentionally underperforming to showcase the MONITOR → OPTIMIZE flow:
- Health: Poor
- CTR: 0.12% (target: 0.35%)
- Mobile CTR: 0.08% (significantly below desktop 0.18%)
- Germany CTR: 0.04% (well below US/UK 0.14%)
- Recommendations: Reduce mobile bid, pause Germany, shift to desktop

### 7.3 Portfolio Summary

| Metric | Value |
|--------|-------|
| Total Active Campaigns | 5 |
| Total Budget | $170,000 |
| Total Spend | $127,450 |
| Total Remaining | $42,550 |
| Campaigns On Track | 3 |
| Campaigns Warning | 1 |
| Campaigns Poor | 1 |

### 7.4 Data File Structure

```json
{
  "products": [
    {
      "product_id": "prod_espn_premium",
      "name": "ESPN Premium Sports",
      "category": "Sports",
      "pricing_options": [...],
      "format_ids": [...],
      "targeting_capabilities": [...],
      "minimum_budget": 5000
    }
    // ... 8 products total
  ],
  "media_buys": [
    {
      "media_buy_id": "mb_apex_motors_q1",
      "brand_manifest": { "name": "Apex Motors" },
      "packages": [...],
      "status": "active"
    }
    // ... 5 media buys total
  ],
  "delivery_metrics": {
    "mb_apex_motors_q1": {
      "brand": "Apex Motors",
      "total_budget": 50000,
      "total_spend": 32450,
      "health": "poor",
      "summary": { "ctr": 0.12, "cpm": 8.43, ... },
      "by_device": { "mobile": {...}, "desktop": {...} },
      "by_geo": { "US": {...}, "UK": {...}, "DE": {...} },
      "recommendations": [...]
    }
    // ... metrics for all 5 media buys
  },
  "aggregations": {
    "portfolio_summary": {
      "total_active_campaigns": 5,
      "total_budget": 170000,
      "total_spend": 127450,
      "campaigns_on_track": 3,
      "campaigns_warning": 1,
      "campaigns_poor": 1
    },
    "spend_by_category": {...},
    "spend_by_device": {...},
    "spend_by_geo": {...}
  },
  "performance_feedback_log": [...],
  "query_examples": {
    "campaign_overview": [...],
    "performance_analysis": [...],
    "optimization_actions": [...],
    "inventory_discovery": [...]
  }
}
```

---

## 8. Acceptance Criteria

### 8.1 Chat + Artifacts Page (Window 1)

| # | Criteria | Test |
|---|----------|------|
| 1 | Page loads with chat + artifact layout | Visual check: chat left, artifact panel right |
| 2 | Chat interface works | Type query, see Claude response |
| 3 | Simple responses appear inline | "Pause Germany" → inline "Done" |
| 4 | Rich outputs appear in artifact panel | "Show all campaigns" → table in artifact |
| 5 | Artifacts persist until replaced | New artifact replaces old one |
| 6 | "Open Dashboard" button works | Opens `/dashboard` in new window |

### 8.2 Live Dashboard Page (Window 2)

| # | Criteria | Test |
|---|----------|------|
| 7 | Dashboard page loads at `/dashboard` | Visual check: campaign cards displayed |
| 8 | Shows all 5 campaign cards | Visual check: Apex, TechFlow, SportMax, FinanceFirst, GreenEnergy |
| 9 | Health badges display correctly | Green/yellow/red visible |
| 10 | Connection status shows connected | Green indicator visible |

### 8.3 Real-Time Sync (Both Windows)

| # | Criteria | Test |
|---|----------|------|
| 11 | **WebSocket syncs both windows** | Execute update in chat, see dashboard update |
| 12 | Geo chips animate on change | "Pause Germany" → DE chip fades out on dashboard |
| 13 | Metrics update on feedback | Submit conversion data → CPA updates |
| 14 | Multiple clients stay in sync | Open 2 dashboard windows, both update |

### 8.4 Demo Flow

| # | Criteria | Test |
|---|----------|------|
| 15 | All 7 tools return valid responses | Test each tool type |
| 16 | DISCOVER phase works | Ask about products, formats, properties |
| 17 | MONITOR phase works | Ask about campaigns, metrics, breakdowns |
| 18 | OPTIMISE phase works | Change bid, verify dashboard updates |
| 19 | Response times under 3 seconds | No lag during demo |
| 20 | Professional appearance | Visual review of both pages |

---

## 9. Implementation Plan

### 9.1 Phase 1: Backend (Foundation)

**Goal**: MCP Server with 7 tools + WebSocket broadcasting to multiple clients

| Task | Description |
|------|-------------|
| 1.1 | Set up Node.js/Express server |
| 1.2 | Implement 7 AdCP tools |
| 1.3 | Load mock data from JSON |
| 1.4 | Add Socket.io for WebSocket (supports multiple clients) |
| 1.5 | Broadcast events to ALL connected clients on state changes |

### 9.2 Phase 2: Chat + Artifact Page

**Goal**: Claude.ai-style chat with artifact panel

| Task | Description |
|------|-------------|
| 2.1 | Set up Next.js project with Tailwind + shadcn/ui |
| 2.2 | Create chat + artifact split layout |
| 2.3 | Build ChatPanel component with message history |
| 2.4 | Build ArtifactPanel component for rich outputs |
| 2.5 | Integrate Claude API with tool calling |
| 2.6 | Logic to determine inline vs artifact responses |
| 2.7 | Add "Open Dashboard" button to launch Window 2 |

### 9.3 Phase 3: Live Dashboard Page

**Goal**: Separate page with campaign cards for second screen

| Task | Description |
|------|-------------|
| 3.1 | Create `/dashboard` route |
| 3.2 | Build DashboardPage with full-width layout |
| 3.3 | Build CampaignCard component |
| 3.4 | Add health badges (green/yellow/red) |
| 3.5 | Add geo/device chips with animation support |
| 3.6 | Add budget progress bars |
| 3.7 | Add connection status indicator |

### 9.4 Phase 4: WebSocket Integration

**Goal**: Both pages sync via WebSocket

| Task | Description |
|------|-------------|
| 4.1 | Create useWebSocket hook (shared) |
| 4.2 | Connect chat page to WebSocket (for tool responses) |
| 4.3 | Connect dashboard page to WebSocket (for live updates) |
| 4.4 | Add transition animations on dashboard |
| 4.5 | Add reconnection logic if connection drops |

### 9.5 Phase 5: Polish

**Goal**: Professional demo-ready appearance

| Task | Description |
|------|-------------|
| 5.1 | Fine-tune colors and typography |
| 5.2 | Add loading states and indicators |
| 5.3 | Test dual-window demo flow |
| 5.4 | Performance optimization |
| 5.5 | Test WebSocket with multiple clients |

### 9.6 File Structure

```
01-adcp-sales-demo/
├── src/
│   ├── frontend/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Chat + Artifacts page (/)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Live Dashboard page (/dashboard)
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.tsx     # Chat message interface
│   │   │   │   ├── MessageList.tsx   # Message history
│   │   │   │   ├── MessageInput.tsx  # Input field
│   │   │   │   └── TypingIndicator.tsx
│   │   │   ├── artifacts/
│   │   │   │   ├── ArtifactPanel.tsx # Right-side artifact container
│   │   │   │   ├── TableArtifact.tsx # Table display
│   │   │   │   └── ReportArtifact.tsx# Report display
│   │   │   ├── dashboard/
│   │   │   │   ├── CampaignCard.tsx  # Individual campaign display
│   │   │   │   ├── HealthBadge.tsx   # Status indicator
│   │   │   │   ├── GeoChips.tsx      # Geo targeting display
│   │   │   │   ├── DeviceChips.tsx   # Device targeting display
│   │   │   │   ├── BudgetBar.tsx     # Budget progress
│   │   │   │   └── ConnectionStatus.tsx # WebSocket indicator
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts       # Real-time state sync
│   │   │   ├── useClaude.ts          # Claude API integration
│   │   │   └── useCampaignState.ts   # Campaign state management
│   │   ├── lib/
│   │   │   ├── api.ts                # Backend API calls
│   │   │   └── types.ts              # TypeScript types
│   │   └── package.json
│   └── backend/
│       ├── server.js                 # Express + Socket.io server
│       ├── tools/
│       │   ├── get-products.js
│       │   ├── list-creative-formats.js
│       │   ├── list-authorized-properties.js
│       │   ├── create-media-buy.js
│       │   ├── get-media-buy-delivery.js
│       │   ├── update-media-buy.js
│       │   └── provide-performance-feedback.js
│       └── package.json
├── data/
│   └── adcp_demo_complete_data.json    # Mock data (already exists)
├── docs/
│   ├── PRD-AdCP-Sales-Demo-Comprehensive.md  # This document
│   └── ...
└── README.md
```

### 9.7 Demo Setup

For the executive demo, Tim will:

1. **Open Window 1** (Chat + Artifacts) on his laptop
2. **Open Window 2** (Live Dashboard) on projector/second screen via `/dashboard`
3. Both windows connect to the same backend
4. When Tim makes changes via chat, the dashboard updates in real-time for the audience

---

## 10. Out of Scope

| Exclusion | Rationale |
|-----------|-----------|
| Real ad platform integrations | Demo uses mock data only |
| User authentication | Demo runs locally, single user |
| Memory between sessions | Excluded per Tim's request |
| Creative upload tools | Focus on media buying lifecycle |
| Complex charts/graphs | Phase 1 uses simple metrics display |
| Mobile responsiveness | Demo on large screen |

---

## 11. Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | **Chat + Artifacts Page** | Next.js page with Claude.ai-style chat and artifact panel |
| 2 | **Live Dashboard Page** | Separate page at `/dashboard` with real-time campaign cards |
| 3 | **Backend Server** | Node.js MCP server with 7 tools + WebSocket (multi-client) |
| 4 | **Data Layer** | Mock data loaded and queryable |
| 5 | **Setup Instructions** | README for Mac setup (how to run both windows) |
| 6 | **Demo Verification** | Screenshot/video showing dual-window setup working |

---

## 12. References

### Documentation
- **AdCP Docs**: https://docs.adcontextprotocol.org
- **MCP Docs**: https://modelcontextprotocol.io
- **Claude API**: https://docs.anthropic.com

### Contact
| Item | Detail |
|------|--------|
| **Primary Contact** | Jason Liew (jasonliew@signal42.uk) |
| **Builder** | Ta Khongsap |
| **Timeline** | 1-1.5 days |
| **Mock Data** | Provided as JSON with this PRD |
| **API Key** | Anthropic key provided separately |

---

*S42 Labs — Signal42 Group — PRD v5.2*
