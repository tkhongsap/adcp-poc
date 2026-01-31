"use client";

export default function ChatPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Message history will be implemented in US-013 */}
        <div className="text-claude-text-secondary text-sm">
          Start a conversation with AdCP Agent...
        </div>
      </div>
      <div className="p-4 border-t border-claude-border">
        {/* MessageInput will be implemented in US-014 */}
        <div className="bg-white rounded-3xl border border-claude-border px-4 py-3 text-claude-text-secondary text-sm">
          Message AdCP Agent...
        </div>
      </div>
    </div>
  );
}
