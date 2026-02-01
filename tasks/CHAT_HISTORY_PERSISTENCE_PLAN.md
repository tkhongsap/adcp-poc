# Plan: Chat History Persistence

**Branch:** `feature/chat-dashboard-sync`
**Status:** Planning
**Date:** February 1, 2026

---

## Problem Statement

Currently, chat conversations are lost when:
- User refreshes the page
- User starts a new chat
- Server restarts

Users need to revisit old conversations for demo continuity and real-world usability.

---

## Current Architecture

### Frontend (`MainContainer.tsx`)
```
useState<Message[]>([])  →  Lost on refresh
conversationIdRef        →  Lost on refresh
```

### Backend (`routes/chat.ts`)
```
Map<string, ChatMessage[]>  →  Lost on server restart
```

### Message Structure
```typescript
// Frontend
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Backend
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

---

## Recommended Approach: localStorage + JSON Files (Hybrid)

### Why Hybrid?
- **localStorage**: Instant load, works offline, survives page refresh
- **JSON files**: Survives server restart, can be demoed across browsers

---

## Implementation Plan

### Phase 1: Frontend - localStorage Persistence

#### Task 1.1: Create Chat History Hook
**File:** `src/frontend/src/hooks/useChatHistory.ts`

```typescript
interface Conversation {
  id: string;
  title: string;           // First user message (truncated)
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatHistoryState {
  conversations: Conversation[];
  activeConversationId: string | null;
}
```

**Functions:**
- `loadConversations()` - Load from localStorage on mount
- `saveConversation(conv)` - Save/update conversation
- `deleteConversation(id)` - Remove conversation
- `getConversation(id)` - Retrieve specific conversation
- `createNewConversation()` - Start fresh with new ID
- `setActiveConversation(id)` - Switch between conversations

#### Task 1.2: Update MainContainer.tsx
**File:** `src/frontend/src/components/chat/MainContainer.tsx`

Changes:
- Import and use `useChatHistory` hook
- Load active conversation on mount
- Auto-save messages after each exchange
- Generate conversation title from first user message

#### Task 1.3: Create Conversation List Component
**File:** `src/frontend/src/components/chat/ConversationList.tsx`

Features:
- List all saved conversations (title + date)
- Click to load conversation
- Delete button per conversation
- "New Chat" button at top
- Show active conversation highlight

#### Task 1.4: Update Sidebar Component
**File:** `src/frontend/src/components/dashboard/Sidebar.tsx`

Changes:
- Add conversation list section
- Add "New Chat" button
- Show recent conversations (last 10)

---

### Phase 2: Backend - JSON File Persistence

#### Task 2.1: Create Conversation Storage Module
**File:** `src/backend/src/data/conversationStore.ts`

```typescript
interface StoredConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
```

**Functions:**
- `saveConversation(id, messages)` - Write to JSON file
- `loadConversation(id)` - Read from JSON file
- `listConversations()` - List all conversation files
- `deleteConversation(id)` - Remove JSON file

**Storage Location:** `data/conversations/{conversation_id}.json`

#### Task 2.2: Update Chat Routes
**File:** `src/backend/src/routes/chat.ts`

New endpoints:
- `GET /api/chat/conversations` - List all conversations
- `GET /api/chat/conversations/:id` - Get full conversation
- `DELETE /api/chat/conversations/:id` - Delete conversation

Changes to existing:
- Save to JSON file after each message exchange
- Load from file if conversation exists but not in memory

#### Task 2.3: Initialize Conversations Directory
**File:** `src/backend/src/index.ts`

- Create `data/conversations/` directory on startup if not exists
- Load existing conversations into memory Map

---

### Phase 3: UI Integration

#### Task 3.1: Conversation Sidebar Panel
**File:** `src/frontend/src/components/chat/ChatSidebar.tsx`

Layout:
```
┌─────────────────────┐
│ [+ New Chat]        │
├─────────────────────┤
│ Today               │
│ ├─ Campaign query   │
│ ├─ Apex performance │
├─────────────────────┤
│ Yesterday           │
│ ├─ Budget review    │
├─────────────────────┤
│ Last 7 days         │
│ ├─ Q1 planning      │
└─────────────────────┘
```

Features:
- Grouped by date (Today, Yesterday, Last 7 days, Older)
- Truncated title (first 30 chars of first message)
- Hover to see full title
- Active conversation highlighted
- Delete on hover (trash icon)

#### Task 3.2: Update Main Layout
**File:** `src/frontend/src/app/page.tsx`

Changes:
- Add ChatSidebar to left of main chat area
- Collapsible sidebar for mobile
- Maintain artifact panel on right

New Layout:
```
┌──────────┬────────────────────┬──────────────┐
│ Chat     │                    │              │
│ History  │   Chat Messages    │  Artifact    │
│ Sidebar  │                    │   Panel      │
│          │   [Input Box]      │              │
└──────────┴────────────────────┴──────────────┘
```

#### Task 3.3: New Chat Flow
**File:** `src/frontend/src/components/chat/MainContainer.tsx`

When "New Chat" clicked:
1. Save current conversation (if has messages)
2. Clear messages state
3. Generate new conversation ID
4. Reset artifact panel
5. Show welcome screen

---

## File Structure

### New Files
```
src/frontend/src/hooks/useChatHistory.ts
src/frontend/src/components/chat/ChatSidebar.tsx
src/frontend/src/components/chat/ConversationList.tsx
src/backend/src/data/conversationStore.ts
data/conversations/                              (directory)
```

### Modified Files
```
src/frontend/src/components/chat/MainContainer.tsx
src/frontend/src/components/dashboard/Sidebar.tsx
src/frontend/src/app/page.tsx
src/backend/src/routes/chat.ts
src/backend/src/index.ts
```

---

## Data Flow

### Save Flow
```
User sends message
       │
       ▼
MainContainer adds to messages state
       │
       ▼
useChatHistory.saveConversation()
       │
       ├──► localStorage.setItem()     (instant)
       │
       ▼
POST /api/chat/stream (includes conversationId)
       │
       ▼
Backend saves to conversations Map
       │
       ▼
conversationStore.saveConversation()
       │
       ▼
Write to data/conversations/{id}.json
```

### Load Flow
```
User clicks conversation in sidebar
       │
       ▼
useChatHistory.setActiveConversation(id)
       │
       ▼
Check localStorage first
       │
       ├── Found ──► Load from localStorage
       │
       └── Not found ──► GET /api/chat/conversations/:id
                                │
                                ▼
                         Load from JSON file
                                │
                                ▼
                         Return to frontend
```

---

## localStorage Schema

**Key:** `adcp_chat_history`

```json
{
  "conversations": [
    {
      "id": "conv_1706812800000_abc123",
      "title": "What sports inventory do you have?",
      "messages": [...],
      "createdAt": "2026-02-01T10:00:00Z",
      "updatedAt": "2026-02-01T10:05:00Z"
    }
  ],
  "activeConversationId": "conv_1706812800000_abc123"
}
```

**Size Management:**
- Keep last 50 conversations max
- Trim messages to last 100 per conversation
- Total localStorage budget: ~4MB

---

## JSON File Schema

**File:** `data/conversations/conv_1706812800000_abc123.json`

```json
{
  "id": "conv_1706812800000_abc123",
  "title": "What sports inventory do you have?",
  "messages": [
    { "role": "user", "content": "What sports inventory..." },
    { "role": "assistant", "content": "We have ESPN..." }
  ],
  "createdAt": "2026-02-01T10:00:00Z",
  "updatedAt": "2026-02-01T10:05:00Z"
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations` | List all conversations (id, title, dates) |
| GET | `/api/chat/conversations/:id` | Get full conversation with messages |
| DELETE | `/api/chat/conversations/:id` | Delete conversation |
| POST | `/api/chat/stream` | Existing - now auto-saves |

---

## Verification Checklist

- [ ] New chat creates fresh conversation
- [ ] Messages persist after page refresh
- [ ] Conversation list shows in sidebar
- [ ] Clicking conversation loads its messages
- [ ] Delete removes conversation from list and storage
- [ ] Server restart preserves conversations (JSON files)
- [ ] Conversation title derived from first message
- [ ] Active conversation highlighted in sidebar
- [ ] Artifact panel clears when switching conversations
- [ ] localStorage doesn't exceed 4MB limit

---

## Demo Flow

1. Start fresh - welcome screen shown
2. Ask "What sports inventory do you have?"
3. Conversation auto-saved with title "What sports inventory..."
4. Click "New Chat" - welcome screen returns
5. Ask "How is Apex performing?"
6. See two conversations in sidebar
7. Click first conversation - loads sports inventory chat
8. Refresh page - conversations still there
9. Restart server - conversations still there (from JSON)

---

## Estimated Scope

| Phase | Files | Complexity |
|-------|-------|------------|
| Phase 1 (localStorage) | 4 | Medium |
| Phase 2 (JSON files) | 3 | Low |
| Phase 3 (UI) | 3 | Medium |

**Total:** ~10 files, ~500 lines of code

---

*Plan created: February 1, 2026*
