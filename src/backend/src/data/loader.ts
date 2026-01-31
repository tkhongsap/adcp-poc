import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  AdCPData,
  Product,
  MediaBuy,
  DeliveryMetrics,
  Aggregations,
  PerformanceFeedback,
  CreativeFormat,
  AuthorizedProperty,
} from '../types/data.js';

// In-memory state for the demo data
let data: AdCPData | null = null;

// Creative formats are static reference data
const creativeFormats: CreativeFormat[] = [
  // Display formats
  {
    format_id: 'display_300x250_image',
    name: 'Medium Rectangle',
    type: 'display',
    dimensions: '300x250',
    specs: {
      max_file_size: '150KB',
      file_types: ['jpg', 'png', 'gif'],
    },
  },
  {
    format_id: 'display_728x90_image',
    name: 'Leaderboard',
    type: 'display',
    dimensions: '728x90',
    specs: {
      max_file_size: '150KB',
      file_types: ['jpg', 'png', 'gif'],
    },
  },
  {
    format_id: 'display_970x250_image',
    name: 'Billboard',
    type: 'display',
    dimensions: '970x250',
    specs: {
      max_file_size: '200KB',
      file_types: ['jpg', 'png', 'gif'],
    },
  },
  {
    format_id: 'display_300x600_image',
    name: 'Half Page',
    type: 'display',
    dimensions: '300x600',
    specs: {
      max_file_size: '200KB',
      file_types: ['jpg', 'png', 'gif'],
    },
  },
  {
    format_id: 'display_320x50_image',
    name: 'Mobile Leaderboard',
    type: 'display',
    dimensions: '320x50',
    specs: {
      max_file_size: '100KB',
      file_types: ['jpg', 'png', 'gif'],
    },
  },
  {
    format_id: 'display_320x480_image',
    name: 'Mobile Interstitial',
    type: 'display',
    dimensions: '320x480',
    specs: {
      max_file_size: '200KB',
      file_types: ['jpg', 'png', 'gif'],
    },
  },
  // Video formats
  {
    format_id: 'video_preroll_15s',
    name: 'Pre-roll 15s',
    type: 'video',
    specs: {
      max_file_size: '10MB',
      file_types: ['mp4', 'webm'],
      max_duration: 15,
    },
  },
  {
    format_id: 'video_preroll_30s',
    name: 'Pre-roll 30s',
    type: 'video',
    specs: {
      max_file_size: '20MB',
      file_types: ['mp4', 'webm'],
      max_duration: 30,
      skip_after: 5,
    },
  },
  {
    format_id: 'video_outstream_15s',
    name: 'Outstream 15s',
    type: 'video',
    specs: {
      max_file_size: '10MB',
      file_types: ['mp4', 'webm'],
      max_duration: 15,
    },
  },
  {
    format_id: 'video_ctv_30s',
    name: 'CTV 30s',
    type: 'video',
    specs: {
      max_file_size: '50MB',
      file_types: ['mp4'],
      max_duration: 30,
    },
  },
  // Native formats
  {
    format_id: 'native_article_card',
    name: 'Native Article Card',
    type: 'native',
    specs: {
      headline_max: 50,
      description_max: 150,
      image_dimensions: '1200x628',
      cta_max: 15,
    },
  },
  {
    format_id: 'native_content_rec',
    name: 'Content Recommendation',
    type: 'native',
    specs: {
      headline_max: 70,
      image_dimensions: '400x300',
    },
  },
  // Audio formats
  {
    format_id: 'audio_30s',
    name: 'Audio 30s',
    type: 'audio',
    specs: {
      max_file_size: '5MB',
      file_types: ['mp3', 'wav', 'ogg'],
      max_duration: 30,
    },
  },
];

// Authorized properties are static reference data
const authorizedProperties: AuthorizedProperty[] = [
  {
    property_id: 'prop_espn',
    name: 'ESPN',
    domain: 'espn.com',
    category: 'Sports',
    monthly_uniques: 85000000,
    authorization_level: 'premium',
    available_formats: ['display_300x250_image', 'display_728x90_image', 'video_preroll_15s', 'video_preroll_30s'],
    discount_percent: 15,
    audience_profile: 'Sports enthusiasts, 18-54, male-skewing',
  },
  {
    property_id: 'prop_cnn',
    name: 'CNN Digital',
    domain: 'cnn.com',
    category: 'News',
    monthly_uniques: 120000000,
    authorization_level: 'standard',
    available_formats: ['display_970x250_image', 'display_300x600_image', 'display_300x250_image', 'video_ctv_30s'],
    audience_profile: 'News consumers, broad demographics, high-income skew on business sections',
  },
  {
    property_id: 'prop_weather',
    name: 'Weather.com',
    domain: 'weather.com',
    category: 'Weather/Local',
    monthly_uniques: 150000000,
    authorization_level: 'standard',
    available_formats: ['display_300x250_image', 'display_320x50_image'],
    audience_profile: 'Broad reach, location-based targeting',
    special_capabilities: ['weather-triggered creative swap', 'real-time temperature targeting', 'severe weather exclusion'],
  },
  {
    property_id: 'prop_techcrunch',
    name: 'TechCrunch',
    domain: 'techcrunch.com',
    category: 'Technology',
    monthly_uniques: 25000000,
    authorization_level: 'premium',
    available_formats: ['display_300x250_image', 'native_article_card'],
    discount_percent: 12,
    audience_profile: 'Tech professionals, startup founders, developers',
  },
  {
    property_id: 'prop_si',
    name: 'Sports Illustrated',
    domain: 'si.com',
    category: 'Sports',
    monthly_uniques: 40000000,
    authorization_level: 'standard',
    available_formats: ['display_300x250_image', 'display_728x90_image'],
    audience_profile: 'Sports fans, classic sports journalism audience',
  },
  {
    property_id: 'prop_bleacher',
    name: 'Bleacher Report',
    domain: 'bleacherreport.com',
    category: 'Sports',
    monthly_uniques: 60000000,
    authorization_level: 'standard',
    available_formats: ['display_300x250_image', 'video_outstream_15s'],
    audience_profile: 'Younger sports fans 18-34, strong mobile engagement',
  },
  {
    property_id: 'prop_forbes',
    name: 'Forbes',
    domain: 'forbes.com',
    category: 'Business',
    monthly_uniques: 70000000,
    authorization_level: 'premium',
    available_formats: ['display_300x250_image', 'native_article_card'],
    discount_percent: 8,
    audience_profile: '58% HHI $100K+, 72% college educated, business decision-makers',
  },
  {
    property_id: 'prop_auto_news',
    name: 'Automotive News Network',
    domain: 'autonews.com',
    category: 'Automotive',
    monthly_uniques: 15000000,
    authorization_level: 'premium',
    available_formats: ['display_300x250_image', 'display_970x250_image', 'video_preroll_30s'],
    discount_percent: 10,
    audience_profile: 'Auto enthusiasts, in-market car buyers',
  },
  {
    property_id: 'prop_spotify',
    name: 'Spotify',
    domain: 'spotify.com',
    category: 'Audio/Music',
    monthly_uniques: 220000000,
    authorization_level: 'exclusive',
    available_formats: ['audio_30s', 'video_preroll_15s'],
    audience_profile: 'Music streamers, broad demographics, high engagement',
    special_capabilities: ['podcast advertising', 'music genre targeting', 'playlist targeting'],
  },
  {
    property_id: 'prop_nyt',
    name: 'New York Times',
    domain: 'nytimes.com',
    category: 'News',
    monthly_uniques: 90000000,
    authorization_level: 'premium',
    available_formats: ['display_300x250_image', 'display_970x250_image', 'native_article_card'],
    discount_percent: 5,
    audience_profile: '85% college educated, high-income, opinion leaders',
    special_capabilities: ['section sponsorship', 'creative approval required (48h lead time)'],
  },
];

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
