import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  AdCPData,
  Product,
  MediaBuy,
  DeliveryMetrics,
  Aggregations,
  PerformanceFeedback,
} from '../types/data.js';

// In-memory state for the demo data
let data: AdCPData | null = null;

/**
 * Load the demo data from the JSON file
 * This should be called on server startup
 */
export function loadData(): void {
  const dataPath = join(process.cwd(), '../../data/adcp_demo_complete_data.json');

  try {
    const rawData = readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(rawData);

    // Extract only the data we need (excluding query_examples and _metadata)
    data = {
      products: parsed.products,
      media_buys: parsed.media_buys,
      delivery_metrics: parsed.delivery_metrics,
      aggregations: parsed.aggregations,
      performance_feedback_log: parsed.performance_feedback_log,
    };

    console.log(`Loaded AdCP demo data: ${data.products.length} products, ${data.media_buys.length} media buys`);
  } catch (error) {
    console.error('Failed to load AdCP demo data:', error);
    throw error;
  }
}

/**
 * Ensure data is loaded before accessing
 */
function ensureDataLoaded(): AdCPData {
  if (!data) {
    throw new Error('Data not loaded. Call loadData() first.');
  }
  return data;
}

// ============================================
// Product access functions
// ============================================

/**
 * Get all products, optionally filtered by category and max CPM
 */
export function getProducts(options?: { category?: string; max_cpm?: number }): Product[] {
  const { products } = ensureDataLoaded();

  let filtered = [...products];

  if (options?.category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === options.category!.toLowerCase());
  }

  if (options?.max_cpm !== undefined) {
    filtered = filtered.filter(p =>
      p.pricing_options.some(po => po.cpm <= options.max_cpm!)
    );
  }

  return filtered;
}

/**
 * Get a single product by ID
 */
export function getProductById(productId: string): Product | undefined {
  const { products } = ensureDataLoaded();
  return products.find(p => p.product_id === productId);
}

// ============================================
// Media Buy access functions
// ============================================

/**
 * Get all media buys
 */
export function getMediaBuys(): MediaBuy[] {
  const { media_buys } = ensureDataLoaded();
  return [...media_buys];
}

/**
 * Get a single media buy by ID
 */
export function getMediaBuyById(mediaBuyId: string): MediaBuy | undefined {
  const { media_buys } = ensureDataLoaded();
  return media_buys.find(mb => mb.media_buy_id === mediaBuyId);
}

/**
 * Add a new media buy to the in-memory state
 */
export function addMediaBuy(mediaBuy: MediaBuy): void {
  const d = ensureDataLoaded();
  d.media_buys.push(mediaBuy);
}

/**
 * Update an existing media buy
 */
export function updateMediaBuy(mediaBuyId: string, updates: Partial<MediaBuy>): MediaBuy | undefined {
  const d = ensureDataLoaded();
  const index = d.media_buys.findIndex(mb => mb.media_buy_id === mediaBuyId);

  if (index === -1) {
    return undefined;
  }

  d.media_buys[index] = {
    ...d.media_buys[index],
    ...updates,
  };

  return d.media_buys[index];
}

// ============================================
// Delivery Metrics access functions
// ============================================

/**
 * Get delivery metrics for all media buys or a specific one
 */
export function getDeliveryMetrics(mediaBuyId?: string): DeliveryMetrics | DeliveryMetrics[] | undefined {
  const { delivery_metrics } = ensureDataLoaded();

  if (mediaBuyId) {
    return delivery_metrics[mediaBuyId];
  }

  return Object.values(delivery_metrics);
}

/**
 * Update delivery metrics for a media buy
 */
export function updateDeliveryMetrics(mediaBuyId: string, updates: Partial<DeliveryMetrics>): DeliveryMetrics | undefined {
  const d = ensureDataLoaded();

  if (!d.delivery_metrics[mediaBuyId]) {
    return undefined;
  }

  d.delivery_metrics[mediaBuyId] = {
    ...d.delivery_metrics[mediaBuyId],
    ...updates,
  };

  return d.delivery_metrics[mediaBuyId];
}

/**
 * Add delivery metrics for a new media buy
 */
export function addDeliveryMetrics(mediaBuyId: string, metrics: DeliveryMetrics): void {
  const d = ensureDataLoaded();
  d.delivery_metrics[mediaBuyId] = metrics;
}

// ============================================
// Aggregations access functions
// ============================================

/**
 * Get portfolio aggregations
 */
export function getAggregations(): Aggregations {
  const { aggregations } = ensureDataLoaded();
  return aggregations;
}

/**
 * Update aggregations
 */
export function updateAggregations(updates: Partial<Aggregations>): Aggregations {
  const d = ensureDataLoaded();
  d.aggregations = {
    ...d.aggregations,
    ...updates,
  };
  return d.aggregations;
}

// ============================================
// Performance Feedback access functions
// ============================================

/**
 * Get all performance feedback entries
 */
export function getPerformanceFeedback(): PerformanceFeedback[] {
  const { performance_feedback_log } = ensureDataLoaded();
  return [...performance_feedback_log];
}

/**
 * Get feedback for a specific media buy
 */
export function getFeedbackByMediaBuyId(mediaBuyId: string): PerformanceFeedback[] {
  const { performance_feedback_log } = ensureDataLoaded();
  return performance_feedback_log.filter(fb => fb.media_buy_id === mediaBuyId);
}

/**
 * Add a new feedback entry
 */
export function addPerformanceFeedback(feedback: PerformanceFeedback): void {
  const d = ensureDataLoaded();
  d.performance_feedback_log.push(feedback);
}

// ============================================
// State management functions
// ============================================

/**
 * Get the entire data state (for WebSocket initial state)
 */
export function getFullState(): AdCPData {
  return ensureDataLoaded();
}

/**
 * Reset the data to its original state (reload from file)
 */
export function resetData(): void {
  loadData();
}

/**
 * Check if data is loaded
 */
export function isDataLoaded(): boolean {
  return data !== null;
}
