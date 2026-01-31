"use client";

import { useState, useRef, useCallback } from "react";
import { Message, Artifact } from "@/types/chat";
import ChatPanel from "./ChatPanel";
import ArtifactPanel from "./ArtifactPanel";
import { detectArtifact, ToolCallData } from "@/utils/artifactDetection";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function OpenDashboardButton() {
  const handleOpenDashboard = () => {
    window.open("/dashboard", "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleOpenDashboard}
      className="flex items-center gap-2 px-4 py-2 bg-claude-sidebar text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-colors"
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
      Open Dashboard
    </button>
  );
}

export default function MainContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const conversationIdRef = useRef<string | null>(null);

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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages from buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            continue;
          }
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);

              // Handle different event types based on previous event line
              if (parsed.conversationId && !parsed.text && !parsed.toolCalls) {
                // Start event
                conversationIdRef.current = parsed.conversationId;
              } else if (parsed.text !== undefined) {
                // Text chunk
                assistantContent += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              } else if (parsed.name !== undefined && parsed.input !== undefined) {
                // Tool call event
                currentToolCall = {
                  name: parsed.name,
                  input: parsed.input,
                };
              } else if (parsed.name !== undefined && parsed.result !== undefined) {
                // Tool result event - combine with current tool call
                if (currentToolCall && currentToolCall.name === parsed.name) {
                  collectedToolCalls.push({
                    name: parsed.name,
                    input: currentToolCall.input,
                    result: parsed.result,
                  });
                  currentToolCall = null;
                }
              } else if (parsed.toolCalls !== undefined) {
                // Done event - use toolCalls from final response if available
                if (parsed.conversationId) {
                  conversationIdRef.current = parsed.conversationId;
                }
                // If we have toolCalls in done event, use those instead
                if (parsed.toolCalls && Array.isArray(parsed.toolCalls)) {
                  // Clear collected and use the complete tool calls
                  collectedToolCalls.length = 0;
                  collectedToolCalls.push(...parsed.toolCalls);
                }
              }
            } catch {
              // Ignore parse errors for incomplete data
            }
          }
        }
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

  return (
    <div className="h-screen bg-claude-cream flex flex-col">
      {/* Header Bar */}
      <header className="flex-shrink-0 h-14 border-b border-claude-border bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-claude-text-primary">
            AdCP Demo
          </span>
          <span className="text-xs text-claude-text-secondary bg-claude-cream px-2 py-0.5 rounded">
            Sales Agent
          </span>
        </div>
        <OpenDashboardButton />
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - 40% width */}
        <div className="w-[40%] min-w-[320px] h-full border-r border-claude-border">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Artifact Panel - 60% width */}
        <div className="w-[60%] min-w-[480px] h-full p-4">
          <ArtifactPanel artifact={artifact} />
        </div>
      </div>
    </div>
  );
}
