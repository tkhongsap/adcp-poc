/**
 * Email Notification Service
 *
 * Generates and sends client emails via Resend API when campaign changes are made.
 * Supports draft generation and manual send confirmation.
 */

export interface EmailDraft {
  id: string;
  mediaBuyId: string;
  to: string[];
  from: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  brandName: string;
  clientName: string;
  changes: Array<{
    operation: string;
    details: string;
    previous_value?: string | number | string[];
    new_value?: string | number | string[];
  }>;
  expectedImpact: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'failed';
  sentAt?: string;
}

// In-memory store for email drafts (keyed by draft ID)
const emailDrafts = new Map<string, EmailDraft>();

/**
 * Format change summary for email
 */
function formatChangesSummary(changes: EmailDraft['changes']): string {
  return changes.map(change => {
    let line = `• ${change.details}`;
    if (change.previous_value !== undefined && change.new_value !== undefined) {
      const prevVal = Array.isArray(change.previous_value)
        ? change.previous_value.join(', ')
        : change.previous_value;
      const newVal = Array.isArray(change.new_value)
        ? change.new_value.join(', ')
        : change.new_value;
      line += `\n• ${prevVal} → ${newVal}`;
    }
    return line;
  }).join('\n');
}

/**
 * Generate expected impact description from changes
 */
function generateExpectedImpact(changes: EmailDraft['changes']): string {
  const operations = changes.map(c => c.operation);

  if (operations.includes('remove_geo')) {
    return 'By focusing spend on higher-performing markets, we expect improved overall campaign efficiency and better ROI.';
  }
  if (operations.includes('add_geo')) {
    return 'Expanding to new markets should increase reach and potential conversions while maintaining cost efficiency.';
  }
  if (operations.includes('adjust_bid')) {
    const bidChange = changes.find(c => c.operation === 'adjust_bid');
    if (bidChange && typeof bidChange.new_value === 'number' && typeof bidChange.previous_value === 'number') {
      if (bidChange.new_value < bidChange.previous_value) {
        return 'The bid reduction should improve cost efficiency while maintaining competitive reach.';
      }
      return 'The bid increase should improve win rates and ad placement quality.';
    }
    return 'Bid optimization should improve campaign performance and efficiency.';
  }
  if (operations.includes('set_status')) {
    const statusChange = changes.find(c => c.operation === 'set_status');
    if (statusChange?.new_value === 'paused') {
      return 'Campaign has been paused. No further spend will occur until resumed.';
    }
    return 'Campaign has been resumed and will begin delivering immediately.';
  }
  if (operations.includes('set_daily_cap')) {
    return 'Daily spend controls help ensure budget pacing aligns with campaign goals.';
  }
  if (operations.includes('shift_budget')) {
    return 'Budget reallocation to higher-performing segments should improve overall campaign efficiency.';
  }

  return 'These optimizations are designed to improve campaign performance and efficiency.';
}

/**
 * Determine change type for email subject
 */
function getChangeType(changes: EmailDraft['changes']): string {
  const operations = changes.map(c => c.operation);

  if (operations.includes('remove_geo') || operations.includes('add_geo')) {
    return 'Geo Targeting Update';
  }
  if (operations.includes('adjust_bid')) {
    return 'Bid Adjustment';
  }
  if (operations.includes('set_status')) {
    const statusChange = changes.find(c => c.operation === 'set_status');
    return statusChange?.new_value === 'paused' ? 'Campaign Paused' : 'Campaign Resumed';
  }
  if (operations.includes('set_daily_cap')) {
    return 'Budget Cap Update';
  }
  if (operations.includes('shift_budget')) {
    return 'Budget Reallocation';
  }

  return 'Campaign Optimization';
}

/**
 * Build HTML email body
 */
function buildHtmlBody(draft: Omit<EmailDraft, 'htmlBody' | 'textBody' | 'id' | 'status' | 'createdAt'>): string {
  const changesSummary = formatChangesSummary(draft.changes);
  const timestamp = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 2px solid #0066cc; padding-bottom: 10px; margin-bottom: 20px; }
    .header h2 { color: #0066cc; margin: 0; }
    .section-title { color: #0066cc; font-weight: bold; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; }
    .divider { border-top: 1px solid #e0e0e0; margin: 15px 0; }
    .changes-box { background: #f8f9fa; border-left: 3px solid #0066cc; padding: 15px; margin: 10px 0; white-space: pre-line; }
    .impact-box { background: #e8f4fd; border-radius: 4px; padding: 15px; margin: 10px 0; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px; }
    .signature { margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Campaign Update: ${draft.brandName}</h2>
  </div>

  <p>Hi ${draft.clientName},</p>

  <p>We've made the following optimisation to your <strong>${draft.brandName}</strong> campaign:</p>

  <div class="section-title">Change Summary</div>
  <div class="changes-box">${changesSummary}</div>

  <div class="section-title">Expected Impact</div>
  <div class="impact-box">${draft.expectedImpact}</div>

  <p>We'll continue monitoring performance and recommend further adjustments as needed.</p>

  <div class="signature">
    <p>Best regards,<br><strong>AdCP Account Team</strong></p>
  </div>

  <div class="footer">
    <p>This update was made via AdCP Sales Agent<br>${timestamp}</p>
  </div>
</body>
</html>`;
}

/**
 * Build plain text email body
 */
function buildTextBody(draft: Omit<EmailDraft, 'htmlBody' | 'textBody' | 'id' | 'status' | 'createdAt'>): string {
  const changesSummary = formatChangesSummary(draft.changes);
  const timestamp = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `Campaign Update: ${draft.brandName}

Hi ${draft.clientName},

We've made the following optimisation to your ${draft.brandName} campaign:

CHANGE SUMMARY
─────────────────────────────────
${changesSummary}

EXPECTED IMPACT
─────────────────────────────────
${draft.expectedImpact}

We'll continue monitoring performance and recommend further adjustments as needed.

Best regards,
AdCP Account Team

---
This update was made via AdCP Sales Agent
${timestamp}`;
}

export interface GenerateEmailDraftParams {
  mediaBuyId: string;
  brandName: string;
  clientName?: string;
  changes: EmailDraft['changes'];
  reason?: string;
}

/**
 * Generate an email draft for a campaign update
 */
export function generateEmailDraft(params: GenerateEmailDraftParams): EmailDraft {
  const { mediaBuyId, brandName, changes, reason } = params;
  const clientName = params.clientName || 'Team';

  const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expectedImpact = reason || generateExpectedImpact(changes);
  const changeType = getChangeType(changes);

  const fromEmail = process.env.EMAIL_FROM || 'adcp-agent@demo.adcp.io';
  const toEmailsStr = process.env.DEMO_EMAIL_RECIPIENT || 'demo@example.com';
  const toEmails = toEmailsStr.split(',').map(e => e.trim()).filter(e => e.length > 0);

  const draftBase = {
    mediaBuyId,
    to: toEmails,
    from: fromEmail,
    subject: `Campaign Update: ${brandName} - ${changeType}`,
    brandName,
    clientName,
    changes,
    expectedImpact,
  };

  const draft: EmailDraft = {
    ...draftBase,
    id: draftId,
    htmlBody: buildHtmlBody(draftBase),
    textBody: buildTextBody(draftBase),
    createdAt: new Date().toISOString(),
    status: 'draft',
  };

  // Store the draft
  emailDrafts.set(draftId, draft);

  // Also store by media buy ID for quick lookup
  emailDrafts.set(`mediaBuy_${mediaBuyId}`, draft);

  console.log(`[EmailService] Generated email draft ${draftId} for ${brandName}`);

  return draft;
}

/**
 * Get email draft by ID
 */
export function getEmailDraft(draftId: string): EmailDraft | null {
  return emailDrafts.get(draftId) || null;
}

/**
 * Get email draft by media buy ID
 */
export function getEmailDraftByMediaBuyId(mediaBuyId: string): EmailDraft | null {
  return emailDrafts.get(`mediaBuy_${mediaBuyId}`) || null;
}

/**
 * Send email via Resend API
 */
export async function sendEmail(draftId: string): Promise<{
  success: boolean;
  message: string;
  emailId?: string;
}> {
  const draft = emailDrafts.get(draftId);

  if (!draft) {
    return {
      success: false,
      message: 'Email draft not found',
    };
  }

  if (draft.status === 'sent') {
    return {
      success: false,
      message: 'Email has already been sent',
    };
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[EmailService] RESEND_API_KEY not configured - simulating send');
    // In demo mode without API key, simulate success
    draft.status = 'sent';
    draft.sentAt = new Date().toISOString();
    return {
      success: true,
      message: `Email sent to ${draft.to.join(', ')} (simulated - no API key configured)`,
      emailId: `simulated_${Date.now()}`,
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: draft.from,
        to: draft.to,
        subject: draft.subject,
        html: draft.htmlBody,
        text: draft.textBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { message?: string };
      console.error('[EmailService] Resend API error:', response.status, errorData);
      draft.status = 'failed';
      return {
        success: false,
        message: `Failed to send email: ${response.status}`,
      };
    }

    const data = await response.json() as { id: string };

    draft.status = 'sent';
    draft.sentAt = new Date().toISOString();

    console.log(`[EmailService] Email sent successfully: ${data.id}`);

    return {
      success: true,
      message: `Email sent to ${draft.to.join(', ')}`,
      emailId: data.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[EmailService] Error sending email:', errorMessage);
    draft.status = 'failed';
    return {
      success: false,
      message: `Failed to send email: ${errorMessage}`,
    };
  }
}

/**
 * Clear all drafts (for testing)
 */
export function clearDrafts(): void {
  emailDrafts.clear();
}
