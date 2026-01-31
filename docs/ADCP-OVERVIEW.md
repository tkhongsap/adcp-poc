# AdCP Overview: Reference Document for Adform Meeting

> **Purpose**: Living reference document for the Adform sales meeting. Edit as needed before building the demo.

---

## 1. TL;DR (Elevator Pitch)

**AdCP = MCP for Advertising**

> "AdCP is an open protocol that makes your DSP fully accessible to AI agents. Without it, AI assistants can't buy media from you. With it, clients simply ask their AI: 'How is my Adform campaign performing?' — and it just works."

**One-liner for Adform**: *"This is how your clients will interact with Adform in the AI era."*

---

## 2. What is AdCP?

### Definition
**Ad Context Protocol (AdCP)** is an open standard that enables AI agents to communicate directly with advertising platforms (DSPs, SSPs, publishers) using natural language.

### Relationship to MCP
- Built on top of **MCP (Model Context Protocol)** — Anthropic's open standard for connecting AI assistants to external tools
- Any AI that supports MCP (Claude, ChatGPT, etc.) can interact with AdCP-compliant platforms
- AdCP extends MCP with advertising-specific tools and data schemas

### Current Status
- **RFC/v0.1** — Early specification stage
- Signal42 is driving adoption with DSP partnerships
- First-mover advantage for early adopters

### Key Resources
- AdCP Docs: https://docs.adcontextprotocol.org
- MCP Docs: https://modelcontextprotocol.io

---

## 3. Why Should Adform Care?

### The Problem
AI agents are coming to buy and manage media. Agencies and brands are increasingly using AI assistants to:
- Query available inventory
- Execute media buys
- Monitor campaign performance
- Make real-time optimizations

### The Risk
> **DSPs without an AI-accessible interface will be bypassed.**

If an AI agent can't talk to your platform, it won't buy from you or manage campaigns on you. Currently, each DSP has proprietary APIs — AI agents would need custom integrations for each, which doesn't scale.

### The Opportunity
By implementing AdCP, Adform enables AI agents to:
- ✅ Query inventory and pricing through natural language
- ✅ Execute and modify media buys programmatically
- ✅ Pull real-time delivery metrics and performance data
- ✅ Make optimization decisions based on live performance

**Competitive advantage**: Adform doesn't get commoditized — you control pricing, targeting, and what data you expose. Early adopters gain advantage as AI-driven media buying accelerates.

---

## 4. The 8 AdCP Tools

AdCP defines 7 core tools (8 including tool descriptions) organized by workflow phase:

### DISCOVER Phase — Finding Inventory

| Tool | Purpose | Example Query |
|------|---------|---------------|
| `get_products` | Discover available inventory with pricing & targeting | "What sports inventory do you have?" |
| `list_creative_formats` | Get available ad format specs | "What video formats do you support?" |
| `list_authorized_properties` | Get accessible publishers | "What publishers can I access?" |

### BUY Phase — Executing Campaigns

| Tool | Purpose | Example Query |
|------|---------|---------------|
| `create_media_buy` | Launch a new campaign | "Launch a $5K test on ESPN" |

### MONITOR Phase — Checking Performance

| Tool | Purpose | Example Query |
|------|---------|---------------|
| `get_media_buy_delivery` | Get performance metrics | "How are my campaigns performing?" |

### OPTIMIZE Phase — Taking Action

| Tool | Purpose | Example Query |
|------|---------|---------------|
| `update_media_buy` | Modify existing campaign (bids, targeting, budgets) | "Reduce mobile bid by 20%" |
| `provide_performance_feedback` | Submit conversion/attribution data | "Submit our conversion data" |

---

## 5. Demo Flow Examples

### DISCOVER Phase

**Sample Queries:**
```
User: "What sports inventory do you have?"
Agent: ESPN Premium ($18-35 CPM), Sports Illustrated ($15-20), Bleacher Report ($12-18)

User: "Find inventory under $20 CPM"
Agent: Weather.com ($8-12), SI ($15-20), Bleacher Report ($12-18)

User: "What video formats do you support?"
Agent: Pre-roll 15s/30s, outstream 15s, CTV 30s. Avg completion 78-96%.

User: "Which properties have premium deals?"
Agent: ESPN (15% discount), TechCrunch (12%), Forbes (8%)
```

### MONITOR Phase

**Sample Queries:**
```
User: "Show me all active campaigns"
Agent: 5 campaigns: Apex Motors ($32K spent), TechFlow ($28K), SportMax ($30K),
       FinanceFirst ($22K), GreenEnergy ($15K)

User: "How are we pacing against budgets?"
Agent: 3 on track, 1 warning (TechFlow overspending), 1 poor (Apex Motors)

User: "Why is Apex Motors struggling?"
Agent: Mobile CTR 0.08% vs Desktop 0.18%. Germany CTR 0.04% vs US/UK 0.14%.
       Recommend: Reduce mobile bid, pause Germany.

User: "What's our best performing campaign?"
Agent: TechFlow SaaS: 0.60% CTR, beating 0.35% target. CPA $317 vs $350 target.
```

### OPTIMIZE Phase

**Sample Queries:**
```
User: "Reduce Apex Motors mobile bid by 20%"
Agent: Done. Mobile bid reduced from $8.50 to $6.80 CPM. Effective immediately.

User: "Pause Germany targeting for Apex"
Agent: Done. Germany removed from geo targeting. Est. savings $6,490.

User: "TechFlow is overspending — cap the daily budget"
Agent: Done. Daily cap set to $568 based on remaining budget/days.

User: "Submit our conversion data for Apex"
Agent: Feedback submitted: 25 conversions, $125K value, 30-day attribution.
```

---

## 6. Key Selling Points

### For Adform Executives

1. **Future-Proof Your Platform**
   - AI-native media buying is accelerating
   - AdCP is the emerging standard
   - First movers gain competitive advantage

2. **Low Integration Effort**
   - AdCP acts as a "translator" to your existing APIs
   - No changes to core bidding algorithms required
   - Start with read-only, add write capabilities later

3. **You Maintain Control**
   - You decide what data to expose
   - You control pricing and inventory access
   - Your platform, your rules

4. **Client Value**
   - Natural language access to campaign management
   - 24/7 AI-powered monitoring and optimization
   - Reduced operational overhead for clients

### Comparison: AdCP vs ARTF

| Aspect | AdCP | ARTF |
|--------|------|------|
| Scope | Full advertising lifecycle | Real-time bidding only |
| Focus | Agent-to-agent communication | Container orchestration |
| Integration | Translator layer to existing APIs | Direct bidstream mutation |
| Complexity | Simpler — wraps existing APIs | Complex — affects bidding algos |
| Best For | AI-native client interfaces | In-auction optimization |

**Recommendation**: Start with AdCP (easier path), consider ARTF for Adform IQ later.

---

## 7. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Environment                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              AI Assistant (Claude, etc.)             │    │
│  │         "How are my campaigns performing?"           │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  MCP Interface                       │    │
│  │         (Model Context Protocol)                     │    │
│  └─────────────────────┬───────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   AdCP Layer                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              AdCP MCP Server                         │    │
│  │                                                      │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │    │
│  │  │ get_products │ │ create_buy   │ │ get_delivery│ │    │
│  │  └──────────────┘ └──────────────┘ └─────────────┘ │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │    │
│  │  │ list_formats │ │ update_buy   │ │ feedback    │ │    │
│  │  └──────────────┘ └──────────────┘ └─────────────┘ │    │
│  │  ┌──────────────┐                                  │    │
│  │  │list_properties│                                 │    │
│  │  └──────────────┘                                  │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │ (API Translation)                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   DSP (Adform)                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Existing APIs & Systems                 │    │
│  │                                                      │    │
│  │   • Campaign Management API                          │    │
│  │   • Reporting API                                    │    │
│  │   • Inventory API                                    │    │
│  │   • Bidding Infrastructure                           │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Query → AI Assistant → MCP → AdCP Server → DSP API → Response → AI → User
```

**Example Flow:**
1. User asks: "How is my Apex Motors campaign performing?"
2. Claude interprets and calls `get_media_buy_delivery` tool
3. AdCP server translates to Adform API call
4. Adform returns metrics
5. AdCP formats response
6. Claude summarizes for user: "Apex Motors: $32K spent, 0.12% CTR..."

---

## 8. Resources & Links

### Official Documentation
- **AdCP Docs**: https://docs.adcontextprotocol.org
- **MCP Docs**: https://modelcontextprotocol.io
- **Claude API**: https://docs.anthropic.com

### Demo Materials
- PRD: `prd-s42-lab-adcp-sale-demo.md`
- AdCP vs ARTF Analysis: `AI in Advertising - AdCP vs ARTF.md`
- Mock Data: `adcp_demo_complete_data.json`

### Key Contacts
- Jason Liew (Signal42): jasonliew@signal42.uk
- Builder: Ta Khongsap

---

## Appendix: Mock Data Summary

For the demo, we provide:

| Data Type | Count | Examples |
|-----------|-------|----------|
| Products | 8 | ESPN, CNN, Weather.com, TechCrunch, SI, Bleacher Report, Forbes, Auto News |
| Media Buys | 5 | Apex Motors (poor), TechFlow (warning), SportMax (good), FinanceFirst (good), GreenEnergy (good) |
| Creative Formats | 14 | Display (6), Video (5), Native (2), Audio (1) |
| Properties | 10 | With reach, deals, audience data |

**Key Scenario**: Apex Motors campaign is intentionally underperforming to demonstrate the MONITOR → OPTIMIZE flow.

---

*Last updated: 2026-01-31*
*Version: 1.0*
