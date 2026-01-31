"use client";

import React from "react";

/** Valid device types that can be displayed */
export type DeviceType = "Desktop" | "Mobile" | "Tablet";

export interface DeviceChipsProps {
  /** Array of device types to display (e.g., ["Desktop", "Mobile", "Tablet"]) */
  devices: DeviceType[];
  /** Optional className for additional styling */
  className?: string;
}

/** Icons for each device type */
const DEVICE_ICONS: Record<DeviceType, React.ReactNode> = {
  Desktop: (
    <svg
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Mobile: (
    <svg
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Tablet: (
    <svg
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
};

/**
 * DeviceChips component displays device types as visual pills.
 * - Shows Desktop, Mobile, Tablet as applicable
 * - Consistent styling with GeoChips (same sizing, border radius, gap)
 * - Uses purple color scheme to differentiate from GeoChips' blue
 */
export default function DeviceChips({
  devices,
  className = "",
}: DeviceChipsProps) {
  if (devices.length === 0) {
    return (
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        <span className="text-xs text-claude-text-secondary italic">
          No devices targeted
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {devices.map((device) => (
        <span
          key={device}
          className="
            inline-flex items-center gap-1 px-2 py-0.5
            text-xs font-medium rounded-full
            bg-purple-50 text-purple-700 border border-purple-200
          "
        >
          {DEVICE_ICONS[device]}
          {device}
        </span>
      ))}
    </div>
  );
}
