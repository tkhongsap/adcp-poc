"use client";

import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Dark sidebar - 220px fixed width */}
      <Sidebar />

      {/* Main content area with warm cream background */}
      <main className="flex-1 bg-claude-cream overflow-auto">
        <div className="p-6">
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
      </main>
    </div>
  );
}
