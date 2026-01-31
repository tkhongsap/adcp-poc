"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import ConnectionStatus from "../ui/ConnectionStatus";

export default function DashboardLayout() {
  // Connection state - will be managed by WebSocket hook in US-029
  // For now, defaults to disconnected until WebSocket is connected
  const [isConnected] = useState(false);
  const [lastUpdated] = useState<Date | null>(null);

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

          {/* Placeholder for campaign content - will be populated in future stories */}
          <div className="bg-white rounded-xl border border-claude-border p-6 shadow-sm">
            <p className="text-claude-text-secondary">
              Campaign data will appear here...
            </p>
          </div>
        </div>

        {/* Connection status bar - fixed at bottom */}
        <div className="border-t border-claude-border bg-white px-6 py-3">
          <ConnectionStatus isConnected={isConnected} lastUpdated={lastUpdated} />
        </div>
      </main>
    </div>
  );
}
