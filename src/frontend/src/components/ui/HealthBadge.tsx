"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type HealthStatus = "good" | "warning" | "poor";

interface HealthBadgeProps {
  status: HealthStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const HEALTH_CONFIG: Record<
  HealthStatus,
  { color: string; pulseColor: string; label: string; description: string }
> = {
  good: {
    color: "bg-green-600",
    pulseColor: "bg-green-400",
    label: "Good",
    description: "Campaign is performing well",
  },
  warning: {
    color: "bg-amber-500",
    pulseColor: "bg-amber-400",
    label: "Warning",
    description: "Campaign needs attention",
  },
  poor: {
    color: "bg-red-500",
    pulseColor: "bg-red-400",
    label: "Poor",
    description: "Campaign is underperforming",
  },
};

export default function HealthBadge({
  status,
  showLabel = false,
  size = "md",
}: HealthBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = HEALTH_CONFIG[status] || HEALTH_CONFIG.good;

  // Size classes: 10px (md) or 8px (sm)
  const sizeClass = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Health status: ${config.label}`}
        role="status"
      >
        {/* Pulse effect for good status */}
        {status === "good" && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full",
              config.pulseColor
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        <motion.div
          className={cn(sizeClass, "rounded-full", config.color)}
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.15 }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {config.label}
        </span>
      )}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2",
              "px-2.5 py-1.5 text-xs text-white bg-claude-sidebar rounded-lg shadow-lg",
              "whitespace-nowrap pointer-events-none"
            )}
            role="tooltip"
          >
            <div className="font-medium">{config.label}</div>
            <div className="text-white/70 text-[10px]">{config.description}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-claude-sidebar" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
