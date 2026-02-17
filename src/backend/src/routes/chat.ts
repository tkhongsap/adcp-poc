import { Router, Request, Response } from 'express';
import { processChat, processChatStream, type ChatMessage } from '../claude/client.js';
import {
  saveConversation as saveConversationToFile,
  loadConversation as loadConversationFromFile,
  listConversations,
  deleteConversation as deleteConversationFromFile,
  loadAllConversations,
  initConversationsDirectory,
  type StoredConversation,
} from '../data/conversationStore.js';

const router = Router();
const DEBUG_CHAT_FLOW = process.env.NODE_ENV !== 'production';

function logChatFlow(message: string, payload: Record<string, unknown>): void {
  if (DEBUG_CHAT_FLOW) {
    console.log(`[chat-flow] ${message}`, payload);
  }
}

// Initialize conversations directory
initConversationsDirectory();

// In-memory conversation storage (for demo purposes)
// Load existing conversations from disk on startup
const conversations: Map<string, ChatMessage[]> = new Map();

// Load persisted conversations into memory
const storedConversations = loadAllConversations();
for (const [id, stored] of storedConversations) {
  conversations.set(id, stored.messages as ChatMessage[]);
}

// Helper to generate title from first message
function getContentAsString(content: string | unknown[]): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const textBlock = content.find((b: unknown) => typeof b === 'object' && b !== null && 'type' in b && (b as { type: string }).type === 'text');
    if (textBlock && typeof textBlock === 'object' && 'text' in textBlock) {
      return (textBlock as { text: string }).text;
    }
    return '';
  }
  return '';
}

function generateTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find((m) => m.role === 'user');
  if (!firstUserMessage) return 'New conversation';
  const content = getContentAsString(firstUserMessage.content).trim();
  return content.length > 40 ? content.substring(0, 37) + '...' : content;
}

// Helper to persist conversation to file
function persistConversation(id: string, messages: ChatMessage[]): void {
  const stored: StoredConversation = {
    id,
    title: generateTitle(messages),
    messages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Check if conversation already exists to preserve createdAt
  const existing = loadConversationFromFile(id);
  if (existing) {
    stored.createdAt = existing.createdAt;
  }
  
  saveConversationToFile(stored);
}

/**
 * POST /api/chat
 * Send a message to the Claude agent and get a response
 *
 * Body:
 *   - message: string - The user's message
 *   - conversationId?: string - Optional ID to continue a conversation
 *
 * Response:
 *   - message: string - Claude's response
 *   - conversationId: string - ID for continuing this conversation
 *   - toolCalls?: Array - Any tools that were called during processing
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, conversationId, model, userId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Get or create conversation history
    const id = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const history = conversations.get(id) || [];

    // Process the chat with optional model and userId for personalization
    const response = await processChat(message, history, model, userId, id);

    // Update conversation history with full tool context
    if (response.historyEntries && response.historyEntries.length > 0) {
      history.push(...response.historyEntries);
    } else {
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: response.message });
    }
    conversations.set(id, history);

    // Keep conversation history manageable (last 20 messages)
    if (history.length > 40) {
      conversations.set(id, history.slice(-40));
    }

    // Persist to file
    persistConversation(id, conversations.get(id) || history);

    res.json({
      message: response.message,
      conversationId: id,
      toolCalls: response.toolCalls,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/chat/stream
 * Send a message to the Claude agent and get a streaming response
 *
 * Uses Server-Sent Events (SSE) to stream the response
 */
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { message, conversationId, model, userId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Get or create conversation history
    const id = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const history = conversations.get(id) || [];

    logChatFlow('stream request', {
      requestedConversationId: conversationId || null,
      resolvedConversationId: id,
      historyLength: history.length,
      firstHistoryRole: history[0]?.role ?? null,
      lastHistoryRole: history[history.length - 1]?.role ?? null,
      messagePreview: typeof message === 'string' ? message.slice(0, 80) : null,
    });

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial event with conversation ID and model being used
    res.write(`event: start\ndata: ${JSON.stringify({ conversationId: id, model: model || 'claude-sonnet-4-5-20250929' })}\n\n`);

    let fullMessage = '';

    // Process with streaming, using the specified model
    const response = await processChatStream(
      message,
      history,
      // On text chunk
      (text) => {
        fullMessage += text;
        res.write(`event: text\ndata: ${JSON.stringify({ text })}\n\n`);
      },
      // On tool call
      (name, input) => {
        res.write(`event: tool_call\ndata: ${JSON.stringify({ name, input })}\n\n`);
      },
      // On tool result
      (name, result) => {
        res.write(`event: tool_result\ndata: ${JSON.stringify({ name, result })}\n\n`);
      },
      // Model parameter
      model,
      // User personalization
      userId,
      id
    );

    // Update conversation history with full tool context
    if (response.historyEntries && response.historyEntries.length > 0) {
      history.push(...response.historyEntries);
    } else {
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: response.message || fullMessage });
    }
    conversations.set(id, history);

    logChatFlow('stream history updated', {
      conversationId: id,
      historyLength: history.length,
      lastAssistantLength: (response.message || fullMessage).length,
      toolCallCount: response.toolCalls?.length || 0,
      hasRichHistory: !!(response.historyEntries && response.historyEntries.length > 0),
    });

    // Keep conversation history manageable
    if (history.length > 40) {
      conversations.set(id, history.slice(-40));
    }

    // Persist to file
    persistConversation(id, conversations.get(id) || history);

    // Send completion event
    res.write(
      `event: done\ndata: ${JSON.stringify({
        conversationId: id,
        toolCalls: response.toolCalls,
      })}\n\n`
    );

    res.end();
  } catch (error) {
    console.error('Chat stream error:', error);

    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } else {
      // If streaming, send error event
      res.write(
        `event: error\ndata: ${JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        })}\n\n`
      );
      res.end();
    }
  }
});

/**
 * DELETE /api/chat/:conversationId
 * Clear a conversation's history
 */
router.delete('/:conversationId', (req: Request, res: Response) => {
  const { conversationId } = req.params;

  if (conversations.has(conversationId)) {
    conversations.delete(conversationId);
    res.json({ success: true, message: 'Conversation cleared' });
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

/**
 * GET /api/chat/:conversationId/history
 * Get conversation history
 */
router.get('/:conversationId/history', (req: Request, res: Response) => {
  const { conversationId } = req.params;

  const history = conversations.get(conversationId);
  if (history) {
    res.json({ conversationId, messages: history });
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

/**
 * GET /api/chat/conversations
 * List all conversations (for sidebar)
 */
router.get('/conversations', (_req: Request, res: Response) => {
  try {
    const conversationList = listConversations();
    res.json({ conversations: conversationList });
  } catch (error) {
    console.error('Failed to list conversations:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

/**
 * POST /api/chat/conversations
 * Save/sync a conversation from frontend
 */
router.post('/conversations', (req: Request, res: Response) => {
  try {
    const { id, title, messages, createdAt, updatedAt } = req.body;

    if (!id || !messages) {
      res.status(400).json({ error: 'id and messages are required' });
      return;
    }

    const conversation: StoredConversation = {
      id,
      title: title || generateTitle(messages),
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString(),
    };

    const existingMessages = conversations.get(id) || [];
    const previousLength = existingMessages.length;
    const incomingLength = conversation.messages.length;
    const existingLastMessage = existingMessages[existingMessages.length - 1];
    const incomingLastMessage = conversation.messages[conversation.messages.length - 1];
    const incomingLastContent = incomingLastMessage ? getContentAsString(incomingLastMessage.content) : '';
    const existingLastContent = existingLastMessage ? getContentAsString(existingLastMessage.content) : '';
    const incomingLastIsIncompleteAssistant =
      incomingLastMessage?.role === 'assistant' && incomingLastContent.trim().length === 0;

    // Guard against stale frontend syncs overwriting richer backend history.
    const shouldIgnoreSync =
      previousLength > incomingLength ||
      (previousLength === incomingLength &&
        incomingLastIsIncompleteAssistant &&
        existingLastMessage?.role === 'assistant' &&
        existingLastContent.trim().length > 0);

    if (shouldIgnoreSync) {
      logChatFlow('frontend sync ignored to protect richer history', {
        conversationId: id,
        previousLength,
        incomingLength,
        existingLastRole: existingLastMessage?.role ?? null,
        incomingLastRole: incomingLastMessage?.role ?? null,
      });

      res.json({
        success: true,
        ignored: true,
        conversation: { id, title: conversation.title },
      });
      return;
    }

    // Save to file
    saveConversationToFile(conversation);

    // Update in-memory cache
    conversations.set(id, conversation.messages as ChatMessage[]);
    logChatFlow('frontend sync applied', {
      conversationId: id,
      previousLength,
      incomingLength,
      firstRole: conversation.messages[0]?.role ?? null,
      lastRole: conversation.messages[conversation.messages.length - 1]?.role ?? null,
    });

    res.json({ success: true, conversation: { id, title: conversation.title } });
  } catch (error) {
    console.error('Failed to save conversation:', error);
    res.status(500).json({ error: 'Failed to save conversation' });
  }
});

/**
 * GET /api/chat/conversations/:id
 * Get a specific conversation
 */
router.get('/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = loadConversationFromFile(id);

    if (conversation) {
      res.json(conversation);
    } else {
      res.status(404).json({ error: 'Conversation not found' });
    }
  } catch (error) {
    console.error('Failed to get conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

/**
 * DELETE /api/chat/conversations/:id
 * Delete a specific conversation
 */
router.delete('/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete from file
    const deleted = deleteConversationFromFile(id);

    // Delete from memory
    conversations.delete(id);

    if (deleted) {
      res.json({ success: true, message: 'Conversation deleted' });
    } else {
      res.status(404).json({ error: 'Conversation not found' });
    }
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
