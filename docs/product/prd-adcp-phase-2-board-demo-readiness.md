# PRD: ADCP Phase 2 Board Demo Readiness

## Document Control
- Product: ADCP Demo
- Version: Draft v0.1
- Status: Draft
- Date: February 17, 2026
- Planning Horizon: 1 week
- Priority: Reliability-first

## 1. Summary
Phase 2 prepares ADCP for a board-level demo with stronger reliability, larger synthetic data scale, grounded outputs, per-user memory, and contractual guarantee checks.
This PRD prioritizes demo failure prevention first, then adds high-credibility capabilities that directly support executive decision-making.

## 2. Business Context
Recent demos created board-level interest and potential proof-of-concept opportunities (including major advertiser use cases).
The Phase 2 objective is to move from "promising demo" to "boardroom-ready product story" with clear proof of scale, accuracy, and operational usefulness.

## 3. Goals
1. Eliminate critical demo-path reliability failures (API contract, test integrity, environment readiness).
2. Scale synthetic data to medium board-demo scale:
   - ~12 platforms
   - ~500 products
   - ~250 campaigns
3. Reduce hallucination risk through explicit grounding metadata and tool-backed numeric responses.
4. Add per-user memory that preserves user context across sessions.
5. Add contractual guarantee monitoring that surfaces KPI risk and recommended actions.

## 4. Non-Goals
1. Production-grade multi-tenant authentication/authorization.
2. Real ad-platform integrations beyond synthetic/mock datasets.
3. Full enterprise SLA/observability rollout.

## 5. Current-State Findings (Validated)
1. `update_media_buy` via `/api/tools/:toolName` can return `{}` because async tool results are not awaited in route handler.
2. `typecheck` on a clean environment can fail unless `.next/types` already exist.
3. Existing tests include false-positive risk (some only assert HTTP 200, not business result correctness).
4. API/tool and multi-platform tests pass once dependencies are installed.
5. UI Playwright tests are environment-blocked until browser/system dependencies are installed.

## 6. Functional Requirements

### FR-1: Tool Route Reliability
- `/api/tools/:toolName` must support async handlers and await results.
- Errors must return structured JSON (no empty object responses).
- Backward compatibility for existing frontend consumers must be maintained.

### FR-2: Test Quality and CI Trustworthiness
- Tool tests must assert semantic outcomes (changes applied, IDs returned, error paths).
- Preflight checks must validate required Playwright browser/runtime dependencies.

### FR-3: Grounded Response Guarantees
- Numeric/performance claims in chat responses must be backed by tool calls.
- Chat responses should include grounding metadata:
  - tool calls used
  - data timestamp
  - confidence indicator

### FR-4: Per-User Memory
- Persist user profile context keyed by `userId`:
  - preferred brands/platforms
  - recurring KPI focus
  - recent actions/intent
- Apply profile summary in prompt context for subsequent turns.
- Provide reset path for clean demo reruns.

### FR-5: Contractual Guarantee Checks
- Introduce guarantee rules per brand/campaign:
  - KPI target
  - evaluation window
  - breach state and severity
- Add endpoint to return guarantee status and risk summary for artifact/dashboard display.

### FR-6: Medium-Scale Synthetic Data
- Expand dataset to target scale (12/500/250).
- Keep deterministic generation (seeded) and versioned snapshots.
- Preserve backward compatibility for core demo brands and flows.

## 7. Non-Functional Requirements
1. Clean-clone setup reproducibility for build and test.
2. Query responsiveness suitable for live demo:
   - key API p95 < 200ms (dev baseline target)
3. Data load startup acceptable for demo environment:
   - target < 1.5s in local dev
4. No blocking dependency on optional Slack/email integrations.

## 8. API / Interface Changes

### 8.1 Tools Route
- Endpoint: `POST /api/tools/:toolName`
- Change: async-safe execution contract with structured result envelope.

### 8.2 Chat Memory APIs
- Add optional `userId` on conversation sync/list/get endpoints.
- Default `userId = "demo-user"` when omitted (non-breaking).

### 8.3 Guarantee Endpoint
- New endpoint: `GET /api/contracts/guarantee-status`
- Filters: brand, platform, campaign/media buy ID
- Output: pass/fail, KPI deltas, risk severity, recommended action.

### 8.4 Type Additions
- `ContractGuaranteeRule`
- `ContractGuaranteeStatus`
- `UserProfileContext`

## 9. Delivery Plan (1 Week)

### Day 1
- Fix async tool route defect and add regression tests.

### Day 2
- Harden test assertions for mutation tools and edge-case failures.
- Update deployment runbook with Playwright/browser/system dependency preflight.

### Day 3
- Implement grounding enforcement + grounding metadata in chat output.

### Day 4
- Implement per-user memory store + prompt context integration + reset support.

### Day 5
- Implement guarantee checker + endpoint.
- Deliver medium-scale synthetic data snapshot and performance smoke validation.

## 10. Test Scenarios / Acceptance Criteria

### Reliability
1. `update_media_buy` returns structured non-empty result and persists changes.
2. Async tool failures return actionable structured errors.

### Grounding
1. Metric-rich responses include data source/tool evidence and timestamp.
2. No unsupported numeric claims when tool data is unavailable.

### Memory
1. Same `userId` restores profile context across sessions.
2. Different `userId`s remain isolated.

### Guarantee Checks
1. Underperforming campaign triggers breach/risk state with recommendation.
2. Healthy campaign returns pass/no false alarm.

### Scale
1. Dataset loads at target size without schema regressions.
2. Platform/brand filters and cross-platform aggregations remain correct.
3. Performance targets are met in smoke run.

### Demo Readiness
1. Build and API/tool tests pass in clean environment after documented setup.
2. UI smoke tests run successfully once documented Playwright deps are installed.

## 11. Risks and Mitigations
1. Risk: false confidence from shallow tests.
   - Mitigation: semantic assertions + regression tests for mutation results.
2. Risk: environment drift before demo.
   - Mitigation: pinned setup preflight and runbook checklist.
3. Risk: larger data introduces latency/regressions.
   - Mitigation: seeded generation + performance smoke gates.
4. Risk: hallucination perception in board meeting.
   - Mitigation: explicit grounding metadata in outputs.

## 12. Dependencies
1. Node/npm environment with reproducible lockfile install.
2. Playwright browser + host OS dependencies.
3. Anthropic API key for end-to-end chat behavior checks.

## 13. Open Items (Defaulted for This Draft)
1. Priority mode: Reliability-first.
2. Scale target: Medium (12/500/250).
3. Timeline: 1 week.
