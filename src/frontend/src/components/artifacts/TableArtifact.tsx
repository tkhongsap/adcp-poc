"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Types for table data
export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "pacing" | "health" | "currency" | "percentage";
  align?: "left" | "center" | "right";
}

export interface TableRow {
  id: string;
  [key: string]: unknown;
}

export interface TableArtifactData {
  columns: TableColumn[];
  rows: TableRow[];
}

interface TableArtifactProps {
  data: TableArtifactData;
}

// Pacing bar component for showing budget/spend progress
function PacingBar({ value, max }: { value: number; max: number }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  // Determine color based on percentage
  let barColor = "bg-green-500";
  if (percentage >= 100) {
    barColor = "bg-red-500";
  } else if (percentage >= 80) {
    barColor = "bg-amber-500";
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {percentage.toFixed(0)}%
      </span>
    </div>
  );
}

// Health dot component
function HealthDot({ status }: { status: "good" | "warning" | "poor" | string }) {
  let dotColor = "bg-gray-400";
  let statusLabel = status;

  switch (status.toLowerCase()) {
    case "good":
    case "on_track":
      dotColor = "bg-green-600";
      statusLabel = "Good";
      break;
    case "warning":
    case "behind":
      dotColor = "bg-amber-500";
      statusLabel = "Warning";
      break;
    case "poor":
    case "overspend":
      dotColor = "bg-red-500";
      statusLabel = "Poor";
      break;
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn("w-2.5 h-2.5 rounded-full", dotColor)}
        title={statusLabel}
      />
      <span className="text-xs text-muted-foreground capitalize">
        {statusLabel}
      </span>
    </div>
  );
}

// Format cell value based on column type
function formatCellValue(
  value: unknown,
  column: TableColumn
): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  switch (column.type) {
    case "pacing":
      // Pacing expects an object with value and max
      if (typeof value === "object" && value !== null) {
        const pacingValue = value as { value: number; max: number };
        return <PacingBar value={pacingValue.value} max={pacingValue.max} />;
      }
      // Fallback for percentage value
      if (typeof value === "number") {
        return <PacingBar value={value} max={100} />;
      }
      return String(value);

    case "health":
      return <HealthDot status={String(value)} />;

    case "currency":
      if (typeof value === "number") {
        return (
          <span className="font-medium tabular-nums">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)}
          </span>
        );
      }
      return String(value);

    case "percentage":
      if (typeof value === "number") {
        return <span className="tabular-nums">{value.toFixed(2)}%</span>;
      }
      return String(value);

    case "number":
      if (typeof value === "number") {
        return (
          <span className="tabular-nums">
            {new Intl.NumberFormat("en-US").format(value)}
          </span>
        );
      }
      return String(value);

    default:
      return String(value);
  }
}

export default function TableArtifact({ data }: TableArtifactProps) {
  const { columns, rows } = data;

  if (!columns || !rows || columns.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left",
                  "text-xs uppercase tracking-wider font-medium",
                  "text-muted-foreground bg-muted/30",
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center"
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <motion.tr
              key={row.id || rowIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: rowIndex * 0.03 }}
              className={cn(
                "border-b border-border last:border-b-0",
                "hover:bg-muted/30 transition-colors duration-150"
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3",
                    "text-sm text-foreground",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center"
                  )}
                >
                  {formatCellValue(row[column.key], column)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
