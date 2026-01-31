"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GeoChipsProps {
  /** Array of country codes (e.g., ["US", "DE", "UK"]) */
  countries: string[];
  /** Optional className for additional styling */
  className?: string;
}

interface ChipState {
  code: string;
  isNew: boolean;
}

/**
 * GeoChips component displays country codes as visual pills with animations.
 * - Fade in animation when a geo is added
 * - Fade out animation when a geo is removed
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
      setChips(currentCountries.map((code) => ({ code, isNew: false })));
      prevCountriesRef.current = [...currentCountries];
      return;
    }

    // Find added countries
    const added = currentCountries.filter((c) => !prevCountries.includes(c));

    // Build new chip state
    const newChips: ChipState[] = currentCountries.map((code) => ({
      code,
      isNew: added.includes(code),
    }));

    setChips(newChips);

    // After animation, remove "new" flag
    const timer = setTimeout(() => {
      setChips((prev) =>
        prev.map((chip) => ({ ...chip, isNew: false }))
      );
    }, 300);

    prevCountriesRef.current = [...currentCountries];

    return () => clearTimeout(timer);
  }, [countries]);

  if (chips.length === 0) {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        <span className="text-xs text-muted-foreground italic">No geos targeted</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <motion.span
            key={chip.code}
            initial={chip.isNew ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            layout
            className={cn(
              "inline-flex items-center px-2 py-0.5",
              "text-xs font-medium rounded-full",
              "bg-primary/10 text-primary",
              "border border-primary/20"
            )}
          >
            {chip.code}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
