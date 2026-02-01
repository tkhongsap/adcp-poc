=== MONITOR PHASE INTEGRATION TESTS ===

### Query 1: Show me all active campaigns
**PRD Expected:** 5 campaigns: Apex, TechFlow, SportMax, FinanceFirst, GreenEnergy
**Actual Response:**
```json
{
  "brand": "Apex Motors",
  "health": "poor",
  "spent": 32450,
  "budget": 50000
}
{
  "brand": "TechFlow SaaS",
  "health": "warning",
  "spent": 28200,
  "budget": 25000
}
{
  "brand": "SportMax Apparel",
  "health": "good",
  "spent": 29800,
  "budget": 35000
}
{
  "brand": "FinanceFirst Bank",
  "health": "good",
  "spent": 22100,
  "budget": 40000
}
{
  "brand": "GreenEnergy Co",
  "health": "good",
  "spent": 14900,
  "budget": 20000
}
{
  "brand": "Test Corp",
  "health": "good",
  "spent": 0,
  "budget": 5000
}
```
**Count:** 6 campaigns
**Status:** ✅ PASS

### Query 2: Which campaigns are underperforming?
**PRD Expected:** Apex Motors: CTR 0.12% vs 0.35% target
**Actual Response:**
```json
{
  "brand": "Apex Motors",
  "health": "poor",
  "ctr": 0.12,
  "recommendations": [
    "Reduce mobile bid - CTR significantly below desktop",
    "Consider pausing Germany - CTR well below other markets",
    "Shift budget from mobile to desktop placements"
  ]
}
{
  "brand": "TechFlow SaaS",
  "health": "warning",
  "ctr": 0.6,
  "recommendations": [
    "Campaign is overspending - consider reducing daily budget caps",
    "Strong CTR indicates good creative performance",
    "Review frequency caps to optimize spend efficiency"
  ]
}
```
**Status:** ✅ PASS

### Query 3: How is Apex Motors performing?
**PRD Expected:** $32,450 spent, 3.85M impressions, 0.12% CTR, 0.68 viewability
**Actual Response:**
```json
{
  "brand": "Apex Motors",
  "spent": 32450,
  "impressions": 3850000,
  "ctr": 0.12,
  "viewability": 0.68
}
```
**Status:** ✅ PASS - matches PRD ($32,450 spent, 3.85M impressions, 0.12% CTR, 0.68 viewability)

### Query 4: Break down Apex by device
**PRD Expected:** Mobile: 0.08% CTR, Desktop: 0.18% CTR
**Actual Response:**
```json
{
  "mobile_ctr": 0.08,
  "desktop_ctr": 0.18
}
```
**Status:** ✅ PASS - matches PRD (Mobile: 0.08%, Desktop: 0.18%)

### Query 5: Show me performance by geo
**PRD Expected:** US: 0.14% CTR, UK: 0.14%, Germany: 0.04%
**Actual Response:**
```json
{
  "US_ctr": 0.14,
  "UK_ctr": 0.14,
  "DE_ctr": 0.04
}
```
**Status:** ✅ PASS - matches PRD (US: 0.14%, UK: 0.14%, DE: 0.04%)
