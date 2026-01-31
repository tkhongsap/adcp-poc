"use client";

import React from "react";

// Props interface for campaign data
export interface CampaignCardData {
  media_buy_id: string;
  brand: string;
  campaign_name: string;
  total_budget: number;
  total_spend: number;
  health: "good" | "warning" | "poor";
  metrics: {
    ctr: number;
    cpm: number;
    cpa: number;
  };
}

interface CampaignCardProps {
  data: CampaignCardData;
}

// Progress bar component for budget/spend visualization
function BudgetProgressBar({ spend, budget }: { spend: number; budget: number }) {
  const percentage = budget > 0 ? Math.min((spend / budget) * 100, 150) : 0;
  const displayPercentage = Math.min(percentage, 100);

  // Determine color based on spend percentage
  let barColor = "bg-green-500";
  if (percentage >= 100) {
    barColor = "bg-red-500";
  } else if (percentage >= 80) {
    barColor = "bg-amber-500";
  }

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-claude-text-secondary mb-1">
        <span>
          ${spend.toLocaleString("en-US", { maximumFractionDigits: 0 })} spent
        </span>
        <span>
          ${budget.toLocaleString("en-US", { maximumFractionDigits: 0 })} budget
        </span>
      </div>
      <div className="h-1.5 bg-claude-border-light rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      <div className="text-right text-xs text-claude-text-secondary mt-1">
        {percentage.toFixed(0)}% utilized
      </div>
    </div>
  );
}

// Health indicator dot
function HealthIndicator({ health }: { health: "good" | "warning" | "poor" }) {
  const colors = {
    good: "bg-green-500",
    warning: "bg-amber-500",
    poor: "bg-red-500",
  };

  const labels = {
    good: "Healthy",
    warning: "Attention",
    poor: "Critical",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${colors[health]}`} />
      <span className="text-xs text-claude-text-secondary">{labels[health]}</span>
    </div>
  );
}

// Metric display component
function MetricItem({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format: "percentage" | "currency";
}) {
  const formattedValue =
    format === "percentage"
      ? `${value.toFixed(2)}%`
      : `$${value.toFixed(2)}`;

  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-claude-text-primary">
        {formattedValue}
      </div>
      <div className="text-xs uppercase tracking-wider text-claude-text-secondary">
        {label}
      </div>
    </div>
  );
}

export default function CampaignCard({ data }: CampaignCardProps) {
  const { media_buy_id, brand, campaign_name, total_budget, total_spend, health, metrics } =
    data;

  return (
    <div className="bg-white rounded-xl border border-claude-border p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header: Campaign name and health status */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-claude-text-primary truncate">
            {campaign_name || media_buy_id}
          </h3>
          <p className="text-sm text-claude-text-secondary truncate">{brand}</p>
        </div>
        <HealthIndicator health={health} />
      </div>

      {/* Budget progress bar */}
      <div className="mb-4">
        <BudgetProgressBar spend={total_spend} budget={total_budget} />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-claude-border-light">
        <MetricItem label="CTR" value={metrics.ctr} format="percentage" />
        <MetricItem label="CPM" value={metrics.cpm} format="currency" />
        <MetricItem label="CPA" value={metrics.cpa} format="currency" />
      </div>
    </div>
  );
}
