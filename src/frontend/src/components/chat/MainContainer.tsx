"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Message, Artifact } from "@/types/chat";
import { cn } from "@/lib/utils";
import ChatSidebar from "./ChatSidebar";
import WelcomeScreen from "./WelcomeScreen";
import ConversationView from "./ConversationView";
import MessageInput from "./MessageInput";
import ArtifactPanel from "./ArtifactPanel";
import ThemeToggle from "../ui/ThemeToggle";
import { detectArtifact, ToolCallData } from "@/utils/artifactDetection";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  const conversationIdRef = useRef<string | null>(null);

  // Auto-open artifact panel when artifact is detected
  useEffect(() => {
    if (artifact) {
      setArtifactPanelOpen(true);
    }
  }, [artifact]);

  const handleSendMessage = useCallback(async (content: string) => {
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
  }, []);

  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar */}
      <ChatSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
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
            <WelcomeScreen onSendMessage={handleSendMessage} disabled={isLoading} />
          ) : (
            /* Conversation state: Messages + sticky bottom input */
            <>
              <ConversationView messages={messages} isLoading={isLoading} />

              {/* Sticky bottom input */}
              <div className="flex-shrink-0 border-t border-border bg-background">
                <div className="max-w-3xl mx-auto px-4 py-4">
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                    placeholder="Reply to AdCP Agent..."
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Artifact panel (slide-in overlay) */}
      <ArtifactPanel
        artifact={artifact}
        isOpen={artifactPanelOpen}
        onClose={() => setArtifactPanelOpen(false)}
      />
    </div>
  );
}
