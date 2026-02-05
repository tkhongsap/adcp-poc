"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Conversation } from "@/hooks/useChatHistory";

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

// Navigation item component
function NavItem({
  icon,
  label,
  isActive = false
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg",
        "transition-colors duration-150",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Recent chat item component with delete
function RecentChatItem({
  title,
  isActive,
  onClick,
  onDelete,
}: {
  title: string;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left px-3 py-2 text-sm rounded-lg pr-8",
          "transition-colors duration-150 truncate",
          isActive
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
        title={title}
      >
        {title}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2",
          "p-1 rounded opacity-0 group-hover:opacity-100",
          "text-muted-foreground hover:text-destructive hover:bg-muted",
          "transition-all duration-150"
        )}
        title="Delete conversation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            fillRule="evenodd"
            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

// Group conversations by date
function groupConversationsByDate(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: {
    label: string;
    conversations: Conversation[];
  }[] = [
    { label: "Today", conversations: [] },
    { label: "Yesterday", conversations: [] },
    { label: "Last 7 days", conversations: [] },
    { label: "Older", conversations: [] },
  ];

  for (const conv of conversations) {
    const convDate = new Date(conv.updatedAt);
    
    if (convDate >= today) {
      groups[0].conversations.push(conv);
    } else if (convDate >= yesterday) {
      groups[1].conversations.push(conv);
    } else if (convDate >= lastWeek) {
      groups[2].conversations.push(conv);
    } else {
      groups[3].conversations.push(conv);
    }
  }

  // Filter out empty groups
  return groups.filter((g) => g.conversations.length > 0);
}

export default function ChatSidebar({
  isCollapsed,
  onToggle,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <AnimatePresence initial={false}>
      {!isCollapsed && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn(
            "h-full flex flex-col",
            "bg-background border-r border-border",
            "overflow-hidden"
          )}
        >
          {/* Logo section */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              {/* Signal42 Logo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1907 2116"
                className="w-6 h-6"
              >
                {/* Cyan accent elements */}
                <g fill="#41e9fd">
                  <path d="m491.855743 1280.366943c-104.749542-389.634643-48.188018-766.371826 122.17508-987.735229-357.460266 124.692139-614.030943 464.550293-614.030943 864.52771 0 505.675293 409.930662 915.605957 915.606199 915.605957 50.295776 0 99.588257-4.220459 147.68042-12.021729-246.838684-116.005371-470.688171-405.648803-571.430756-780.376709z"/>
                  <path d="m1134.718262 268.137207c4.415283-57.793945 12.98291-107.838135 25.662231-148.583984-93.571289-30.807618-189.027466-36.292969-281.162597-11.523438-105.591309 28.387329-194.988709 93.38855-265.187073 184.601929 94.462097-32.95105 195.877075-51.078369 301.575256-51.078369 75.546997 0 148.886353 9.332397 219.112183 26.583862z"/>
                  <path d="m1548.866211 1818.101807c-130.816162 125.371215-298.64502 212.316772-485.579712 242.641845 115.577148 54.316895 236.173706 70.704834 351.568359 39.682373 93.787598-25.213623 174.78125-79.348266 240.938233-155.009521-34.583008-30.520874-70.608521-73.621826-106.92688-127.314697z"/>
                </g>
                {/* Purple brand elements */}
                <path d="m1238.262817 1074.497437c-84.647094-314.859375-118.814819-606.504395-103.544555-806.36023-70.22583-17.251465-143.565186-26.583862-219.112183-26.583862-105.698181 0-207.113159 18.127319-301.575256 51.078369-170.363098 221.363403-226.924622 598.100586-122.17508 987.735229 100.742585 374.727906 324.592072 664.371338 571.430756 780.376709 186.934692-30.325073 354.76355-117.27063 485.579712-242.641845-112.115479-165.748902-226.989746-432.589356-310.603394-743.60437z" fill="#4D3EFE"/>
                <path d="m1816.156372 984.258301c89.151489 387.269775 20.019043 754.861938-160.363281 961.158203 47.513428 41.932617 92.302002 60.215698 131.355835 49.716675 149.471069-40.183228 160.447754-486.613648 29.007446-1010.874878z" fill="#41e9fd"/>
                <path d="m1787.789795 877.777832c-148.94812-527.153809-385.371948-915.610352-536.27771-875.040283-40.705933 10.943359-71.039917 52.251221-91.131592 116.815674 262.592529 86.455566 510.250855 373.3302 627.409302 758.224609z" fill="#41e9fd"/>
                <path d="m1816.156372 984.258301c-2.759277-11.008301-5.626953-22.06836-8.512329-33.1427 15.244507 66.257324 23.567749 135.158813 23.567749 206.043823 0 259.879883-108.451416 494.286133-282.345581 660.942383 36.318359 53.692871 72.343872 96.793823 106.92688 127.314697 180.382324-206.296265 249.51477-573.888428 160.363281-961.158203z" fill="#4D3EFE"/>
                <path d="m1788.446899 880.151367c-.221679-.786743-.434326-1.587524-.657104-2.373535-117.158447-384.894409-364.816773-671.769043-627.409302-758.224609-12.679321 40.745849-21.246948 90.790039-25.662231 148.583984 310.059082 76.169556 558.006225 310.140747 653.728637 612.01416z" fill="#3994FB"/>
                <path d="m1788.446899 880.151367c-95.722412-301.873413-343.669555-535.844604-653.728637-612.01416-15.270264 199.855835 18.897461 491.500855 103.544555 806.36023 83.613648 311.015014 198.487915 577.855468 310.603394 743.60437 173.894165-166.65625 282.345581-401.0625 282.345581-660.942383 0-70.88501-8.323242-139.786499-23.567749-206.043823-2.409424-9.244996-4.749512-18.455689-7.24646-27.74231-3.904175-14.523682-7.913208-28.896606-11.950684-43.221924z" fill="#4D3EFE"/>
                {/* S42 text - uses currentColor for theme compatibility */}
                <path d="m1191.39624 907.203369v68.019409h-81.619262v-68.019409h-155.4693v-66.070801l128.744324-193.366211h108.344238v196.768677h50.52771v62.668335zm-78.706421-62.668335v-36.437988c0-36.276245 1.130982-70.281006 3.402466-102.024048h-.974243c-16.5177 29.794556-35.463501 60.729858-56.842773 92.785889l-31.091797 45.676147z" fill="currentColor"/>
                <path d="m1450.338623 652.138062c18.46106 8.097412 32.71228 19.516357 42.753052 34.25708 10.035766 14.740722 15.064087 31.662353 15.064087 50.764648 0 18.466309-3.483643 34.337891-10.444702 47.614746-6.97168 13.286865-16.442383 24.61499-28.421509 34.004517-11.98938 9.399902-27.376343 18.950927-46.155762 28.663696-19.435669 10.046021-34.095337 18.466309-43.969726 25.271362-9.884156 6.7948-16.603638 12.872803-20.162476 18.213868-3.569092 5.351074-5.66919 11.257446-6.315186 17.739379h163.722779v66.55542h-261.375367c-.328125-2.917724-.484741-7.935913-.484741-15.06372 0-23.312622 2.746582-43.313599 8.259033-60.003052 5.50232-16.669068 15.05896-32.136841 28.663697-46.392822 13.604736-14.246094 32.707153-28.179078 57.32727-41.778931 18.461548-10.369019 32.551026-18.870239 42.268799-25.51355 9.717896-6.633423 17.40625-13.842163 23.07544-21.616455 5.664062-7.77417 8.505737-16.679199 8.505737-26.725098 0-10.358886-3.245606-18.536987-9.717896-24.534301-6.481323-5.987183-15.548095-8.98584-27.209472-8.98584-14.256226 0-25.104737 4.129394-32.551026 12.388428-7.450805 8.258789-11.171508 20.334106-11.171508 36.195434h-83.078003c.317993-36.266235 11.661377-64.203003 34.009399-83.799927 22.348511-19.597168 53.273926-29.400879 92.791138-29.400879 24.61499 0 46.155883 4.058716 64.616943 12.145997z" fill="currentColor"/>
                <path d="m827.990601 892.31665c57.73645 47.715577 86.60205 117.269654 86.60205 208.672364h-216.502136c0-38.487549-11.030334-67.948609-33.075744-88.404053-22.060608-20.445313-53.520936-30.662842-94.416565-30.662842-34.48407 0-61.941254 7.420899-82.386506 22.242554-20.450347 14.851562-30.672973 34.287231-30.672973 58.336792 0 18.456299 5.411804 33.489746 16.240204 45.11084 10.823303 11.631103 27.85083 21.848633 51.112854 30.662597 23.252136 8.834229 57.736206 18.849854 103.442627 30.077393 68.140686 16.830566 123.282165 34.2771 165.379089 52.319336 42.096985 18.042236 76.560974 44.706909 103.437561 79.983642 26.856506 35.28711 40.294678 82.194825 40.294678 140.723511 0 55.328369-14.432801 103.639771-43.303467 144.933838-28.86554 41.304566-69.569153 73.178589-122.080444 95.612793-52.526612 22.444458-114.074219 33.681763-184.622742 33.681763-112.271881 0-200.075256-26.048828-263.409912-78.176392-63.349915-52.117554-95.017258-125.488281-95.017258-220.111572h221.312973c0 88.22229 47.301727 132.3031 141.925049 132.3031 39.275085 0 70.154846-8.006591 92.614258-24.04956 22.439331-16.032959 33.676636-38.073486 33.676636-66.151489 0-20.849121-5.411805-37.286133-16.240174-49.320923-10.823303-12.025025-26.66449-21.838623-47.508484-29.461426-20.859314-7.612671-54.121948-17.446411-99.828125-29.471436-69.761139-17.628173-125.503265-35.276733-167.186218-52.925292-41.703278-17.628174-76.187378-43.687012-103.43753-78.176392-27.270508-34.469116-40.8956-80.589233-40.8956-138.320679 0-52.107422 13.625092-97.813598 40.8956-137.108887 27.250152-39.285156 66.338348-69.766235 117.269622-91.412841 50.91095-21.646607 110.055542-32.480103 177.408631-32.480103 108.248657 0 191.240905 23.86792 248.972046 71.573364z" fill="currentColor"/>
              </svg>
              <span className="text-lg font-semibold text-foreground">Signal42</span>
            </div>
            <button
              onClick={onToggle}
              className={cn(
                "p-1.5 rounded-lg",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted transition-colors"
              )}
              aria-label="Collapse sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* New Chat button */}
          <div className="px-3 mb-4">
            <button
              onClick={onNewChat}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg",
                "bg-muted hover:bg-muted/80",
                "text-foreground transition-colors duration-150"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              New chat
            </button>
          </div>

          {/* Navigation items */}
          <nav className="px-3 space-y-1 mb-4">
            <NavItem
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10 3c.53 0 1.04.21 1.41.59l7 7a2 2 0 010 2.82l-7 7a2 2 0 01-2.82 0l-7-7A2 2 0 011 12V5a2 2 0 012-2h7zm-5 9a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              }
              label="Search"
            />
            <NavItem
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              }
              label="Chats"
              isActive
            />
            <NavItem
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3.75 3A1.75 1.75 0 002 4.75v3.5C2 9.216 2.784 10 3.75 10h3.5A1.75 1.75 0 009 8.25v-3.5A1.75 1.75 0 007.25 3h-3.5zM3.75 11A1.75 1.75 0 002 12.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 009 16.25v-3.5A1.75 1.75 0 007.25 11h-3.5zM11 4.75c0-.966.784-1.75 1.75-1.75h3.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0116.25 10h-3.5A1.75 1.75 0 0111 8.25v-3.5zM12.75 11a1.75 1.75 0 00-1.75 1.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0018 16.25v-3.5A1.75 1.75 0 0016.25 11h-3.5z" />
                </svg>
              }
              label="Projects"
            />
            <NavItem
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                </svg>
              }
              label="Artifacts"
            />
            <NavItem
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z" clipRule="evenodd" />
                </svg>
              }
              label="Code"
            />
          </nav>

          {/* Recents section */}
          <div className="flex-1 overflow-y-auto px-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Recents
            </div>
            
            {groupedConversations.length === 0 ? (
              <div className="text-sm text-muted-foreground px-3 py-2">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-4">
                {groupedConversations.map((group) => (
                  <div key={group.label}>
                    <div className="text-xs text-muted-foreground px-3 mb-1">
                      {group.label}
                    </div>
                    <div className="space-y-0.5">
                      {group.conversations.map((conv) => (
                        <RecentChatItem
                          key={conv.id}
                          title={conv.title}
                          isActive={conv.id === activeConversationId}
                          onClick={() => onSelectConversation(conv.id)}
                          onDelete={() => onDeleteConversation(conv.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User profile section */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                U
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  User
                </div>
                <div className="text-xs text-muted-foreground">
                  Signal42 Agent
                </div>
              </div>
              <button className="p-1 text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                </svg>
              </button>
            </div>
          </div>
        </motion.aside>
      )}

      {/* Collapsed sidebar button */}
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-shrink-0 p-2"
        >
          <button
            onClick={onToggle}
            className={cn(
              "p-2 rounded-lg",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted transition-colors"
            )}
            aria-label="Expand sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
