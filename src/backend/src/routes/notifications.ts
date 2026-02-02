/**
 * Notifications API Routes
 *
 * Handles email draft management and sending for the notification agents feature.
 */

import { Router, Request, Response } from 'express';
import {
  getEmailDraft,
  getEmailDraftByMediaBuyId,
  sendEmail,
} from '../services/emailService.js';
import { getNotificationConfig } from '../services/notificationService.js';

const router = Router();

/**
 * GET /api/notifications/config
 * Get current notification configuration status
 */
router.get('/config', (_req: Request, res: Response) => {
  const config = getNotificationConfig();
  res.json(config);
});

/**
 * GET /api/notifications/draft/:id
 * Get an email draft by ID or media buy ID
 *
 * @param id - Draft ID (draft_xxx) or media buy ID (mb_xxx)
 */
router.get('/draft/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // Try to find by draft ID first
  let draft = getEmailDraft(id);

  // If not found and looks like a media buy ID, try that
  if (!draft && (id.startsWith('mb_') || !id.startsWith('draft_'))) {
    draft = getEmailDraftByMediaBuyId(id);
  }

  if (!draft) {
    res.status(404).json({
      success: false,
      error: 'Email draft not found',
    });
    return;
  }

  res.json({
    success: true,
    draft: {
      id: draft.id,
      mediaBuyId: draft.mediaBuyId,
      to: draft.to,
      from: draft.from,
      subject: draft.subject,
      htmlBody: draft.htmlBody,
      textBody: draft.textBody,
      brandName: draft.brandName,
      clientName: draft.clientName,
      status: draft.status,
      createdAt: draft.createdAt,
      sentAt: draft.sentAt,
    },
  });
});

/**
 * POST /api/notifications/send-email
 * Send an email draft
 *
 * Body:
 *   - draftId: string - The ID of the draft to send
 */
router.post('/send-email', async (req: Request, res: Response) => {
  const { draftId } = req.body;

  if (!draftId) {
    res.status(400).json({
      success: false,
      error: 'draftId is required',
    });
    return;
  }

  try {
    const result = await sendEmail(draftId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message,
      });
      return;
    }

    res.json({
      success: true,
      message: result.message,
      emailId: result.emailId,
    });
  } catch (error) {
    console.error('[NotificationsRoute] Error sending email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/notifications/draft/by-media-buy/:mediaBuyId
 * Get email draft by media buy ID (convenience endpoint)
 */
router.get('/draft/by-media-buy/:mediaBuyId', (req: Request, res: Response) => {
  const { mediaBuyId } = req.params;

  const draft = getEmailDraftByMediaBuyId(mediaBuyId);

  if (!draft) {
    res.status(404).json({
      success: false,
      error: 'No email draft found for this media buy',
    });
    return;
  }

  res.json({
    success: true,
    draft: {
      id: draft.id,
      mediaBuyId: draft.mediaBuyId,
      to: draft.to,
      from: draft.from,
      subject: draft.subject,
      htmlBody: draft.htmlBody,
      textBody: draft.textBody,
      brandName: draft.brandName,
      clientName: draft.clientName,
      status: draft.status,
      createdAt: draft.createdAt,
      sentAt: draft.sentAt,
    },
  });
});

export default router;
