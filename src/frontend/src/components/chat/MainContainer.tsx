"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Message, Artifact } from "@/types/chat";
import { cn } from "@/lib/utils";
import ChatSidebar from "./ChatSidebar";
import WelcomeScreen from "./WelcomeScreen";
import ConversationView from "./ConversationView";
import MessageInput, { ClaudeModelId, DEFAULT_MODEL } from "./MessageInput";
import ArtifactPanel from "./ArtifactPanel";
import ThemeToggle from "../ui/ThemeToggle";
import { detectArtifact, ToolCallData } from "@/utils/artifactDetection";
import { API_BASE_URL } from "@/lib/apiBaseUrl";
import { useChatHistory, generateConversationId } from "@/hooks/useChatHistory";

function OpenDashboardButton() {
  const handleOpenDashboard = () => {
    window.open("/dashboard", "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleOpenDashboard}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg",
        "bg-muted text-foreground",
        "hover:bg-muted/80 hover:scale-[1.02]",
        "active:scale-[0.98]",
        "transition-all duration-200"
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" />
        <path d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" />
      </svg>
      Dashboard
    </button>
  );
}

export default function MainContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [artifactPanelOpen, setArtifactPanelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ClaudeModelId>(DEFAULT_MODEL);
  const conversationIdRef = useRef<string | null>(null);

  // Chat history hook
  const {
    conversations,
    activeConversationId,
    isLoaded: historyLoaded,
    saveConversation,
    getConversation,
    deleteConversation,
    setActiveConversation,
    fetchConversationFromBackend,
  } = useChatHistory();

  // Auto-open artifact panel when artifact is detected
  useEffect(() => {
    if (artifact) {
      setArtifactPanelOpen(true);
    }
  }, [artifact]);

  // Refs to hold stable function references
  const getConversationRef = useRef(getConversation);
  const saveConversationRef = useRef(saveConversation);
  getConversationRef.current = getConversation;
  saveConversationRef.current = saveConversation;

  // Load active conversation on mount or when activeConversationId changes
  useEffect(() => {
    if (historyLoaded && activeConversationId) {
      const conv = getConversationRef.current(activeConversationId);
      if (conv && conv.messages.length > 0) {
        setMessages(conv.messages);
        conversationIdRef.current = activeConversationId;
      }
    }
  }, [historyLoaded, activeConversationId]);

  // Track if we're in the middle of loading a conversation to avoid save loops
  const isLoadingConversation = useRef(false);
  
  // Save messages only when user sends a new message (not on load)
  const prevMessagesLength = useRef(0);
  useEffect(() => {
    // Skip if still loading, not loaded yet, or no conversation
    if (isLoadingConversation.current || !historyLoaded || !conversationIdRef.current) {
      prevMessagesLength.current = messages.length;
      return;
    }
    
    // Only save if messages increased (new message added, not loaded)
    if (messages.length > 0 && messages.length > prevMessagesLength.current) {
      saveConversationRef.current(conversationIdRef.current, messages);
    }
    prevMessagesLength.current = messages.length;
  }, [messages, historyLoaded]);

  // Handler for creating new chat
  const handleNewChat = useCallback(() => {
    // Save current conversation if it has messages
    if (conversationIdRef.current && messages.length > 0) {
      saveConversationRef.current(conversationIdRef.current, messages);
    }
    
    // Reset state for new chat
    const newId = generateConversationId();
    conversationIdRef.current = newId;
    prevMessagesLength.current = 0;
    setMessages([]);
    setArtifact(null);
    setArtifactPanelOpen(false);
    setActiveConversation(newId);
  }, [messages, setActiveConversation]);

  // Handler for selecting a conversation
  const handleSelectConversation = useCallback(async (id: string) => {
    isLoadingConversation.current = true;
    
    try {
      // Save current conversation if it has messages
      if (conversationIdRef.current && messages.length > 0) {
        saveConversationRef.current(conversationIdRef.current, messages);
      }
      
      // Load selected conversation
      let conv = getConversationRef.current(id);
      
      // If conversation has no messages (metadata-only from list), fetch from backend
      if (!conv || conv.messages.length === 0) {
        const fullConv = await fetchConversationFromBackend(id);
        if (fullConv) {
          conv = fullConv;
          // Save to local state so it's available next time
          saveConversationRef.current(id, fullConv.messages, false); // Don't sync back to backend
        }
      }
      
      if (conv && conv.messages.length > 0) {
        conversationIdRef.current = id;
        prevMessagesLength.current = conv.messages.length;
        setMessages(conv.messages);
        setActiveConversation(id);
        // Clear artifact when switching conversations
        setArtifact(null);
        setArtifactPanelOpen(false);
      }
    } finally {
      // Always reset the loading flag
      isLoadingConversation.current = false;
    }
  }, [messages, setActiveConversation, fetchConversationFromBackend]);

  // Handler for deleting a conversation
  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    
    // If deleting active conversation, reset to new chat
    if (conversationIdRef.current === id) {
      const newId = generateConversationId();
      conversationIdRef.current = newId;
      prevMessagesLength.current = 0;
      setMessages([]);
      setArtifact(null);
      setArtifactPanelOpen(false);
      setActiveConversation(newId);
    }
  }, [deleteConversation, setActiveConversation]);

  const handleSendMessage = useCallback(async (content: string) => {
    // Ensure we have a conversation ID
    if (!conversationIdRef.current) {
      conversationIdRef.current = generateConversationId();
      setActiveConversation(conversationIdRef.current);
    }

    // Add user message immediately
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create a placeholder for the assistant message that will be streamed
    const assistantMessageId = `assistant_${Date.now()}`;
    let assistantContent = "";

    // Track tool calls for artifact detection
    const collectedToolCalls: ToolCallData[] = [];
    let currentToolCall: { name: string; input: Record<string, unknown> } | null =
      null;

    try {
      // Use streaming endpoint
      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          conversationId: conversationIdRef.current,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Add empty assistant message that will be populated via streaming
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      // Process the SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";
      let currentEvent: string | null = null;
      let stopStreaming = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages from buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
            continue;
          }
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);

              // Primary: handle by SSE event type (preferred)
              if (currentEvent === "start" && parsed.conversationId) {
                conversationIdRef.current = parsed.conversationId;
              } else if (currentEvent === "text" && parsed.text !== undefined) {
                assistantContent += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              } else if (
                currentEvent === "tool_call" &&
                parsed.name !== undefined &&
                parsed.input !== undefined
              ) {
                currentToolCall = {
                  name: parsed.name,
                  input: parsed.input,
                };
              } else if (
                currentEvent === "tool_result" &&
                parsed.name !== undefined &&
                parsed.result !== undefined
              ) {
                if (currentToolCall && currentToolCall.name === parsed.name) {
                  collectedToolCalls.push({
                    name: parsed.name,
                    input: currentToolCall.input,
                    result: parsed.result,
                  });
                  currentToolCall = null;
                }
              } else if (currentEvent === "done") {
                if (parsed.conversationId) {
                  conversationIdRef.current = parsed.conversationId;
                }
                // If we have toolCalls in done event, use those instead
                if (parsed.toolCalls && Array.isArray(parsed.toolCalls)) {
                  // Clear collected and use the complete tool calls
                  collectedToolCalls.length = 0;
                  collectedToolCalls.push(...parsed.toolCalls);
                }
              } else if (currentEvent === "error") {
                const backendError =
                  typeof parsed.error === "string" ? parsed.error : "Unknown backend error";

                assistantContent =
                  backendError.includes("apiKey") || backendError.includes("authToken")
                    ? `Sorry — the backend is running, but it can't talk to Anthropic yet.\n\n${backendError}\n\nTip: set \`ANTHROPIC_API_KEY\` in Replit Secrets and restart the backend.`
                    : `Sorry — the backend returned an error:\n\n${backendError}`;

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );

                stopStreaming = true;
                try {
                  await reader.cancel();
                } catch {
                  // ignore
                }
                break;
              } else if (parsed.conversationId && !parsed.text && !parsed.toolCalls) {
                // Fallback: Start event (older parsing behavior)
                conversationIdRef.current = parsed.conversationId;
              } else if (parsed.text !== undefined) {
                // Fallback: Text chunk
                assistantContent += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore parse errors for incomplete data
            }
          }
        }

        if (stopStreaming) break;
      }

      // After stream completes, detect artifacts from collected tool calls
      if (collectedToolCalls.length > 0) {
        const detection = detectArtifact(collectedToolCalls, content);
        if (detection.shouldShowArtifact && detection.artifact) {
          setArtifact(detection.artifact);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);

      // Add error message
      setMessages((prev) => {
        // Remove the empty assistant message if it exists
        const filtered = prev.filter((msg) => msg.id !== assistantMessageId);
        return [
          ...filtered,
          {
            id: assistantMessageId,
            role: "assistant",
            content:
              "Sorry, I encountered an error processing your request. Please make sure the backend server is running and try again.",
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel, setActiveConversation]);

  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main content area - flexes to share space with artifact panel */}
      <div
        className={cn(
          "flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          artifactPanelOpen && artifact ? "flex-1" : "flex-1"
        )}
      >
        {/* Minimal header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex-shrink-0 h-12 flex items-center justify-end px-4 gap-3",
            "bg-background"
          )}
        >
          <ThemeToggle />
          <OpenDashboardButton />
        </motion.header>

        {/* Chat content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!hasMessages ? (
            /* Empty state: Welcome screen with centered input */
            <WelcomeScreen
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          ) : (
            /* Conversation state: Messages + sticky bottom input */
            <>
              <ConversationView messages={messages} isLoading={isLoading} />

              {/* Sticky bottom input */}
              <div className="flex-shrink-0 border-t border-border bg-background">
                <div className={cn(
                  "mx-auto px-4 py-4 transition-all duration-300",
                  artifactPanelOpen && artifact ? "max-w-2xl" : "max-w-3xl"
                )}>
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                    placeholder="Reply to AdCP Agent..."
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Artifact panel - side-by-side with chat */}
      <ArtifactPanel
        artifact={artifact}
        isOpen={artifactPanelOpen}
        onClose={() => setArtifactPanelOpen(false)}
      />
    </div>
  );
}
