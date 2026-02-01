"use client";

import { motion } from "framer-motion";
import MessageInput, { ClaudeModelId } from "./MessageInput";
import QuickActionPills from "./QuickActionPills";

interface WelcomeScreenProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  selectedModel?: ClaudeModelId;
  onModelChange?: (model: ClaudeModelId) => void;
}

// Minimal animated logo - clean geometric design
function AnimatedLogo() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.5,
      }}
      className="mb-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-7 h-7 text-primary-foreground"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {/* Minimal chat/agent icon */}
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 14.65 3.04 17.06 4.75 18.83L3 22L7.5 20.5C8.89 21.15 10.41 21.5 12 21.5C17.52 21.5 22 17.02 22 11.5C22 6.48 17.52 2 12 2Z"
            fill="currentColor"
          />
          <motion.circle
            cx="8"
            cy="12"
            r="1.5"
            fill="currentColor"
            className="text-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          />
          <motion.circle
            cx="12"
            cy="12"
            r="1.5"
            fill="currentColor"
            className="text-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          />
          <motion.circle
            cx="16"
            cy="12"
            r="1.5"
            fill="currentColor"
            className="text-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          />
        </motion.svg>
      </div>
    </motion.div>
  );
}

export default function WelcomeScreen({
  onSendMessage,
  disabled = false,
  selectedModel,
  onModelChange,
}: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl text-center"
      >
        {/* Animated logo */}
        <div className="flex justify-center">
          <AnimatedLogo />
        </div>

        {/* Greeting */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-2"
        >
          AdCP Agent
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-muted-foreground mb-8"
        >
          Your AI-powered campaign management assistant
        </motion.p>

        {/* Centered message input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-4"
        >
          <MessageInput
            onSendMessage={onSendMessage}
            disabled={disabled}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
          />
        </motion.div>

        {/* Quick action pills */}
        <QuickActionPills onActionClick={onSendMessage} />
      </motion.div>
    </div>
  );
}
