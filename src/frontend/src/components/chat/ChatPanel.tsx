"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "@/types/chat";
import MessageInput from "./MessageInput";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    // User messages: right-aligned with warm gray bubble
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] bg-claude-user-bubble rounded-2xl px-4 py-3">
          <div className="text-claude-text-primary text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant (Claude) messages: left-aligned with no bubble
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[90%]">
        <div className="text-claude-text-primary text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:mt-4 prose-headings:mb-2 prose-code:bg-claude-border-light prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-claude-sidebar prose-pre:text-white">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex space-x-1.5 px-4 py-3">
        <div className="w-2 h-2 bg-claude-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-claude-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-claude-text-secondary rounded-full animate-bounce" />
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, onSendMessage, isLoading = false }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-claude-text-secondary text-sm text-center">
              Start a conversation with AdCP Agent...
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-claude-border">
        <MessageInput onSendMessage={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
