"use client";

import React from "react";
import {
  ReportArtifactData,
  ReportSection,
  ReportMetric,
} from "@/types/chat";

interface ReportArtifactProps {
  data: ReportArtifactData;
}

// Metric card component for displaying individual metrics
function MetricCard({ metric }: { metric: ReportMetric }) {
  // Determine change indicator color
  let changeColorClass = "text-claude-text-secondary";
  if (metric.changeType === "positive") {
    changeColorClass = "text-green-600";
  } else if (metric.changeType === "negative") {
    changeColorClass = "text-red-500";
  }

  return (
    <div className="bg-claude-cream rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-claude-text-secondary mb-1">
        {metric.label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-claude-text-primary">
          {typeof metric.value === "number"
            ? new Intl.NumberFormat("en-US").format(metric.value)
            : metric.value}
        </span>
        {metric.change && (
          <span className={`text-sm font-medium ${changeColorClass}`}>
            {metric.change}
          </span>
        )}
      </div>
    </div>
  );
}

// Section component for rendering report sections
function SectionBlock({ section }: { section: ReportSection }) {
  return (
    <div className="mb-6 last:mb-0">
      {/* Section header */}
      <h3 className="text-sm font-semibold text-claude-text-primary mb-3 pb-2 border-b border-claude-border-light">
        {section.title}
      </h3>

      {/* Metrics grid */}
      {section.metrics && section.metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {section.metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      )}

      {/* Text content */}
      {section.content && (
        <p className="text-sm text-claude-text-primary leading-relaxed">
          {section.content}
        </p>
      )}
    </div>
  );
}

// Recommendations list component
function RecommendationsList({ recommendations }: { recommendations: string[] }) {
  return (
    <div className="mt-6 pt-4 border-t border-claude-border-light">
      <h3 className="text-sm font-semibold text-claude-text-primary mb-3 flex items-center gap-2">
        <span className="text-lg">💡</span>
        Recommendations
      </h3>
      <ul className="space-y-2">
        {recommendations.map((recommendation, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-claude-text-primary"
          >
            <span className="text-claude-orange mt-0.5 flex-shrink-0">•</span>
            <span className="leading-relaxed">{recommendation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReportArtifact({ data }: ReportArtifactProps) {
  const { icon, sections, recommendations, summary } = data;

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center text-claude-text-secondary py-8">
        No report data available
      </div>
    );
  }

  return (
    <div className="report-artifact">
      {/* Report icon (if provided) */}
      {icon && (
        <div className="text-center mb-4">
          <span className="text-4xl">{icon}</span>
        </div>
      )}

      {/* Summary (if provided) */}
      {summary && (
        <div className="mb-6 p-4 bg-claude-cream rounded-lg border border-claude-border-light">
          <p className="text-sm text-claude-text-primary leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Report sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <SectionBlock key={index} section={section} />
        ))}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <RecommendationsList recommendations={recommendations} />
      )}
    </div>
  );
}
