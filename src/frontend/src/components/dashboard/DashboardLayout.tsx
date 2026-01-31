"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import MediaBuysTable from "./MediaBuysTable";
import ConnectionStatus from "../ui/ConnectionStatus";
import GeoChips from "../ui/GeoChips";
import ThemeToggle from "../ui/ThemeToggle";
import { useWebSocket } from "../../hooks/useWebSocket";

type ViewMode = "cards" | "table";

// Loading skeleton for cards
function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="h-4 w-32 bg-muted rounded mb-2" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
      <div className="mb-3">
        <div className="h-3 w-full bg-muted rounded mb-2" />
        <div className="h-1.5 w-full bg-muted rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  // Connection state managed by WebSocket hook
  const {
    mediaBuys,
    deliveryMetrics,
    isConnected,
    lastUpdated,
    recentlyUpdatedIds,
  } = useWebSocket();

  // View mode toggle between cards and table
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const isLoading = mediaBuys.length === 0;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Dark sidebar - 220px fixed width */}
      <Sidebar />

      {/* Main content area with warm cream background */}
      <main className="flex-1 flex flex-col bg-background overflow-hidden">
        {/* Content area - scrollable */}
        <div className="flex-1 overflow-auto p-6">
          {/* Header with view toggle */}
          <div className="flex justify-between items-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <Link href="/">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Chat
                </button>
              </Link>
              <h1 className="text-2xl font-semibold text-foreground">
                Campaign Dashboard
              </h1>
            </motion.div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* View mode toggle */}
              <div className="flex items-center bg-card rounded-lg border border-border p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-all duration-200",
                    viewMode === "cards"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Cards
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-all duration-200",
                    viewMode === "table"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Table
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Content based on view mode */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {viewMode === "table" ? (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-muted rounded w-full" />
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 bg-muted rounded w-full" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </div>
                )}
                <p className="text-center text-muted-foreground mt-4">
                  {isConnected ? "Loading campaign data..." : "Connecting to server..."}
                </p>
              </motion.div>
            ) : viewMode === "table" ? (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <MediaBuysTable
                  mediaBuys={mediaBuys}
                  deliveryMetrics={deliveryMetrics}
                  recentlyUpdatedIds={recentlyUpdatedIds}
                />
              </motion.div>
            ) : (
              <motion.div
                key="cards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {mediaBuys.map((mediaBuy, index) => {
                  const metrics = deliveryMetrics[mediaBuy.media_buy_id];
                  const isRecentlyUpdated = recentlyUpdatedIds.has(mediaBuy.media_buy_id);

                  return (
                    <motion.div
                      key={mediaBuy.media_buy_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className={cn(
                        "bg-card rounded-xl border border-border p-4",
                        "transition-shadow duration-200 hover:shadow-md",
                        isRecentlyUpdated && "ring-2 ring-primary/30"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {mediaBuy.brand_manifest.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {mediaBuy.media_buy_id}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            mediaBuy.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : mediaBuy.status === "paused"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {mediaBuy.status}
                        </span>
                      </div>

                      {metrics && (
                        <>
                          {/* Budget progress */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Spend</span>
                              <span>
                                ${metrics.total_spend.toLocaleString()} / $
                                {metrics.total_budget.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.min(
                                    100,
                                    (metrics.total_spend / metrics.total_budget) * 100
                                  )}%`,
                                }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className={cn(
                                  "h-full rounded-full",
                                  metrics.total_spend / metrics.total_budget > 1
                                    ? "bg-red-500"
                                    : metrics.total_spend / metrics.total_budget > 0.8
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                                )}
                              />
                            </div>
                          </div>

                          {/* Health indicator */}
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full",
                                metrics.health === "good"
                                  ? "bg-green-600"
                                  : metrics.health === "warning"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              )}
                            />
                            <span className="text-xs text-muted-foreground capitalize">
                              {metrics.health}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {metrics.pacing.replace("_", " ")}
                            </span>
                          </div>

                          {/* Key metrics */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-muted/50 rounded-lg p-2">
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                CTR
                              </div>
                              <div className="text-sm font-medium text-foreground">
                                {metrics.summary.ctr.toFixed(2)}%
                              </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-2">
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                CPM
                              </div>
                              <div className="text-sm font-medium text-foreground">
                                ${metrics.summary.cpm.toFixed(2)}
                              </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-2">
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                CPA
                              </div>
                              <div className="text-sm font-medium text-foreground">
                                ${metrics.summary.cpa.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Geo targeting */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                          Targeted Geos
                        </div>
                        <GeoChips
                          countries={
                            mediaBuy.packages
                              .flatMap((pkg) => pkg.targeting_overlay?.geo_country_any_of || [])
                              .filter((v, i, a) => a.indexOf(v) === i)
                          }
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Connection status bar - fixed at bottom */}
        <div className="border-t border-border bg-card px-6 py-3">
          <ConnectionStatus isConnected={isConnected} lastUpdated={lastUpdated} />
        </div>
      </main>
    </div>
  );
}
