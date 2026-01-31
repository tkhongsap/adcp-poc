# AdCP Sales Demo - Ralph Agent Todo List

> **Ralph Loop Protocol**
>
> 1.  **Pick Task**: Find the highest priority task below that is unchecked `[ ]`.
> 2.  **Implement**: Write the code to satisfy the Acceptance Criteria.
> 3.  **Verify**: Run tests/checks to ensure it passes.
> 4.  **Mark Complete**: Check the box `[x]` in this file.
> 5.  **Update PRD**: Update `prd.json` to set `passes: true` for that story.
> 6.  **Loop**: Repeat until all tasks are complete.

## Status Dashboard
Total Tasks: 33
Completed: 7
Remaining: 26

## Task List

- [x] **US-001: Project setup with Next.js and Express**
  - *Description*: As a developer, I need the project scaffolded with Next.js frontend and Express backend so I can build the demo application.
  - *Acceptance Criteria*:
    - Next.js 14 app created in src/frontend with App Router
    - Express server created in src/backend
    - Tailwind CSS configured
    - TypeScript configured for both frontend and backend
    - Both frontend and backend can start without errors
    - package.json scripts for dev, build, start
    - Typecheck passes

- [x] **US-002: Load mock data layer**
  - *Description*: As a developer, I need the mock data loaded from data/adcp_demo_complete_data.json so tools can access it.
  - *Acceptance Criteria*:
    - Data loader module created in backend
    - JSON data loaded on server startup
    - Data accessible via exported functions
    - In-memory state for updates during demo
    - Typecheck passes

- [x] **US-003: Implement get_products tool**
  - *Description*: As an AI agent, I need the get_products tool to discover available advertising inventory.
  - *Acceptance Criteria*:
    - Tool accepts optional category and max_cpm parameters
    - Returns products array with product_id, name, description, category, pricing_options
    - Filters by category when provided
    - Filters by max_cpm when provided
    - Returns all products when no filters
    - Typecheck passes

- [x] **US-004: Implement list_creative_formats tool**
  - *Description*: As an AI agent, I need the list_creative_formats tool to get available ad format specifications.
  - *Acceptance Criteria*:
    - Tool accepts optional type parameter (display, video, native, audio)
    - Returns formats array with format_id, name, type, dimensions, specs
    - Filters by type when provided
    - Returns all formats when no filter
    - Typecheck passes

- [x] **US-005: Implement list_authorized_properties tool**
  - *Description*: As an AI agent, I need the list_authorized_properties tool to get accessible publishers.
  - *Acceptance Criteria*:
    - Tool takes no parameters
    - Returns properties array with property_id, name, domain, category, monthly_uniques
    - Includes authorization_level and available_formats
    - Typecheck passes

- [x] **US-006: Implement create_media_buy tool**
  - *Description*: As an AI agent, I need the create_media_buy tool to launch new campaigns.
  - *Acceptance Criteria*:
    - Tool accepts brand_name, product_id, budget, targeting, start_time, end_time
    - Creates new media buy in mock data
    - Returns media_buy_id, status submitted, estimated_impressions
    - Generates unique media_buy_id
    - Typecheck passes

- [x] **US-007: Implement get_media_buy_delivery tool**
  - *Description*: As an AI agent, I need the get_media_buy_delivery tool to get performance metrics.
  - *Acceptance Criteria*:
    - Tool accepts optional media_buy_id parameter
    - Returns single media buy metrics when id provided
    - Returns all media buy metrics when id omitted
    - Includes total_budget, total_spend, pacing, health, summary, by_device, by_geo, recommendations
    - Typecheck passes

- [ ] **US-008: Implement update_media_buy tool**
  - *Description*: As an AI agent, I need the update_media_buy tool to modify existing campaigns.
  - *Acceptance Criteria*:
    - Tool accepts media_buy_id and updates object
    - Supports remove_geo, add_geo operations
    - Supports adjust_bid with device and change_percent
    - Supports set_daily_cap and shift_budget operations
    - Returns success, changes_applied, estimated_impact
    - Updates mock data state
    - Typecheck passes

- [ ] **US-009: Implement provide_performance_feedback tool**
  - *Description*: As an AI agent, I need the provide_performance_feedback tool to submit conversion data.
  - *Acceptance Criteria*:
    - Tool accepts media_buy_id, feedback_type, and data object
    - Supports feedback_type: conversion_data, lead_quality, brand_lift
    - Returns feedback_id, status processed, impact
    - Logs feedback to performance_feedback_log
    - Typecheck passes

- [ ] **US-010: Add WebSocket broadcasting**
  - *Description*: As a developer, I need Socket.io broadcasting so both windows can sync state.
  - *Acceptance Criteria*:
    - Socket.io integrated with Express server
    - Broadcasts initial_state event on client connect
    - Broadcasts media_buy_updated when update_media_buy called
    - Broadcasts media_buy_created when create_media_buy called
    - Broadcasts feedback_submitted when provide_performance_feedback called
    - Supports multiple connected clients
    - Typecheck passes

- [ ] **US-011: Create REST API endpoints for tools**
  - *Description*: As a developer, I need REST API endpoints that wrap the tools so the frontend can call them.
  - *Acceptance Criteria*:
    - POST /api/tools/:toolName endpoint created
    - Routes to appropriate tool handler
    - Returns tool results as JSON
    - Handles errors gracefully
    - CORS configured for frontend
    - Typecheck passes

- [ ] **US-012: Create chat page layout with 40/60 split**
  - *Description*: As a user, I want a Claude.ai-style layout with chat on left and artifact panel on right.
  - *Acceptance Criteria*:
    - Chat page at / or /chat route
    - 40% width chat panel on left
    - 60% width artifact panel on right
    - Responsive container with min-widths
    - Claude.ai-inspired warm cream background (#F5F4EF)
    - Typecheck passes

- [ ] **US-013: Build ChatPanel with message history**
  - *Description*: As a user, I want to see a scrollable message history in the chat panel.
  - *Acceptance Criteria*:
    - ChatPanel component created
    - Displays user messages right-aligned with warm gray background
    - Displays Claude messages left-aligned with no bubble
    - Auto-scrolls to latest message
    - Supports markdown rendering in messages
    - Typecheck passes

- [ ] **US-014: Build MessageInput component**
  - *Description*: As a user, I want an input field to type messages to the AI agent.
  - *Acceptance Criteria*:
    - MessageInput component created
    - Pill-shaped input field (24px radius) at bottom of chat
    - Send button with Claude orange (#DA7756)
    - Enter key submits message
    - Placeholder text: Message AdCP Agent...
    - Typecheck passes

- [ ] **US-015: Integrate Claude API with tool calling**
  - *Description*: As a developer, I need Claude API integration so the chat can call tools.
  - *Acceptance Criteria*:
    - Claude API client configured with API key from env
    - Tool definitions for all 7 AdCP tools
    - Handles tool_use responses and executes tools
    - Returns tool results to Claude for final response
    - Handles streaming responses
    - Typecheck passes

- [ ] **US-016: Build ArtifactPanel container**
  - *Description*: As a user, I want an artifact panel that displays rich content from Claude responses.
  - *Acceptance Criteria*:
    - ArtifactPanel component created
    - White background with subtle border (#E5E4DF)
    - 12px border radius
    - Shows empty state when no artifact
    - Persists artifact until replaced
    - Typecheck passes

- [ ] **US-017: Build TableArtifact component**
  - *Description*: As a user, I want to see campaign data in beautifully formatted tables.
  - *Acceptance Criteria*:
    - TableArtifact component created
    - Styled headers (12px, uppercase, #5D5D5A)
    - Row dividers with #EEEEE8
    - Row hover state with warm cream background
    - Supports pacing bars and health dots in cells
    - Typecheck passes

- [ ] **US-018: Build ReportArtifact component**
  - *Description*: As a user, I want to see performance reports with sections, metrics, and recommendations.
  - *Acceptance Criteria*:
    - ReportArtifact component created
    - Supports title with icon
    - Sections with headers
    - Metrics display with labels and values
    - Recommendations as bullet list
    - Typecheck passes

- [ ] **US-019: Add artifact detection logic**
  - *Description*: As a developer, I need logic to determine when to show artifacts vs inline responses.
  - *Acceptance Criteria*:
    - Simple confirmations (Pause Germany) stay inline
    - Single values (What's the CTR?) stay inline
    - Tables (Show all campaigns) go to artifact panel
    - Reports (Give me a performance report) go to artifact panel
    - Comparison queries go to artifact panel
    - Typecheck passes

- [ ] **US-020: Add Open Dashboard button**
  - *Description*: As a user, I want a button to open the live dashboard in a new window.
  - *Acceptance Criteria*:
    - Button visible in chat page header or artifact panel
    - Opens /dashboard in new window/tab
    - Styled with Claude orange or secondary dark
    - Typecheck passes

- [ ] **US-021: Create dashboard page layout**
  - *Description*: As a user, I want a live dashboard page for real-time campaign monitoring.
  - *Acceptance Criteria*:
    - Dashboard page at /dashboard route
    - Dark sidebar (220px) on left
    - Main content area with warm cream background
    - Full-width layout optimized for projector/second screen
    - Typecheck passes

- [ ] **US-022: Build sidebar navigation**
  - *Description*: As a user, I want a Claude.ai-style dark sidebar for dashboard navigation.
  - *Acceptance Criteria*:
    - Sidebar component with #1A1915 background
    - AdCP Demo branding at top
    - Trading section with Media Buys, Products, Formats links
    - Active state with #DA7756 text or left accent
    - Typecheck passes

- [ ] **US-023: Build CampaignCard component**
  - *Description*: As a user, I want campaign cards showing key metrics for each media buy.
  - *Acceptance Criteria*:
    - CampaignCard component created
    - Shows campaign name and advertiser
    - Shows budget and spend with progress bar
    - Shows key metrics: CTR, CPM, CPA
    - White background with subtle border
    - Typecheck passes

- [ ] **US-024: Add HealthBadge component**
  - *Description*: As a user, I want to see campaign health status at a glance.
  - *Acceptance Criteria*:
    - HealthBadge component with colored dot
    - Green (#22863A) for good
    - Amber (#D97706) for warning
    - Red (#DC2626) for poor
    - 10px dot with tooltip on hover
    - Typecheck passes

- [ ] **US-025: Add GeoChips with animation**
  - *Description*: As a user, I want to see targeted countries as visual chips that animate on change.
  - *Acceptance Criteria*:
    - GeoChips component displays country codes as pills
    - Fade out animation when geo is removed
    - Fade in animation when geo is added
    - 300ms transition duration
    - Typecheck passes

- [ ] **US-026: Add DeviceChips component**
  - *Description*: As a user, I want to see device targeting as visual chips.
  - *Acceptance Criteria*:
    - DeviceChips component displays devices as pills
    - Shows Desktop, Mobile, Tablet as applicable
    - Consistent styling with GeoChips
    - Typecheck passes

- [ ] **US-027: Add BudgetBar component**
  - *Description*: As a user, I want to see budget spend as a progress bar with pacing colors.
  - *Acceptance Criteria*:
    - BudgetBar component with 6px height
    - Green fill for 0-80% spent
    - Amber fill for 80-100% spent
    - Red fill for over 100% spent
    - Shows percentage text
    - Typecheck passes

- [ ] **US-028: Add ConnectionStatus indicator**
  - *Description*: As a user, I want to see if the dashboard is connected to the backend.
  - *Acceptance Criteria*:
    - ConnectionStatus component at bottom of dashboard
    - Green dot and Connected text when connected
    - Red dot and Disconnected when disconnected
    - Shows last updated timestamp
    - Typecheck passes

- [ ] **US-029: Connect dashboard to WebSocket**
  - *Description*: As a developer, I need the dashboard to receive WebSocket events.
  - *Acceptance Criteria*:
    - useWebSocket hook created
    - Connects to backend Socket.io server
    - Handles initial_state event to populate data
    - Handles media_buy_updated event
    - Handles media_buy_created event
    - Handles feedback_submitted event
    - Updates local state on events
    - Typecheck passes

- [ ] **US-030: Add data table view for media buys**
  - *Description*: As a user, I want to see media buys in a table format on the dashboard.
  - *Acceptance Criteria*:
    - MediaBuysTable component created
    - Columns: Status, ID, Advertiser, Campaign, Spend/Budget, Health
    - Row hover state
    - Status toggle switch styled like Claude.ai
    - Pacing bar in spend column
    - Typecheck passes

- [ ] **US-031: Add row highlight animation on updates**
  - *Description*: As a user, I want to see which rows were just updated.
  - *Acceptance Criteria*:
    - Row flashes yellow (#FEF3C7) when updated
    - 400ms animation duration
    - Fades back to white
    - Works for metric changes, geo changes, bid changes
    - Typecheck passes

- [ ] **US-032: Add typing indicator to chat**
  - *Description*: As a user, I want to see when Claude is processing my request.
  - *Acceptance Criteria*:
    - TypingIndicator component with animated dots
    - Shows while waiting for Claude API response
    - Hides when response arrives
    - Positioned where next message would appear
    - Typecheck passes

- [ ] **US-033: End-to-end demo flow test**
  - *Description*: As Tim, I want to verify the complete demo flow works.
  - *Acceptance Criteria*:
    - Chat page loads and accepts messages
    - Claude responds with tool calls
    - Tables appear in artifact panel
    - Dashboard shows all 5 campaigns
    - Pausing Germany removes DE chip from dashboard
    - Connection status shows connected
    - Typecheck passes
