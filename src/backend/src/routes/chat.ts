import { Router, Request, Response } from 'express';
import { processChat, processChatStream, type ChatMessage } from '../claude/client.js';

const router = Router();

// In-memory conversation storage (for demo purposes)
const conversations: Map<string, ChatMessage[]> = new Map();

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
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Get or create conversation history
    const id = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const history = conversations.get(id) || [];

    // Process the chat
    const response = await processChat(message, history);

    // Update conversation history
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response.message });
    conversations.set(id, history);

    // Keep conversation history manageable (last 20 messages)
    if (history.length > 40) {
      conversations.set(id, history.slice(-40));
    }

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
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Get or create conversation history
    const id = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const history = conversations.get(id) || [];

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial event with conversation ID
    res.write(`event: start\ndata: ${JSON.stringify({ conversationId: id })}\n\n`);

    let fullMessage = '';

    // Process with streaming
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
      }
    );

    // Update conversation history
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response.message || fullMessage });
    conversations.set(id, history);

    // Keep conversation history manageable
    if (history.length > 40) {
      conversations.set(id, history.slice(-40));
    }

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

export default router;
