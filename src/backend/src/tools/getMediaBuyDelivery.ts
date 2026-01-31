import { getDeliveryMetrics } from '../data/loader.js';
import type { DeliveryMetrics, MetricsSummary, DeviceMetrics, GeoMetrics } from '../types/data.js';

/**
 * Input parameters for the get_media_buy_delivery tool
 */
export interface GetMediaBuyDeliveryInput {
  media_buy_id?: string;
}

/**
 * Output format for delivery metrics (matches DeliveryMetrics structure)
 */
export interface DeliveryMetricsOutput {
  media_buy_id: string;
  brand: string;
  total_budget: number;
  total_spend: number;
  pacing: 'on_track' | 'behind' | 'overspend';
  health: 'good' | 'warning' | 'poor';
  summary: MetricsSummary;
  by_device: Record<string, DeviceMetrics>;
  by_geo: Record<string, GeoMetrics>;
  recommendations: string[];
}

/**
 * Tool result wrapper for single media buy
 */
export interface GetMediaBuyDeliverySingleResult {
  success: boolean;
  metrics: DeliveryMetricsOutput | null;
  error?: string;
}

/**
 * Tool result wrapper for all media buys
 */
export interface GetMediaBuyDeliveryAllResult {
  success: boolean;
  metrics: DeliveryMetricsOutput[];
  count: number;
  error?: string;
}

/**
 * Union type for tool result
 */
export type GetMediaBuyDeliveryResult = GetMediaBuyDeliverySingleResult | GetMediaBuyDeliveryAllResult;

/**
 * Transform DeliveryMetrics to output format (excludes current_bids)
 */
function toDeliveryMetricsOutput(metrics: DeliveryMetrics): DeliveryMetricsOutput {
  return {
    media_buy_id: metrics.media_buy_id,
    brand: metrics.brand,
    total_budget: metrics.total_budget,
    total_spend: metrics.total_spend,
    pacing: metrics.pacing,
    health: metrics.health,
    summary: metrics.summary,
    by_device: metrics.by_device,
    by_geo: metrics.by_geo,
    recommendations: metrics.recommendations,
  };
}

/**
 * get_media_buy_delivery tool implementation
 *
 * Retrieves delivery/performance metrics for media buys.
 *
 * @param input - Optional media_buy_id to get specific metrics
 * @returns Delivery metrics for one or all media buys
 */
export function getMediaBuyDelivery(input: GetMediaBuyDeliveryInput): GetMediaBuyDeliveryResult {
  // If media_buy_id is provided, return single metrics
  if (input.media_buy_id) {
    const metrics = getDeliveryMetrics(input.media_buy_id);

    if (!metrics || Array.isArray(metrics)) {
      return {
        success: false,
        metrics: null,
        error: `Media buy not found: ${input.media_buy_id}`,
      };
    }

    return {
      success: true,
      metrics: toDeliveryMetricsOutput(metrics),
    };
  }

  // No media_buy_id provided, return all metrics
  const allMetrics = getDeliveryMetrics();

  if (!allMetrics || !Array.isArray(allMetrics)) {
    return {
      success: true,
      metrics: [],
      count: 0,
    };
  }

  const outputMetrics = allMetrics.map(toDeliveryMetricsOutput);

  return {
    success: true,
    metrics: outputMetrics,
    count: outputMetrics.length,
  };
}
