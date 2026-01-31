"use client";

import { useState, useRef, useCallback } from "react";
import { Message } from "@/types/chat";
import ChatPanel from "./ChatPanel";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
            const eventType = line.slice(7);
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
              } else if (parsed.toolCalls !== undefined) {
                // Done event - conversation ID already captured from start
                if (parsed.conversationId) {
                  conversationIdRef.current = parsed.conversationId;
                }
              }
            } catch {
              // Ignore parse errors for incomplete data
            }
          }
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
    <ChatPanel
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
    />
  );
}
