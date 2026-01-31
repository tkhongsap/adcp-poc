"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ConversationViewProps {
  messages: Message[];
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

export default function ConversationView({ messages, isLoading = false }: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto"
    >
      {/* Centered message container with max-width */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {isLoading && <TypingIndicator />}
        </AnimatePresence>
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
