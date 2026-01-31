"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ReportArtifactData,
  ReportSection,
  ReportMetric,
} from "@/types/chat";

interface ReportArtifactProps {
  data: ReportArtifactData;
}

// Metric card component for displaying individual metrics
function MetricCard({ metric, index }: { metric: ReportMetric; index: number }) {
  // Determine change indicator color
  let changeColorClass = "text-muted-foreground";
  if (metric.changeType === "positive") {
    changeColorClass = "text-green-600 dark:text-green-400";
  } else if (metric.changeType === "negative") {
    changeColorClass = "text-red-500 dark:text-red-400";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-muted/50 rounded-lg p-4 border border-border/50"
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
        {metric.label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-foreground tabular-nums">
          {typeof metric.value === "number"
            ? new Intl.NumberFormat("en-US").format(metric.value)
            : metric.value}
        </span>
        {metric.change && (
          <span className={cn("text-sm font-medium", changeColorClass)}>
            {metric.change}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Section component for rendering report sections
function SectionBlock({ section, index }: { section: ReportSection; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-card rounded-xl border border-border p-5 shadow-sm"
    >
      {/* Section header */}
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <div className="w-1 h-4 bg-primary rounded-full" />
        {section.title}
      </h3>

      {/* Metrics grid */}
      {section.metrics && section.metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {section.metrics.map((metric, metricIndex) => (
            <MetricCard key={metricIndex} metric={metric} index={metricIndex} />
          ))}
        </div>
      )}

      {/* Text content */}
      {section.content && (
        <p className="text-sm text-foreground leading-relaxed mt-3">
          {section.content}
        </p>
      )}
    </motion.div>
  );
}

// Recommendations list component
function RecommendationsList({ recommendations }: { recommendations: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-primary/5 rounded-xl border border-primary/20 p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </span>
        Recommendations
      </h3>
      <ul className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
            className="flex items-start gap-3 text-sm text-foreground"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <svg
                className="w-3 h-3 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            <span className="leading-relaxed">{recommendation}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function ReportArtifact({ data }: ReportArtifactProps) {
  const { icon, sections, recommendations, summary } = data;

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No report data available
      </div>
    );
  }

  return (
    <div className="report-artifact space-y-5">
      {/* Report icon (if provided) */}
      {icon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="text-4xl">{icon}</span>
        </motion.div>
      )}

      {/* Summary (if provided) */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-muted/50 rounded-xl border border-border"
        >
          <p className="text-sm text-foreground leading-relaxed">
            {summary}
          </p>
        </motion.div>
      )}

      {/* Report sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <SectionBlock key={index} section={section} index={index} />
        ))}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <RecommendationsList recommendations={recommendations} />
      )}
    </div>
  );
}
