# AdCP Architecture Analysis

**Question**: Is this an MCP server/protocol? What are the host, client, server, data, and tools?

---

## Summary

**This is NOT a true MCP implementation.** It's a **Claude SDK-based agentic application** using Claude's `tool_use` protocol, which is MCP-adjacent but not the formal Model Context Protocol specification.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOST                                    │
│              Express.js Backend (Port 3001)                     │
│              /src/backend/src/index.ts                          │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         │                                         │
         ▼                                         ▼
┌─────────────────────┐                 ┌─────────────────────┐
│      CLIENT         │                 │    WebSocket        │
│  Next.js Frontend   │                 │    (Socket.io)      │
│  (Port 5000)        │                 │    Real-time sync   │
└─────────────────────┘                 └─────────────────────┘
         │
         │ HTTP POST /api/chat/stream (SSE)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER                                    │
│              Claude API Client (Agentic Loop)                    │
│              /src/backend/src/claude/client.ts                   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  TOOL_DEFINITIONS (7 tools with JSON schemas)           │   │
│   │  Agentic loop: tool_use → executeTool() → tool_result   │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TOOLS                                    │
│              /src/backend/src/tools/*.ts (7 modules)             │
│                                                                  │
│   get_products          │ list_creative_formats                  │
│   list_authorized_properties │ create_media_buy                  │
│   get_media_buy_delivery│ update_media_buy                       │
│   provide_performance_feedback                                   │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA                                     │
│              /src/backend/src/data/loader.ts                     │
│              In-memory state loaded from:                        │
│              /data/adcp_demo_complete_data.json                  │
│                                                                  │
│   products[] │ media_buys[] │ delivery_metrics{}                 │
│   aggregations{} │ performance_feedback_log[]                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. HOST - Express.js Backend

**File**: `/src/backend/src/index.ts`

The Express.js server acts as the **host** that orchestrates all components:

```typescript
const app = express();
const httpServer = createServer(app);
const PORT = process.env.BACKEND_PORT || 3001;

// Load mock data on startup
loadData();

// Initialize WebSocket server
initializeWebSocket(httpServer);

// API Routes
app.use('/api/tools', toolsRouter);
app.use('/api/chat', chatRouter);
```

**Responsibilities**:
- HTTP server on port 3001
- Routes: `/api/chat`, `/api/chat/stream`, `/api/tools`, `/health`
- WebSocket server for real-time updates via Socket.io
- Loads mock data on startup

---

### 2. CLIENT - Next.js Frontend

**File**: `/src/frontend/src/components/chat/MainContainer.tsx`

The React frontend acts as the **client** that users interact with:

```typescript
// Send message to backend
const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: content,
    conversationId: conversationIdRef.current,
    model: selectedModel,  // claude-sonnet-4-5, claude-opus-4-5, or claude-haiku-4-5
  }),
});

// Process SSE stream for real-time responses
const reader = response.body?.getReader();
// ... handles 'text', 'tool_call', 'tool_result', 'done', 'error' events
```

**Responsibilities**:
- Chat UI with message history
- Sends HTTP POST to `/api/chat/stream`
- Receives SSE (Server-Sent Events) for streaming responses
- Connects to WebSocket for live state updates
- Model selector (Sonnet 4.5 / Opus 4.5 / Haiku 4.5)
- Artifact panel for visualizing tool results

---

### 3. SERVER - Claude API Client (Agentic Loop)

**File**: `/src/backend/src/claude/client.ts`

This is the core "MCP-like" component that manages the agentic loop:

```typescript
// Tool definitions with JSON schemas
export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'get_products',
    description: 'Discover available advertising inventory...',
    input_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: '...' },
        max_cpm: { type: 'number', description: '...' },
      },
      required: [],
    },
  },
  // ... 7 tools total
];

// Agentic loop pattern
while (response.stop_reason === 'tool_use') {
  // 1. Extract tool_use blocks from Claude's response
  const toolUseBlocks = response.content.filter(
    (block): block is ToolUseBlock => block.type === 'tool_use'
  );

  // 2. Execute each tool locally
  for (const toolUse of toolUseBlocks) {
    const result = executeTool(toolUse.name, toolUse.input);
    toolResults.push({
      type: 'tool_result',
      tool_use_id: toolUse.id,
      content: JSON.stringify(result),
    });
  }

  // 3. Send tool_result back to Claude
  messages.push({ role: 'assistant', content: response.content });
  messages.push({ role: 'user', content: toolResults });

  // 4. Continue conversation until Claude gives final text response
  response = await anthropic.messages.create({ ... });
}
```

**Responsibilities**:
- Initializes Anthropic SDK client
- Defines 7 tools with JSON schemas
- Manages conversation history
- Executes agentic loop (tool_use → execute → tool_result → repeat)
- Supports both synchronous and streaming responses

---

### 4. TOOLS - 7 Campaign Management Tools

**Directory**: `/src/backend/src/tools/`

| Tool | File | Purpose |
|------|------|---------|
| `get_products` | `getProducts.ts` | Query ad inventory with optional category/CPM filters |
| `list_creative_formats` | `listCreativeFormats.ts` | Get ad format specs (display, video, native, audio) |
| `list_authorized_properties` | `listAuthorizedProperties.ts` | Get publisher access with authorization levels |
| `create_media_buy` | `createMediaBuy.ts` | Launch new advertising campaigns |
| `get_media_buy_delivery` | `getMediaBuyDelivery.ts` | Get performance metrics for campaigns |
| `update_media_buy` | `updateMediaBuy.ts` | Modify campaigns (targeting, bids, budgets) |
| `provide_performance_feedback` | `providePerformanceFeedback.ts` | Submit conversion data, lead quality, or brand lift |

**Tool execution dispatcher** (in `client.ts`):
```typescript
function executeTool(toolName: string, toolInput: Record<string, unknown>): unknown {
  switch (toolName) {
    case 'get_products':
      return getProducts(toolInput as { category?: string; max_cpm?: number });
    case 'list_creative_formats':
      return listCreativeFormats(toolInput as { type?: 'display' | 'video' | 'native' | 'audio' });
    // ... etc
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
```

---

### 5. DATA - In-Memory State

**File**: `/src/backend/src/data/loader.ts`
**Source**: `/data/adcp_demo_complete_data.json`

```typescript
interface AdCPData {
  products: Product[]                              // 8 ad products
  media_buys: MediaBuy[]                           // 5 campaigns
  delivery_metrics: Record<string, DeliveryMetrics>
  aggregations: Aggregations
  performance_feedback_log: PerformanceFeedback[]
}

// Also includes static reference data:
const creativeFormats: CreativeFormat[]        // 13 formats
const authorizedProperties: AuthorizedProperty[] // 10 publishers
```

**Data access pattern**:
- Data loaded from JSON file on server startup
- Stored in module-level variable (`let data: AdCPData | null`)
- CRUD operations modify in-memory state
- No persistence (resets on server restart)

---

## MCP vs. This Implementation

| Aspect | True MCP | This Implementation |
|--------|----------|---------------------|
| **Protocol** | JSON-RPC 2.0 over stdio/SSE/WebSocket | HTTP REST + Claude SDK |
| **Tool Registry** | Server exposes tools via `tools/list` method | Client defines `TOOL_DEFINITIONS` array |
| **Tool Execution** | MCP server executes tools autonomously | Application executes tools, sends results to Claude |
| **Resources** | `resources/read`, `resources/list` protocol | Not implemented |
| **Prompts** | `prompts/get`, `prompts/list` protocol | Static system prompt in code |
| **Transport** | Formal MCP transport layer | Standard HTTP/SSE |
| **Discovery** | Runtime capability negotiation | Tools hardcoded at compile time |

---

## Key Insight

This is a **Claude tool_use implementation**, not MCP. The pattern is similar:

1. Tools are defined with JSON schemas (like MCP)
2. Claude requests tool execution via `tool_use` content blocks
3. Application executes tools locally
4. Results sent back via `tool_result` content blocks
5. Repeat until Claude produces final text response

**But it's NOT MCP because**:
- No separate MCP server process
- No JSON-RPC 2.0 protocol
- No `resources/` or `prompts/` protocols
- No capability negotiation
- Tools defined client-side (in the app calling Claude), not server-side (in a separate MCP server)

---

## Data Flow Summary

```
1. User types message in Next.js chat UI
                    │
                    ▼
2. POST /api/chat/stream { message, conversationId, model }
                    │
                    ▼
3. Express backend calls Claude API with TOOL_DEFINITIONS
                    │
                    ▼
4. Claude responds with tool_use block (e.g., get_products)
                    │
                    ▼
5. Backend executes tool locally via executeTool()
                    │
                    ▼
6. Tool reads from in-memory data (loaded from JSON)
                    │
                    ▼
7. Backend sends tool_result back to Claude
                    │
                    ▼
8. Claude continues (may call more tools or give final response)
                    │
                    ▼
9. SSE streams response chunks back to frontend
                    │
                    ▼
10. Frontend renders message and optionally shows artifact panel
```

---

## Files Reference

| Component | Key File |
|-----------|----------|
| Host | `/src/backend/src/index.ts` |
| Client | `/src/frontend/src/components/chat/MainContainer.tsx` |
| Server (Claude) | `/src/backend/src/claude/client.ts` |
| Tools | `/src/backend/src/tools/*.ts` (7 files + index) |
| Data Loader | `/src/backend/src/data/loader.ts` |
| Mock Data | `/data/adcp_demo_complete_data.json` |
| Types | `/src/backend/src/types/data.ts` |

---

## Conclusion

This application demonstrates a well-structured **agentic AI pattern** using the Anthropic SDK, but should not be confused with the formal **Model Context Protocol (MCP)**. To convert this to true MCP, you would need to:

1. Create a separate MCP server process
2. Implement JSON-RPC 2.0 transport
3. Move tool definitions to the MCP server
4. Have the Claude-calling application act as an MCP client
5. Optionally implement resources and prompts protocols
