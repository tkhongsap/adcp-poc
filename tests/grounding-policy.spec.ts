import { test, expect } from '@playwright/test';
import {
  applyClaimEvidencePolicy,
  buildGroundingMetadata,
  evaluateClaimEvidencePolicy,
  isCampaignMetricClaim,
} from '../src/backend/src/claude/grounding';

test.describe('Grounding Policy', () => {
  test('detects campaign metric claims with numeric values', () => {
    const text =
      'Apex campaign spend is $32,450 and CTR is 0.12%, which is below our target.';
    expect(isCampaignMetricClaim(text)).toBe(true);
  });

  test('does not require evidence for non-metric responses', () => {
    const text = 'I can help you compare platforms and suggest optimization workflows.';
    const policy = evaluateClaimEvidencePolicy(text, 0);

    expect(policy.requiresEvidence).toBe(false);
    expect(policy.evidenceSatisfied).toBe(true);
    expect(policy.policyReason).toBe('no_metric_claim');
  });

  test('requires evidence for campaign metric claims and flags missing evidence', () => {
    const text = 'This campaign has 4.8M impressions, $24,000 spend, and a 1.1% CTR.';
    const policy = evaluateClaimEvidencePolicy(text, 0);

    expect(policy.requiresEvidence).toBe(true);
    expect(policy.evidenceSatisfied).toBe(false);
    expect(policy.policyReason).toBe('campaign_metric_claim');
  });

  test('replaces message when evidence is missing', () => {
    const text = 'TechFlow campaign spend is $12,500 with 0.8% CTR.';
    const policy = evaluateClaimEvidencePolicy(text, 0);
    const output = applyClaimEvidencePolicy(text, policy);

    expect(output).toContain("I don't have tool-backed campaign data");
  });

  test('builds high-confidence grounding metadata when tool evidence exists', () => {
    const policy = evaluateClaimEvidencePolicy(
      'Apex campaign spent $10,000 at 0.9% CTR.',
      2
    );
    const grounding = buildGroundingMetadata(
      [{ name: 'get_media_buy_delivery' }, { name: 'get_media_buy_delivery' }],
      policy
    );

    expect(grounding.confidence).toBe('high');
    expect(grounding.source_scope).toBe('tool_data');
    expect(grounding.tool_calls_used).toEqual(['get_media_buy_delivery']);
    expect(grounding.data_snapshot_ts).toBeTruthy();
  });

  test('builds low-confidence grounding metadata for blocked metric claims', () => {
    const policy = evaluateClaimEvidencePolicy(
      'Campaign spend is $40,000 and CTR is 0.3%.',
      0
    );
    const grounding = buildGroundingMetadata([], policy);

    expect(grounding.confidence).toBe('low');
    expect(grounding.source_scope).toBe('insufficient_evidence');
    expect(grounding.note).toContain('missing tool evidence');
  });
});

