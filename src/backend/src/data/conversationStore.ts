import * as fs from 'fs';
import * as path from 'path';

export interface StoredMessage {
  role: 'user' | 'assistant';
  content: string | unknown[];
}

export interface StoredConversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: string;
  updatedAt: string;
}

// Path to conversations directory - relative to workspace root
const DATA_DIR = path.resolve(process.cwd(), '../../data/conversations');

/**
 * Ensure the conversations directory exists
 */
export function initConversationsDirectory(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`Created conversations directory: ${DATA_DIR}`);
    }
  } catch (error) {
    console.error('Failed to create conversations directory:', error);
  }
}

/**
 * Get the file path for a conversation
 */
function getConversationPath(id: string): string {
  // Sanitize ID to prevent directory traversal
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, `${safeId}.json`);
}

/**
 * Save a conversation to JSON file
 */
export function saveConversation(conversation: StoredConversation): void {
  try {
    initConversationsDirectory();
    const filePath = getConversationPath(conversation.id);
    fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2), 'utf-8');
    console.log(`Saved conversation: ${conversation.id}`);
  } catch (error) {
    console.error(`Failed to save conversation ${conversation.id}:`, error);
  }
}

/**
 * Load a conversation from JSON file
 */
export function loadConversation(id: string): StoredConversation | null {
  try {
    const filePath = getConversationPath(id);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as StoredConversation;
  } catch (error) {
    console.error(`Failed to load conversation ${id}:`, error);
    return null;
  }
}

/**
 * List all conversations (metadata only for sidebar)
 */
export function listConversations(): Array<{
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}> {
  try {
    initConversationsDirectory();
    const files = fs.readdirSync(DATA_DIR);
    
    const conversations = files
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        try {
          const content = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8');
          const conv = JSON.parse(content) as StoredConversation;
          return {
            id: conv.id,
            title: conv.title,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            messageCount: conv.messages.length,
          };
        } catch {
          return null;
        }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    // Sort by updatedAt descending
    return conversations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Failed to list conversations:', error);
    return [];
  }
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): boolean {
  try {
    const filePath = getConversationPath(id);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted conversation: ${id}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to delete conversation ${id}:`, error);
    return false;
  }
}

/**
 * Check if a conversation exists
 */
export function conversationExists(id: string): boolean {
  const filePath = getConversationPath(id);
  return fs.existsSync(filePath);
}

/**
 * Load all conversations into memory (for server startup)
 */
export function loadAllConversations(): Map<string, StoredConversation> {
  const map = new Map<string, StoredConversation>();
  
  try {
    initConversationsDirectory();
    const files = fs.readdirSync(DATA_DIR);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
          const conv = JSON.parse(content) as StoredConversation;
          map.set(conv.id, conv);
        } catch {
          // Skip invalid files
        }
      }
    }
    
    console.log(`Loaded ${map.size} conversations from disk`);
  } catch (error) {
    console.error('Failed to load conversations:', error);
  }
  
  return map;
}
