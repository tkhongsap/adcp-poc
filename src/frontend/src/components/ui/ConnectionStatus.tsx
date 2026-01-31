"use client";

import React from "react";

export type ConnectionState = "connected" | "disconnected";

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdated?: Date | null;
}

const CONNECTION_CONFIG: Record<
  ConnectionState,
  { color: string; label: string }
> = {
  connected: {
    color: "bg-[#22863A]",
    label: "Connected",
  },
  disconnected: {
    color: "bg-[#DC2626]",
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
      {/* Status dot - 10px (w-2.5 h-2.5) */}
      <div
        className={`w-2.5 h-2.5 rounded-full ${config.color}`}
        aria-hidden="true"
      />

      {/* Status text */}
      <span className="text-claude-text-secondary">{config.label}</span>

      {/* Last updated timestamp */}
      {lastUpdated && isConnected && (
        <span className="text-claude-text-secondary/60 text-xs">
          · Last updated {formatLastUpdated(lastUpdated)}
        </span>
      )}
    </div>
  );
}
