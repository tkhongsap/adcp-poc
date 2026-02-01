# Chat-to-Dashboard Real-Time Sync

**Branch:** `feature/chat-dashboard-sync`
**Status:** Planning
**Date:** February 1, 2026

---

## Overview

Enable chat commands like "pause this campaign" or "stop Apex Motors" to update the dashboard toggle switch in real-time, creating a powerful demo moment where natural language commands visibly affect the UI.

---

## Current State

### What Already Works

The architecture for real-time updates is **already implemented**:

| Component | File | Status |
|-----------|------|--------|
| WebSocket broadcast | `src/backend/src/websocket/socket.ts` | Working |
| Frontend listener | `src/frontend/src/hooks/useWebSocket.ts` | Working |
| Update tool | `src/backend/src/tools/updateMediaBuy.ts` | Partial |
| Dashboard table | `src/frontend/src/components/dashboard/MediaBuysTable.tsx` | Working |

### Supported Operations (update_media_buy tool)

| Operation | Chat Example | Dashboard Effect |
|-----------|--------------|------------------|
| `remove_geo` | "Pause Germany targeting" | Geo chips update |
| `add_geo` | "Add UK targeting" | Geo chips update |
| `adjust_bid` | "Reduce mobile bid by 30%" | Metrics update |
| `set_daily_cap` | "Cap daily spend at $500" | Pacing bar updates |
| `shift_budget` | "Shift budget to desktop" | Allocation changes |

### Missing Operation

| Operation | Chat Example | Dashboard Effect |
|-----------|--------------|------------------|
| `set_status` | "Pause Apex campaign" | Toggle switch flips |

---

## Implementation Plan

### Task 1: Add `set_status` Operation Type

**File:** `src/backend/src/tools/updateMediaBuy.ts`

Add new interface and operation:

```typescript
// New interface
export interface SetStatusOperation {
  status: "active" | "paused";
}

// Add to MediaBuyUpdates interface
export interface MediaBuyUpdates {
  // ... existing operations
  set_status?: SetStatusOperation;
}
```

### Task 2: Implement `applySetStatus` Function

**File:** `src/backend/src/tools/updateMediaBuy.ts`

Create function to change campaign status:

```typescript
function applySetStatus(
  mediaBuy: MediaBuy,
  operation: SetStatusOperation
): ChangeApplied {
  const previousStatus = mediaBuy.status;
  mediaBuy.status = operation.status;

  return {
    operation: 'set_status',
    details: `Campaign ${operation.status === 'paused' ? 'paused' : 'activated'}`,
    previous_value: previousStatus,
    new_value: operation.status,
  };
}
```

### Task 3: Add Operation to Main Function

**File:** `src/backend/src/tools/updateMediaBuy.ts`

Add to the `updateMediaBuy` function's operation handling:

```typescript
if (normalizedUpdates.set_status) {
  const change = applySetStatus(mediaBuy, normalizedUpdates.set_status);
  changesApplied.push(change);
}
```

### Task 4: Update Normalization Function

**File:** `src/backend/src/tools/updateMediaBuy.ts`

Add aliases for the set_status operation:

```typescript
// Handle set_status with aliases: pause, resume, status
if (updates.set_status || updates.pause || updates.resume) {
  if (updates.pause) {
    normalized.set_status = { status: 'paused' };
  } else if (updates.resume) {
    normalized.set_status = { status: 'active' };
  } else {
    const op = updates.set_status as Record<string, unknown>;
    normalized.set_status = {
      status: (op.status || 'paused') as 'active' | 'paused',
    };
  }
}
```

### Task 5: Update Tool Schema (Optional)

**File:** `src/backend/src/claude/client.ts`

Update the `update_media_buy` tool schema to document the new operation:

```typescript
// In TOOL_DEFINITIONS, update the updates property schema
set_status: {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["active", "paused"],
      description: "New status for the campaign"
    }
  },
  required: ["status"]
}
```

### Task 6: Update System Prompt (Optional)

**File:** `src/backend/src/claude/client.ts`

Add example to system prompt so Claude knows how to use it:

```
- Pause/resume campaigns: "Pause Apex campaign" → update_media_buy with set_status
```

---

## Data Flow Diagram

```
User: "Pause Apex Motors campaign"
         │
         ▼
┌─────────────────────────────────────┐
│ Claude API                          │
│ Calls: update_media_buy             │
│ Args: {                             │
│   media_buy_id: "apex",             │
│   updates: { set_status: {          │
│     status: "paused"                │
│   }}                                │
│ }                                   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ updateMediaBuy.ts                   │
│ → applySetStatus()                  │
│ → mediaBuy.status = "paused"        │
│ → broadcastMediaBuyUpdated()        │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ WebSocket Broadcast                 │
│ Event: "media_buy_updated"          │
│ Payload includes updated mediaBuy   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ useWebSocket.ts                     │
│ → handleMediaBuyUpdated()           │
│ → setMediaBuys() with new status    │
│ → markAsUpdated() for animation     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ MediaBuysTable.tsx                  │
│ → Row re-renders                    │
│ → StatusToggle flips to OFF         │
│ → Row flashes with highlight        │
└─────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/backend/src/tools/updateMediaBuy.ts` | Add SetStatusOperation, applySetStatus, normalization |
| `src/backend/src/claude/client.ts` | Update tool schema, system prompt (optional) |

---

## Testing Checklist

- [ ] Chat: "Pause Apex campaign" → Dashboard toggle turns OFF
- [ ] Chat: "Resume Apex Motors" → Dashboard toggle turns ON
- [ ] Chat: "Stop the TechFlow campaign" → Toggle updates
- [ ] Chat: "Activate GlobalRetail" → Toggle updates
- [ ] Row highlights briefly (400ms) when status changes
- [ ] WebSocket broadcast logged in backend console
- [ ] Works with brand name resolution (not just media_buy_id)

---

## Demo Script

1. Open chat interface and dashboard side-by-side (two browser windows)
2. In chat: "Show me all active campaigns"
3. Note Apex Motors toggle is ON in dashboard
4. In chat: "Pause Apex Motors campaign"
5. Watch dashboard: Toggle flips to OFF with highlight animation
6. In chat: "Resume Apex"
7. Watch dashboard: Toggle flips back to ON

---

## Estimated Impact

- **Demo value:** High - visible, immediate feedback from natural language
- **Code changes:** Minimal - ~50 lines in one file
- **Risk:** Low - follows existing pattern for other operations

---

*Plan created: February 1, 2026*
