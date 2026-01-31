"use client";

export default function Sidebar() {
  return (
    <aside className="w-[220px] flex-shrink-0 bg-claude-sidebar h-full flex flex-col">
      {/* Branding - placeholder for US-022 */}
      <div className="p-4">
        <span className="text-white text-lg font-semibold">AdCP Demo</span>
      </div>

      {/* Navigation placeholder - will be built out in US-022 */}
      <nav className="flex-1 px-3 py-4">
        <div className="text-claude-text-secondary text-xs uppercase tracking-wider mb-2 px-3">
          Trading
        </div>
        <ul className="space-y-1">
          <li>
            <span className="block px-3 py-2 text-white text-sm rounded hover:bg-white/10 cursor-pointer">
              Media Buys
            </span>
          </li>
          <li>
            <span className="block px-3 py-2 text-white/60 text-sm rounded hover:bg-white/10 cursor-pointer">
              Products
            </span>
          </li>
          <li>
            <span className="block px-3 py-2 text-white/60 text-sm rounded hover:bg-white/10 cursor-pointer">
              Formats
            </span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
