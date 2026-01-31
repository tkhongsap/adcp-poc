import {
  addMediaBuy,
  addDeliveryMetrics,
  getProductById,
  getMediaBuys,
} from '../data/loader.js';
import { broadcastMediaBuyCreated } from '../websocket/socket.js';
import type { MediaBuy, TargetingOverlay, DeliveryMetrics } from '../types/data.js';

/**
 * Input parameters for the create_media_buy tool
 */
export interface CreateMediaBuyInput {
  brand_name: string;
  product_id: string;
  budget: number;
  targeting: TargetingOverlay;
  start_time: string;
  end_time: string;
}

/**
 * Output format for the create_media_buy tool
 */
export interface CreateMediaBuyOutput {
  media_buy_id: string;
  status: 'submitted';
  estimated_impressions: number;
  brand_name: string;
  product_id: string;
  budget: number;
  start_time: string;
  end_time: string;
}

/**
 * Tool result wrapper
 */
export interface CreateMediaBuyResult {
  success: boolean;
  media_buy: CreateMediaBuyOutput | null;
  error?: string;
}

/**
 * Generate a unique media buy ID
 */
function generateMediaBuyId(brandName: string): string {
  const existingBuys = getMediaBuys();
  const sanitizedBrand = brandName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const baseId = `mb_${sanitizedBrand}`;

  // Find existing IDs with this prefix and get the next number
  const existingWithPrefix = existingBuys.filter(mb => mb.media_buy_id.startsWith(baseId));
  const nextNum = existingWithPrefix.length + 1;

  return `${baseId}_${nextNum}`;
}

/**
 * Estimate impressions based on budget and product CPM
 */
function estimateImpressions(productId: string, budget: number): number {
  const product = getProductById(productId);

  if (!product || product.pricing_options.length === 0) {
    // Default estimate if product not found
    return Math.floor((budget / 15) * 1000); // Assume $15 CPM
  }

  // Use the lowest CPM option to calculate maximum impressions
  const lowestCpm = Math.min(...product.pricing_options.map(po => po.cpm));
  return Math.floor((budget / lowestCpm) * 1000);
}

/**
 * Create initial delivery metrics for a new media buy
 */
function createInitialDeliveryMetrics(
  mediaBuyId: string,
  brandName: string,
  budget: number
): DeliveryMetrics {
  return {
    media_buy_id: mediaBuyId,
    brand: brandName,
    total_budget: budget,
    total_spend: 0,
    pacing: 'on_track',
    health: 'good',
    summary: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpm: 0,
      cpa: 0,
      viewability: 0,
      completion_rate: null,
    },
    by_device: {},
    by_geo: {},
    current_bids: {},
    recommendations: ['Campaign just launched - gathering initial data'],
  };
}

/**
 * create_media_buy tool implementation
 *
 * Creates a new media buy campaign and returns the submitted status.
 *
 * @param input - Brand name, product ID, budget, targeting, and date range
 * @returns The created media buy with status and estimated impressions
 */
export function createMediaBuy(input: CreateMediaBuyInput): CreateMediaBuyResult {
  // Validate required fields
  if (!input.brand_name || !input.product_id || !input.budget || !input.start_time || !input.end_time) {
    return {
      success: false,
      media_buy: null,
      error: 'Missing required fields: brand_name, product_id, budget, start_time, and end_time are required',
    };
  }

  // Validate product exists
  const product = getProductById(input.product_id);
  if (!product) {
    return {
      success: false,
      media_buy: null,
      error: `Product not found: ${input.product_id}`,
    };
  }

  // Validate budget meets minimum
  if (input.budget < product.minimum_budget) {
    return {
      success: false,
      media_buy: null,
      error: `Budget ${input.budget} is below minimum ${product.minimum_budget} for product ${product.name}`,
    };
  }

  // Generate unique ID
  const mediaBuyId = generateMediaBuyId(input.brand_name);

  // Estimate impressions
  const estimatedImpressions = estimateImpressions(input.product_id, input.budget);

  // Create the media buy object
  const mediaBuy: MediaBuy = {
    media_buy_id: mediaBuyId,
    buyer_ref: `${input.brand_name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    brand_manifest: {
      name: input.brand_name,
      url: `https://${input.brand_name.toLowerCase().replace(/\s+/g, '')}.com`,
    },
    packages: [
      {
        package_id: `pkg_${mediaBuyId}_001`,
        product_id: input.product_id,
        pricing_option_id: product.pricing_options[0]?.pricing_option_id || 'default',
        budget: input.budget,
        targeting_overlay: input.targeting || {},
      },
    ],
    start_time: input.start_time,
    end_time: input.end_time,
    status: 'submitted',
    created_at: new Date().toISOString(),
  };

  // Add to in-memory state
  addMediaBuy(mediaBuy);

  // Create initial delivery metrics for the new media buy
  const initialMetrics = createInitialDeliveryMetrics(mediaBuyId, input.brand_name, input.budget);
  addDeliveryMetrics(mediaBuyId, initialMetrics);

  // Broadcast new media buy to all connected clients
  broadcastMediaBuyCreated({
    media_buy_id: mediaBuyId,
    media_buy: mediaBuy,
    delivery_metrics: initialMetrics,
    estimated_impressions: estimatedImpressions,
    timestamp: new Date().toISOString(),
  });

  // Return success response
  return {
    success: true,
    media_buy: {
      media_buy_id: mediaBuyId,
      status: 'submitted',
      estimated_impressions: estimatedImpressions,
      brand_name: input.brand_name,
      product_id: input.product_id,
      budget: input.budget,
      start_time: input.start_time,
      end_time: input.end_time,
    },
  };
}
