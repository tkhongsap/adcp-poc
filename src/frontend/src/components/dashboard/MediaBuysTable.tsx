"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MediaBuy, DeliveryMetrics } from "../../hooks/useWebSocket";
import HealthBadge from "../ui/HealthBadge";
import GeoChips from "../ui/GeoChips";

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
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full",
        "border-2 border-transparent transition-colors duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        isActive ? "bg-primary" : "bg-muted",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className="sr-only">{isActive ? "Active" : "Paused"}</span>
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full",
          "bg-white shadow ring-0"
        )}
        style={{ x: isActive ? 16 : 0 }}
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
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>${spend.toLocaleString()}</span>
        <span>/ ${budget.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayWidth}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>
    </div>
  );
}

/**
 * MediaBuysTable component - data table view for media buys
 */
export default function MediaBuysTable({
  mediaBuys,
  deliveryMetrics,
  recentlyUpdatedIds,
  onStatusToggle,
}: MediaBuysTableProps) {
  if (mediaBuys.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No media buys available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-card rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              Advertiser
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              Campaign
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground min-w-[180px]">
              Spend/Budget
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              Geos
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              Health
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {mediaBuys.map((mediaBuy, index) => {
              const metrics = deliveryMetrics[mediaBuy.media_buy_id];
              const isRecentlyUpdated = recentlyUpdatedIds.has(mediaBuy.media_buy_id);
              const isActive = mediaBuy.status === "active";

              return (
                <motion.tr
                  key={mediaBuy.media_buy_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: isRecentlyUpdated ? "rgba(218, 119, 86, 0.1)" : "transparent"
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.03,
                    backgroundColor: { duration: 0.4 }
                  }}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    "hover:bg-muted/50 transition-colors duration-150"
                  )}
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
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                    {mediaBuy.media_buy_id}
                  </td>

                  {/* Advertiser */}
                  <td className="px-4 py-3 text-sm text-foreground font-medium">
                    {mediaBuy.brand_manifest.name}
                  </td>

                  {/* Campaign - use media_buy_id or derive from packages */}
                  <td className="px-4 py-3 text-sm text-foreground">
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
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>

                  {/* Geos - targeted countries */}
                  <td className="px-4 py-3">
                    <GeoChips
                      countries={
                        mediaBuy.packages.flatMap(
                          (pkg) => pkg.targeting_overlay?.geo_country_any_of || []
                        ).filter((v, i, a) => a.indexOf(v) === i) // unique values
                      }
                    />
                  </td>

                  {/* Health */}
                  <td className="px-4 py-3">
                    {metrics ? (
                      <HealthBadge status={metrics.health} showLabel />
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
