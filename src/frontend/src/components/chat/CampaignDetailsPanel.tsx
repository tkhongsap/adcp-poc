"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MediaBuy, DeliveryMetrics } from "@/hooks/useWebSocket";
import type { ChangeApplied } from "@/types/notifications";

interface CampaignDetailsPanelProps {
  mediaBuy: MediaBuy | null;
  metrics: DeliveryMetrics | null;
  isOpen: boolean;
  onClose: () => void;
  recentChanges?: ChangeApplied[];
  isHighlighted?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    active: { color: "bg-green-500", label: "Active" },
    paused: { color: "bg-yellow-500", label: "Paused" },
    completed: { color: "bg-gray-500", label: "Completed" },
    submitted: { color: "bg-blue-500", label: "Submitted" },
  };

  const config = statusConfig[status] || { color: "bg-gray-500", label: status };

  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-2 h-2 rounded-full", config.color)} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}

function PacingBadge({ pacing }: { pacing: string }) {
  const pacingConfig: Record<string, { color: string; label: string }> = {
    on_track: { color: "text-green-600 bg-green-100 dark:bg-green-900/30", label: "On Track" },
    behind: { color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30", label: "Behind" },
    overspend: { color: "text-red-600 bg-red-100 dark:bg-red-900/30", label: "Overspend" },
  };

  const config = pacingConfig[pacing] || { color: "text-gray-600 bg-gray-100", label: pacing };

  return (
    <span className={cn("px-2 py-0.5 text-xs font-medium rounded", config.color)}>
      {config.label}
    </span>
  );
}

function HighlightWrapper({
  children,
  isHighlighted
}: {
  children: React.ReactNode;
  isHighlighted: boolean;
}) {
  return (
    <motion.div
      animate={isHighlighted ? {
        backgroundColor: ["rgba(250, 204, 21, 0)", "rgba(250, 204, 21, 0.3)", "rgba(250, 204, 21, 0)"],
      } : {}}
      transition={{ duration: 0.5 }}
      className="rounded"
    >
      {children}
    </motion.div>
  );
}

export default function CampaignDetailsPanel({
  mediaBuy,
  metrics,
  isOpen,
  onClose,
  recentChanges = [],
  isHighlighted = false,
}: CampaignDetailsPanelProps) {
  // Get geo targeting from first package
  const geoTargeting = mediaBuy?.packages?.[0]?.targeting_overlay?.geo_country_any_of || [];
  const deviceTargeting = mediaBuy?.packages?.[0]?.targeting_overlay?.device_type || [];
  const totalBudget = mediaBuy?.packages?.reduce((sum, pkg) => sum + (pkg.budget || 0), 0) || 0;

  // Check which fields were recently changed
  const changedFields = new Set(recentChanges.map(c => c.operation));

  return (
    <AnimatePresence mode="wait">
      {isOpen && mediaBuy && (
        <motion.div
          key="campaign-details-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "h-full flex-shrink-0",
            "bg-card border-l border-border",
            "flex flex-col overflow-hidden"
          )}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h2 className="text-sm font-semibold text-foreground truncate">
                Campaign Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className={cn(
                "p-1.5 rounded-lg",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted transition-colors"
              )}
              aria-label="Close panel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 space-y-5">
            {/* Campaign Name */}
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {mediaBuy.brand_manifest?.name || mediaBuy.buyer_ref}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mediaBuy.media_buy_id}
              </p>
            </div>

            {/* Status */}
            <HighlightWrapper isHighlighted={isHighlighted && changedFields.has('set_status')}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Status
                </label>
                <StatusBadge status={mediaBuy.status} />
              </div>
            </HighlightWrapper>

            {/* Budget & Spend */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Budget
                </label>
                <p className="text-sm font-semibold">{formatCurrency(totalBudget)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Spend
                </label>
                <p className="text-sm font-semibold">
                  {metrics ? formatCurrency(metrics.total_spend) : "—"}
                </p>
              </div>
            </div>

            {/* Pacing */}
            {metrics && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pacing
                </label>
                <PacingBadge pacing={metrics.pacing} />
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Geo Targeting */}
            <HighlightWrapper isHighlighted={isHighlighted && (changedFields.has('remove_geo') || changedFields.has('add_geo'))}>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Geo Targeting
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {geoTargeting.length > 0 ? (
                    geoTargeting.map((geo) => (
                      <span
                        key={geo}
                        className="px-2 py-0.5 text-xs font-medium bg-muted rounded"
                      >
                        {geo}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No geo targeting</span>
                  )}
                </div>
              </div>
            </HighlightWrapper>

            {/* Device Targeting */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Device Targeting
              </label>
              <div className="flex flex-wrap gap-1.5">
                {deviceTargeting.length > 0 ? (
                  deviceTargeting.map((device) => (
                    <span
                      key={device}
                      className="px-2 py-0.5 text-xs font-medium bg-muted rounded capitalize"
                    >
                      {device}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">All devices</span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Current Bids */}
            <HighlightWrapper isHighlighted={isHighlighted && changedFields.has('adjust_bid')}>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Current Bids
                </label>
                {metrics?.current_bids && Object.keys(metrics.current_bids).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(metrics.current_bids).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium">
                          {typeof value === "number" ? `$${value.toFixed(2)}` : value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No bid data</span>
                )}
              </div>
            </HighlightWrapper>

            {/* Performance Summary */}
            {metrics?.summary && (
              <>
                <div className="border-t border-border" />
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Performance
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">CTR</p>
                      <p className="text-sm font-medium">{formatPercentage(metrics.summary.ctr)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CPM</p>
                      <p className="text-sm font-medium">${metrics.summary.cpm.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Impressions</p>
                      <p className="text-sm font-medium">{metrics.summary.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Clicks</p>
                      <p className="text-sm font-medium">{metrics.summary.clicks.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Recent Changes */}
            {recentChanges.length > 0 && (
              <>
                <div className="border-t border-border" />
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <span className="text-yellow-500">&#10024;</span>
                    Recently Changed
                  </label>
                  <div className="space-y-1">
                    {recentChanges.map((change, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        {change.details}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
