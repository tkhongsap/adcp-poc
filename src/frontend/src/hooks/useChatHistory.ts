"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Message } from "@/types/chat";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatHistoryState {
  conversations: Conversation[];
  activeConversationId: string | null;
}

const STORAGE_KEY = "adcp_chat_history";
const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES_PER_CONVERSATION = 100;
const SAVE_DEBOUNCE_MS = 1000;

// Helper to serialize dates for localStorage
function serializeConversation(conv: Conversation): Record<string, unknown> {
  return {
    ...conv,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
    messages: conv.messages.map((m) => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
    })),
  };
}

// Helper to deserialize dates from localStorage
function deserializeConversation(data: Record<string, unknown>): Conversation {
  return {
    id: data.id as string,
    title: data.title as string,
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
    messages: ((data.messages as Array<Record<string, unknown>>) || []).map((m) => ({
      id: m.id as string,
      role: m.role as "user" | "assistant",
      content: m.content as string,
      timestamp: new Date(m.timestamp as string),
    })),
  };
}

// Generate title from first user message
function generateTitle(messages: Message[]): string {
  const firstUserMessage = messages.find((m) => m.role === "user");
  if (!firstUserMessage) return "New conversation";
  
  const content = firstUserMessage.content.trim();
  // Truncate to 40 chars and add ellipsis if needed
  return content.length > 40 ? content.substring(0, 37) + "..." : content;
}

// Generate new conversation ID
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function useChatHistory() {
  const [state, setState] = useState<ChatHistoryState>({
    conversations: [],
    activeConversationId: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use ref to access current state in callbacks without causing re-renders
  const stateRef = useRef(state);
  stateRef.current = state;
  
  // Debounce timer ref for saves
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const conversations = (parsed.conversations || []).map(deserializeConversation);
        setState({
          conversations,
          activeConversationId: parsed.activeConversationId || null,
        });
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      const serialized = {
        conversations: state.conversations.map(serializeConversation),
        activeConversationId: state.activeConversationId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [state, isLoaded]);

  // Sync conversation to backend
  const syncToBackend = useCallback(async (conversation: Conversation) => {
    try {
      await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: conversation.id,
          title: conversation.title,
          messages: conversation.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          createdAt: conversation.createdAt.toISOString(),
          updatedAt: conversation.updatedAt.toISOString(),
        }),
      });
    } catch (error) {
      console.error("Failed to sync conversation to backend:", error);
    }
  }, []);

  // Fetch a specific conversation from backend (with full messages)
  const fetchConversationFromBackend = useCallback(async (id: string): Promise<Conversation | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${id}`);
      if (response.ok) {
        const conv = await response.json();
        return {
          id: conv.id,
          title: conv.title,
          messages: (conv.messages || []).map((m: Record<string, unknown>) => ({
            id: m.id || `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            role: m.role as "user" | "assistant",
            content: m.content as string,
            timestamp: new Date((m.timestamp as string) || Date.now()),
          })),
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
        };
      }
    } catch (error) {
      console.error("Failed to fetch conversation from backend:", error);
    }
    return null;
  }, []);

  // Load conversations from backend (for cross-browser/server-restart scenarios)
  // Note: This only loads metadata for the sidebar. Full messages are fetched on demand.
  const loadFromBackend = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`);
      if (response.ok) {
        const data = await response.json();
        if (data.conversations && Array.isArray(data.conversations)) {
          // These are metadata-only (no messages) from the list endpoint
          const backendConversations = data.conversations.map((conv: Record<string, unknown>) => ({
            id: conv.id as string,
            title: conv.title as string,
            messages: [] as Message[], // Messages will be fetched on demand
            createdAt: new Date(conv.createdAt as string),
            updatedAt: new Date(conv.updatedAt as string),
          }));
          
          // Merge with localStorage (local wins if it has messages, backend wins otherwise)
          setState((prev) => {
            const localById = new Map(prev.conversations.map((c) => [c.id, c]));
            
            const merged: Conversation[] = [];
            
            // Add backend conversations, using local version if it has messages
            for (const backendConv of backendConversations) {
              const localConv = localById.get(backendConv.id);
              if (localConv && localConv.messages.length > 0) {
                merged.push(localConv);
              } else {
                merged.push(backendConv);
              }
              localById.delete(backendConv.id);
            }
            
            // Add local-only conversations
            for (const localConv of localById.values()) {
              merged.push(localConv);
            }
            
            // Sort and limit
            const sorted = merged
              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
              .slice(0, MAX_CONVERSATIONS);
            
            return {
              ...prev,
              conversations: sorted,
            };
          });
        }
      }
    } catch (error) {
      console.error("Failed to load conversations from backend:", error);
    }
  }, []);

  // Load from backend on mount
  useEffect(() => {
    if (isLoaded) {
      loadFromBackend();
    }
  }, [isLoaded, loadFromBackend]);

  // Save or update a conversation with debouncing
  const saveConversation = useCallback((
    conversationId: string,
    messages: Message[],
    syncBackend = true
  ) => {
    if (messages.length === 0) return;

    // Clear any pending save
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Capture the conversation ID at call time
    const targetConversationId = conversationId;
    const messagesToSave = [...messages]; // Copy to avoid stale closure

    // Debounce the save operation
    saveTimerRef.current = setTimeout(() => {
      // Verify the active conversation hasn't changed
      if (stateRef.current.activeConversationId !== targetConversationId) {
        return; // Skip stale save
      }
      
      setState((prev) => {
        const existingIndex = prev.conversations.findIndex((c) => c.id === targetConversationId);
        const now = new Date();
        
        let conversation: Conversation;
        
        if (existingIndex >= 0) {
          // Update existing conversation
          conversation = {
            ...prev.conversations[existingIndex],
            messages: messagesToSave.slice(-MAX_MESSAGES_PER_CONVERSATION),
            title: generateTitle(messagesToSave),
            updatedAt: now,
          };
        } else {
          // Create new conversation
          conversation = {
            id: targetConversationId,
            title: generateTitle(messagesToSave),
            messages: messagesToSave.slice(-MAX_MESSAGES_PER_CONVERSATION),
            createdAt: now,
            updatedAt: now,
          };
        }

        // Sync to backend asynchronously
        if (syncBackend) {
          syncToBackend(conversation);
        }

        // Update conversations list
        const updatedConversations = existingIndex >= 0
          ? prev.conversations.map((c, i) => i === existingIndex ? conversation : c)
          : [conversation, ...prev.conversations];

        // Sort by updated date and limit total
        const sorted = updatedConversations
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, MAX_CONVERSATIONS);

        return {
          conversations: sorted,
          activeConversationId: targetConversationId,
        };
      });
    }, SAVE_DEBOUNCE_MS);
  }, [syncToBackend]);

  // Get a specific conversation - uses ref to avoid dependency on state
  const getConversation = useCallback((id: string): Conversation | undefined => {
    return stateRef.current.conversations.find((c) => c.id === id);
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    // Delete from backend
    try {
      await fetch(`${API_BASE_URL}/api/chat/conversations/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete conversation from backend:", error);
    }

    setState((prev) => {
      const newConversations = prev.conversations.filter((c) => c.id !== id);
      return {
        conversations: newConversations,
        activeConversationId: prev.activeConversationId === id ? null : prev.activeConversationId,
      };
    });
  }, []);

  // Set active conversation
  const setActiveConversation = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      activeConversationId: id,
    }));
  }, []);

  // Create a new conversation
  const createNewConversation = useCallback((): string => {
    const id = generateConversationId();
    setState((prev) => ({
      ...prev,
      activeConversationId: id,
    }));
    return id;
  }, []);

  // Get active conversation - uses ref to avoid dependency on state
  const getActiveConversation = useCallback((): Conversation | undefined => {
    const { activeConversationId, conversations } = stateRef.current;
    if (!activeConversationId) return undefined;
    return conversations.find((c) => c.id === activeConversationId);
  }, []);

  return {
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    isLoaded,
    saveConversation,
    getConversation,
    deleteConversation,
    setActiveConversation,
    createNewConversation,
    getActiveConversation,
    loadFromBackend,
    fetchConversationFromBackend,
  };
}
