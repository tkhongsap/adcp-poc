"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

interface FormatSpecs {
  max_file_size?: string;
  file_types?: string[];
  max_duration?: number;
  skip_after?: number;
  interaction?: string;
  headline_max?: number;
  description_max?: number;
  image_dimensions?: string;
  cta_max?: number;
}

interface CreativeFormat {
  format_id: string;
  name: string;
  type: "display" | "video" | "native" | "audio";
  dimensions?: string;
  specs: FormatSpecs;
}

interface FormatsApiResponse {
  success: boolean;
  formats: CreativeFormat[];
  count: number;
}

/**
 * TypeBadge - displays format type with color coding
 */
function TypeBadge({ type }: { type: string }) {
  const typeColors: Record<string, string> = {
    display: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    video: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    native: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    audio: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  };

  const colorClass = typeColors[type] || "bg-muted text-muted-foreground";

  return (
    <span className={cn("px-2 py-1 text-xs font-medium rounded-full capitalize", colorClass)}>
      {type}
    </span>
  );
}

/**
 * SpecsList - displays format specifications
 */
function SpecsList({ specs }: { specs: FormatSpecs }) {
  const specItems: string[] = [];

  if (specs.max_file_size) {
    specItems.push(`Max size: ${specs.max_file_size}`);
  }
  if (specs.file_types && specs.file_types.length > 0) {
    specItems.push(`Types: ${specs.file_types.join(", ")}`);
  }
  if (specs.max_duration) {
    specItems.push(`Duration: ${specs.max_duration}s`);
  }
  if (specs.skip_after) {
    specItems.push(`Skip after: ${specs.skip_after}s`);
  }
  if (specs.headline_max) {
    specItems.push(`Headline: ${specs.headline_max} chars`);
  }
  if (specs.description_max) {
    specItems.push(`Desc: ${specs.description_max} chars`);
  }
  if (specs.image_dimensions) {
    specItems.push(`Image: ${specs.image_dimensions}`);
  }
  if (specs.cta_max) {
    specItems.push(`CTA: ${specs.cta_max} chars`);
  }
  if (specs.interaction) {
    specItems.push(`Interaction: ${specs.interaction.replace(/_/g, " ")}`);
  }

  if (specItems.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {specItems.map((item, index) => (
        <span
          key={index}
          className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * FormatsTable - displays available creative formats
 */
export default function FormatsTable() {
  const [formats, setFormats] = useState<CreativeFormat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFormats() {
      try {
        const body = filterType ? { type: filterType } : {};
        const response = await fetch(`${API_BASE_URL}/api/tools/list_creative_formats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FormatsApiResponse = await response.json();
        if (data.success) {
          setFormats(data.formats);
        } else {
          throw new Error("Failed to fetch formats");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load formats");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFormats();
  }, [filterType]);

  const formatTypes = ["display", "video", "native", "audio"];

  if (isLoading) {
    return (
      <div className="overflow-x-auto bg-card rounded-xl border border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted rounded w-full" />
          ))}
        </div>
        <p className="text-center text-muted-foreground mt-4">Loading formats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8 bg-card rounded-xl border border-border">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter by type:</span>
        <button
          onClick={() => setFilterType(null)}
          className={cn(
            "px-3 py-1.5 text-sm rounded-lg transition-colors",
            filterType === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
        </button>
        {formatTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors capitalize",
              filterType === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table */}
      {formats.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 bg-card rounded-xl border border-border">
          No formats available
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
                  Format Name
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
                  Dimensions
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
                  Specifications
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {formats.map((format, index) => (
                  <motion.tr
                    key={format.format_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className={cn(
                      "border-b border-border last:border-b-0",
                      "hover:bg-muted/50 transition-colors duration-150"
                    )}
                  >
                    {/* Format Name */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{format.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {format.format_id}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <TypeBadge type={format.type} />
                    </td>

                    {/* Dimensions */}
                    <td className="px-4 py-3 text-sm text-foreground">
                      {format.dimensions || "—"}
                    </td>

                    {/* Specifications */}
                    <td className="px-4 py-3">
                      <SpecsList specs={format.specs} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
