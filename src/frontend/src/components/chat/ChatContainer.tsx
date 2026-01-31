"use client";

import { useState } from "react";
import { Message } from "@/types/chat";
import ChatPanel from "./ChatPanel";

// Demo messages for testing the UI
const demoMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Show me all active campaigns",
    timestamp: new Date("2026-01-31T10:00:00"),
  },
  {
    id: "2",
    role: "assistant",
    content: `I found **5 active media buys** in your account. Here's a summary:

1. **Nike Summer 2026** - Running at 78% pacing, health: good
2. **Coca-Cola Q1** - Running at 92% pacing, health: warning
3. **Toyota Hybrid** - Running at 45% pacing, health: good
4. **Amazon Prime Day** - Running at 100% pacing, health: good
5. **McDonald's Breakfast** - Running at 112% pacing, health: poor

Would you like me to show detailed metrics for any of these campaigns?`,
    timestamp: new Date("2026-01-31T10:00:05"),
  },
  {
    id: "3",
    role: "user",
    content: "What's the CTR for the Nike campaign?",
    timestamp: new Date("2026-01-31T10:01:00"),
  },
  {
    id: "4",
    role: "assistant",
    content: `The **Nike Summer 2026** campaign has a CTR of **0.85%**, which is above the industry average of 0.5% for display ads.

Key metrics:
- Impressions: 2.4M
- Clicks: 20,400
- CTR: 0.85%
- Average CPM: $4.20`,
    timestamp: new Date("2026-01-31T10:01:10"),
  },
];

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>(demoMessages);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    // TODO: Send to backend API and handle response (US-015)
  };

  return <ChatPanel messages={messages} onSendMessage={handleSendMessage} />;
}
