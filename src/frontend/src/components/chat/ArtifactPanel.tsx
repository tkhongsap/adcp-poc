"use client";

import { Artifact, isTableArtifactData, isReportArtifactData } from "@/types/chat";
import TableArtifact from "@/components/artifacts/TableArtifact";
import ReportArtifact from "@/components/artifacts/ReportArtifact";

interface ArtifactPanelProps {
  artifact: Artifact | null;
}

export default function ArtifactPanel({ artifact }: ArtifactPanelProps) {
  // Empty state when no artifact
  if (!artifact) {
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

  // Artifact content display
  return (
    <div className="h-full bg-white rounded-xl border border-claude-border flex flex-col overflow-hidden">
      {/* Artifact header */}
      <div className="px-4 py-3 border-b border-claude-border flex items-center gap-2">
        <span className="text-lg">
          {artifact.type === "table" && "📋"}
          {artifact.type === "report" && "📊"}
          {artifact.type === "chart" && "📈"}
        </span>
        <h2 className="text-sm font-medium text-claude-text-primary">
          {artifact.title}
        </h2>
      </div>

      {/* Artifact content area */}
      <div className="flex-1 overflow-auto p-4">
        {/* Render artifact based on type */}
        {artifact.type === "table" && isTableArtifactData(artifact.data) ? (
          <TableArtifact data={artifact.data} />
        ) : artifact.type === "report" && isReportArtifactData(artifact.data) ? (
          <ReportArtifact data={artifact.data} />
        ) : (
          // Fallback for other artifact types (chart) - will be replaced with ChartArtifact in future stories
          <div className="text-claude-text-secondary text-sm">
            <pre className="whitespace-pre-wrap font-mono text-xs bg-claude-cream p-4 rounded-lg">
              {JSON.stringify(artifact.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
