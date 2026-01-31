import {
  getMediaBuyById,
  addPerformanceFeedback,
  getDeliveryMetrics,
} from '../data/loader.js';
import { broadcastFeedbackSubmitted } from '../websocket/socket.js';
import type { PerformanceFeedback, FeedbackData } from '../types/data.js';

/**
 * Input parameters for the provide_performance_feedback tool
 */
export interface ProvidePerformanceFeedbackInput {
  media_buy_id: string;
  feedback_type: 'conversion_data' | 'lead_quality' | 'brand_lift';
  data: FeedbackData;
}

/**
 * Output format for the provide_performance_feedback tool
 */
export interface ProvidePerformanceFeedbackOutput {
  feedback_id: string;
  media_buy_id: string;
  status: 'processed' | 'pending';
  impact: string;
}

/**
 * Tool result wrapper
 */
export interface ProvidePerformanceFeedbackResult {
  success: boolean;
  result: ProvidePerformanceFeedbackOutput | null;
  error?: string;
}

/**
 * Generate a unique feedback ID
 */
function generateFeedbackId(mediaBuyId: string, feedbackType: string): string {
  const timestamp = Date.now();
  const typePrefix = feedbackType.split('_')[0]; // 'conversion', 'lead', or 'brand'
  return `fb_${mediaBuyId}_${typePrefix}_${timestamp}`;
}

/**
 * Calculate impact description based on feedback type and data
 */
function calculateImpact(
  feedbackType: 'conversion_data' | 'lead_quality' | 'brand_lift',
  data: FeedbackData,
  mediaBuyId: string
): string {
  // Get delivery metrics to contextualize the impact
  const metricsResult = getDeliveryMetrics(mediaBuyId);
  const metrics = Array.isArray(metricsResult) ? undefined : metricsResult;

  switch (feedbackType) {
    case 'conversion_data': {
      const conversions = data.conversions ?? 0;
      const conversionValue = data.conversion_value ?? 0;
      const attributionWindow = data.attribution_window ?? '30-day';

      if (metrics && conversions > 0) {
        const roas = conversionValue / metrics.total_spend;
        if (roas >= 3) {
          return `Strong ROAS of ${roas.toFixed(1)}x with ${conversions} conversions in ${attributionWindow} window. Recommend increasing budget.`;
        } else if (roas >= 1) {
          return `Positive ROAS of ${roas.toFixed(1)}x with ${conversions} conversions. Campaign is profitable.`;
        } else {
          return `ROAS of ${roas.toFixed(1)}x below target. Consider bid or targeting optimizations.`;
        }
      }
      return `Conversion data logged: ${conversions} conversions worth $${conversionValue}`;
    }

    case 'lead_quality': {
      const leadsSubmitted = data.leads_submitted ?? 0;
      const leadsQualified = data.leads_qualified ?? 0;
      const qualificationRate = data.qualification_rate ?? (leadsSubmitted > 0 ? (leadsQualified / leadsSubmitted) * 100 : 0);
      const pipelineValue = data.pipeline_value ?? 0;
      const leadToCustomerRate = data.lead_to_customer_rate;

      if (qualificationRate >= 40) {
        return `Excellent lead quality: ${qualificationRate.toFixed(0)}% qualification rate with $${pipelineValue.toLocaleString()} pipeline value. High-intent audience being reached.`;
      } else if (qualificationRate >= 20) {
        return `Good lead quality: ${qualificationRate.toFixed(0)}% qualification rate. Consider refining targeting to improve further.`;
      } else {
        return `Lead quality below target at ${qualificationRate.toFixed(0)}%. Recommend reviewing targeting and creative messaging.`;
      }
    }

    case 'brand_lift': {
      const awarenessLift = data.awareness_lift ?? 0;
      const considerationLift = data.consideration_lift ?? 0;
      const purchaseIntentLift = data.purchase_intent_lift ?? 0;
      const sampleSize = data.sample_size ?? 0;

      const avgLift = (awarenessLift + considerationLift + purchaseIntentLift) / 3;
      const sampleNote = sampleSize > 0 ? ` (n=${sampleSize})` : '';

      if (avgLift >= 10) {
        return `Strong brand lift results${sampleNote}: +${awarenessLift}% awareness, +${considerationLift}% consideration, +${purchaseIntentLift}% purchase intent.`;
      } else if (avgLift >= 5) {
        return `Moderate brand lift${sampleNote}: +${awarenessLift}% awareness, +${considerationLift}% consideration. Consider increasing frequency.`;
      } else {
        return `Limited brand lift detected${sampleNote}. Recommend creative refresh or audience expansion.`;
      }
    }

    default:
      return 'Feedback processed and logged for analysis.';
  }
}

/**
 * provide_performance_feedback tool implementation
 *
 * Submits conversion data, lead quality, or brand lift feedback for a media buy.
 * This data helps optimize campaign performance and measure effectiveness.
 *
 * @param input - Media buy ID, feedback type, and data object
 * @returns Feedback ID, status, and calculated impact
 */
export function providePerformanceFeedback(
  input: ProvidePerformanceFeedbackInput
): ProvidePerformanceFeedbackResult {
  // Validate required fields
  if (!input.media_buy_id) {
    return {
      success: false,
      result: null,
      error: 'Missing required field: media_buy_id',
    };
  }

  if (!input.feedback_type) {
    return {
      success: false,
      result: null,
      error: 'Missing required field: feedback_type',
    };
  }

  const validFeedbackTypes = ['conversion_data', 'lead_quality', 'brand_lift'];
  if (!validFeedbackTypes.includes(input.feedback_type)) {
    return {
      success: false,
      result: null,
      error: `Invalid feedback_type: ${input.feedback_type}. Must be one of: ${validFeedbackTypes.join(', ')}`,
    };
  }

  if (!input.data || typeof input.data !== 'object') {
    return {
      success: false,
      result: null,
      error: 'Missing required field: data object',
    };
  }

  // Verify media buy exists
  const mediaBuy = getMediaBuyById(input.media_buy_id);
  if (!mediaBuy) {
    return {
      success: false,
      result: null,
      error: `Media buy not found: ${input.media_buy_id}`,
    };
  }

  // Generate feedback ID
  const feedbackId = generateFeedbackId(input.media_buy_id, input.feedback_type);

  // Calculate impact
  const impact = calculateImpact(input.feedback_type, input.data, input.media_buy_id);

  // Create the feedback entry
  const feedback: PerformanceFeedback = {
    feedback_id: feedbackId,
    media_buy_id: input.media_buy_id,
    submitted_at: new Date().toISOString(),
    feedback_type: input.feedback_type,
    data: input.data,
    status: 'processed',
    impact: impact,
  };

  // Add to performance_feedback_log
  addPerformanceFeedback(feedback);

  // Broadcast feedback to all connected clients
  broadcastFeedbackSubmitted({
    feedback_id: feedbackId,
    media_buy_id: input.media_buy_id,
    feedback_type: input.feedback_type,
    impact: impact,
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    result: {
      feedback_id: feedbackId,
      media_buy_id: input.media_buy_id,
      status: 'processed',
      impact: impact,
    },
  };
}
