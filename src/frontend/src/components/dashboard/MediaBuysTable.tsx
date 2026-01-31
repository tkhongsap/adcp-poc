"use client";

import React from "react";
import type { MediaBuy, DeliveryMetrics } from "../../hooks/useWebSocket";
import HealthBadge from "../ui/HealthBadge";

interface MediaBuysTableProps {
  mediaBuys: MediaBuy[];
  deliveryMetrics: Record<string, DeliveryMetrics>;
  recentlyUpdatedIds: Set<string>;
  onStatusToggle?: (mediaBuyId: string, newStatus: "active" | "paused") => void;
}

/**
 * StatusToggle component - Claude.ai-style toggle switch
 */
function StatusToggle({
  isActive,
  disabled = false,
  onChange,
}: {
  isActive: boolean;
  disabled?: boolean;
  onChange?: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      disabled={disabled}
      onClick={onChange}
      className={`
        relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-claude-orange focus:ring-offset-2
        ${isActive ? "bg-claude-orange" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span className="sr-only">{isActive ? "Active" : "Paused"}</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-4 w-4 transform rounded-full
          bg-white shadow ring-0 transition duration-200 ease-in-out
          ${isActive ? "translate-x-4" : "translate-x-0"}
        `}
      />
    </button>
  );
}

/**
 * PacingBar component - shows spend/budget as progress bar
 */
function PacingBar({
  spend,
  budget,
}: {
  spend: number;
  budget: number;
}) {
  const percentage = budget > 0 ? (spend / budget) * 100 : 0;
  const displayWidth = Math.min(percentage, 100);

  // Determine bar color based on percentage thresholds
  let barColor = "bg-green-500";
  if (percentage >= 100) {
    barColor = "bg-red-500";
  } else if (percentage >= 80) {
    barColor = "bg-amber-500";
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-claude-text-secondary">
        <span>${spend.toLocaleString()}</span>
        <span>/ ${budget.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${displayWidth}%` }}
        />
      </div>
    </div>
  );
}

/**
 * MediaBuysTable component - data table view for media buys
 *
 * Columns: Status (toggle), ID, Advertiser, Campaign, Spend/Budget (pacing bar), Health
 * Features: Row hover state, status toggle styled like Claude.ai, pacing bar
 */
export default function MediaBuysTable({
  mediaBuys,
  deliveryMetrics,
  recentlyUpdatedIds,
  onStatusToggle,
}: MediaBuysTableProps) {
  if (mediaBuys.length === 0) {
    return (
      <div className="text-center text-claude-text-secondary py-8">
        No media buys available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-claude-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-claude-border-light">
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-claude-text-secondary">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-claude-text-secondary">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-claude-text-secondary">
              Advertiser
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-claude-text-secondary">
              Campaign
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-claude-text-secondary min-w-[180px]">
              Spend/Budget
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-claude-text-secondary">
              Health
            </th>
          </tr>
        </thead>
        <tbody>
          {mediaBuys.map((mediaBuy) => {
            const metrics = deliveryMetrics[mediaBuy.media_buy_id];
            const isRecentlyUpdated = recentlyUpdatedIds.has(mediaBuy.media_buy_id);
            const isActive = mediaBuy.status === "active";

            return (
              <tr
                key={mediaBuy.media_buy_id}
                className={`
                  border-b border-claude-border-light last:border-b-0
                  hover:bg-claude-cream transition-colors duration-150
                  ${isRecentlyUpdated ? "bg-[#FEF3C7]" : ""}
                `}
              >
                {/* Status toggle */}
                <td className="px-4 py-3">
                  <StatusToggle
                    isActive={isActive}
                    onChange={
                      onStatusToggle
                        ? () =>
                            onStatusToggle(
                              mediaBuy.media_buy_id,
                              isActive ? "paused" : "active"
                            )
                        : undefined
                    }
                  />
                </td>

                {/* ID */}
                <td className="px-4 py-3 text-sm text-claude-text-secondary font-mono">
                  {mediaBuy.media_buy_id}
                </td>

                {/* Advertiser */}
                <td className="px-4 py-3 text-sm text-claude-text-primary font-medium">
                  {mediaBuy.brand_manifest.name}
                </td>

                {/* Campaign - use media_buy_id or derive from packages */}
                <td className="px-4 py-3 text-sm text-claude-text-primary">
                  {metrics?.brand || mediaBuy.brand_manifest.name} Campaign
                </td>

                {/* Spend/Budget with pacing bar */}
                <td className="px-4 py-3">
                  {metrics ? (
                    <PacingBar
                      spend={metrics.total_spend}
                      budget={metrics.total_budget}
                    />
                  ) : (
                    <span className="text-claude-text-secondary text-sm">—</span>
                  )}
                </td>

                {/* Health */}
                <td className="px-4 py-3">
                  {metrics ? (
                    <HealthBadge status={metrics.health} showLabel />
                  ) : (
                    <span className="text-claude-text-secondary text-sm">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
