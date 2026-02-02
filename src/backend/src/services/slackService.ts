/**
 * Slack Notification Service
 *
 * Posts notifications to Slack via Incoming Webhook when campaign changes are made.
 * Uses Slack Block Kit formatting for rich message display.
 */

export interface SlackNotificationPayload {
  brandName: string;
  campaignName: string;
  changes: Array<{
    operation: string;
    details: string;
    previous_value?: string | number | string[];
    new_value?: string | number | string[];
  }>;
  reason?: string;
  timestamp: string;
  dashboardUrl?: string;
}

export interface SlackMessageBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  elements?: Array<{
    type: string;
    text: string;
  }>;
}

export interface SlackMessage {
  blocks: SlackMessageBlock[];
}

/**
 * Format change details for Slack display
 */
function formatChangeDetails(changes: SlackNotificationPayload['changes']): string {
  return changes.map(change => {
    let detail = `• ${change.details}`;
    if (change.previous_value !== undefined && change.new_value !== undefined) {
      const prevVal = Array.isArray(change.previous_value)
        ? change.previous_value.join(', ')
        : change.previous_value;
      const newVal = Array.isArray(change.new_value)
        ? change.new_value.join(', ')
        : change.new_value;
      detail += `\n  _${prevVal}_ → _${newVal}_`;
    }
    return detail;
  }).join('\n');
}

/**
 * Format a human-readable reason from the changes
 */
function formatReason(changes: SlackNotificationPayload['changes'], providedReason?: string): string {
  if (providedReason) return providedReason;

  // Generate a default reason based on operation types
  const operations = changes.map(c => c.operation);

  if (operations.includes('remove_geo')) {
    return 'Optimizing geo targeting based on performance data';
  }
  if (operations.includes('add_geo')) {
    return 'Expanding reach to new markets';
  }
  if (operations.includes('adjust_bid')) {
    return 'Adjusting bids to improve campaign efficiency';
  }
  if (operations.includes('set_status')) {
    return 'Campaign status updated per optimization recommendation';
  }
  if (operations.includes('set_daily_cap')) {
    return 'Setting spend controls for budget management';
  }
  if (operations.includes('shift_budget')) {
    return 'Reallocating budget to higher-performing segments';
  }

  return 'Campaign optimized based on AI recommendations';
}

/**
 * Build Slack Block Kit message structure
 */
export function buildSlackMessage(payload: SlackNotificationPayload): SlackMessage {
  const changeDetails = formatChangeDetails(payload.changes);
  const reason = formatReason(payload.changes, payload.reason);
  const timestamp = new Date(payload.timestamp).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const blocks: SlackMessageBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hey team 👋\n\nJust made some changes to the *${payload.campaignName}* campaign you should know about:`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*What changed:*\n${changeDetails}\n\n*Why:*\n• ${reason}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Campaign:*\n${payload.campaignName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Updated:*\n${timestamp}`,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: payload.dashboardUrl
            ? `📊 <${payload.dashboardUrl}|View in Dashboard> • Made by AdCP Sales Agent`
            : '📊 Made by AdCP Sales Agent',
        },
      ],
    },
  ];

  return { blocks };
}

/**
 * Send notification to Slack webhook
 *
 * @param payload - The notification content
 * @returns Promise with success status and message
 */
export async function sendSlackNotification(payload: SlackNotificationPayload): Promise<{
  success: boolean;
  message: string;
  channelName?: string;
}> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('[SlackService] SLACK_WEBHOOK_URL not configured - skipping notification');
    return {
      success: false,
      message: 'Slack webhook not configured',
    };
  }

  try {
    const slackMessage = buildSlackMessage(payload);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SlackService] Webhook request failed:', response.status, errorText);
      return {
        success: false,
        message: `Slack webhook failed: ${response.status}`,
      };
    }

    // Extract channel name from webhook URL if possible (for display purposes)
    const channelName = process.env.SLACK_CHANNEL_NAME || '#adcp-demo';

    console.log(`[SlackService] Notification sent successfully to ${channelName}`);
    return {
      success: true,
      message: `Slack notification sent to ${channelName}`,
      channelName,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SlackService] Error sending notification:', errorMessage);
    return {
      success: false,
      message: `Failed to send Slack notification: ${errorMessage}`,
    };
  }
}
