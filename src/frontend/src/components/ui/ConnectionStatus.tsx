"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ConnectionState = "connected" | "disconnected";

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdated?: Date | null;
}

const CONNECTION_CONFIG: Record<
  ConnectionState,
  { color: string; pulseColor: string; label: string }
> = {
  connected: {
    color: "bg-green-600",
    pulseColor: "bg-green-400",
    label: "Connected",
  },
  disconnected: {
    color: "bg-red-500",
    pulseColor: "bg-red-400",
    label: "Disconnected",
  },
};

function formatLastUpdated(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 5) {
    return "just now";
  } else if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m ago`;
  } else {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
}

export default function ConnectionStatus({
  isConnected,
  lastUpdated,
}: ConnectionStatusProps) {
  const status: ConnectionState = isConnected ? "connected" : "disconnected";
  const config = CONNECTION_CONFIG[status];

  return (
    <div
      className="flex items-center gap-2 text-sm"
      role="status"
      aria-live="polite"
    >
      {/* Status dot with pulse animation for connected state */}
      <div className="relative">
        {isConnected && (
          <motion.div
            className={cn(
              "absolute inset-0 w-2.5 h-2.5 rounded-full",
              config.pulseColor
            )}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        <div
          className={cn("w-2.5 h-2.5 rounded-full relative", config.color)}
          aria-hidden="true"
        />
      </div>

      {/* Status text */}
      <span className="text-muted-foreground">{config.label}</span>

      {/* Last updated timestamp */}
      {lastUpdated && isConnected && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground/60 text-xs"
        >
          · Last updated {formatLastUpdated(lastUpdated)}
        </motion.span>
      )}
    </div>
  );
}
