# AdCP Demo - Enhancement Request: Multi-Agent Notifications

## Overview

Add two notification agents that trigger automatically when campaign optimisations are made. These are **real integrations** - Slack messages actually post, emails actually send when confirmed.

**Additionally:** The dashboard must visually reflect changes in real-time so the demo shows the AI actually modifying campaign data.

---

## NEW: Live Dashboard Updates

### Requirement

When an optimisation is made via chat, the dashboard UI must **visibly update** to reflect the change. This is critical for the demo - Tim needs to show the AI actually doing something, not just saying it did.

### Demo Flow Example

1. **Tim opens dashboard** - Shows Apex Motors campaign with:
   - Status: Active
   - Budget: $50,000
   - Spend: $32,450
   - Targeting: US, UK, DE
   - Mobile bid: $8.50 CPM

2. **Tim says:** "Remove Germany targeting from Apex Motors"

3. **Chat responds:** "Done. Germany has been removed from targeting for Apex Motors."

4. **Dashboard updates in real-time:**
   - Targeting now shows: US, UK ~~DE~~ (DE is gone)
   - Visual indicator of change (brief highlight/animation)

5. **Slack notification posts** to #adcp-demo

6. **Email draft appears** ready to send

### Campaign Details Panel Required

The dashboard needs a visible panel/section showing campaign details that can update. Must include:

| Field | Example | Updates When |
|-------|---------|--------------|
| Campaign Name | Apex Motors Q1 | - |
| Status | Active / Paused | Status change |
| Total Budget | $50,000 | Budget change |
| Spend to Date | $32,450 | - |
| Pacing | Behind / On Track | - |
| **Geo Targeting** | US, UK, DE | Geo added/removed |
| **Device Targeting** | Mobile, Desktop | Device changes |

### UI Behaviour

- **Auto-refresh** after `update_media_buy` succeeds
- **Visual feedback** - Brief highlight or animation on changed fields
- **No manual refresh needed** - Changes appear automatically

### Suggested Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Chat Interface                    │  Campaign Details          │
│                                    │                            │
│  User: Remove Germany from Apex    │  APEX MOTORS Q1            │
│                                    │  Status: Active            │
│  Agent: Done. Germany removed...   │  Budget: $50,000           │
│                                    │  Spend: $32,450            │
│  [Email Draft] [Slack ✓]           │                            │
│                                    │  Targeting:                │
│                                    │  ├─ Geo: US, UK            │
│                                    │  └─ Device: Mobile, Desktop│
│                                    │                            │
└─────────────────────────────────────────────────────────────────┘
```

### Demo Scenarios That Show Visible Changes

| Tim Says | What Changes in Dashboard |
|----------|---------------------------|
| "Remove Germany targeting from Apex Motors" | Geo: US, UK, ~~DE~~ → US, UK |
| "Pause the Apex Motors campaign" | Status: Active → Paused |
| "Increase budget to $60,000" | Budget: $50,000 → $60,000 |
| "Add tablet to device targeting" | Device: Mobile, Desktop → Mobile, Desktop, Tablet |

---

## Agent 1: Client Email (Real - Gmail/SMTP)

### Trigger
Any successful call to `update_media_buy`

### Behaviour
1. Draft a professional client-facing email
2. Display in UI for review
3. **"Send" button** - when clicked, actually sends the email
4. **"Edit" option** - allow tweaks before sending (nice to have)

### Integration Options

**Option A: Gmail API (Recommended)**
- Use OAuth to connect to a demo Gmail account
- Can save to drafts OR send directly
- Professional, shows in "Sent" folder
- Requires: Google Cloud project, OAuth consent screen

**Option B: SendGrid / Resend / Postmark**
- Transactional email API
- Simpler integration (just API key)
- Sends from a configured email address
- Requires: Account setup, verified sender domain

**Option C: SMTP**
- Direct SMTP connection
- Works with any email provider
- Requires: SMTP credentials

**Recommendation:** SendGrid or Resend - quickest to implement, reliable delivery.

### Email Details

```
From: adcp-agent@signal42.uk (or similar branded address)
To: [Configurable - for demo, use Tim's email or a test recipient]
Subject: Campaign Update: [Brand Name] - [Change Type]

[Email body as per template below]
```

### Email Template

```
Hi [Client],

We've made the following optimisation to your [Brand Name] campaign:

CHANGE SUMMARY
─────────────────────────────────
• [What was changed]
• [Previous value] → [New value]
• Reason: [Pulled from recommendations]

EXPECTED IMPACT
─────────────────────────────────
• [Brief statement on expected improvement]

We'll continue monitoring performance and recommend further adjustments as needed.

Best regards,
AdCP Account Team

---
This update was made via AdCP Sales Agent
[Timestamp]
```

### UI Requirements
- Show email preview in expandable panel
- "Send Email" button (prominent)
- "Edit" button (optional - nice to have)
- After sending: Show "✓ Email sent to [address]" confirmation
- Loading state while sending

### Environment Variables Needed
```
# If using SendGrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=adcp-agent@signal42.uk

# If using Gmail API
GMAIL_CLIENT_ID=xxxxx
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REFRESH_TOKEN=xxxxx

# Demo recipient (for safety)
DEMO_EMAIL_RECIPIENT=tim@signal42.uk
```

---

## Agent 2: Internal Slack (Real - Slack API)

### Trigger
Same as email - any successful `update_media_buy`

### Behaviour
1. Generate Slack message
2. **Automatically post** to configured channel
3. Show confirmation in UI

### Integration: Slack Webhook or Bot

**Option A: Incoming Webhook (Simplest)**
- Create webhook URL for a specific channel
- Just POST JSON to the webhook
- No OAuth needed
- Limited to one channel

**Option B: Slack Bot (More Flexible)**
- Create Slack app with bot token
- Can post to any channel
- Can mention users
- More setup but more powerful

**Recommendation:** Incoming Webhook for speed. Can upgrade to bot later if needed.

### Slack Setup Steps
1. Go to https://api.slack.com/apps
2. Create New App → From scratch
3. App name: "AdCP Agent" 
4. Select Tim's workspace
5. Go to "Incoming Webhooks" → Enable
6. "Add New Webhook to Workspace"
7. Select channel (e.g., #adcp-demo or #account-updates)
8. Copy webhook URL

### Slack Message Format

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
        "text": "*What changed:*\n• Mobile bid reduced by 20% ($8.50 → $6.80 CPM)\n\n*Why:*\n• Mobile CTR (0.08%) was significantly underperforming desktop (0.18%)\n• This should improve overall campaign efficiency"
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
          "text": "*Updated:*\n31 Jan 2026, 14:32"
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
          "text": "📊 <https://adcp-demo.tkhongsap.io|View in Dashboard> • Made by AdCP Sales Agent"
        }
      ]
    }
  ]
}
```

### Example: How it appears in Slack

```
Hey team 👋

Just made some changes to the Apex Motors campaign you should know about:

────────────────────────────

What changed:
• Mobile bid reduced by 20% ($8.50 → $6.80 CPM)

Why:
• Mobile CTR (0.08%) was significantly underperforming desktop (0.18%)
• This should improve overall campaign efficiency

Campaign: Apex Motors Q1          Updated: 31 Jan 2026, 14:32

────────────────────────────

📊 View in Dashboard • Made by AdCP Sales Agent
```
```

### UI Requirements
- Show "Slack notification sent" confirmation in chat/panel
- Include link to the Slack message or channel
- Show the message content that was posted

### Environment Variables Needed
```
SLACK_WEBHOOK_URL=your-slack-webhook-url-here
SLACK_CHANNEL_NAME=#adcp-demo
```

---

## Demo Flow

**Tim says:** "Reduce Apex Motors mobile bid by 20%"

**System response:**

1. **Chat:** "Done. Mobile bid reduced from $8.50 to $6.80 CPM."

2. **Email Panel:**
   ```
   📧 Draft Email to Client
   
   [Email preview shown]
   
   [Send Email] [Edit]
   ```

3. **Slack Panel:**
   ```
   ✓ Slack notification sent to #adcp-demo
   
   [Preview of message]
   ```

**Tim clicks "Send Email"** → Email actually arrives in inbox

**Tim switches to Slack** → Message is there in real-time

---

## Security Considerations

### For Demo Safety
- **Email:** Hardcode recipient to Tim's email (or a test address) so demo doesn't accidentally email real clients
- **Slack:** Use a dedicated demo channel, not a production channel

### Environment Variables
- Store all API keys/webhooks in `.env`
- Don't commit to repo
- Provide Tim with secure way to configure for his accounts

---

## Implementation Checklist

### Campaign Details Panel (2-3 hours)
- [ ] Add Campaign Details panel to dashboard layout
- [ ] Display: status, budget, spend, geo targeting, device targeting, bids
- [ ] Auto-refresh panel after `update_media_buy` succeeds
- [ ] Add visual highlight/animation on changed fields

### Slack (2-3 hours)
- [ ] Create Slack app in Tim's workspace
- [ ] Enable Incoming Webhooks
- [ ] Add webhook to demo channel
- [ ] Add webhook URL to environment variables
- [ ] Implement POST to webhook on `update_media_buy` success
- [ ] Show confirmation in UI

### Email (3-4 hours)
- [ ] Set up SendGrid/Resend account (or use existing)
- [ ] Verify sender domain/email
- [ ] Add API key to environment variables
- [ ] Implement email draft generation
- [ ] Add "Send" button with API call
- [ ] Show confirmation in UI

### Total Estimate: 7-10 hours

---

## Acceptance Criteria

1. ✅ Dashboard shows Campaign Details panel with targeting, bids, status
2. ✅ Optimisation via chat updates dashboard in real-time (no manual refresh)
3. ✅ Visual feedback on changed fields (highlight/animation)
4. ✅ Slack notification posts to #adcp-demo channel automatically
5. ✅ Slack message uses "Hey team" format with change details
6. ✅ Email draft appears with correct brand name and changes
7. ✅ "Send Email" button actually sends the email
8. ✅ Read-only queries do NOT trigger notifications

---

## What We Need From Tim

1. **Slack workspace** - Which workspace to install the app?
2. **Slack channel** - Create a #adcp-demo channel or use existing?
3. **Demo email recipient** - Tim's email for testing, or a shared inbox?
4. **Sender email** - What address should emails come from? (needs domain verification)

---

## Questions for TA

1. Do you have a preference between SendGrid/Resend/other for email?
2. Any existing Slack bot setup in Signal42 we can leverage?
3. Should the email have a "Save as Draft" option in addition to "Send"?
4. Want me to set up the Slack app, or will you do it?

Let me know if you need any clarification.
