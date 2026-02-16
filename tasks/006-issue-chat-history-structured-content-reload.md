# Issue: Structured Chat Messages Render as `[object Object]` on Conversation Reload

## Status
- `type`: bug
- `priority`: medium
- `state`: backlog
- `branch`: `fix/chat-session-followup-action-context`

## Problem Summary
Sequential action context was fixed by preserving rich message history (`tool_use` / `tool_result` blocks).
However, when conversations are loaded from backend storage, some messages are still cast as plain strings in the frontend and may render as `[object Object]`.

## User Impact
This appears when loading a conversation from backend storage (for example after reload, different browser, or local cache miss).
Intermediate tool messages can display as garbled text instead of clean chat text.

## Current Root Cause
Frontend mapping in `src/frontend/src/hooks/useChatHistory.ts`:

- `src/frontend/src/hooks/useChatHistory.ts:170`
- `src/frontend/src/hooks/useChatHistory.ts:173`

`m.content` is cast directly to `string`, but backend now stores `content` as `string | unknown[]` (`src/backend/src/data/conversationStore.ts:6`).

## Scope of Fix
- Add safe frontend normalization when reading backend conversation messages.
- If `content` is a string, keep as-is.
- If `content` is structured blocks, extract human-readable text blocks.
- Do not render raw object arrays in chat UI.
- Preserve existing behavior for normal text-only conversations.

## Acceptance Criteria
1. Reloading a conversation with tool calls does not show `[object Object]`.
2. Conversations loaded from backend are readable and stable.
3. Existing sequential-action behavior (pause -> resume in same session) remains intact.
4. No regression for text-only conversations.

## Notes
This is a targeted frontend parsing fix and should be low effort.
