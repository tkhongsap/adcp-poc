# Integration Test Report

**Date**: 2026-02-01
**Branch**: `feature/integration-testing`
**Total Queries**: 28
**Errors**: 0

---

## DISCOVER - Finding the Right Inventory (8 queries)

| # | Query | Tool Called? | Tool Name(s) | Output Summary |
|---|-------|--------------|--------------|----------------|
| 1 | What sports inventory do you have? | Yes | `get_products` | Found 3 sports products (ESPN, SI, Bleacher Report) |
| 2 | Find inventory under $20 CPM | Yes | `get_products` | Found 5 products under $20 CPM |
| 3 | What's good for reaching tech executives? | Yes | `get_products`, `list_authorized_properties` | Recommended TechCrunch, Forbes |
| 4 | What video formats do you support? | Yes | `list_creative_formats` | Listed 4 video formats |
| 5 | What publishers can I access? | Yes | `list_authorized_properties` | Listed 10 publishers |
| 6 | Which properties have premium deals? | Yes | `list_authorized_properties` | Found 5 premium properties with discounts |
| 7 | What's the minimum budget for NYT? | Yes | `get_products`, `list_authorized_properties` | NYT in properties but not in products |
| 8 | Launch a $5K test campaign on ESPN | Yes | `get_products`, `list_authorized_properties` | Asked for brand name, dates, targeting |

---

## MONITOR - Campaign Performance (8 queries)

| # | Query | Tool Called? | Tool Name(s) | Output Summary |
|---|-------|--------------|--------------|----------------|
| 9 | Show me all active campaigns | Yes | `get_media_buy_delivery` | Showed 5 active campaigns |
| 10 | What's our total spend this month? | Yes | `get_media_buy_delivery` | $127,450 across 5 campaigns |
| 11 | How are we pacing against budgets? | Yes | `get_media_buy_delivery` | 3 on track, 1 warning, 1 poor |
| 12 | Which campaigns are underperforming? | Yes | `get_media_buy_delivery` | Apex Motors (poor), TechFlow (overspending) |
| 13 | How is Apex Motors performing? | Yes | `get_media_buy_delivery` | Poor health, behind pace, low CTR |
| 14 | Break down Apex by device | Yes | `get_media_buy_delivery` | Mobile CTR 0.08% vs Desktop 0.18% |
| 15 | Show me performance by geo | Yes | `get_media_buy_delivery` | All campaigns geo breakdown shown |
| 16 | What's our best performing campaign? | Yes | `get_media_buy_delivery` | SportMax Apparel (good health, 85% completion) |

---

## OPTIMIZE - Making Adjustments (7 queries)

| # | Query | Tool Called? | Tool Name(s) | Output Summary | Status |
|---|-------|--------------|--------------|----------------|--------|
| 17 | Why is Apex Motors struggling? | Yes | `get_media_buy_delivery` | Low mobile CTR, Germany underperforming | OK |
| 18 | What optimisations would you recommend? | Yes | `get_media_buy_delivery` | Detailed recommendations per campaign | OK |
| 19 | Reduce Apex mobile bid by 20% | Yes | `get_media_buy_delivery`, `update_media_buy` | Bid reduced $6.80 to $5.44 | OK |
| 20 | Pause Germany targeting | No | None | Asked which campaign to modify | NEEDS FIX |
| 21 | Shift 20% budget from mobile to desktop | Yes | `get_media_buy_delivery` | Asked which campaign to modify | NEEDS FIX |
| 22 | TechFlow is overspending - cap the daily budget | Yes | `get_media_buy_delivery` | Asked what cap amount to set | NEEDS FIX |
| 23 | Submit our conversion data for Apex | No | None | Asked for conversion details | NEEDS FIX |

---

## GENERAL - MCP, AdCP, Digital Marketing (5 queries)

| # | Query | Tool Called? | Tool Name(s) | Output Summary |
|---|-------|--------------|--------------|----------------|
| 24 | What is MCP? | No | None | Explained Model Context Protocol |
| 25 | What is AdCP and how does it work? | No | None | Explained Advertising Control Plane |
| 26 | Explain programmatic advertising | No | None | Comprehensive explanation |
| 27 | What is CPM and how is it calculated? | No | None | Explained Cost Per Mille |
| 28 | What are the best practices for digital campaign optimization? | No | None | Listed optimization best practices |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Queries | 28 |
| With Tool Calls | 21 (75%) |
| Without Tool Calls | 7 (25%) |
| Errors | 0 |

---

## Tool Usage Breakdown

| Tool | Times Called |
|------|--------------|
| `get_media_buy_delivery` | 13 |
| `get_products` | 5 |
| `list_authorized_properties` | 5 |
| `list_creative_formats` | 1 |
| `update_media_buy` | 1 |

---

## Issues Identified

### Issue 1: NYT Not in Products Data
**Query**: "What's the minimum budget for NYT?"
**Problem**: NYT exists in `authorized_properties` but not in `products` data.
**Impact**: System cannot provide minimum budget for NYT.
**Fix Required**: Add NYT product to `data/adcp_demo_complete_data.json` or update tool descriptions.

### Issue 2: Ambiguous Campaign References
**Queries**: #20, #21, #22, #23
**Problem**: When user says "Pause Germany targeting" or "Submit conversion data for Apex", the system asks for clarification instead of inferring from context.
**Impact**: Extra back-and-forth required from user.
**Fix Options**:
1. Improve system prompt to use conversation context
2. Add campaign lookup by brand name in tools
3. Teach model to infer campaign from recent context

### Issue 3: Missing Tool Calls for Optimization Actions
**Queries**: #20 (Pause Germany), #23 (Submit conversion data)
**Problem**: No tool was called - system just asked for more info.
**Expected**: Should call `get_media_buy_delivery` first to identify campaigns, then ask which one.

### Issue 4: Tools Never Called
**Tools not used in tests**:
- `create_media_buy` - Query #8 asked for details but didn't complete creation
- `provide_performance_feedback` - Query #23 asked for details but didn't complete

---

## Recommendations

### High Priority
1. **Add NYT product** to mock data with minimum budget info
2. **Improve context awareness** for campaign-specific commands

### Medium Priority
3. **Add brand name lookup** - Allow tools to find campaigns by brand name (e.g., "Apex" -> `mb_apex_motors_q1`)
4. **Test multi-turn conversations** - Verify system remembers context

### Low Priority
5. **Add test coverage** for `create_media_buy` and `provide_performance_feedback` flows
6. **Add automated assertions** to test script for CI/CD

---

## Test Script Location

```
/home/runner/workspace/test-queries.mjs
```

**Run tests**:
```bash
node test-queries.mjs
```
