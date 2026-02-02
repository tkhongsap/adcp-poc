/**
 * Types for the notification agents feature
 */

export interface EmailDraft {
  id: string;
  mediaBuyId: string;
  to: string;
  from: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  brandName: string;
  clientName: string;
  status: 'draft' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
}

export interface SlackNotification {
  sent: boolean;
  message: string;
  channelName?: string;
}

export interface NotificationResult {
  slack: SlackNotification;
  email: {
    draftGenerated: boolean;
    draft: EmailDraft | null;
    message: string;
  };
  timestamp: string;
}

export interface ChangeApplied {
  operation: string;
  details: string;
  previous_value?: string | number | string[];
  new_value?: string | number | string[];
}

export interface CampaignUpdateNotification {
  mediaBuyId: string;
  brandName: string;
  campaignName: string;
  changes: ChangeApplied[];
  notifications: NotificationResult;
  timestamp: string;
}
