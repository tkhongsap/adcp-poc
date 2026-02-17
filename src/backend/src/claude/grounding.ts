import { getAggregations } from '../data/loader.js';

const METRIC_KEYWORDS = [
  'ctr',
  'cpm',
  'cpa',
  'roas',
  'impressions',
  'clicks',
  'conversions',
  'spend',
  'budget',
  'viewability',
  'completion rate',
  'quality score',
  'impression share',
  'pacing',
] as const;

const CAMPAIGN_CONTEXT_KEYWORDS = [
  'campaign',
  'media buy',
  'delivery',
  'portfolio',
  'brand',
  'apex',
  'techflow',
  'sportmax',
  'financefirst',
  'greenenergy',
  'luxebeauty',
  'freshbite',
  'urbanliving',
  'chang',
] as const;

const NUMERIC_CLAIM_PATTERN =
  /(\$?\d[\d,]*(\.\d+)?%?|\b\d+(\.\d+)?\s?(k|m|b)\b)/i;

const INSUFFICIENT_EVIDENCE_MESSAGE =
  "I don't have tool-backed campaign data for that yet. Ask me to pull delivery metrics for a specific brand, campaign, or platform and I'll provide grounded numbers.";

export type GroundingConfidence = 'high' | 'medium' | 'low';
export type GroundingSourceScope = 'tool_data' | 'general_response' | 'insufficient_evidence';

export interface ClaimEvidencePolicy {
  requiresEvidence: boolean;
  evidenceSatisfied: boolean;
  policyReason: 'campaign_metric_claim' | 'no_metric_claim';
}

export interface GroundingMetadata {
  tool_calls_used: string[];
  data_snapshot_ts: string;
  confidence: GroundingConfidence;
  source_scope: GroundingSourceScope;
  note?: string;
}

export interface GroundingToolCall {
  name: string;
}

function containsAnyKeyword(text: string, keywords: readonly string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword));
}

export function isCampaignMetricClaim(text: string): boolean {
  const hasMetricKeyword = containsAnyKeyword(text, METRIC_KEYWORDS);
  const hasCampaignContext = containsAnyKeyword(text, CAMPAIGN_CONTEXT_KEYWORDS);
  const hasNumericClaim = NUMERIC_CLAIM_PATTERN.test(text);

  return hasMetricKeyword && hasCampaignContext && hasNumericClaim;
}

export function evaluateClaimEvidencePolicy(
  message: string,
  toolCallCount: number
): ClaimEvidencePolicy {
  const requiresEvidence = isCampaignMetricClaim(message);
  const evidenceSatisfied = !requiresEvidence || toolCallCount > 0;

  return {
    requiresEvidence,
    evidenceSatisfied,
    policyReason: requiresEvidence ? 'campaign_metric_claim' : 'no_metric_claim',
  };
}

export function applyClaimEvidencePolicy(
  message: string,
  policy: ClaimEvidencePolicy
): string {
  if (policy.requiresEvidence && !policy.evidenceSatisfied) {
    return INSUFFICIENT_EVIDENCE_MESSAGE;
  }

  return message;
}

function getDataSnapshotTimestamp(hasToolEvidence: boolean): string {
  if (hasToolEvidence) {
    try {
      return getAggregations().portfolio_summary.as_of;
    } catch {
      return new Date().toISOString();
    }
  }
  return new Date().toISOString();
}

export function buildGroundingMetadata(
  toolCalls: GroundingToolCall[] | undefined,
  policy: ClaimEvidencePolicy
): GroundingMetadata {
  const toolCallsUsed = Array.from(new Set((toolCalls || []).map((call) => call.name)));
  const hasToolEvidence = toolCallsUsed.length > 0;

  let confidence: GroundingConfidence = 'medium';
  let sourceScope: GroundingSourceScope = 'general_response';
  let note: string | undefined;

  if (policy.requiresEvidence && !policy.evidenceSatisfied) {
    confidence = 'low';
    sourceScope = 'insufficient_evidence';
    note = 'Metric claim blocked due to missing tool evidence.';
  } else if (hasToolEvidence) {
    confidence = 'high';
    sourceScope = 'tool_data';
  }

  return {
    tool_calls_used: toolCallsUsed,
    data_snapshot_ts: getDataSnapshotTimestamp(hasToolEvidence),
    confidence,
    source_scope: sourceScope,
    note,
  };
}
