"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Artifact, isTableArtifactData, isReportArtifactData } from "@/types/chat";
import { cn } from "@/lib/utils";
import TableArtifact from "@/components/artifacts/TableArtifact";
import ReportArtifact from "@/components/artifacts/ReportArtifact";

interface ArtifactPanelProps {
  artifact: Artifact | null;
}

const artifactTypeConfig = {
  table: { icon: "📋", label: "Table" },
  report: { icon: "📊", label: "Report" },
  chart: { icon: "📈", label: "Chart" },
} as const;

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full bg-card rounded-xl border border-border flex items-center justify-center"
    >
      <div className="text-center px-8 max-w-sm">
        {/* Subtle illustration */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
            />
          </svg>
        </div>
        <h3 className="text-base font-medium text-foreground mb-2">
          Artifacts appear here
        </h3>
        <p className="text-sm text-muted-foreground">
          Tables, reports, and visualizations will be displayed when generated during conversation.
        </p>
      </div>
    </motion.div>
  );
}

export default function ArtifactPanel({ artifact }: ArtifactPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {!artifact ? (
        <EmptyState key="empty" />
      ) : (
        <motion.div
          key={artifact.title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full bg-card rounded-xl border border-border flex flex-col overflow-hidden"
        >
          {/* Artifact header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <span className="text-lg">
              {artifactTypeConfig[artifact.type]?.icon || "📄"}
            </span>
            <h2 className="flex-1 text-sm font-medium text-foreground truncate">
              {artifact.title}
            </h2>
            {/* Type badge */}
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              "bg-primary/10 text-primary"
            )}>
              {artifactTypeConfig[artifact.type]?.label || artifact.type}
            </span>
          </div>

          {/* Artifact content area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 overflow-auto p-4"
          >
            {/* Render artifact based on type */}
            {artifact.type === "table" && isTableArtifactData(artifact.data) ? (
              <TableArtifact data={artifact.data} />
            ) : artifact.type === "report" && isReportArtifactData(artifact.data) ? (
              <ReportArtifact data={artifact.data} />
            ) : (
              // Fallback for other artifact types (chart) - will be replaced with ChartArtifact in future stories
              <div className="text-muted-foreground text-sm">
                <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-4 rounded-lg">
                  {JSON.stringify(artifact.data, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
