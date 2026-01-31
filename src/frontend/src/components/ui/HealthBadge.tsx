"use client";

import React, { useState } from "react";

export type HealthStatus = "good" | "warning" | "poor";

interface HealthBadgeProps {
  status: HealthStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const HEALTH_CONFIG: Record<
  HealthStatus,
  { color: string; label: string; description: string }
> = {
  good: {
    color: "bg-[#22863A]",
    label: "Good",
    description: "Campaign is performing well",
  },
  warning: {
    color: "bg-[#D97706]",
    label: "Warning",
    description: "Campaign needs attention",
  },
  poor: {
    color: "bg-[#DC2626]",
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
        className={`${sizeClass} rounded-full ${config.color} cursor-pointer transition-transform hover:scale-110`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Health status: ${config.label}`}
        role="status"
      />
      {showLabel && (
        <span className="text-xs text-claude-text-secondary">
          {config.label}
        </span>
      )}
      {showTooltip && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs text-white bg-claude-sidebar rounded shadow-lg whitespace-nowrap pointer-events-none"
          role="tooltip"
        >
          <div className="font-medium">{config.label}</div>
          <div className="text-white/70 text-[10px]">{config.description}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-claude-sidebar" />
        </div>
      )}
    </div>
  );
}
