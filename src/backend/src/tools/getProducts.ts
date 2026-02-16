import { getProducts as getProductsFromLoader } from '../data/loader.js';
import type { Product, PricingOption } from '../types/data.js';

/**
 * Input parameters for the get_products tool
 */
export interface GetProductsInput {
  category?: string;
  max_cpm?: number;
  platform?: string;
}

/**
 * Simplified pricing option for tool output
 */
export interface ProductPricingOutput {
  pricing_option_id: string;
  currency: string;
  cpm: number;
  pricing_model: string;
}

/**
 * Output format for a single product from the get_products tool
 */
export interface GetProductsOutput {
  product_id: string;
  name: string;
  description: string;
  category: string;
  platform?: string;
  pricing_options: ProductPricingOutput[];
}

/**
 * Tool result wrapper
 */
export interface GetProductsResult {
  success: boolean;
  products: GetProductsOutput[];
  count: number;
  filters_applied: {
    category?: string;
    max_cpm?: number;
    platform?: string;
  };
}

/**
 * Transform a Product to the tool output format
 */
function transformProduct(product: Product): GetProductsOutput {
  return {
    product_id: product.product_id,
    name: product.name,
    description: product.description,
    category: product.category,
    platform: product.platform,
    pricing_options: product.pricing_options.map((po: PricingOption) => ({
      pricing_option_id: po.pricing_option_id,
      currency: po.currency,
      cpm: po.cpm,
      pricing_model: po.pricing_model,
    })),
  };
}

/**
 * get_products tool implementation
 *
 * Discovers available advertising inventory with optional filtering.
 *
 * @param input - Optional category and max_cpm filters
 * @returns Array of products with their details and pricing options
 */
export function getProducts(input?: GetProductsInput): GetProductsResult {
  const products = getProductsFromLoader({
    category: input?.category,
    max_cpm: input?.max_cpm,
    platform: input?.platform,
  });

  const transformedProducts = products.map(transformProduct);

  return {
    success: true,
    products: transformedProducts,
    count: transformedProducts.length,
    filters_applied: {
      category: input?.category,
      max_cpm: input?.max_cpm,
      platform: input?.platform,
    },
  };
}
