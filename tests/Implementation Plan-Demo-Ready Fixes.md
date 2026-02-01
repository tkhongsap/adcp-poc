# Implementation Plan: Demo-Ready Fixes

**Date**: 2026-02-01
**Branch**: `feature/integration-testing`
**Goal**: Achieve 100% demo readiness for client presentation

---

## Current State

| Metric | Value |
|--------|-------|
| Test Pass Rate | 25/28 (89%) |
| Tools Working | 7/7 (100%) |
| Demo Readiness | Partial |

---

## Tasks Overview

| # | Task | Priority | Effort | Files to Modify |
|---|------|----------|--------|-----------------|
| 1 | Add NYT product to mock data | High | 10 min | `data/adcp_demo_complete_data.json` |
| 2 | Add Spotify product to mock data | High | 10 min | `data/adcp_demo_complete_data.json` |
| 3 | Improve system prompt for context awareness | High | 20 min | `src/backend/src/claude/client.ts` |
| 4 | Add Rich Media format | Medium | 5 min | `src/backend/src/data/loader.ts` |
| 5 | Add brand name lookup to tools | Medium | 30 min | `src/backend/src/tools/*.ts` |
| 6 | Re-run integration tests | High | 10 min | `test-queries.mjs` |

**Total Estimated Effort**: ~1.5 hours

---

## Task 1: Add NYT Product

**File**: `data/adcp_demo_complete_data.json`

**Problem**: Query "What's the minimum budget for NYT?" fails because NYT exists in `authorized_properties` but not in `products`.

**Solution**: Add NYT product entry to the `products` array.

**Data to Add**:
```json
{
  "product_id": "prod_nyt_premium",
  "name": "New York Times Premium",
  "description": "Premium news audience on New York Times digital properties with high-income, educated readers",
  "category": "News",
  "pricing_options": [
    {
      "pricing_option_id": "po_nyt_standard",
      "currency": "USD",
      "cpm": 32.0,
      "pricing_model": "fixed_cpm"
    },
    {
      "pricing_option_id": "po_nyt_sponsorship",
      "currency": "USD",
      "cpm": 42.0,
      "pricing_model": "fixed_cpm"
    }
  ],
  "format_ids": [
    {"agent_url": "https://creative.adcontextprotocol.org", "id": "display_300x250_image"},
    {"agent_url": "https://creative.adcontextprotocol.org", "id": "display_970x250_image"},
    {"agent_url": "https://creative.adcontextprotocol.org", "id": "native_article_card"}
  ],
  "targeting_capabilities": ["geo_country", "device_type", "news_interest", "income_level"],
  "minimum_budget": 15000,
  "available_inventory": 12000000
}
```

**Verification**: Run query "What's the minimum budget for NYT?" - should return $15,000.

---

## Task 2: Add Spotify Product

**File**: `data/adcp_demo_complete_data.json`

**Problem**: Spotify exists in `authorized_properties` but not in `products`.

**Solution**: Add Spotify product entry.

**Data to Add**:
```json
{
  "product_id": "prod_spotify_audio",
  "name": "Spotify Audio Ads",
  "description": "Audio advertising on Spotify's streaming platform reaching music and podcast listeners",
  "category": "Audio/Music",
  "pricing_options": [
    {
      "pricing_option_id": "po_spotify_standard",
      "currency": "USD",
      "cpm": 15.0,
      "pricing_model": "fixed_cpm"
    },
    {
      "pricing_option_id": "po_spotify_podcast",
      "currency": "USD",
      "cpm": 25.0,
      "pricing_model": "fixed_cpm"
    }
  ],
  "format_ids": [
    {"agent_url": "https://creative.adcontextprotocol.org", "id": "audio_30s"},
    {"agent_url": "https://creative.adcontextprotocol.org", "id": "video_preroll_15s"}
  ],
  "targeting_capabilities": ["geo_country", "device_type", "music_genre", "podcast_category", "demographics"],
  "minimum_budget": 10000,
  "available_inventory": 50000000
}
```

**Verification**: Run query "What audio inventory do you have?" - should include Spotify.

---

## Task 3: Improve System Prompt

**File**: `src/backend/src/claude/client.ts`

**Problem**: When user says "Pause Germany targeting" without specifying campaign, Claude asks for clarification instead of using conversation context.

**Solution**: Add context-awareness guidelines to system prompt.

**Changes to `getSystemPrompt()` function**:

Add after the existing guidelines:

```typescript
// Add to system prompt:
`
Context Awareness:
- When a user refers to a campaign by brand name (e.g., "Apex", "TechFlow"), use get_media_buy_delivery to find the matching campaign ID
- If a campaign was recently discussed in the conversation, apply commands to that campaign without asking for clarification
- For ambiguous commands like "pause Germany targeting", first check if there's a recently discussed campaign, otherwise list campaigns and ask which one
- Brand name mappings: "Apex" = mb_apex_motors_q1, "TechFlow" = mb_techflow_saas, "SportMax" = mb_sportmax_apparel, "FinanceFirst" = mb_financefirst, "GreenEnergy" = mb_greenenergy

Smart Defaults:
- When creating campaigns without all details, suggest reasonable defaults based on the product and budget
- For bid adjustments, always confirm the change before and after values
- For geo changes, confirm which countries are being added/removed
`
```

**Verification**: Run query "Pause Germany targeting" after discussing Apex Motors - should apply to Apex without asking.

---

## Task 4: Add Rich Media Format

**File**: `src/backend/src/data/loader.ts`

**Problem**: PRD lists 14 formats, only 13 available (missing Rich Media).

**Solution**: Add Rich Media format to `creativeFormats` array.

**Data to Add** (insert before Audio formats section):

```typescript
// Rich Media formats
{
  format_id: 'rich_media_expandable',
  name: 'Expandable Rich Media',
  type: 'display',
  dimensions: '300x250 -> 600x400',
  specs: {
    max_file_size: '500KB',
    file_types: ['html5', 'js'],
    interaction: 'click_to_expand',
  },
},
```

**Verification**: Run query "What ad formats are available?" - should list 14 formats including Rich Media.

---

## Task 5: Add Brand Name Lookup

**File**: `src/backend/src/tools/getMediaBuyDelivery.ts` (and others)

**Problem**: Users must use exact media_buy_id like `mb_apex_motors_q1` instead of brand names like "Apex".

**Solution**: Add brand name matching to tool input processing.

**Implementation**:

1. Create helper function in `src/backend/src/data/loader.ts`:
```typescript
export function findMediaBuyByBrandName(brandName: string): MediaBuy | undefined {
  const { media_buys } = ensureDataLoaded();
  const normalizedName = brandName.toLowerCase();
  return media_buys.find(mb =>
    mb.brand_manifest.name.toLowerCase().includes(normalizedName) ||
    mb.media_buy_id.toLowerCase().includes(normalizedName)
  );
}
```

2. Update tool input schemas to accept `brand_name` as alternative to `media_buy_id`

3. Update tool handlers to resolve brand name to media_buy_id

**Affected Tools**:
- `getMediaBuyDelivery.ts`
- `updateMediaBuy.ts`
- `providePerformanceFeedback.ts`

**Verification**: Run query "How is Apex performing?" - should work without needing full ID.

---

## Task 6: Re-run Integration Tests

**Command**: `node test-queries.mjs`

**Expected Results After Fixes**:

| Query | Before | After |
|-------|--------|-------|
| What's the minimum budget for NYT? | FAIL | PASS |
| Pause Germany targeting | NEEDS FIX | PASS |
| Shift 20% budget from mobile to desktop | NEEDS FIX | PASS |
| Submit our conversion data for Apex | NEEDS FIX | PASS |

**Target**: 28/28 (100%) pass rate

---

## Implementation Order

```
1. Task 1 (NYT product) ──┐
                          ├── Data fixes (can be done in parallel)
2. Task 2 (Spotify product)┤
                          │
3. Task 4 (Rich Media) ───┘

4. Task 3 (System prompt) ── Context awareness

5. Task 5 (Brand lookup) ── Tool enhancements

6. Task 6 (Re-test) ── Verification
```

---

## Verification Checklist

After implementation, verify these queries work:

- [ ] "What's the minimum budget for NYT?" → Returns $15,000
- [ ] "What audio inventory do you have?" → Includes Spotify
- [ ] "What ad formats are available?" → Lists 14 formats
- [ ] "How is Apex performing?" → Works without full ID
- [ ] "Pause Germany targeting" (after discussing Apex) → Applies to Apex
- [ ] "Submit conversion data for Apex" → Works without asking for ID

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Data format mismatch | Low | Copy existing product structure exactly |
| System prompt too long | Low | Keep additions concise |
| Brand lookup ambiguity | Medium | Use includes() for partial matching |
| Breaking existing tests | Low | Run full test suite after each change |

---

## Success Criteria

- All 28 test queries pass
- No additional user clarification needed for common commands
- NYT and Spotify fully functional as products
- Demo script runs smoothly end-to-end
