"use client";

import { useState } from "react";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const tradingNavItems: NavItem[] = [
  {
    id: "media-buys",
    label: "Media Buys",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    id: "products",
    label: "Products",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    id: "formats",
    label: "Formats",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
];

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function NavLink({ item, isActive, onClick }: NavLinkProps) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`
          relative w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md
          transition-colors duration-150 cursor-pointer text-left
          ${
            isActive
              ? "text-claude-orange bg-white/5"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }
        `}
      >
        {/* Left accent bar for active state */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-claude-orange rounded-r" />
        )}
        {item.icon}
        <span>{item.label}</span>
      </button>
    </li>
  );
}

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("media-buys");

  return (
    <aside className="w-[220px] flex-shrink-0 bg-claude-sidebar h-full flex flex-col">
      {/* Branding */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-claude-orange rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">
            AdCP Demo
          </span>
        </div>
      </div>

      {/* Trading Section */}
      <nav className="flex-1 px-3 py-4">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-3 px-3 font-medium">
          Trading
        </div>
        <ul className="space-y-1">
          {tradingNavItems.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              onClick={() => setActiveItem(item.id)}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="text-white/30 text-xs">Adform AdCP</div>
      </div>
    </aside>
  );
}
