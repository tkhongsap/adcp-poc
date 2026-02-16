# PRD: AdCP Sales Agent Demo

## 1. Introduction/Overview

The AdCP Sales Agent Demo is a two-window demonstration system for Adform executives showcasing how AI agents can interact with Demand-Side Platforms (DSPs) via natural language using the Ad Context Protocol (AdCP).

The system consists of:
1. **Chat + Artifact Page** — Claude.ai-style interface with chat on left and artifact panel on right for rich outputs (reports, tables)
2. **Live Dashboard Page** — Separate window showing real-time media buy data, designed for dual-monitor demo setup
3. **MCP Backend** — Server exposing 7 AdCP tools with WebSocket for real-time updates across all connected clients

**Key Message**: "This is how your clients will interact with Adform in the AI era"

**Demo User**: Tim (Signal42 co-founder) presenting to Adform executives

---

## 2. Goals

- Demonstrate the full AI-powered media buying lifecycle: **Discover → Monitor → Optimize**
- Provide real-time visual feedback via WebSocket when AI takes actions
- Deliver a professional, polished UI inspired by Claude.ai aesthetics
- Support dual-monitor demo setup (chat on laptop, dashboard on projector)
- Execute response times under 3 seconds for smooth demo flow
- Showcase all 7 AdCP tools through natural language interaction

---

## 3. User Stories

### Backend Stories

#### US-001: Set up MCP Server with Express + Socket.io
**Description:** As a developer, I need a backend server that can handle tool requests and broadcast real-time updates so that both frontend pages stay synchronized.

**Acceptance Criteria:**
- [ ] Express server running on configurable port (default 3001)
- [ ] Socket.io integrated for WebSocket connections
- [ ] CORS configured for frontend access
- [ ] Server logs connections and tool calls
- [ ] Typecheck/lint passes

---

#### US-002: Implement `get_products` tool
**Description:** As an AI agent, I want to query available advertising products so that I can help users discover inventory options.

**Acceptance Criteria:**
- [ ] Tool accepts optional `category` parameter (Sports, News, Technology, etc.)
- [ ] Tool accepts optional `max_cpm` parameter for price filtering
- [ ] Returns array of products with: product_id, name, description, category, pricing_options, formats, targeting_capabilities, minimum_budget
- [ ] Loads data from `data/adcp_demo_complete_data.json`
- [ ] Returns 8 products when no filters applied
- [ ] Typecheck/lint passes

---

#### US-003: Implement `list_creative_formats` tool
**Description:** As an AI agent, I want to query available ad formats so that I can help users understand creative specifications.

**Acceptance Criteria:**
- [ ] Tool accepts optional `type` parameter (display, video, native, audio)
- [ ] Returns array of formats with: format_id, name, type, dimensions/duration, file_types, specs
- [ ] Returns 14 formats when no filters applied
- [ ] Typecheck/lint passes

---

#### US-004: Implement `list_authorized_properties` tool
**Description:** As an AI agent, I want to query accessible publisher properties so that I can help users understand where their ads can appear.

**Acceptance Criteria:**
- [ ] Tool requires no parameters
- [ ] Returns array of properties with: property_id, name, domain, category, monthly_uniques, authorization_level, available_formats, audience
- [ ] Returns 10 properties
- [ ] Typecheck/lint passes

---

#### US-005: Implement `create_media_buy` tool
**Description:** As an AI agent, I want to create new media buys so that I can help users launch campaigns programmatically.

**Acceptance Criteria:**
- [ ] Tool accepts required parameters: brand_name, product_id, budget, targeting, start_time, end_time
- [ ] Generates unique media_buy_id
- [ ] Returns: media_buy_id, status ("submitted"), estimated_impressions
- [ ] Broadcasts `media_buy_created` WebSocket event to all connected clients
- [ ] New media buy appears in mock data state
- [ ] Typecheck/lint passes

---

#### US-006: Implement `get_media_buy_delivery` tool
**Description:** As an AI agent, I want to retrieve performance metrics so that I can help users monitor campaign health.

**Acceptance Criteria:**
- [ ] Tool accepts optional `media_buy_id` parameter
- [ ] If media_buy_id provided, returns metrics for that specific media buy
- [ ] If media_buy_id omitted, returns metrics for all media buys
- [ ] Returns: total_budget, total_spend, pacing, health, summary (CTR, CPM, CPA), by_device breakdown, by_geo breakdown, recommendations
- [ ] Returns data for 5 existing media buys
- [ ] Typecheck/lint passes

---

#### US-007: Implement `update_media_buy` tool (with WebSocket broadcast)
**Description:** As an AI agent, I want to modify existing media buys so that I can help users optimize campaign performance in real-time.

**Acceptance Criteria:**
- [ ] Tool accepts required `media_buy_id` parameter
- [ ] Tool accepts `updates` object with optional fields: remove_geo, add_geo, adjust_bid, set_daily_cap, shift_budget
- [ ] Updates mock data state accordingly
- [ ] Calculates and returns estimated_impact
- [ ] Returns: success, changes_applied array, estimated_impact string
- [ ] Broadcasts `media_buy_updated` WebSocket event to ALL connected clients
- [ ] Dashboard updates within 500ms of tool execution
- [ ] Typecheck/lint passes

---

#### US-008: Implement `provide_performance_feedback` tool
**Description:** As an AI agent, I want to submit conversion data so that I can help users provide feedback signals to the platform.

**Acceptance Criteria:**
- [ ] Tool accepts required parameters: media_buy_id, feedback_type ("conversion_data" | "lead_quality" | "brand_lift"), data object
- [ ] Generates unique feedback_id
- [ ] Updates delivery metrics based on feedback (e.g., CPA recalculation)
- [ ] Returns: feedback_id, status ("processed"), impact string
- [ ] Broadcasts `feedback_submitted` WebSocket event to all connected clients
- [ ] Typecheck/lint passes

---

#### US-009: Load and serve mock data from JSON
**Description:** As a developer, I need the backend to load mock data at startup so that all tools have consistent data to work with.

**Acceptance Criteria:**
- [ ] Loads `data/adcp_demo_complete_data.json` on server startup
- [ ] Maintains in-memory state for mutations (updates, creates)
- [ ] Provides reset endpoint to restore original data
- [ ] State persists across tool calls within a session
- [ ] Typecheck/lint passes

---

### Frontend - Dashboard Stories

#### US-010: Create Next.js project with Tailwind + shadcn/ui
**Description:** As a developer, I need a frontend project setup so that I can build the UI components.

**Acceptance Criteria:**
- [ ] Next.js 14+ project initialized with App Router
- [ ] Tailwind CSS configured with Claude.ai color palette
- [ ] shadcn/ui installed and configured
- [ ] TypeScript enabled with strict mode
- [ ] Project runs with `npm run dev`
- [ ] Typecheck/lint passes

---

#### US-011: Build dark sidebar navigation component
**Description:** As a user viewing the dashboard, I want a professional sidebar navigation so that the interface feels like a real DSP platform.

**Acceptance Criteria:**
- [ ] Sidebar width: 220px
- [ ] Background: #1A1915 (warm black)
- [ ] Logo/brand "AdCP Demo" at top
- [ ] Navigation sections: Trading (Media Buys, Products, Formats, Properties), Setup (Creatives, Advertisers)
- [ ] Active item highlighted with #DA7756 (Claude orange)
- [ ] Hover states on nav items
- [ ] **Verify in browser using dev-browser skill**

---

#### US-012: Build data table with media buys
**Description:** As a user viewing the dashboard, I want to see all media buys in a professional table so that I can monitor their status at a glance.

**Acceptance Criteria:**
- [ ] Table container: #FFFFFF background, 12px radius, subtle shadow
- [ ] Columns: Status toggle, ID, Advertiser, Campaign, Spend/Budget, Pacing bar, Health dot
- [ ] Header: 12px uppercase, #5D5D5A text, #FAF9F7 background
- [ ] Rows: 60px height, hover state #F5F4EF
- [ ] Displays all 5 media buys from mock data
- [ ] **Verify in browser using dev-browser skill**

---

#### US-013: Add status toggles and health indicators
**Description:** As a user viewing the dashboard, I want visual indicators for campaign status and health so that I can quickly identify issues.

**Acceptance Criteria:**
- [ ] Status toggle: 40px × 22px, #DA7756 when active, #D4D3CE when paused
- [ ] Toggle animates smoothly (200ms ease-out)
- [ ] Health dots: 10px solid circles
- [ ] Green (#22863A) for "good", Yellow (#D97706) for "warning", Red (#DC2626) for "poor"
- [ ] Tooltip shows health status text on hover
- [ ] **Verify in browser using dev-browser skill**

---

#### US-014: Add pacing bars and spend display
**Description:** As a user viewing the dashboard, I want to see budget progress visually so that I can understand spend rates.

**Acceptance Criteria:**
- [ ] Pacing bar: 80px × 6px, rounded, #EEEEE8 background
- [ ] Fill colors: Green (#22863A) for 0-80%, Amber (#D97706) for 80-100%, Red (#DC2626) for >100%
- [ ] Spend text: "$X / $Y" format with percentage
- [ ] Bar width animates smoothly when value changes (500ms ease)
- [ ] **Verify in browser using dev-browser skill**

---

#### US-015: Add filter bar (search, dropdowns)
**Description:** As a user viewing the dashboard, I want filtering options so that I can find specific media buys quickly.

**Acceptance Criteria:**
- [ ] Search input: 280px width, 40px height, magnifying glass icon, placeholder "Search media buys..."
- [ ] Advertiser dropdown filter
- [ ] Status dropdown filter (All, Active, Paused)
- [ ] "Clear filters" link in #DA7756
- [ ] Focus state: border #DA7756
- [ ] **Verify in browser using dev-browser skill**

---

#### US-016: Add connection status bar
**Description:** As a user viewing the dashboard, I want to see WebSocket connection status so that I know if real-time updates are working.

**Acceptance Criteria:**
- [ ] Fixed at bottom of content area
- [ ] Background: #FAF9F7, border-top: 1px solid #E5E4DF
- [ ] Shows "Last updated: [timestamp]" on left
- [ ] Shows "Connected" + green dot (#22863A) when connected
- [ ] Shows "Reconnecting..." + yellow pulsing dot when reconnecting
- [ ] Shows "Connection lost" + red dot + "Reconnect" link when disconnected
- [ ] **Verify in browser using dev-browser skill**

---

#### US-017: Implement row update animations
**Description:** As a user viewing the dashboard, I want visual feedback when data changes so that I notice real-time updates during the demo.

**Acceptance Criteria:**
- [ ] When any row data updates, row background pulses yellow (#FEF3C7) → white over 400ms
- [ ] Pacing bar width transitions smoothly (500ms ease)
- [ ] Health dot color crossfades (300ms)
- [ ] New rows slide down from top (300ms)
- [ ] CSS keyframes animation named `rowUpdate`
- [ ] **Verify in browser using dev-browser skill**

---

### Frontend - Chat + Artifacts Stories

#### US-018: Build chat panel with message history
**Description:** As a user on the chat page, I want a Claude.ai-style chat interface so that I can converse with the AI agent naturally.

**Acceptance Criteria:**
- [ ] Chat panel: 40% width (min 400px), #FAF9F7 background
- [ ] User messages: right-aligned, #F5F4EF background, 18px radius
- [ ] Claude messages: left-aligned, no bubble, Claude avatar icon on left
- [ ] Messages max-width: 80% of chat panel
- [ ] Scrollable message history
- [ ] **Verify in browser using dev-browser skill**

---

#### US-019: Build message input with send button
**Description:** As a user on the chat page, I want an input field to send messages so that I can query the AI agent.

**Acceptance Criteria:**
- [ ] Input: sticky at bottom, 52px height, 24px radius (pill shape)
- [ ] Placeholder: "Message AdCP Agent..."
- [ ] Send button: circular, #DA7756, inside input on right
- [ ] Enter key submits message
- [ ] Input clears after sending
- [ ] Disabled state while waiting for response
- [ ] **Verify in browser using dev-browser skill**

---

#### US-020: Build artifact panel container
**Description:** As a user on the chat page, I want an artifact panel that displays rich content so that I can see detailed reports and tables.

**Acceptance Criteria:**
- [ ] Artifact panel: 60% width, #FFFFFF background
- [ ] Artifact container: 12px radius, 1px #E5E4DF border, subtle shadow
- [ ] Max-width: 800px, centered
- [ ] Header with icon and title (16px / 500 weight)
- [ ] Empty state: "No artifact yet" with subtitle "Ask about media buys, products, or request a report"
- [ ] Artifact persists until replaced by new artifact
- [ ] **Verify in browser using dev-browser skill**

---

#### US-021: Implement table artifact rendering
**Description:** As a user on the chat page, I want tables displayed beautifully in the artifact panel so that I can review campaign data.

**Acceptance Criteria:**
- [ ] Table header: 12px uppercase, #5D5D5A
- [ ] Table rows: 14px, #1A1915, divider 1px #EEEEE8
- [ ] Includes pacing bars (6px height, colored by status)
- [ ] Includes health dots (10px, colored)
- [ ] Triggered by queries like "Show all campaigns", "List products"
- [ ] **Verify in browser using dev-browser skill**

---

#### US-022: Implement report artifact rendering
**Description:** As a user on the chat page, I want formatted reports in the artifact panel so that I can see analysis and recommendations.

**Acceptance Criteria:**
- [ ] Report sections with headers
- [ ] Metrics displayed prominently
- [ ] Recommendations as bullet list
- [ ] Triggered by queries like "Give me a performance report", "Analyze performance"
- [ ] Proper markdown rendering
- [ ] **Verify in browser using dev-browser skill**

---

#### US-023: Add "Open Dashboard" button
**Description:** As a user on the chat page, I want a button to open the dashboard so that I can set up the dual-monitor demo.

**Acceptance Criteria:**
- [ ] Button in header area: "Open Dashboard" with external link icon
- [ ] Opens `/dashboard` in new browser window/tab
- [ ] Button style: Ghost button with #E5E4DF border
- [ ] Hover state: #F5F4EF background
- [ ] **Verify in browser using dev-browser skill**

---

#### US-024: Integrate Claude API with tool calling
**Description:** As a developer, I need Claude API integration so that the chat interface can process natural language queries.

**Acceptance Criteria:**
- [ ] Claude API client configured with Anthropic SDK
- [ ] System prompt defines AdCP agent role and available tools
- [ ] All 7 AdCP tools registered as Claude tools
- [ ] Tool calls routed to backend MCP server
- [ ] Responses streamed to chat (typing indicator while processing)
- [ ] Errors handled gracefully with user-friendly messages
- [ ] Typecheck/lint passes

---

### Integration Stories

#### US-025: Create useWebSocket hook for real-time sync
**Description:** As a developer, I need a shared WebSocket hook so that both pages can receive real-time updates.

**Acceptance Criteria:**
- [ ] Hook manages Socket.io connection lifecycle
- [ ] Handles `initial_state` event on connect
- [ ] Handles `media_buy_updated`, `media_buy_created`, `feedback_submitted` events
- [ ] Automatic reconnection with exponential backoff
- [ ] Returns connection status (connected, reconnecting, disconnected)
- [ ] Returns last update timestamp
- [ ] Typecheck/lint passes

---

#### US-026: Connect dashboard to WebSocket events
**Description:** As a user viewing the dashboard, I want real-time updates so that I see changes when AI takes actions.

**Acceptance Criteria:**
- [ ] Dashboard receives initial state on page load
- [ ] `media_buy_updated` event triggers row update animation
- [ ] `media_buy_created` event adds new row with animation
- [ ] `feedback_submitted` event updates metrics with animation
- [ ] Multiple dashboard windows all update simultaneously
- [ ] **Verify in browser using dev-browser skill**

---

#### US-027: Connect chat page to backend tools
**Description:** As a developer, I need the chat page to call backend tools so that AI responses include real data.

**Acceptance Criteria:**
- [ ] Chat sends tool calls to backend API endpoint
- [ ] Backend executes tool and returns result
- [ ] Tool results passed back to Claude for response generation
- [ ] DISCOVER tools return read-only data
- [ ] OPTIMIZE tools trigger WebSocket broadcasts
- [ ] Typecheck/lint passes

---

#### US-028: Test multi-client synchronization
**Description:** As a demo presenter, I need multiple browser windows to stay synchronized so that the dual-monitor setup works flawlessly.

**Acceptance Criteria:**
- [ ] Open chat page in Window 1
- [ ] Open dashboard in Window 2
- [ ] Execute "Pause Germany for Apex Motors" in chat
- [ ] Dashboard in Window 2 updates within 500ms
- [ ] Open third dashboard window - also receives updates
- [ ] Disconnect and reconnect - state remains consistent
- [ ] **Verify in browser using dev-browser skill**

---

## 4. Functional Requirements

### Discovery Tools
- FR-1: The system must allow querying products by category and max CPM
- FR-2: The system must return all 8 products when no filters are applied to `get_products`
- FR-3: The system must allow querying creative formats by type (display, video, native, audio)
- FR-4: The system must return all 14 formats when no filters are applied to `list_creative_formats`
- FR-5: The system must return all 10 authorized properties when `list_authorized_properties` is called

### Media Buy Operations
- FR-6: The system must allow creating new media buys with brand name, product, budget, targeting, and dates
- FR-7: The system must generate unique IDs for new media buys in format `mb_YYYYMMDD_###`
- FR-8: The system must return delivery metrics for a specific media buy or all media buys
- FR-9: The system must allow updating media buys with geo changes, bid adjustments, daily caps, and budget shifts
- FR-10: The system must calculate estimated impact for all update operations

### Real-Time Updates
- FR-11: The system must broadcast WebSocket events when any media buy is created or updated
- FR-12: The system must broadcast WebSocket events when performance feedback is submitted
- FR-13: All connected clients must receive WebSocket events within 500ms of the triggering action
- FR-14: The system must send initial state to clients on WebSocket connection

### Chat Interface
- FR-15: The system must display simple responses (confirmations, single values) inline in chat
- FR-16: The system must display rich responses (tables, reports) in the artifact panel
- FR-17: The system must show typing indicator while Claude is processing
- FR-18: The system must support markdown rendering in chat messages

### Dashboard Display
- FR-19: The dashboard must display all 5 media buys with status, metrics, and health indicators
- FR-20: The dashboard must show real-time connection status
- FR-21: The dashboard must animate data changes (row highlight, bar transitions)
- FR-22: The dashboard must display "Last updated" timestamp

### Data Management
- FR-23: The system must load mock data from `data/adcp_demo_complete_data.json` on startup
- FR-24: The system must maintain in-memory state for the duration of the session
- FR-25: The system must provide a reset endpoint to restore original mock data

---

## 5. Non-Goals (Out of Scope)

| Exclusion | Rationale |
|-----------|-----------|
| Real ad platform integrations | Demo uses mock data only |
| User authentication | Demo runs locally, single user |
| Memory between sessions | Excluded per Tim's request |
| Creative upload tools | Focus on media buying lifecycle |
| Complex charts/graphs | Phase 1 uses simple metrics display |
| Mobile responsiveness | Demo on large screen only |

---

## 6. Design Considerations

### Color System (Claude.ai / Anthropic Inspired)

**Base Colors:**
- Background Primary: `#F5F4EF` (warm cream/beige)
- Background Secondary: `#FFFFFF` (cards, panels)
- Text Primary: `#1A1915` (near black, warm)
- Text Secondary: `#5D5D5A` (medium gray)
- Borders: `#E5E4DF`

**Accent Colors:**
- Primary Accent: `#DA7756` (Claude's signature coral/orange)
- Sidebar Background: `#1A1915` (warm black)

**Status Colors:**
- Good: `#22863A` (green)
- Warning: `#D97706` (amber)
- Poor: `#DC2626` (red)

### Typography
- Font Family: "Söhne" or fallback to "Inter", system-ui
- Page Title: 24px / 500 weight
- Table Header: 12px / 500 weight / uppercase / tracking 0.03em
- Body: 14px / 400 weight

### Layout
- Sidebar: 220px fixed width
- Chat Panel: 40% width (min 400px)
- Artifact Panel: 60% width
- Dashboard Content: max 1200px centered

### Reference
See Section 4.7 of the Comprehensive PRD (`docs/product/prd-adcp-sales-demo-comprehensive.md`) for complete design specifications.

---

## 7. Technical Considerations

### Frontend Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React hooks + WebSocket state sync
- **Types**: TypeScript with strict mode

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **AI**: Claude API (Anthropic SDK)

### Data
- **Source**: `data/adcp_demo_complete_data.json`
- **Storage**: In-memory during session
- **Schema**: Products, Media Buys, Creative Formats, Properties, Delivery Metrics

### Architecture
```
┌─────────────────┐     ┌─────────────────┐
│  Chat Page (/)  │     │ Dashboard       │
│                 │     │ (/dashboard)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    Claude API         │
         ├───────────────────────┤
         │                       │
         └───────┬───────────────┘
                 │ WebSocket + REST
                 ▼
         ┌───────────────┐
         │ Backend MCP   │
         │ Server        │
         │ (Express +    │
         │  Socket.io)   │
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────┐
         │ Mock Data     │
         │ (JSON)        │
         └───────────────┘
```

---

## 8. Success Metrics

Based on Acceptance Criteria from Comprehensive PRD Section 8:

### Chat + Artifacts Page (Window 1)
1. Page loads with chat + artifact layout
2. Chat interface accepts input and displays responses
3. Simple responses appear inline in chat
4. Rich outputs appear in artifact panel
5. Artifacts persist until replaced
6. "Open Dashboard" button opens `/dashboard` in new window

### Live Dashboard Page (Window 2)
7. Dashboard page loads at `/dashboard`
8. Shows all 5 campaign cards
9. Health badges display correctly (green/yellow/red)
10. Connection status shows connected (green indicator)

### Real-Time Sync (Both Windows)
11. WebSocket syncs both windows
12. Geo chips animate on change (e.g., DE chip fades out)
13. Metrics update on feedback submission
14. Multiple clients stay in sync

### Demo Flow
15. All 7 tools return valid responses
16. DISCOVER phase works (products, formats, properties)
17. MONITOR phase works (campaigns, metrics, breakdowns)
18. OPTIMIZE phase works (bid changes, geo pauses)
19. Response times under 3 seconds
20. Professional appearance

---

## 9. Open Questions

None - the comprehensive PRD provides complete specifications.

---

## References

- **Comprehensive PRD**: `docs/product/prd-adcp-sales-demo-comprehensive.md`
- **Mock Data**: `data/adcp_demo_complete_data.json`
- **AdCP Docs**: https://docs.adcontextprotocol.org
- **MCP Docs**: https://modelcontextprotocol.io
- **Claude API**: https://docs.anthropic.com

---

*S42 Labs — Signal42 Group — PRD v1.0*
