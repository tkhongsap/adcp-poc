import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import type {
  AdCPData,
  PlatformData,
  Product,
  MediaBuy,
  DeliveryMetrics,
  Aggregations,
  PerformanceFeedback,
  CreativeFormat,
  AuthorizedProperty,
  SpendCategory,
} from '../types/data.js';

// In-memory state for the demo data
let data: AdCPData | null = null;

// Creative formats and authorized properties loaded from platform files
let creativeFormats: CreativeFormat[] = [];
let authorizedProperties: AuthorizedProperty[] = [];

/**
 * Load platform data from data/platforms/*.json files and merge into a single AdCPData object.
 * Falls back to legacy adcp_demo_complete_data.json if no platform directory exists.
 */
export function loadData(): void {
  const platformsDir = join(process.cwd(), '../../data/platforms');
  const legacyPath = join(process.cwd(), '../../data/adcp_demo_complete_data.json');

  if (existsSync(platformsDir)) {
    try {
      loadFromPlatformFiles(platformsDir);
      return;
    } catch (error) {
      console.warn('Failed to load platform files, falling back to legacy data:', error);
    }
  }

  // Fallback to legacy single file
  loadFromLegacyFile(legacyPath);
}

/**
 * Load and merge data from per-platform JSON files in data/platforms/
 */
function loadFromPlatformFiles(platformsDir: string): void {
  const files = readdirSync(platformsDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    throw new Error('No platform JSON files found in data/platforms/');
  }

  const allProducts: Product[] = [];
  const allMediaBuys: MediaBuy[] = [];
  const allDeliveryMetrics: Record<string, DeliveryMetrics> = {};
  const allFeedback: PerformanceFeedback[] = [];
  const allCreativeFormats: CreativeFormat[] = [];
  const allAuthorizedProperties: AuthorizedProperty[] = [];

  for (const file of files) {
    const filePath = join(platformsDir, file);
    const rawData = readFileSync(filePath, 'utf-8');
    const platformData: PlatformData = JSON.parse(rawData);

    // Merge products (ensure platform field is set)
    if (platformData.products) {
      for (const product of platformData.products) {
        product.platform = product.platform || platformData.platform;
        allProducts.push(product);
      }
    }

    // Merge media buys
    if (platformData.media_buys) {
      for (const mb of platformData.media_buys) {
        mb.platform = mb.platform || platformData.platform;
        allMediaBuys.push(mb);
      }
    }

    // Merge delivery metrics
    if (platformData.delivery_metrics) {
      for (const [id, metrics] of Object.entries(platformData.delivery_metrics)) {
        metrics.platform = metrics.platform || platformData.platform;
        allDeliveryMetrics[id] = metrics;
      }
    }

    // Merge performance feedback
    if (platformData.performance_feedback_log) {
      allFeedback.push(...platformData.performance_feedback_log);
    }

    // Merge creative formats
    if (platformData.creative_formats) {
      allCreativeFormats.push(...platformData.creative_formats);
    }

    // Merge authorized properties
    if (platformData.authorized_properties) {
      allAuthorizedProperties.push(...platformData.authorized_properties);
    }
  }

  // Store creative formats and authorized properties
  creativeFormats = allCreativeFormats;
  authorizedProperties = allAuthorizedProperties;

  // Compute aggregations across all platforms
  const aggregations = computeAggregations(allMediaBuys, allDeliveryMetrics);

  data = {
    products: allProducts,
    media_buys: allMediaBuys,
    delivery_metrics: allDeliveryMetrics,
    aggregations,
    performance_feedback_log: allFeedback,
  };

  console.log(`Loaded multi-platform data: ${files.length} platforms, ${allProducts.length} products, ${allMediaBuys.length} media buys, ${Object.keys(allDeliveryMetrics).length} delivery metrics`);
}

/**
 * Load from the legacy single JSON file (backward compatibility)
 */
function loadFromLegacyFile(dataPath: string): void {
  try {
    const rawData = readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(rawData);

    data = {
      products: parsed.products,
      media_buys: parsed.media_buys,
      delivery_metrics: parsed.delivery_metrics,
      aggregations: parsed.aggregations,
      performance_feedback_log: parsed.performance_feedback_log,
    };

    console.log(`Loaded AdCP demo data (legacy): ${data.products.length} products, ${data.media_buys.length} media buys`);
  } catch (error) {
    console.error('Failed to load AdCP demo data:', error);
    throw error;
  }
}

/**
 * Compute portfolio aggregations across all platforms
 */
function computeAggregations(
  mediaBuys: MediaBuy[],
  deliveryMetrics: Record<string, DeliveryMetrics>
): Aggregations {
  const metrics = Object.values(deliveryMetrics);
  const activeCampaigns = mediaBuys.filter(mb => mb.status === 'active');

  const totalBudget = metrics.reduce((sum, m) => sum + m.total_budget, 0);
  const totalSpend = metrics.reduce((sum, m) => sum + m.total_spend, 0);
  const totalImpressions = metrics.reduce((sum, m) => sum + m.summary.impressions, 0);
  const totalClicks = metrics.reduce((sum, m) => sum + m.summary.clicks, 0);
  const totalConversions = metrics.reduce((sum, m) => sum + m.summary.conversions, 0);

  // Spend by platform
  const spendByPlatform: Record<string, SpendCategory> = {};
  for (const m of metrics) {
    const platform = m.platform || 'unknown';
    if (!spendByPlatform[platform]) {
      spendByPlatform[platform] = { spend: 0, share: 0 };
    }
    spendByPlatform[platform].spend += m.total_spend;
  }
  for (const key of Object.keys(spendByPlatform)) {
    spendByPlatform[key].share = totalSpend > 0 ? Math.round((spendByPlatform[key].spend / totalSpend) * 100) / 100 : 0;
  }

  // Spend by brand
  const spendByBrand: Record<string, SpendCategory> = {};
  for (const m of metrics) {
    const brand = m.brand;
    if (!spendByBrand[brand]) {
      spendByBrand[brand] = { spend: 0, share: 0 };
    }
    spendByBrand[brand].spend += m.total_spend;
  }
  for (const key of Object.keys(spendByBrand)) {
    spendByBrand[key].share = totalSpend > 0 ? Math.round((spendByBrand[key].spend / totalSpend) * 100) / 100 : 0;
  }

  // Spend by device
  const spendByDevice: Record<string, SpendCategory> = {};
  for (const m of metrics) {
    for (const [device, deviceMetrics] of Object.entries(m.by_device)) {
      if (!spendByDevice[device]) {
        spendByDevice[device] = { spend: 0, share: 0 };
      }
      spendByDevice[device].spend += deviceMetrics.spend;
    }
  }
  for (const key of Object.keys(spendByDevice)) {
    spendByDevice[key].share = totalSpend > 0 ? Math.round((spendByDevice[key].spend / totalSpend) * 100) / 100 : 0;
  }

  // Spend by geo
  const spendByGeo: Record<string, SpendCategory> = {};
  for (const m of metrics) {
    for (const [geo, geoMetrics] of Object.entries(m.by_geo)) {
      if (!spendByGeo[geo]) {
        spendByGeo[geo] = { spend: 0, share: 0 };
      }
      spendByGeo[geo].spend += geoMetrics.spend;
    }
  }
  for (const key of Object.keys(spendByGeo)) {
    spendByGeo[key].share = totalSpend > 0 ? Math.round((spendByGeo[key].spend / totalSpend) * 100) / 100 : 0;
  }

  // Top and underperforming campaigns
  const sortedByCtr = [...metrics].sort((a, b) => b.summary.ctr - a.summary.ctr);
  const topPerforming = sortedByCtr.slice(0, 3).map(m => ({
    media_buy_id: m.media_buy_id,
    brand: m.brand,
    metric: 'ctr',
    value: m.summary.ctr,
    reason: `CTR ${m.summary.ctr}%` + (m.platform ? ` (${m.platform})` : ''),
  }));

  const underperforming = metrics
    .filter(m => m.health === 'poor' || m.health === 'warning')
    .map(m => ({
      media_buy_id: m.media_buy_id,
      brand: m.brand,
      metric: m.health === 'poor' ? 'ctr' : 'budget',
      value: m.health === 'poor' ? m.summary.ctr : m.total_spend / m.total_budget,
      issue: m.health === 'poor'
        ? `Low CTR at ${m.summary.ctr}%`
        : `Spend ${Math.round((m.total_spend / m.total_budget) * 100)}% of budget`,
    }));

  return {
    portfolio_summary: {
      as_of: new Date().toISOString(),
      total_active_campaigns: activeCampaigns.length,
      total_budget: totalBudget,
      total_spend: totalSpend,
      total_remaining: totalBudget - totalSpend,
      total_impressions: totalImpressions,
      total_clicks: totalClicks,
      total_conversions: totalConversions,
      overall_ctr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
      overall_cpm: totalImpressions > 0 ? Math.round((totalSpend / totalImpressions) * 1000 * 100) / 100 : 0,
      overall_cpa: totalConversions > 0 ? Math.round((totalSpend / totalConversions) * 100) / 100 : 0,
      campaigns_on_track: metrics.filter(m => m.pacing === 'on_track').length,
      campaigns_warning: metrics.filter(m => m.health === 'warning').length,
      campaigns_poor: metrics.filter(m => m.health === 'poor').length,
    },
    spend_by_category: {},
    spend_by_format: {},
    spend_by_device: spendByDevice,
    spend_by_geo: spendByGeo,
    spend_by_platform: spendByPlatform,
    spend_by_brand: spendByBrand,
    top_performing_campaigns: topPerforming,
    underperforming_campaigns: underperforming,
    monthly_trend: {},
  };
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
 * Get all products, optionally filtered by category, max CPM, and platform
 */
export function getProducts(options?: { category?: string; max_cpm?: number; platform?: string }): Product[] {
  const { products } = ensureDataLoaded();

  let filtered = [...products];

  if (options?.platform) {
    filtered = filtered.filter(p => p.platform?.toLowerCase() === options.platform!.toLowerCase());
  }

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
 * Get products filtered by platform
 */
export function getProductsByPlatform(platform: string): Product[] {
  return getProducts({ platform });
}

/**
 * Get a single product by ID
 */
export function getProductById(productId: string): Product | undefined {
  const { products } = ensureDataLoaded();
  return products.find(p => p.product_id === productId);
}

// ============================================
// Creative Format access functions
// ============================================

/**
 * Get all creative formats, optionally filtered by type
 */
export function getCreativeFormats(options?: { type?: 'display' | 'video' | 'native' | 'audio' }): CreativeFormat[] {
  let filtered = [...creativeFormats];

  if (options?.type) {
    filtered = filtered.filter(f => f.type === options.type);
  }

  return filtered;
}

/**
 * Get a single creative format by ID
 */
export function getCreativeFormatById(formatId: string): CreativeFormat | undefined {
  return creativeFormats.find(f => f.format_id === formatId);
}

// ============================================
// Authorized Property access functions
// ============================================

/**
 * Get all authorized properties
 */
export function getAuthorizedProperties(): AuthorizedProperty[] {
  return [...authorizedProperties];
}

/**
 * Get a single authorized property by ID
 */
export function getAuthorizedPropertyById(propertyId: string): AuthorizedProperty | undefined {
  return authorizedProperties.find(p => p.property_id === propertyId);
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
 * Find a media buy by brand name (partial match)
 * This allows users to say "Apex" instead of "mb_apex_motors_q1"
 */
export function findMediaBuyByBrandName(brandName: string): MediaBuy | undefined {
  const { media_buys } = ensureDataLoaded();
  const normalizedName = brandName.toLowerCase();
  return media_buys.find(mb =>
    mb.brand_manifest.name.toLowerCase().includes(normalizedName) ||
    mb.media_buy_id.toLowerCase().includes(normalizedName)
  );
}

/**
 * Resolve a media buy ID or brand name to a media buy ID
 * Tries exact match first, then brand name match
 */
export function resolveMediaBuyId(idOrBrandName: string): string | undefined {
  // First try exact match
  const exactMatch = getMediaBuyById(idOrBrandName);
  if (exactMatch) {
    return exactMatch.media_buy_id;
  }

  // Then try brand name match
  const brandMatch = findMediaBuyByBrandName(idOrBrandName);
  if (brandMatch) {
    return brandMatch.media_buy_id;
  }

  return undefined;
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
 * Get delivery metrics for all media buys or a specific one, optionally filtered by platform
 */
export function getDeliveryMetrics(mediaBuyId?: string, platform?: string): DeliveryMetrics | DeliveryMetrics[] | undefined {
  const { delivery_metrics } = ensureDataLoaded();

  if (mediaBuyId) {
    return delivery_metrics[mediaBuyId];
  }

  let allMetrics = Object.values(delivery_metrics);

  if (platform) {
    allMetrics = allMetrics.filter(m => m.platform?.toLowerCase() === platform.toLowerCase());
  }

  return allMetrics;
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
