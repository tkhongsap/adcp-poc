import ChatPanel from "@/components/chat/ChatPanel";
import ArtifactPanel from "@/components/chat/ArtifactPanel";

export default function ChatPage() {
  return (
    <div className="h-screen bg-claude-cream flex">
      {/* Chat Panel - 40% width */}
      <div className="w-[40%] min-w-[320px] h-full border-r border-claude-border">
        <ChatPanel />
      </div>

      {/* Artifact Panel - 60% width */}
      <div className="w-[60%] min-w-[480px] h-full p-4">
        <ArtifactPanel />
      </div>
    </div>
  );
}
