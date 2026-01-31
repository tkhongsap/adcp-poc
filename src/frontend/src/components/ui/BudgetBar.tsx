"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

// Gradient versions for subtle enhancement
const BUDGET_GRADIENTS = {
  good: "bg-gradient-to-r from-green-500 to-green-400",
  warning: "bg-gradient-to-r from-amber-500 to-amber-400",
  danger: "bg-gradient-to-r from-red-500 to-red-400",
} as const;

export interface BudgetBarProps {
  spend: number;
  budget: number;
  showPercentage?: boolean;
  showGradient?: boolean;
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
  showGradient = false,
  className = "",
}: BudgetBarProps) {
  // Calculate percentage, cap display at 100% but track actual for color
  const percentage = budget > 0 ? (spend / budget) * 100 : 0;
  const displayWidth = Math.min(percentage, 100);

  // Determine bar color based on percentage thresholds
  let colorKey: "good" | "warning" | "danger" = "good";
  if (percentage >= BUDGET_THRESHOLDS.danger) {
    colorKey = "danger";
  } else if (percentage >= BUDGET_THRESHOLDS.warning) {
    colorKey = "warning";
  }

  const barColor = showGradient ? BUDGET_GRADIENTS[colorKey] : BUDGET_COLORS[colorKey];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Progress bar container - 6px height */}
      <div
        className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Budget utilization: ${percentage.toFixed(0)}%`}
      >
        {/* Progress bar fill with animation */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayWidth}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>

      {/* Percentage text */}
      {showPercentage && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground whitespace-nowrap min-w-[32px] text-right"
        >
          {percentage.toFixed(0)}%
        </motion.span>
      )}
    </div>
  );
}
