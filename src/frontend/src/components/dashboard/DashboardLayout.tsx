"use client";

import Sidebar from "./Sidebar";
import ConnectionStatus from "../ui/ConnectionStatus";
import { useWebSocket } from "../../hooks/useWebSocket";

export default function DashboardLayout() {
  // Connection state managed by WebSocket hook
  const {
    mediaBuys,
    deliveryMetrics,
    isConnected,
    lastUpdated,
    recentlyUpdatedIds,
  } = useWebSocket();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Dark sidebar - 220px fixed width */}
      <Sidebar />

      {/* Main content area with warm cream background */}
      <main className="flex-1 flex flex-col bg-claude-cream overflow-hidden">
        {/* Content area - scrollable */}
        <div className="flex-1 overflow-auto p-6">
          <h1 className="text-2xl font-semibold text-claude-text-primary mb-6">
            Campaign Dashboard
          </h1>

          {/* Campaign cards grid - populated from WebSocket data */}
          {mediaBuys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaBuys.map((mediaBuy) => {
                const metrics = deliveryMetrics[mediaBuy.media_buy_id];
                const isRecentlyUpdated = recentlyUpdatedIds.has(
                  mediaBuy.media_buy_id
                );

                return (
                  <div
                    key={mediaBuy.media_buy_id}
                    className={`bg-white rounded-xl border border-claude-border p-4 shadow-sm transition-all duration-400 ${
                      isRecentlyUpdated ? "bg-yellow-50 border-yellow-200" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-claude-text-primary">
                          {mediaBuy.brand_manifest.name}
                        </h3>
                        <p className="text-sm text-claude-text-secondary">
                          {mediaBuy.media_buy_id}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          mediaBuy.status === "active"
                            ? "bg-green-100 text-green-700"
                            : mediaBuy.status === "paused"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {mediaBuy.status}
                      </span>
                    </div>

                    {metrics && (
                      <>
                        {/* Budget progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-claude-text-secondary mb-1">
                            <span>Spend</span>
                            <span>
                              ${metrics.total_spend.toLocaleString()} / $
                              {metrics.total_budget.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                metrics.total_spend / metrics.total_budget > 1
                                  ? "bg-red-500"
                                  : metrics.total_spend / metrics.total_budget >
                                    0.8
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (metrics.total_spend / metrics.total_budget) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Health indicator */}
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              metrics.health === "good"
                                ? "bg-[#22863A]"
                                : metrics.health === "warning"
                                ? "bg-[#D97706]"
                                : "bg-[#DC2626]"
                            }`}
                          />
                          <span className="text-xs text-claude-text-secondary capitalize">
                            {metrics.health}
                          </span>
                          <span className="text-xs text-claude-text-secondary">
                            •
                          </span>
                          <span className="text-xs text-claude-text-secondary capitalize">
                            {metrics.pacing.replace("_", " ")}
                          </span>
                        </div>

                        {/* Key metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-xs text-claude-text-secondary uppercase tracking-wider">
                              CTR
                            </div>
                            <div className="text-sm font-medium text-claude-text-primary">
                              {metrics.summary.ctr.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-claude-text-secondary uppercase tracking-wider">
                              CPM
                            </div>
                            <div className="text-sm font-medium text-claude-text-primary">
                              ${metrics.summary.cpm.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-claude-text-secondary uppercase tracking-wider">
                              CPA
                            </div>
                            <div className="text-sm font-medium text-claude-text-primary">
                              ${metrics.summary.cpa.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-claude-border p-6 shadow-sm">
              <p className="text-claude-text-secondary">
                {isConnected
                  ? "Loading campaign data..."
                  : "Connecting to server..."}
              </p>
            </div>
          )}
        </div>

        {/* Connection status bar - fixed at bottom */}
        <div className="border-t border-claude-border bg-white px-6 py-3">
          <ConnectionStatus isConnected={isConnected} lastUpdated={lastUpdated} />
        </div>
      </main>
    </div>
  );
}
