"use client";

import React, { useEffect, useRef, useState } from "react";

export interface GeoChipsProps {
  /** Array of country codes (e.g., ["US", "DE", "UK"]) */
  countries: string[];
  /** Optional className for additional styling */
  className?: string;
}

interface ChipState {
  code: string;
  isEntering: boolean;
  isExiting: boolean;
}

/**
 * GeoChips component displays country codes as visual pills with animations.
 * - Fade in animation when a geo is added
 * - Fade out animation when a geo is removed
 * - 300ms transition duration
 */
export default function GeoChips({ countries, className = "" }: GeoChipsProps) {
  const [chips, setChips] = useState<ChipState[]>([]);
  const prevCountriesRef = useRef<string[]>([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const prevCountries = prevCountriesRef.current;
    const currentCountries = countries;

    // On first render, just show all chips without animation
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setChips(currentCountries.map((code) => ({ code, isEntering: false, isExiting: false })));
      prevCountriesRef.current = [...currentCountries];
      return;
    }

    // Find added and removed countries
    const added = currentCountries.filter((c) => !prevCountries.includes(c));
    const removed = prevCountries.filter((c) => !currentCountries.includes(c));
    const unchanged = currentCountries.filter((c) => prevCountries.includes(c));

    // Build new chip state
    const newChips: ChipState[] = [
      // Keep unchanged chips
      ...unchanged.map((code) => ({ code, isEntering: false, isExiting: false })),
      // Add new chips with entering state
      ...added.map((code) => ({ code, isEntering: true, isExiting: false })),
      // Keep removed chips for exit animation
      ...removed.map((code) => ({ code, isEntering: false, isExiting: true })),
    ];

    setChips(newChips);

    // After animation duration, remove entering state and remove exited chips
    const timer = setTimeout(() => {
      setChips((prev) =>
        prev
          .filter((chip) => !chip.isExiting)
          .map((chip) => ({ ...chip, isEntering: false }))
      );
    }, 300);

    prevCountriesRef.current = [...currentCountries];

    return () => clearTimeout(timer);
  }, [countries]);

  if (chips.length === 0) {
    return (
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        <span className="text-xs text-claude-text-secondary italic">No geos targeted</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {chips.map((chip) => (
        <span
          key={chip.code}
          className={`
            inline-flex items-center px-2 py-0.5
            text-xs font-medium rounded-full
            bg-blue-50 text-blue-700 border border-blue-200
            transition-all duration-300 ease-in-out
            ${chip.isEntering ? "opacity-0 scale-90" : ""}
            ${chip.isExiting ? "opacity-0 scale-90" : ""}
            ${!chip.isEntering && !chip.isExiting ? "opacity-100 scale-100" : ""}
          `}
          style={{
            // Apply animation classes after mount for entering
            ...(chip.isEntering && {
              animation: "fadeIn 300ms ease-in-out forwards",
            }),
            ...(chip.isExiting && {
              animation: "fadeOut 300ms ease-in-out forwards",
            }),
          }}
        >
          {chip.code}
        </span>
      ))}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
