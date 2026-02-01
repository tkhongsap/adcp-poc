"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProductsTable from "./ProductsTable";
import ThemeToggle from "../ui/ThemeToggle";

export default function ProductsView() {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Chat
            </button>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">
            Products
          </h1>
        </motion.div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <p className="text-muted-foreground">
          Available advertising inventory across premium publishers. Each product includes pricing options and targeting capabilities.
        </p>
      </motion.div>

      {/* Products table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ProductsTable />
      </motion.div>
    </>
  );
}
