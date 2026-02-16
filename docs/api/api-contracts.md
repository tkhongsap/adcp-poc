# ADCP Demo API Contract

This document captures the implemented backend contracts in this repo (as used by the frontend).

Base assumptions:
- Backend port: `3001` (default)
- Frontend env base: `NEXT_PUBLIC_API_URL` or `http://localhost:3001`
- SSE endpoint: `POST /api/chat/stream`

## 1) Conversation APIs

### `POST /api/chat`

Non-streaming chat request (JSON request/response).

- **Request body**
  - `message` (required, `string`)
  - `conversationId` (optional, `string`)
  - `model` (optional, `string`) — must be one of:
    - `claude-sonnet-4-5-20250929`
    - `claude-opus-4-5-20251101`
    - `claude-haiku-4-5-20251001`

- **Success response**
  - `200`
  - `{ message: string, conversationId: string, toolCalls?: ToolCall[] }`

- **Failure**
  - `400` if `message` missing
  - `500` on processing error

### `POST /api/chat/stream`

Streaming chat endpoint. Response is `text/event-stream` with event frames:

- `event: start`  
  `data: { conversationId, model }`
- `event: text`  
  `data: { text }`
- `event: tool_call`  
  `data: { name, input }`
- `event: tool_result`  
  `data: { name, result }`
- `event: done`  
  `data: { conversationId, toolCalls? }`
- `event: error`  
  `data: { error }`

Headers:
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

### `DELETE /api/chat/:conversationId`

- Deletes an active in-memory conversation
- **Success**: `200`
- **Not found**: `404`
- **Not recommended for production archival**: backend in-memory + file sync rely on explicit delete logic

### `GET /api/chat/:conversationId/history`

- Returns raw in-memory history `{ conversationId, messages }`
- **Success**: `200`, **Not found**: `404`

### Conversation Persistence + Sync Endpoints

#### `GET /api/chat/conversations`
- Returns all stored conversations metadata
- `200` shape: `{ conversations: [{ id, title, createdAt, updatedAt, messageCount }] }`

#### `POST /api/chat/conversations`
- Save/sync a conversation from frontend
- Body fields:
  - `id` (required)
  - `title` (optional)
  - `messages` (required)
  - `createdAt`, `updatedAt` (optional)
- Writes conversation JSON file under `data/conversations`

#### `GET /api/chat/conversations/:id`
- Returns full persisted conversation payload
- `200` payload includes `{ id, title, messages, createdAt, updatedAt }`
- `404` if missing

#### `DELETE /api/chat/conversations/:id`
- Deletes persisted + in-memory conversation
- `200` on success, `404` if missing

## 2) Tool Discovery & Execution APIs

### `GET /api/tools`
- `200` => `{ success: true, tools: string[] }`
- Enumerated tools:
  - `get_products`
  - `list_creative_formats`
  - `list_authorized_properties`
  - `create_media_buy`
  - `get_media_buy_delivery`
  - `update_media_buy`
  - `provide_performance_feedback`

### `POST /api/tools/:toolName`
- Executes one tool directly
- Unknown tool => `404` with available list
- Tool handler errors => `500` with `{ success: false, error }`

## 3) Notification APIs

### `GET /api/notifications/config`
- Returns notification availability/config metadata for UI.

### `GET /api/notifications/draft/:id`
- `id` may be:
  - draft id (`draft_xxx`)
  - media buy id (`mb_xxx`) fallback
- Returns a normalized draft payload (or `404`)

### `GET /api/notifications/draft/by-media-buy/:mediaBuyId`
- Fetches by media buy id alias

### `POST /api/notifications/send-email`
- Body: `{ draftId: string }`
- Success: `{ success: true, message, emailId? }`
- Failure (including missing/invalid key or duplicate send): `400` or `500` depending implementation path

## 4) Health Check

### `GET /health`

- Returns:
  - `status`
  - `timestamp`
  - `dataLoaded`
  - websocket init + connected client count

## 5) Tool Contracts

Below are request/response shape expectations for each tool.

### `get_products`
- **Input**: `{ category?: string, max_cpm?: number }`
- **Output**:  
  `{ success: boolean, products: ProductOutput[], count: number, filters_applied: { category?, max_cpm? } }`

### `list_creative_formats`
- **Input**: `{ type?: "display" | "video" | "native" | "audio" }`
- **Output**:  
  `{ success: boolean, formats: CreativeFormatOutput[], count: number, filters_applied: { type? } }`

### `list_authorized_properties`
- **Input**: `{}`
- **Output**:  
  `{ success: boolean, properties: AuthorizedPropertyOutput[], count: number }`

### `create_media_buy`
- **Input**:
  - `brand_name: string`
  - `product_id: string`
  - `budget: number`
  - `targeting: object` (geo/device/sports_interest etc)
  - `start_time: string` (ISO 8601)
  - `end_time: string` (ISO 8601)
- **Output**:
  - success false if required fields missing or product not found/invalid budget:
    `{ success: false, media_buy: null, error: string }`
  - success true:
    `{ success: true, media_buy: { media_buy_id, status, estimated_impressions, brand_name, product_id, budget, start_time, end_time } }`
- Side effects:
  - Creates campaign + initial metrics in-memory
  - Broadcasts websocket `media_buy_created`

### `get_media_buy_delivery`
- **Input**: `{ media_buy_id?: string }`
- **Output**:
  - if no id: `{ success: true, metrics: DeliveryMetrics[], count }`
  - if id: `{ success: true, metrics: DeliveryMetrics }` or `{ success: false, metrics: null, error }`
- IDs can be brand-like aliases (`Apex`, `TechFlow`, etc.) and resolved internally.

### `update_media_buy`
- **Input**:
  - `media_buy_id: string`
  - `updates: { ... }` one or more operations
- Supported operation nodes:
  - `remove_geo: { countries: string[] }`
  - `add_geo: { countries: string[] }`
  - `adjust_bid: { device: string, change_percent: number }`
  - `set_daily_cap: { amount: number }`
  - `shift_budget: { from_device?, to_device?, from_audience?, to_audience?, percent: number }`
  - `set_status: { status: "active" | "paused" }`
- **Output**:
  `{ success: true, result: { media_buy_id, success, changes_applied, estimated_impact, notifications? } }`
- Side effects:
  - Mutates campaign state + metrics
  - Sends Slack/email draft flow
  - Broadcasts `media_buy_updated`

### `provide_performance_feedback`
- **Input**:
  - `media_buy_id: string`
  - `feedback_type: "conversion_data" | "lead_quality" | "brand_lift"`
  - `data: object` with feedback-specific fields
- **Output**:
  `{ success: true, result: { feedback_id, media_buy_id, status, impact } }`
- Side effects:
  - Appends feedback entry in memory
  - Broadcasts `feedback_submitted`

## 6) Example SSE Success Flow (Chat)

1) Frontend sends `POST /api/chat/stream`.
2) Backend sends:
- `event:start` with `conversationId`
- zero or more `event:text` chunks
- optional pairs of `event:tool_call` and `event:tool_result`
- final `event:done` with persisted `conversationId` and collected tool calls

## 7) Response Shapes Summary

- Most endpoint failures return JSON `error` fields with optional `details`.
- Route-level validation failures in chat are explicit and short-circuit quickly.
- Tool route errors are wrapped with `success: false` where applicable.

