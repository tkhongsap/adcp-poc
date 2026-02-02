"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/apiBaseUrl";
import type { EmailDraft } from "@/types/notifications";

interface EmailDraftCardProps {
  draft: EmailDraft;
  onDismiss: () => void;
  onSent?: () => void;
}

export default function EmailDraftCard({ draft, onDismiss, onSent }: EmailDraftCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendEmail = async () => {
    setIsSending(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draftId: draft.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send email');
      }

      setSendStatus('sent');
      onSent?.();
    } catch (error) {
      console.error('Error sending email:', error);
      setSendStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  // Already sent state
  if (sendStatus === 'sent' || draft.status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-lg border border-green-200 dark:border-green-800",
          "bg-green-50 dark:bg-green-900/20",
          "p-4"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Email sent to {draft.to}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {draft.subject}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border border-border",
        "bg-card shadow-sm",
        "overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-muted/50">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-base">&#128231;</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Email Draft</p>
          <p className="text-xs text-muted-foreground truncate">To: {draft.to}</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "p-1.5 rounded-lg text-muted-foreground",
            "hover:text-foreground hover:bg-muted",
            "transition-colors"
          )}
        >
          <svg
            className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Subject */}
      <div className="px-4 py-2 border-b border-border">
        <p className="text-xs text-muted-foreground">Subject</p>
        <p className="text-sm font-medium text-foreground">{draft.subject}</p>
      </div>

      {/* Expandable Preview */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-background">
              <div
                className="text-sm text-foreground prose prose-sm dark:prose-invert max-w-none"
                style={{ fontSize: '13px', lineHeight: '1.5' }}
              >
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {draft.textBody}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {sendStatus === 'error' && errorMessage && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 p-3 bg-muted/30">
        <button
          onClick={onDismiss}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-muted transition-colors"
          )}
        >
          Dismiss
        </button>
        <button
          onClick={handleSendEmail}
          disabled={isSending}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-lg",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2"
          )}
        >
          {isSending ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Email
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
