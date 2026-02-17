import { getDeliveryMetrics, resolveMediaBuyId, getGuaranteesForMediaBuy } from '../data/loader.js';
import type {
  DeliveryMetrics,
  MetricsSummary,
  DeviceMetrics,
  GeoMetrics,
  ContractualGuarantee,
  ComplianceStatus,
  GuaranteeComplianceResult,
  GuaranteeMetric,
} from '../types/data.js';

/**
 * Input parameters for the get_media_buy_delivery tool
 */
export interface GetMediaBuyDeliveryInput {
  media_buy_id?: string;
  platform?: string;
}

/**
 * Output format for delivery metrics (matches DeliveryMetrics structure)
 */
export interface DeliveryMetricsOutput {
  media_buy_id: string;
  brand: string;
  platform?: string;
  total_budget: number;
  total_spend: number;
  pacing: 'on_track' | 'behind' | 'overspend';
  health: 'good' | 'warning' | 'poor';
  summary: MetricsSummary;
  by_device: Record<string, DeviceMetrics>;
  by_geo: Record<string, GeoMetrics>;
  recommendations: string[];
  platform_specific_metrics?: Record<string, unknown>;
  guarantee_compliance?: GuaranteeComplianceResult;
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
 * Extract the current value for a guarantee metric from delivery metrics
 */
function getCurrentMetricValue(metric: GuaranteeMetric, summary: MetricsSummary): number | undefined {
  switch (metric) {
    case 'impressions': return summary.impressions;
    case 'clicks': return summary.clicks;
    case 'conversions': return summary.conversions;
    case 'ctr': return summary.ctr;
    case 'viewability': return summary.viewability;
    case 'completion_rate': return summary.completion_rate ?? undefined;
    case 'cpm': return summary.cpm;
    case 'cpa': return summary.cpa;
    default: return undefined;
  }
}

/**
 * Determine compliance status for a single guarantee given its current value.
 *
 * Thresholds:
 * - For "gte" (at least): violated if <90% of target, at_risk if <100%, compliant otherwise
 * - For "lte" (at most): violated if >110% of target, at_risk if >100%, compliant otherwise
 */
function evaluateGuarantee(
  guarantee: ContractualGuarantee,
  currentValue: number
): { status: ComplianceStatus; percentToTarget: number } {
  const { operator, guaranteed_value } = guarantee;

  if (operator === 'gte') {
    // "At least" guarantee — higher is better
    const percentToTarget = guaranteed_value > 0
      ? Math.round((currentValue / guaranteed_value) * 100)
      : 100;

    if (currentValue >= guaranteed_value) {
      return { status: 'compliant', percentToTarget };
    } else if (currentValue >= guaranteed_value * 0.9) {
      return { status: 'at_risk', percentToTarget };
    } else {
      return { status: 'violated', percentToTarget };
    }
  } else {
    // "At most" guarantee — lower is better
    const percentToTarget = guaranteed_value > 0
      ? Math.round((currentValue / guaranteed_value) * 100)
      : 100;

    if (currentValue <= guaranteed_value) {
      return { status: 'compliant', percentToTarget };
    } else if (currentValue <= guaranteed_value * 1.1) {
      return { status: 'at_risk', percentToTarget };
    } else {
      return { status: 'violated', percentToTarget };
    }
  }
}

/**
 * Calculate guarantee compliance for a media buy by comparing
 * contractual guarantees against current delivery metrics.
 */
export function calculateGuaranteeCompliance(
  mediaBuyId: string,
  deliveryMetrics: DeliveryMetrics
): GuaranteeComplianceResult {
  const guarantees = getGuaranteesForMediaBuy(mediaBuyId);

  if (!guarantees || guarantees.length === 0) {
    return {
      media_buy_id: mediaBuyId,
      has_guarantees: false,
      guarantees: [],
      overall_status: 'compliant',
      summary: 'No contractual guarantees on this campaign.',
    };
  }

  const evaluatedGuarantees: ContractualGuarantee[] = guarantees.map(g => {
    const currentValue = getCurrentMetricValue(g.metric, deliveryMetrics.summary);
    if (currentValue === undefined) {
      return {
        ...g,
        current_value: undefined,
        compliance_status: 'at_risk' as ComplianceStatus,
        percent_to_target: 0,
      };
    }

    const { status, percentToTarget } = evaluateGuarantee(g, currentValue);
    return {
      ...g,
      current_value: currentValue,
      compliance_status: status,
      percent_to_target: percentToTarget,
    };
  });

  // Overall status is the worst status across all guarantees
  const statusPriority: ComplianceStatus[] = ['violated', 'at_risk', 'compliant'];
  const overallStatus = statusPriority.find(s =>
    evaluatedGuarantees.some(g => g.compliance_status === s)
  ) || 'compliant';

  // Build human-readable summary
  const violated = evaluatedGuarantees.filter(g => g.compliance_status === 'violated');
  const atRisk = evaluatedGuarantees.filter(g => g.compliance_status === 'at_risk');
  const compliant = evaluatedGuarantees.filter(g => g.compliance_status === 'compliant');

  const parts: string[] = [];
  if (violated.length > 0) {
    parts.push(`${violated.length} VIOLATED (${violated.map(g => g.metric).join(', ')})`);
  }
  if (atRisk.length > 0) {
    parts.push(`${atRisk.length} AT RISK (${atRisk.map(g => g.metric).join(', ')})`);
  }
  if (compliant.length > 0) {
    parts.push(`${compliant.length} compliant`);
  }
  const summary = `SLA Status: ${parts.join('; ')} — ${evaluatedGuarantees.length} total guarantees.`;

  return {
    media_buy_id: mediaBuyId,
    has_guarantees: true,
    guarantees: evaluatedGuarantees,
    overall_status: overallStatus,
    summary,
  };
}

/**
 * Transform DeliveryMetrics to output format (excludes current_bids)
 */
function toDeliveryMetricsOutput(metrics: DeliveryMetrics): DeliveryMetricsOutput {
  const output: DeliveryMetricsOutput = {
    media_buy_id: metrics.media_buy_id,
    brand: metrics.brand,
    platform: metrics.platform,
    total_budget: metrics.total_budget,
    total_spend: metrics.total_spend,
    pacing: metrics.pacing,
    health: metrics.health,
    summary: metrics.summary,
    by_device: metrics.by_device,
    by_geo: metrics.by_geo,
    recommendations: metrics.recommendations,
    platform_specific_metrics: metrics.platform_specific_metrics,
  };

  // Calculate guarantee compliance if guarantees exist
  const compliance = calculateGuaranteeCompliance(metrics.media_buy_id, metrics);
  if (compliance.has_guarantees) {
    output.guarantee_compliance = compliance;
  }

  return output;
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
    // Resolve brand name or ID to actual media_buy_id
    const resolvedId = resolveMediaBuyId(input.media_buy_id);

    if (!resolvedId) {
      return {
        success: false,
        metrics: null,
        error: `Media buy not found: ${input.media_buy_id}`,
      };
    }

    const metrics = getDeliveryMetrics(resolvedId);

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

  // No media_buy_id provided, return all metrics (optionally filtered by platform)
  const allMetrics = getDeliveryMetrics(undefined, input.platform);

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
