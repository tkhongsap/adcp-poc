# PRD: Multi-Agent Notifications & Live Dashboard Updates

**Version:** 1.0
**Date:** 2026-02-02
**Status:** Draft
**Source Spec:** `docs/02-adcp_notification_agents_spec_v2.md`

---

## 1. Introduction/Overview

This feature adds two notification agents to the AdCP Demo that trigger automatically when campaign optimizations are made via the chat interface. The notifications are **real integrations** - Slack messages actually post to a channel, and emails actually send when confirmed.

Additionally, the dashboard will visually reflect campaign changes in real-time, showing the AI actually modifying data rather than just reporting it did.

### Problem Statement

Currently, when Tim demonstrates the AdCP platform:
- Campaign optimizations happen via chat, but there's no visible proof of changes
- No external notifications are sent to team members or clients
- The demo lacks the "wow factor" of seeing AI actions reflected in real systems

### Solution

1. **Live Dashboard Updates** - Campaign changes appear instantly with visual feedback
2. **Slack Agent** - Automatically posts to a team channel when changes are made
3. **Email Agent** - Generates draft emails to clients, sent on user confirmation

---

## 2. Goals

| # | Goal | Metric |
|---|------|--------|
| G1 | Real-time dashboard updates | Changes visible within 500ms of optimization |
| G2 | Automated Slack notifications | 100% of `update_media_buy` calls trigger Slack post |
| G3 | Client email workflow | Draft generated for every optimization, sendable in 1 click |
| G4 | Demo-ready experience | Complete flow demonstrable in under 2 minutes |
| G5 | Zero manual refresh | Dashboard auto-updates without page reload |

---

## 3. User Stories

### US1: Live Dashboard Updates
**As** Tim (demo presenter),
**I want** the dashboard to update automatically when I make campaign changes via chat,
**So that** I can show prospects the AI is actually doing something, not just saying it did.

**Acceptance Criteria:**
- Campaign details panel shows current targeting, budget, status, bids
- Changes made via chat reflect immediately (no manual refresh)
- Changed fields highlight briefly to draw attention
- Works for: geo changes, status changes, budget changes, bid adjustments

### US2: Slack Notification Agent
**As** Tim,
**I want** Slack messages to post automatically when optimizations are made,
**So that** I can demonstrate real team communication workflows.

**Acceptance Criteria:**
- Message posts to configured channel immediately after `update_media_buy`
- Message includes: what changed, why, campaign name, timestamp
- UI shows "Slack notification sent" confirmation
- Read-only queries do NOT trigger notifications

### US3: Client Email Agent
**As** Tim,
**I want** to generate and send professional client emails about campaign changes,
**So that** I can demonstrate client communication workflows.

**Acceptance Criteria:**
- Email draft appears in UI after optimization
- Draft includes: brand name, what changed, expected impact
- "Send Email" button actually delivers the email
- Confirmation shown after successful send
- Email arrives in real inbox (not spam)

### US4: Demo Scenario Execution
**As** Tim,
**I want** to execute a complete demo scenario in one flow,
**So that** prospects see the full power of the platform.

**Demo Flow:**
1. Open dashboard showing Apex Motors campaign
2. Say: "Remove Germany targeting from Apex Motors"
3. See: Chat confirms, dashboard updates (DE removed), Slack posts, email draft appears
4. Click: "Send Email" → email arrives in inbox
5. Check: Slack channel shows the message

---

## 4. Functional Requirements

### 4.1 Campaign Details Panel

| # | Requirement |
|---|-------------|
| FR1.1 | Add Campaign Details panel to right side of chat interface |
| FR1.2 | Panel displays: Campaign Name, Status, Budget, Spend, Pacing, Geo Targeting, Device Targeting, Current Bids |
| FR1.3 | Panel auto-selects campaign context from chat conversation |
| FR1.4 | Panel refreshes automatically when `update_media_buy` succeeds (via WebSocket) |
| FR1.5 | Changed fields show visual highlight animation (300-500ms fade) |
| FR1.6 | Panel is collapsible/resizable to not obstruct chat |

**Data Fields:**

| Field | Source | Updates On |
|-------|--------|------------|
| Campaign Name | `brand_manifest.name` | - |
| Status | `status` | `set_status` operation |
| Total Budget | `packages[].budget` sum | Budget changes |
| Spend to Date | `delivery_metrics.total_spend` | - |
| Pacing | `delivery_metrics.pacing` | - |
| Geo Targeting | `packages[].targeting_overlay.geo_country_any_of` | `add_geo`, `remove_geo` |
| Device Targeting | `packages[].targeting_overlay.device_type` | Device changes |
| Current Bids | `delivery_metrics.current_bids` | `adjust_bid` |

### 4.2 Slack Notification Agent

| # | Requirement |
|---|-------------|
| FR2.1 | Trigger Slack notification on every successful `update_media_buy` call |
| FR2.2 | POST message to configured webhook URL (env variable) |
| FR2.3 | Message format uses Slack Block Kit (sections, dividers, context) |
| FR2.4 | Message includes: greeting, what changed, why, campaign name, timestamp, dashboard link |
| FR2.5 | UI shows "Slack notification sent to #channel-name" confirmation |
| FR2.6 | DO NOT trigger on read-only operations (`get_media_buy_delivery`, etc.) |
| FR2.7 | Handle webhook failures gracefully (log error, don't break main flow) |

**Slack Message Structure:**
```
Hey team 👋

Just made some changes to the *{Campaign Name}* campaign you should know about:

────────────────────────────
What changed:
• {Change description}

Why:
• {Reason from recommendations or user request}

Campaign: {Name}          Updated: {Timestamp}
────────────────────────────

📊 View in Dashboard • Made by AdCP Sales Agent
```

### 4.3 Client Email Agent

| # | Requirement |
|---|-------------|
| FR3.1 | Generate email draft on every successful `update_media_buy` call |
| FR3.2 | Display email preview in expandable panel below chat |
| FR3.3 | Email includes: recipient, subject, formatted body with change details |
| FR3.4 | "Send Email" button triggers actual email delivery via Resend API |
| FR3.5 | Show loading state while sending |
| FR3.6 | Show "Email sent to {address}" confirmation on success |
| FR3.7 | Show error message if send fails |
| FR3.8 | Email recipient configurable via env variable (safety for demo) |
| FR3.9 | Sender address: `adcp-agent@{configured-domain}` |

**Email Template:**
```
Subject: Campaign Update: {Brand Name} - {Change Type}

Hi {Client},

We've made the following optimisation to your {Brand Name} campaign:

CHANGE SUMMARY
─────────────────────────────────
• {What was changed}
• {Previous value} → {New value}
• Reason: {From recommendations or user request}

EXPECTED IMPACT
─────────────────────────────────
• {Brief statement on expected improvement}

We'll continue monitoring performance and recommend further adjustments as needed.

Best regards,
AdCP Account Team

---
This update was made via AdCP Sales Agent
{Timestamp}
```

### 4.4 Integration Flow

| # | Requirement |
|---|-------------|
| FR4.1 | All three features trigger from single `update_media_buy` success |
| FR4.2 | Execution order: 1) Update data, 2) Broadcast WebSocket, 3) Post Slack, 4) Generate email draft |
| FR4.3 | Slack posts automatically (no user action required) |
| FR4.4 | Email requires user confirmation to send |
| FR4.5 | Failures in Slack/Email do not affect dashboard update |

---

## 5. Non-Goals (Out of Scope)

| # | Explicitly Excluded |
|---|---------------------|
| NG1 | Email editing capability before sending (nice-to-have for future) |
| NG2 | Multiple Slack channels / channel selection |
| NG3 | Email to actual clients (demo uses hardcoded recipient) |
| NG4 | Notification preferences / settings UI |
| NG5 | Notification history / log viewing |
| NG6 | Slack Bot with slash commands (webhook only) |
| NG7 | Email attachments or rich HTML formatting |
| NG8 | Batching multiple changes into single notification |

---

## 6. Design Considerations

### 6.1 UI Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Sidebar  │        Chat Interface          │   Campaign Details Panel   │
│           │                                │                            │
│  [Convos] │  User: Remove Germany from     │  ┌─────────────────────┐   │
│           │        Apex Motors             │  │ APEX MOTORS Q1      │   │
│           │                                │  │ Status: ● Active    │   │
│           │  Agent: Done. Germany removed  │  │ Budget: $50,000     │   │
│           │         from Apex Motors.      │  │ Spend:  $32,450     │   │
│           │                                │  │ Pacing: Behind      │   │
│           │  ┌─────────────────────────┐   │  ├─────────────────────┤   │
│           │  │ 📧 Email Draft          │   │  │ Geo: US, UK         │   │
│           │  │ To: tim@signal42.uk     │   │  │ Device: Mobile, Desk│   │
│           │  │ Subject: Campaign Update│   │  │ Mobile Bid: $8.50   │   │
│           │  │ [Preview...]            │   │  └─────────────────────┘   │
│           │  │ [Send Email] [Dismiss]  │   │                            │
│           │  └─────────────────────────┘   │  Recently Changed: ✨      │
│           │                                │  • Geo targeting updated   │
│           │  ✓ Slack sent to #adcp-demo    │                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Visual Feedback

- **Changed fields**: Yellow/gold highlight that fades over 400ms
- **Slack confirmation**: Green checkmark with channel name
- **Email panel**: Expandable card with preview, prominent Send button
- **Loading states**: Spinner on Send button while email delivers

### 6.3 Component Structure

```
MainContainer (existing)
├── ChatSidebar (existing)
├── ConversationView (existing)
│   └── NotificationCards (NEW)
│       ├── EmailDraftCard
│       └── SlackConfirmation
├── MessageInput (existing)
└── CampaignDetailsPanel (NEW)
    ├── CampaignHeader
    ├── BudgetSection
    ├── TargetingSection
    └── BidsSection
```

---

## 7. Technical Considerations

### 7.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ Chat UI      │  │ Campaign     │  │ Notification Cards │     │
│  │              │  │ Details Panel│  │ (Email/Slack)      │     │
│  └──────────────┘  └──────────────┘  └────────────────────┘     │
│         │                 │                    │                 │
│         └─────────────────┼────────────────────┘                 │
│                           │ WebSocket                            │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                         Backend (Express)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ Chat Routes  │  │ Tool:        │  │ Notification       │     │
│  │ /api/chat    │→ │ update_      │→ │ Service            │     │
│  │              │  │ media_buy    │  │                    │     │
│  └──────────────┘  └──────────────┘  └────────────────────┘     │
│                                              │                   │
│                           ┌──────────────────┼──────────────┐   │
│                           │                  │              │   │
│                           ▼                  ▼              ▼   │
│                    ┌──────────┐      ┌──────────┐   ┌──────────┐│
│                    │ WebSocket│      │ Slack    │   │ Resend   ││
│                    │ Broadcast│      │ Webhook  │   │ API      ││
│                    └──────────┘      └──────────┘   └──────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Key Files to Modify

**Backend:**
| File | Changes |
|------|---------|
| `src/backend/src/tools/updateMediaBuy.ts` | Add notification trigger after successful update |
| `src/backend/src/services/notificationService.ts` | NEW: Orchestrate Slack + Email |
| `src/backend/src/services/slackService.ts` | NEW: Slack webhook integration |
| `src/backend/src/services/emailService.ts` | NEW: Resend API integration |
| `src/backend/src/routes/notifications.ts` | NEW: Email send endpoint |
| `src/backend/src/websocket/socket.ts` | Add notification payload to broadcasts |

**Frontend:**
| File | Changes |
|------|---------|
| `src/frontend/src/components/chat/MainContainer.tsx` | Add CampaignDetailsPanel, handle notifications |
| `src/frontend/src/components/chat/CampaignDetailsPanel.tsx` | NEW: Campaign details display |
| `src/frontend/src/components/chat/EmailDraftCard.tsx` | NEW: Email preview + send |
| `src/frontend/src/components/chat/SlackConfirmation.tsx` | NEW: Slack sent indicator |
| `src/frontend/src/hooks/useWebSocket.ts` | Handle notification payloads |

### 7.3 Environment Variables

```bash
# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=adcp-agent@yourdomain.com
DEMO_EMAIL_RECIPIENT=tim@signal42.uk

# Slack (provide both options - let Replit choose)
# Option A: Incoming Webhook (Recommended - simpler)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00/B00/xxx

# Option B: Bot Token (more flexible)
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxx
SLACK_CHANNEL_ID=C0123456789
```

### 7.4 API Endpoints

**New Endpoints:**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/notifications/send-email` | Send the drafted email |
| GET | `/api/notifications/draft/:mediaBuyId` | Get current email draft |

### 7.5 Replit Integration Notes

- All API keys stored as Replit Secrets (env vars)
- Services must handle missing credentials gracefully (skip notification, log warning)
- Consider Replit's outbound request limits for webhooks
- Use Replit's built-in preview URL for dashboard link in Slack messages

### 7.6 Dependencies to Add

```json
{
  "resend": "^3.0.0"
}
```
No additional dependencies for Slack (native fetch to webhook).

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard update latency | < 500ms | Time from tool success to UI update |
| Slack delivery rate | 100% | Successful posts / total triggers |
| Email delivery rate | > 95% | Emails delivered / emails sent |
| Demo completion | < 2 min | Time from first command to email received |
| Zero manual refresh | 100% | All updates via WebSocket |

---

## 9. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| Q1 | Which Slack approach does Replit prefer - Webhook or Bot? | Replit | Open |
| Q2 | What domain will be used for sender email verification? | Tim | Open |
| Q3 | Should "Edit email before send" be added in v1 or deferred? | Tim | Deferred |
| Q4 | Specific demo recipient email address? | Tim | Open |
| Q5 | Slack channel name for demo? | Tim | Open |

---

## 10. Implementation Checklist

### Phase 1: Campaign Details Panel
- [ ] Create `CampaignDetailsPanel` component
- [ ] Integrate into `MainContainer` layout (right side)
- [ ] Wire up WebSocket listener for `media_buy_updated` events
- [ ] Add highlight animation on changed fields
- [ ] Test with all `update_media_buy` operations

### Phase 2: Slack Integration
- [ ] Create `slackService.ts` with webhook POST function
- [ ] Create message formatter using Block Kit
- [ ] Add trigger in `updateMediaBuy.ts` tool
- [ ] Add `SlackConfirmation` component to chat UI
- [ ] Test end-to-end with real Slack workspace

### Phase 3: Email Integration
- [ ] Set up Resend account and verify domain
- [ ] Create `emailService.ts` with Resend SDK
- [ ] Create email template formatter
- [ ] Add `/api/notifications/send-email` endpoint
- [ ] Create `EmailDraftCard` component
- [ ] Wire up Send button to API
- [ ] Test end-to-end with real email delivery

### Phase 4: Integration Testing
- [ ] Test complete demo flow (command → dashboard → Slack → email)
- [ ] Test error handling (Slack down, email fails)
- [ ] Test with missing env vars (graceful degradation)
- [ ] Performance testing (latency targets)

---

## Appendix A: Slack Message JSON

```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Hey team 👋\n\nJust made some changes to the *Apex Motors* campaign you should know about:"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*What changed:*\n• Germany removed from geo targeting\n\n*Why:*\n• Germany CTR (0.04%) significantly underperforming other markets"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Campaign:*\nApex Motors Q1"
        },
        {
          "type": "mrkdwn",
          "text": "*Updated:*\n2 Feb 2026, 10:32"
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "📊 <https://adcp-demo.replit.app|View in Dashboard> • Made by AdCP Sales Agent"
        }
      ]
    }
  ]
}
```

---

## Appendix B: Email HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
    .section-title { color: #0066cc; font-weight: bold; margin-top: 20px; }
    .divider { border-top: 1px solid #ddd; margin: 15px 0; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Campaign Update: {{brand_name}}</h2>
  </div>

  <p>Hi {{client_name}},</p>

  <p>We've made the following optimisation to your {{brand_name}} campaign:</p>

  <div class="section-title">CHANGE SUMMARY</div>
  <div class="divider"></div>
  <ul>
    <li>{{change_description}}</li>
    <li>{{previous_value}} → {{new_value}}</li>
    <li>Reason: {{reason}}</li>
  </ul>

  <div class="section-title">EXPECTED IMPACT</div>
  <div class="divider"></div>
  <p>{{expected_impact}}</p>

  <p>We'll continue monitoring performance and recommend further adjustments as needed.</p>

  <p>Best regards,<br>AdCP Account Team</p>

  <div class="footer">
    <div class="divider"></div>
    <p>This update was made via AdCP Sales Agent<br>{{timestamp}}</p>
  </div>
</body>
</html>
```
