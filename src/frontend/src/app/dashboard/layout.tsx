"use client";

import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Dark sidebar - 260px fixed width */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col bg-background overflow-hidden">
        {/* Content area - scrollable */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
