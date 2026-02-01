"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

interface PricingOption {
  pricing_option_id: string;
  currency: string;
  cpm: number;
  pricing_model: string;
}

interface Product {
  product_id: string;
  name: string;
  description: string;
  category: string;
  pricing_options: PricingOption[];
  minimum_budget?: number;
  available_inventory?: number;
}

interface ProductsApiResponse {
  success: boolean;
  products: Product[];
  count: number;
}

/**
 * CategoryBadge - displays product category with color coding
 */
function CategoryBadge({ category }: { category: string }) {
  const categoryColors: Record<string, string> = {
    Sports: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    News: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Technology: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Business: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "Weather/Local": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    Automotive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "Audio/Music": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  };

  const colorClass = categoryColors[category] || "bg-muted text-muted-foreground";

  return (
    <span className={cn("px-2 py-1 text-xs font-medium rounded-full", colorClass)}>
      {category}
    </span>
  );
}

/**
 * CPMRange - displays min-max CPM from pricing options
 */
function CPMRange({ pricingOptions }: { pricingOptions: PricingOption[] }) {
  if (pricingOptions.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const cpms = pricingOptions.map((po) => po.cpm);
  const minCpm = Math.min(...cpms);
  const maxCpm = Math.max(...cpms);

  if (minCpm === maxCpm) {
    return <span className="font-medium">${minCpm.toFixed(2)}</span>;
  }

  return (
    <span className="font-medium">
      ${minCpm.toFixed(2)} - ${maxCpm.toFixed(2)}
    </span>
  );
}

/**
 * ProductsTable - displays available advertising products
 */
export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tools/get_products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ProductsApiResponse = await response.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="overflow-x-auto bg-card rounded-xl border border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted rounded w-full" />
          ))}
        </div>
        <p className="text-center text-muted-foreground mt-4">Loading products...</p>
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

  if (products.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8 bg-card rounded-xl border border-border">
        No products available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-card rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              Product Name
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              CPM Range
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium text-muted-foreground">
              Pricing Options
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {products.map((product, index) => (
              <motion.tr
                key={product.product_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className={cn(
                  "border-b border-border last:border-b-0",
                  "hover:bg-muted/50 transition-colors duration-150"
                )}
              >
                {/* Product Name */}
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{product.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {product.product_id}
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <CategoryBadge category={product.category} />
                </td>

                {/* Description */}
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm text-muted-foreground truncate" title={product.description}>
                    {product.description}
                  </p>
                </td>

                {/* CPM Range */}
                <td className="px-4 py-3 text-sm text-foreground">
                  <CPMRange pricingOptions={product.pricing_options} />
                </td>

                {/* Pricing Options Count */}
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {product.pricing_options.length} option
                  {product.pricing_options.length !== 1 ? "s" : ""}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
