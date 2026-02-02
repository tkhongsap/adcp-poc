/**
 * Notification Orchestration Service
 *
 * Coordinates sending notifications via multiple channels (Slack, Email)
 * when campaign changes are made through the update_media_buy tool.
 */

import { sendSlackNotification, SlackNotificationPayload } from './slackService.js';
import { generateEmailDraft, EmailDraft } from './emailService.js';
import type { MediaBuy, DeliveryMetrics } from '../types/data.js';

export interface NotificationContext {
  mediaBuyId: string;
  mediaBuy: MediaBuy;
  deliveryMetrics: DeliveryMetrics | null;
  changes: Array<{
    operation: string;
    details: string;
    previous_value?: string | number | string[];
    new_value?: string | number | string[];
  }>;
  reason?: string;
}

export interface NotificationResult {
  slack: {
    sent: boolean;
    message: string;
    channelName?: string;
  };
  email: {
    draftGenerated: boolean;
    draft: EmailDraft | null;
    message: string;
  };
  timestamp: string;
}

/**
 * Extract brand name from media buy
 */
function getBrandName(mediaBuy: MediaBuy): string {
  return mediaBuy.brand_manifest?.name || mediaBuy.buyer_ref || 'Unknown Campaign';
}

/**
 * Get campaign display name
 */
function getCampaignName(mediaBuy: MediaBuy): string {
  const brandName = getBrandName(mediaBuy);
  // For now, just use the brand name as campaign name
  return brandName;
}

/**
 * Get client name for email greeting
 */
function getClientName(_mediaBuy: MediaBuy): string {
  // Default to generic greeting since BrandManifest doesn't have contact_name
  return 'Team';
}

/**
 * Send notifications across all configured channels
 *
 * This is the main entry point called after a successful update_media_buy operation.
 * It sends Slack notifications automatically and generates email drafts for review.
 *
 * @param context - The notification context with media buy and change details
 * @returns Promise with results from each notification channel
 */
export async function sendNotifications(context: NotificationContext): Promise<NotificationResult> {
  const { mediaBuyId, mediaBuy, changes, reason } = context;

  const brandName = getBrandName(mediaBuy);
  const campaignName = getCampaignName(mediaBuy);
  const clientName = getClientName(mediaBuy);
  const timestamp = new Date().toISOString();

  // Get dashboard URL from environment or use default
  const dashboardUrl = process.env.DASHBOARD_URL || process.env.REPLIT_DOMAINS?.split(',')[0] || undefined;

  // Prepare Slack notification payload
  const slackPayload: SlackNotificationPayload = {
    brandName,
    campaignName,
    changes,
    reason,
    timestamp,
    dashboardUrl: dashboardUrl ? `https://${dashboardUrl}` : undefined,
  };

  // Send Slack notification (automatic)
  const slackResult = await sendSlackNotification(slackPayload);

  // Generate email draft (requires user action to send)
  const emailDraft = generateEmailDraft({
    mediaBuyId,
    brandName,
    clientName,
    changes,
    reason,
  });

  console.log(`[NotificationService] Notifications processed for ${campaignName}:`, {
    slack: slackResult.success ? 'sent' : 'skipped',
    email: 'draft generated',
  });

  return {
    slack: {
      sent: slackResult.success,
      message: slackResult.message,
      channelName: slackResult.channelName,
    },
    email: {
      draftGenerated: true,
      draft: emailDraft,
      message: `Email draft generated for ${brandName}`,
    },
    timestamp,
  };
}

/**
 * Check if notifications are configured
 */
export function getNotificationConfig(): {
  slackEnabled: boolean;
  emailEnabled: boolean;
  slackChannel?: string;
  emailFrom?: string;
  emailRecipient?: string;
} {
  return {
    slackEnabled: !!process.env.SLACK_WEBHOOK_URL,
    emailEnabled: !!process.env.RESEND_API_KEY,
    slackChannel: process.env.SLACK_CHANNEL_NAME,
    emailFrom: process.env.EMAIL_FROM,
    emailRecipient: process.env.DEMO_EMAIL_RECIPIENT,
  };
}
