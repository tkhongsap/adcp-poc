# Tool Contracts — Detailed Implementation Guide

This document expands the tool interface definitions for runtime behavior and edge cases.

All tool execution happens through:
- Direct call: `POST /api/tools/:toolName`
- Or implicitly via `POST /api/chat/stream` during Claude turn-taking

## Common tool response shape

Most tools return either:
- `{ success: true, ... }`
- `{ success: false, error: "..." }`

Where tools return rich payloads, they also include identifiers, normalized arrays, and counts.

## `get_products`

**Input**

```json
{ "category": "video", "max_cpm": 15.0 }
```

Both fields are optional.

- `category?: string`
- `max_cpm?: number`

**Output**

```json
{
  "success": true,
  "products": [
    {
      "product_id": "prod_espn_premium",
      "name": "ESPN Premium Display",
      "description": "...",
      "category": "display",
      "pricing_options": [
        { "pricing_option_id": "...", "currency": "USD", "cpm": 12.5, "pricing_model": "CPM" }
      ]
    }
  ],
  "count": 12,
  "filters_applied": {
    "category": "video",
    "max_cpm": 15
  }
}
```

**Implementation notes**
- Source from `getProducts(options)` in `data/loader.ts`.
- Pure read operation.
- Filtering is case-sensitive only for category equality after normalization to lowercase.

**Error cases**
- No explicit validation errors in the handler (bad inputs return empty result or default list).

## `list_creative_formats`

**Input**

```json
{ "type": "native" }
```

- `type?: "display" | "video" | "native" | "audio"`

**Output**

```json
{
  "success": true,
  "formats": [
    {
      "format_id": "native_article_card",
      "name": "Native Article Card",
      "type": "native",
      "dimensions": "300x250",
      "specs": {
        "headline_max": 50,
        "description_max": 150,
        "image_dimensions": "1200x628"
      }
    }
  ],
  "count": 5,
  "filters_applied": { "type": "native" }
}
```

**Implementation notes**
- Source from `getCreativeFormats` in `data/loader.ts`.
- Static catalogue defined in code for deterministic shape.

## `list_authorized_properties`

**Input**

```json
{}
```

**Output**

```json
{
  "success": true,
  "properties": [
    {
      "property_id": "prop_espn",
      "name": "ESPN",
      "domain": "espn.com",
      "category": "Sports",
      "monthly_uniques": 85000000,
      "authorization_level": "premium",
      "available_formats": ["display_300x250_image", "display_728x90_image"],
      "discount_percent": 15,
      "audience_profile": "Sports enthusiasts..."
    }
  ],
  "count": 9
}
```

**Implementation notes**
- Static in-memory list in `data/loader.ts`.

## `create_media_buy`

**Input**

```json
{
  "brand_name": "Apex Motors",
  "product_id": "prod_espn_premium",
  "budget": 50000,
  "targeting": {
    "geo_country_any_of": ["US", "CA"],
    "device_type": ["mobile", "desktop"]
  },
  "start_time": "2026-02-01T00:00:00Z",
  "end_time": "2026-02-28T23:59:59Z"
}
```

- `brand_name`, `product_id`, `budget`, `targeting`, `start_time`, `end_time` are required by handler-level checks.

**Output (success)**

```json
{
  "success": true,
  "media_buy": {
    "media_buy_id": "mb_apex_1",
    "status": "submitted",
    "estimated_impressions": 333333,
    "brand_name": "Apex Motors",
    "product_id": "prod_espn_premium",
    "budget": 50000,
    "start_time": "2026-02-01T00:00:00Z",
    "end_time": "2026-02-28T23:59:59Z"
  }
}
```

**Output (failure)**

```json
{
  "success": false,
  "media_buy": null,
  "error": "Budget 500 is below minimum 1200 for product ESPN Premium"
}
```

**Side effects**
- Adds a new `MediaBuy` to in-memory store.
- Creates initial `DeliveryMetrics`.
- Broadcasts `media_buy_created` over websocket with initial metrics and estimate.

## `get_media_buy_delivery`

**Input (all)**

```json
{}
```

**Input (single)**

```json
{ "media_buy_id": "mb_apex_motors_q1" }
```

`media_buy_id` can be either exact ID or brand alias (e.g., `Apex`, `TechFlow`) via `resolveMediaBuyId`.

**Output (all)**

```json
{
  "success": true,
  "metrics": [
    {
      "media_buy_id": "mb_apex_motors_q1",
      "brand": "Apex Motors",
      "total_budget": 50000,
      "total_spend": 12000,
      "pacing": "on_track",
      "health": "good",
      "summary": {
        "impressions": 900000,
        "clicks": 12000,
        "conversions": 220,
        "ctr": 1.33,
        "cpm": 13.3,
        "cpa": 54.5,
        "viewability": 68,
        "completion_rate": 32.1
      },
      "by_device": {},
      "by_geo": {},
      "recommendations": ["...", "..."]
    }
  ],
  "count": 5
}
```

**Output (single)**

```json
{
  "success": true,
  "metrics": { ...single delivery metrics... }
}
```

**Failure**

```json
{
  "success": false,
  "metrics": null,
  "error": "Media buy not found: foo"
}
```

## `update_media_buy`

This is the most operationally important mutation tool.

**Input**

```json
{
  "media_buy_id": "mb_apex_motors_q1",
  "updates": {
    "set_status": { "status": "paused" },
    "remove_geo": { "countries": ["DE", "FR"] },
    "adjust_bid": { "device": "mobile", "change_percent": -15 }
  }
}
```

Notes:
- `media_buy_id` can be brand alias.
- `updates` is required and may contain any subset of operations.
- Aliases supported by normalization layer:
  - `set_status`: `state`
  - pause/resume shortcuts via `{ pause: true }`, `{ resume: true }`, `{ activate: true }`
  - remove/add geo can accept `countries`, `geo`, or `country`
  - bid uses `change_percent`/`adjustment_percent`/`percent`
  - daily cap accepts `amount`/`cap`/`daily_cap`/`budget`

**Output**

```json
{
  "success": true,
  "result": {
    "media_buy_id": "mb_apex_motors_q1",
    "success": true,
    "changes_applied": [
      {
        "operation": "set_status",
        "details": "Changed campaign status from active to paused",
        "previous_value": "active",
        "new_value": "paused"
      }
    ],
    "estimated_impact": {
      "budget_change": -10000,
      "reach_change_percent": -100,
      "efficiency_improvement": "CPM reduced",
      "description": "Campaign paused - delivery stopped"
    },
    "notifications": {
      "slack": {
        "sent": true,
        "message": "Slack notification sent to #adcp-demo",
        "channelName": "#adcp-demo"
      },
      "email": {
        "draftGenerated": true,
        "draft": {
          "id": "draft_xxx",
          "to": ["demo@example.com"],
          "from": "adcp-agent@demo.adcp.io"
        },
        "message": "Email draft generated for Apex Motors"
      },
      "timestamp": "2026-02-16T..."
    }
  }
}
```

Failure examples:
- missing `media_buy_id` / empty `updates`
- unresolved media buy id
- missing metrics object
- runtime errors in notification are logged but do not fail state mutation

**Side effects**
- Updates in-memory campaign and metrics
- Sends notifications via Slack + in-memory email draft
- Broadcasts `media_buy_updated` including `changes_applied`, optional `notifications`

## `provide_performance_feedback`

**Input examples**

Conversion:

```json
{
  "media_buy_id": "mb_apex_motors_q1",
  "feedback_type": "conversion_data",
  "data": {
    "conversions": 120,
    "conversion_value": 24000,
    "attribution_window": "30-day"
  }
}
```

Lead quality:

```json
{
  "media_buy_id": "Apex",
  "feedback_type": "lead_quality",
  "data": {
    "leads_submitted": 300,
    "leads_qualified": 95,
    "qualification_rate": 31.6,
    "pipeline_value": 420000
  }
}
```

Brand lift:

```json
{
  "media_buy_id": "mb_techflow_saas",
  "feedback_type": "brand_lift",
  "data": {
    "awareness_lift": 5.2,
    "consideration_lift": 3.8,
    "purchase_intent_lift": 2.4,
    "sample_size": 1200
  }
}
```

**Output**

```json
{
  "success": true,
  "result": {
    "feedback_id": "fb_mb_apex_motors_q1_conversion_1708000000000",
    "media_buy_id": "mb_apex_motors_q1",
    "status": "processed",
    "impact": "Strong ROAS of 2.0x with 120 conversions in 30-day window. Recommend increasing budget."
  }
}
```

**Failure**

```json
{
  "success": false,
  "result": null,
  "error": "Missing required field: feedback_type"
}
```

**Side effects**
- Appends a record to `performance_feedback_log`.
- Broadcasts `feedback_submitted`.

## Cross-cutting behavior

- Tool name and input validation is minimal in tool router; individual tools perform specific validation.
- Alias resolution for campaign references is handled in `data/loader.ts` functions:
  - `resolveMediaBuyId`
  - `findMediaBuyByBrandName`
- All mutating tools mutate in-memory store; persistence is not durable except chat history.

