"use client";

import React from "react";

// Color thresholds for budget bar
const BUDGET_THRESHOLDS = {
  warning: 80, // Amber when >= 80%
  danger: 100, // Red when >= 100%
} as const;

// Color configuration
const BUDGET_COLORS = {
  good: "bg-green-500", // 0-80% spent
  warning: "bg-amber-500", // 80-100% spent
  danger: "bg-red-500", // >100% spent
} as const;

export interface BudgetBarProps {
  spend: number;
  budget: number;
  showPercentage?: boolean;
  className?: string;
}

/**
 * BudgetBar component - displays budget spend as a progress bar with pacing colors
 *
 * - Green (0-80%): On track
 * - Amber (80-100%): Approaching budget
 * - Red (>100%): Over budget
 */
export default function BudgetBar({
  spend,
  budget,
  showPercentage = true,
  className = "",
}: BudgetBarProps) {
  // Calculate percentage, cap display at 100% but track actual for color
  const percentage = budget > 0 ? (spend / budget) * 100 : 0;
  const displayWidth = Math.min(percentage, 100);

  // Determine bar color based on percentage thresholds
  let barColor: string = BUDGET_COLORS.good;
  if (percentage >= BUDGET_THRESHOLDS.danger) {
    barColor = BUDGET_COLORS.danger;
  } else if (percentage >= BUDGET_THRESHOLDS.warning) {
    barColor = BUDGET_COLORS.warning;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Progress bar container - 6px height */}
      <div
        className="flex-1 h-1.5 bg-claude-border-light rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Budget utilization: ${percentage.toFixed(0)}%`}
      >
        {/* Progress bar fill */}
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${displayWidth}%` }}
        />
      </div>

      {/* Percentage text */}
      {showPercentage && (
        <span className="text-xs text-claude-text-secondary whitespace-nowrap min-w-[32px] text-right">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
