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

// Animated starburst icon matching Claude.ai style
function AnimatedStarburst() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.6,
      }}
      className="mb-6"
    >
      <motion.svg
        viewBox="0 0 32 32"
        fill="none"
        className="w-12 h-12 text-primary"
        animate={{
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Starburst rays */}
        <motion.path
          d="M16 2L17.5 12L24 5L18.5 13L30 12L19 15L30 18L18.5 17L24 25L17.5 18L16 28L14.5 18L8 25L13.5 17L2 18L13 15L2 12L13.5 13L8 5L14.5 12L16 2Z"
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
      </motion.svg>
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
        {/* Animated starburst icon */}
        <div className="flex justify-center">
          <AnimatedStarburst />
        </div>

        {/* Greeting */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-2xl md:text-3xl font-medium text-foreground mb-8"
        >
          Welcome back!
        </motion.h1>

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
