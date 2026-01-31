"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !disabled) {
      onSendMessage(trimmedValue);
      setInputValue("");
      // Reset height after send
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = inputValue.trim().length > 0 && !disabled;

  return (
    <div
      className={cn(
        "flex items-end gap-3 rounded-2xl border px-4 py-2",
        "bg-card transition-all duration-200",
        isFocused
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-muted-foreground/30"
      )}
    >
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Message AdCP Agent..."
        disabled={disabled}
        rows={1}
        className={cn(
          "flex-1 bg-transparent outline-none resize-none",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "min-h-[24px] max-h-[120px] py-1.5",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      />
      <motion.button
        onClick={handleSend}
        disabled={!canSend}
        whileHover={canSend ? { scale: 1.05 } : {}}
        whileTap={canSend ? { scale: 0.95 } : {}}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-full",
          "transition-all duration-200",
          canSend
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
        aria-label="Send message"
      >
        {disabled ? (
          // Loading spinner
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          // Send arrow
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}
