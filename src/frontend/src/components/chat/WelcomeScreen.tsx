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
        {/* Greeting */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-2"
        >
          Signal42 Agent
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
