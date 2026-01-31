"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Artifact, isTableArtifactData, isReportArtifactData } from "@/types/chat";
import { cn } from "@/lib/utils";
import TableArtifact from "@/components/artifacts/TableArtifact";
import ReportArtifact from "@/components/artifacts/ReportArtifact";

interface ArtifactPanelProps {
  artifact: Artifact | null;
  isOpen: boolean;
  onClose: () => void;
}

const artifactTypeConfig = {
  table: { icon: "📋", label: "Table" },
  report: { icon: "📊", label: "Report" },
  chart: { icon: "📈", label: "Chart" },
} as const;

export default function ArtifactPanel({ artifact, isOpen, onClose }: ArtifactPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && artifact && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Slide-in panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 h-full w-[50%] min-w-[400px] max-w-[800px]",
              "bg-card border-l border-border shadow-2xl z-50",
              "flex flex-col"
            )}
          >
            {/* Panel header with close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {artifactTypeConfig[artifact.type]?.icon || "📄"}
                </span>
                <h2 className="text-sm font-medium text-foreground truncate max-w-[300px]">
                  {artifact.title}
                </h2>
                {/* Type badge */}
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    "bg-primary/10 text-primary"
                  )}
                >
                  {artifactTypeConfig[artifact.type]?.label || artifact.type}
                </span>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className={cn(
                  "p-2 rounded-lg",
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-muted transition-colors"
                )}
                aria-label="Close artifact panel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Artifact content area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-1 overflow-auto p-4"
            >
              {/* Render artifact based on type */}
              {artifact.type === "table" && isTableArtifactData(artifact.data) ? (
                <TableArtifact data={artifact.data} />
              ) : artifact.type === "report" && isReportArtifactData(artifact.data) ? (
                <ReportArtifact data={artifact.data} />
              ) : (
                // Fallback for other artifact types (chart)
                <div className="text-muted-foreground text-sm">
                  <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-4 rounded-lg">
                    {JSON.stringify(artifact.data, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
