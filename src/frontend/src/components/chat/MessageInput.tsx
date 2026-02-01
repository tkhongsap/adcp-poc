"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Available Claude 4.5 models
export const CLAUDE_MODELS = {
  "claude-sonnet-4-5-20250929": {
    id: "claude-sonnet-4-5-20250929",
    name: "Sonnet 4.5",
    description: "Best balance of speed and intelligence",
  },
  "claude-opus-4-5-20251101": {
    id: "claude-opus-4-5-20251101",
    name: "Opus 4.5",
    description: "Maximum intelligence",
  },
  "claude-haiku-4-5-20251001": {
    id: "claude-haiku-4-5-20251001",
    name: "Haiku 4.5",
    description: "Fastest responses",
  },
} as const;

export type ClaudeModelId = keyof typeof CLAUDE_MODELS;

export const DEFAULT_MODEL: ClaudeModelId = "claude-sonnet-4-5-20250929";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  selectedModel?: ClaudeModelId;
  onModelChange?: (model: ClaudeModelId) => void;
}

// Model selector dropdown
interface ModelSelectorProps {
  selectedModel: ClaudeModelId;
  onModelChange: (model: ClaudeModelId) => void;
}

function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectModel = (modelId: ClaudeModelId) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 px-2 py-1 text-xs rounded-lg",
          "text-muted-foreground hover:text-foreground",
          "hover:bg-muted/50 transition-colors"
        )}
      >
        <span className="font-medium">{CLAUDE_MODELS[selectedModel].name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn(
            "w-3 h-3 transition-transform",
            isOpen && "rotate-180"
          )}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "absolute bottom-full right-0 mb-2 z-50",
            "bg-card border border-border rounded-lg shadow-lg",
            "py-1 min-w-[180px]"
          )}
        >
          {Object.values(CLAUDE_MODELS).map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelectModel(model.id as ClaudeModelId)}
              className={cn(
                "w-full px-3 py-2 text-left text-sm",
                selectedModel === model.id
                  ? "text-foreground bg-muted/50"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className="font-medium">{model.name}</div>
              <div className="text-xs text-muted-foreground">{model.description}</div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "How can I help you today?",
  selectedModel = DEFAULT_MODEL,
  onModelChange,
}: MessageInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [localModel, setLocalModel] = useState<ClaudeModelId>(selectedModel);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use controlled model if onModelChange is provided, otherwise use local state
  const currentModel = onModelChange ? selectedModel : localModel;
  const handleModelChange = onModelChange || setLocalModel;

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
        "flex flex-col rounded-3xl border",
        "bg-card transition-all duration-200",
        isFocused
          ? "border-primary/50 ring-2 ring-primary/20 shadow-lg"
          : "border-border hover:border-muted-foreground/30"
      )}
    >
      {/* Main input area */}
      <div className="flex items-end gap-2 px-4 py-3">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 bg-transparent outline-none resize-none",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "min-h-[24px] max-h-[120px] py-0.5",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-3 pb-3">
        {/* Left side: Attachment and clock icons */}
        <div className="flex items-center gap-1">
          {/* Attachment button (visual only) */}
          <button
            type="button"
            className={cn(
              "p-2 rounded-lg",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted transition-colors"
            )}
            aria-label="Add attachment"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          </button>

          {/* Clock/history button (visual only) */}
          <button
            type="button"
            className={cn(
              "p-2 rounded-lg",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted transition-colors"
            )}
            aria-label="View history"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Right side: Model selector and send button */}
        <div className="flex items-center gap-2">
          <ModelSelector selectedModel={currentModel} onModelChange={handleModelChange} />

          {/* Send button */}
          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
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
              // Send arrow (up arrow like Claude.ai)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
