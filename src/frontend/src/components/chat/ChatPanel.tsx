"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import MessageInput from "./MessageInput";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === "user";

  if (isUser) {
    // User messages: right-aligned with warm gray bubble
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="flex justify-end mb-4"
      >
        <div className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          "bg-muted"
        )}>
          <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </motion.div>
    );
  }

  // Assistant (Claude) messages: left-aligned with no bubble
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex justify-start mb-4"
    >
      <div className="max-w-[90%]">
        <div className={cn(
          "text-foreground text-sm leading-relaxed",
          "prose prose-sm max-w-none",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
          "prose-headings:mt-4 prose-headings:mb-2",
          "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground",
          "prose-pre:bg-claude-sidebar prose-pre:text-white",
          "dark:prose-invert"
        )}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-center gap-1.5 px-4 py-3">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-2 h-2 bg-muted-foreground rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="w-2 h-2 bg-muted-foreground rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="w-2 h-2 bg-muted-foreground rounded-full"
        />
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      {/* Subtle illustration */}
      <div className="w-20 h-20 mb-6 rounded-2xl bg-muted flex items-center justify-center">
        <svg
          className="w-10 h-10 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Start a conversation
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Ask me about your campaigns, performance metrics, or optimization strategies.
      </p>
    </motion.div>
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
    <div className="flex flex-col h-full bg-card">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <MessageBubble key={message.id} message={message} index={index} />
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {isLoading && <TypingIndicator />}
            </AnimatePresence>
          </>
        )}
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border">
        <MessageInput onSendMessage={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
