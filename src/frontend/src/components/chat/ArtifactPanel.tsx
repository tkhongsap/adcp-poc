"use client";

export default function ArtifactPanel() {
  return (
    <div className="h-full bg-white rounded-xl border border-claude-border flex items-center justify-center">
      <div className="text-center text-claude-text-secondary">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-sm">
          Artifacts will appear here when Claude generates tables, reports, or
          visualizations.
        </div>
      </div>
    </div>
  );
}
