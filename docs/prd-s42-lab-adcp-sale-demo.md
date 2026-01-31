# S42 Labs: Product Requirements Document

## AdCP Sales Agent Demo

<table>
  <thead>
    <tr>
        <th>Document Type</th>
        <th>S42 Labs PRD</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Field</td>
        <td>Value</td>
    </tr>
    <tr>
        <td>Product Name</td>
        <td>AdCP Sales Agent Demo</td>
    </tr>
    <tr>
        <td>Version</td>
        <td>4.0</td>
    </tr>
    <tr>
        <td>Status</td>
        <td>Draft</td>
    </tr>
    <tr>
        <td>Priority</td>
        <td>#1 - Urgent</td>
    </tr>
    <tr>
        <td>Builder</td>
        <td>Ta Khongsap</td>
    </tr>
    <tr>
        <td>Author</td>
        <td>Jason Liew</td>
    </tr>
    <tr>
        <td>Created</td>
        <td>2026-01-30</td>
    </tr>
    <tr>
        <td>Timeline</td>
        <td>1-1.5 days</td>
    </tr>
  </tbody>
</table>

## 1. Industry Context

### 1.1 Background: The Advertising Ecosystem
Digital advertising connects brands (advertisers) with audiences through technology platforms:

<table>
  <thead>
    <tr>
        <th>Advertisers</th>
        <th>Brands that want to show ads</th>
        <th>Nike, Toyota, Netflix</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Player</td>
        <td>What They Do</td>
        <td>Example</td>
    </tr>
    <tr>
        <td>Publishers</td>
        <td>Websites/apps that show ads</td>
        <td>ESPN, CNN, Weather.com</td>
    </tr>
    <tr>
        <td>DSPs</td>
        <td>Demand-Side Platforms - tech that helps buyers purchase ads programmatically</td>
        <td>Adform, The Trade Desk, DV360</td>
    </tr>
    <tr>
        <td>Media Buyers</td>
        <td>Agencies/brands who use DSPs to buy ads</td>
        <td>Agency traders, brand teams</td>
    </tr>
  </tbody>
</table>

### 1.2 The Problem (for DSPs like Adform)
**AI agents are coming to buy and manage media, and DSPs need to be ready.**

AI assistants (like Claude, ChatGPT, etc.) are increasingly being used by agencies and brands to automate media buying and campaign management. These AI agents need a standardised way to:

<table>
  <thead>
    <tr>
        <th>Discover</th>
        <th>Find available inventory, query products, compare pricing and targeting options</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Capability</td>
        <td>What AI Agents Need To Do</td>
    </tr>
    <tr>
        <td>Buy</td>
        <td>Execute media buys, launch campaigns programmatically</td>
    </tr>
    <tr>
        <td>Monitor</td>
        <td>Check live campaign metrics - impressions, clicks, CTR, viewability, spend, pacing</td>
    </tr>
    <tr>
        <td>Optimise</td>
        <td>Adjust bids, budgets, and targeting based on real-time performance data</td>
    </tr>
  </tbody>
</table>

The risk: DSPs without an AI-accessible interface will be bypassed. If an AI agent can't talk to your platform, it won't buy from you or manage campaigns on you. Currently, each DSP has proprietary APIs and dashboards - AI agents would need custom integrations for each, which doesn't scale.

### 1.3 The Solution (AdCP for DSPs)

**AdCP makes your platform fully accessible to AI agents through a single open standard.**

By implementing AdCP, a DSP like Adform enables AI agents to:
* Query available inventory and pricing through natural language
* Execute and modify media buys programmatically
* Pull real-time delivery metrics and performance data
* Make optimisation decisions based on live campaign performance

Clients can ask their AI assistant: "How is my Adform campaign performing?" or "Reduce mobile bids on underperforming geos" - and it just works. Adform doesn't get commoditised - you control pricing, targeting, and what data you expose. Early adopters gain competitive advantage as AI-driven media buying accelerates.

### 1.4 What This Demo Shows

*An AI agent querying inventory, monitoring live campaign performance, identifying issues, recommending optimisations, and executing changes - the future of how clients will interact with Adform.*

### 1.5 What is MCP?

MCP (Model Context Protocol) is Anthropic's open standard for connecting AI assistants to external tools and data sources. AdCP is built on MCP, meaning any AI assistant that supports MCP can interact with AdCP-compliant platforms.

## 2. Product Summary

*A demonstration system consisting of (1) a web dashboard frontend with AI chat interface, and (2) an MCP backend simulating an AdCP-compliant sales agent. This allows Tim to show Adform executives the full Discover → Monitor → Optimise lifecycle through natural language.*

<table>
  <thead>
    <tr>
        <th>Product Type</th>
        <th>Demo/Proof of Concept (Frontend + Backend)</th>
    </tr>
    <tr>
        <th>Purpose</th>
        <th>Executive demonstration for Adform partnership meeting</th>
    </tr>
    <tr>
        <th>Demo User</th>
        <th>Tim (Signal42 co-founder) presenting to Adform executives</th>
    </tr>
    <tr>
        <th>Key Message</th>
        <th>This is how your clients will interact with Adform in the AI era</th>
    </tr>
    <tr>
        <th>Uses AITWO OS?</th>
        <th>No - standalone demo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Attribute</td>
        <td>Detail</td>
    </tr>
  </tbody>
</table>

## 3. System Architecture

### 3.1 Components

<table>
  <thead>
    <tr>
        <th>1. Frontend Dashboard</th>
        <th>React/Next.js or similar</th>
        <th>Web UI with AI chat interface</th>
    </tr>
    <tr>
        <th>2. MCP Server</th>
        <th>Node.js/TypeScript or Python</th>
        <th>Backend exposing 7 AdCP tools</th>
    </tr>
    <tr>
        <th>3. Data Layer</th>
        <th>SQLite or JSON files</th>
        <th>Mock advertising data (provided)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Component</td>
        <td>Technology</td>
        <td>Purpose</td>
    </tr>
  </tbody>
</table>

### 3.2 Data Flow

User (Tim) → Frontend Chat → Claude API → MCP Server Tools → Mock Data → Response in Chat

# 4. Frontend Dashboard Requirements

## 4.1 Core UI Components

<table>
  <thead>
    <tr>
        <th>Component</th>
        <th>Requirements</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Component</td>
        <td>Requirements</td>
    </tr>
    <tr>
        <td>Chat Interface</td>
        <td>Primary interaction. Text input, message history, typing indicators. Clean, professional.</td>
    </tr>
    <tr>
        <td>Response Display</td>
        <td>Render AI responses with tables, lists, metrics. Markdown support preferred.</td>
    </tr>
    <tr>
        <td>Loading States</td>
        <td>Visual feedback while Claude processes. Typing animation or spinner.</td>
    </tr>
  </tbody>
</table>

## 4.2 Design & Claude API

<table>
  <thead>
    <tr>
        <th>Requirement</th>
        <th>Detail</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Requirement</td>
        <td>Detail</td>
    </tr>
    <tr>
        <td>Appearance</td>
        <td>Professional, modern dashboard. Executive demo - must look polished.</td>
    </tr>
    <tr>
        <td>Branding</td>
        <td>Neutral/generic or subtle Signal42. NOT Adform branded.</td>
    </tr>
    <tr>
        <td>Claude API</td>
        <td>Integrate with Anthropic API. We provide the API key.</td>
    </tr>
    <tr>
        <td>Tool Calling</td>
        <td>Claude calls the 7 backend tools based on natural language queries.</td>
    </tr>
  </tbody>
</table>

# 5. Backend / MCP Server Requirements

## 5.1 AdCP Tools to Implement (7 Tools)
Note: AdCP uses "media buy" not "campaign".

<table>
  <thead>
    <tr>
        <th>#</th>
        <th></th>
        <th>Tool Name</th>
        <th>Purpose</th>
        <th>Demo Phase</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>1</td>
        <td>get_products</td>
        <td>Discover available inventory</td>
        <td>DISCOVER</td>
        <td></td>
    </tr>
    <tr>
        <td>2</td>
        <td>list_creative_formats</td>
        <td>Get available ad format specs</td>
        <td>DISCOVER</td>
        <td></td>
    </tr>
    <tr>
        <td>3</td>
        <td>list_authorized_properties</td>
        <td>Get accessible publishers</td>
        <td>DISCOVER</td>
        <td></td>
    </tr>
    <tr>
        <td>4</td>
        <td>create_media_buy</td>
        <td>Launch a new campaign</td>
        <td>DISCOVER → BUY</td>
        <td></td>
    </tr>
    <tr>
        <td>5</td>
        <td>get_media_buy_delivery</td>
        <td>Get performance metrics</td>
        <td>MONITOR</td>
        <td></td>
    </tr>
    <tr>
        <td>6</td>
        <td>update_media_buy</td>
        <td>Modify existing campaign</td>
        <td>OPTIMISE</td>
        <td></td>
    </tr>
    <tr>
        <td>7</td>
        <td>provide_performance_feedback</td>
        <td>Submit conversion data</td>
        <td>OPTIMISE</td>
        <td></td>
    </tr>
  </tbody>
</table>

# 6. Demo Flow: Discover → Monitor → Optimise

The demo follows three clear phases showing the full campaign lifecycle:

## 6.1 DISCOVER - Finding the Right Inventory
*"I have a campaign coming up - what inventory options do I have?"*

<table>
  <thead>
    <tr>
        <th>Tim Might Ask</th>
        <th></th>
        <th>Expected Response</th>
        <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>What sports inventory do you have?</td>
        <td>ESPN ($18-35), Sports Illustrated ($15-20), Bleacher Report ($12-18)</td>
        <td colspan="2"></td>
    </tr>
    <tr>
        <td>Find inventory under $20 CPM</td>
        <td>Weather.com ($8-12), SI ($15-20), Bleacher ($12-18)</td>
        <td colspan="2"></td>
    </tr>
    <tr>
        <td>What's good for reaching tech executives?</td>
        <td>TechCrunch ($35-45), Forbes Executive ($38)</td>
        <td colspan="2"></td>
    </tr>
    <tr>
        <td>What video formats do you support?</td>
        <td>Pre-roll 15s/30s, outstream, CTV 30s</td>
        <td colspan="2"></td>
    </tr>
    <tr>
        <td>What publishers can I access?</td>
        <td>10 properties: ESPN, CNN, Weather, TechCrunch...</td>
        <td colspan="2"></td>
    </tr>
    <tr>
        <td>Which properties have premium deals?</td>
        <td>ESPN 15% discount, TechCrunch 12%, Forbes 8%</td>
        <td colspan="2"></td>
    </tr>
    <tr>
        <td>What's the minimum budget for NYT?</td>
        <td>$15K for ROS, $25K for Section Sponsorship</td>
        <td colspan="2"></td>
    </tr>
    <tr>
        <td>Launch a $5K test campaign on ESPN</td>
        <td>Created: media_buy_id mb_20260130_001, status: submitted</td>
        <td colspan="2"></td>
    </tr>
  </tbody>
</table>

## 6.2 MONITOR - Checking Live Performance
*"How are my campaigns performing right now?"*

<table>
  <thead>
    <tr>
        <th>Tim Might Ask</th>
        <th></th>
        <th>Expected Response</th>
        <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Show me all active campaigns</td>
        <td>5 campaigns: Apex, TechFlow, SportMax, FinanceFirst, GreenEnergy</td>
        <td colspan="2"></td>
    </tr>
    <tr>
        <td>What's our total spend this month?</td>
        <td>$127,450 across 5 campaigns, $42,550 remaining</td>
        <td colspan="2"></td>
    </tr>
    <tr>
        <td>How are we pacing against budgets?</td>
        <td>3 on track, 1 warning (TechFlow), 1 poor (Apex)</td>
        <td colspan="2"></td>
    </tr>
  </tbody>
</table>

<table>
  <tbody>
    <tr>
        <td>Which campaigns are underperforming?</td>
        <td>Apex Motors: CTR 0.12% vs 0.35% target</td>
    </tr>
    <tr>
        <td>How is Apex Motors performing?</td>
        <td>$32,450 spent, 3.85M impressions, 0.12% CTR, 0.68 viewability</td>
    </tr>
    <tr>
        <td>Break down Apex by device</td>
        <td>Mobile: 0.08% CTR, Desktop: 0.18% CTR</td>
    </tr>
    <tr>
        <td>Show me performance by geo</td>
        <td>US: 0.14% CTR, UK: 0.14%, Germany: 0.04%</td>
    </tr>
    <tr>
        <td>What's our best performing campaign?</td>
        <td>TechFlow: 0.60% CTR, beating target</td>
    </tr>
  </tbody>
</table>

## 6.3 OPTIMISE - Taking Action on Insights
*"Something's not working - help me fix it."*

<table>
  <thead>
    <tr>
        <th>Tim Might Ask</th>
        <th>Expected Response</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Why is Apex Motors struggling?</td>
        <td>Mobile CTR 0.08% vs desktop 0.18%; Germany at 0.04%</td>
    </tr>
    <tr>
        <td>What optimisations would you recommend?</td>
        <td>1. Reduce mobile bid 20%, 2. Pause Germany, 3. Shift budget to desktop</td>
    </tr>
    <tr>
        <td>Reduce Apex mobile bid by 20%</td>
        <td>Done: Mobile bid reduced $8.50 → $6.80</td>
    </tr>
    <tr>
        <td>Pause Germany targeting</td>
        <td>Done: Germany removed, est. savings $6,490</td>
    </tr>
    <tr>
        <td>Shift 20% budget from mobile to desktop</td>
        <td>Done: Desktop allocation increased to 60%</td>
    </tr>
    <tr>
        <td>TechFlow is overspending - cap the daily budget</td>
        <td>Done: Daily cap set to $568</td>
    </tr>
    <tr>
        <td>Submit our conversion data for Apex</td>
        <td>Feedback submitted: 25 conversions, $125K value</td>
    </tr>
  </tbody>
</table>

# 7. Mock Data Summary

We provide comprehensive JSON files. Publishers are real; advertisers are fictional:

<table>
  <thead>
    <tr>
        <th>Products</th>
        <th>10</th>
        <th>ESPN, CNN, Weather, TechCrunch, SI, Bleacher, Forbes, Auto News, Spotify, NYT</th>
    </tr>
    <tr>
        <th>Media Buys</th>
        <th>5</th>
        <th>Apex Motors (poor), TechFlow (warning), SportMax, FinanceFirst, GreenEnergy</th>
    </tr>
    <tr>
        <th>Creative Formats</th>
        <th>14</th>
        <th>Display (6), Video (5), Native (2), Audio (1), Rich Media (1)</th>
    </tr>
    <tr>
        <th>Properties</th>
        <th>10</th>
        <th>With reach, formats, deals, audience segments</th>
    </tr>
    <tr>
        <th>Delivery Metrics</th>
        <th>5</th>
        <th>Full breakdowns by device, geo, format, creative</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Data Type</td>
        <td>Count</td>
        <td>Details</td>
    </tr>
  </tbody>
</table>

Metrics: impressions, clicks, CTR, CPM, CPC, CPA, viewability, completion_rate, reach, frequency, conversions - with breakdowns by device, geo, format, creative, audience, and time.

# 8. Acceptance Criteria

<table>
  <thead>
    <tr>
        <th>1</th>
        <th>Frontend loads and chat interface works</th>
        <th>Type query, see response</th>
    </tr>
    <tr>
        <th>2</th>
        <th>All 7 tools return valid responses</th>
        <th>Test each tool type</th>
    </tr>
    <tr>
        <th>3</th>
        <th>DISCOVER phase works (inventory queries)</th>
        <th>Ask about products, formats, properties</th>
    </tr>
    <tr>
        <th>4</th>
        <th>MONITOR phase works (performance queries)</th>
        <th>Ask about campaigns, metrics, breakdowns</th>
    </tr>
    <tr>
        <th>5</th>
        <th>OPTIMISE phase works (updates persist)</th>
        <th>Change bid, verify it changed</th>
    </tr>
    <tr>
        <th>6</th>
        <th>Response times under 3 seconds</th>
        <th>No lag during demo</th>
    </tr>
    <tr>
        <th>7</th>
        <th>Professional appearance</th>
        <th>Visual review</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>#</td>
        <td>Criteria</td>
        <td>Test</td>
    </tr>
  </tbody>
</table>

# 9. Out of Scope

<table>
  <thead>
    <tr>
        <th>Real ad platform integrations</th>
        <th>Demo uses mock data only</th>
    </tr>
    <tr>
        <th>User authentication</th>
        <th>Demo runs locally, single user</th>
    </tr>
    <tr>
        <th>Memory between sessions</th>
        <th>Excluded per Tim's request</th>
    </tr>
    <tr>
        <th>Creative upload tools</th>
        <th>Focus on media buying lifecycle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Exclusion</td>
        <td>Rationale</td>
    </tr>
  </tbody>
</table>

# 10. Deliverables

<table>
  <thead>
    <tr>
        <th>1</th>
        <th>Frontend Application</th>
        <th>Dashboard with AI chat interface, professional design</th>
    </tr>
    <tr>
        <th>2</th>
        <th>Backend Server</th>
        <th>MCP/API server with all 7 tools</th>
    </tr>
    <tr>
        <th>3</th>
        <th>Data Layer</th>
        <th>Mock data loaded and queryable</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>#</td>
        <td>Deliverable</td>
        <td>Description</td>
    </tr>
  </tbody>
</table>

<table>
  <tbody>
    <tr>
        <td>4</td>
        <td>Setup Instructions</td>
        <td>README for Mac setup</td>
    </tr>
    <tr>
        <td>5</td>
        <td>Demo Verification</td>
        <td>Screenshot/video of working demo</td>
    </tr>
  </tbody>
</table>

## 11. References & Communication

Claude API: https://docs.anthropic.com
AdCP Docs: https://docs.adcontextprotocol.org
MCP Docs: https://modelcontextprotocol.io

<table>
  <thead>
    <tr>
        <th>Primary Contact</th>
        <th>Jason Liew (jasonliew@signal42.uk)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>Item</td>
        <td>Detail</td>
    </tr>
    <tr>
        <td>Timeline</td>
        <td>1-1.5 days</td>
    </tr>
    <tr>
        <td>Mock Data</td>
        <td>Provided as JSON with this PRD</td>
    </tr>
    <tr>
        <td>API Key</td>
        <td>Anthropic key provided separately</td>
    </tr>
  </tbody>
</table>


*S42 Labs — Signal42 Group — PRD v4.0*