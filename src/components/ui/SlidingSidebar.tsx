"use client";

import React from "react";

type SlidingSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  tabLabel?: string;
};

export function SlidingSidebar({
  isOpen,
  onToggle,
  title,
  children,
  className = "",
  tabLabel,
}: SlidingSidebarProps) {
  const label = tabLabel || title;

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300 ease-in-out motion-reduce:transition-none ${className}`}
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(calc(-100% + 16px))",
      }}
      aria-label={title}
    >
      {children}

      <button
        type="button"
        onClick={onToggle}
        className={`absolute right-[-16px] top-1/2 -translate-y-1/2 z-50 flex h-16 w-9 items-center justify-center rounded-r-full border border-[#E2E8F0]/80 bg-white/70 backdrop-blur-md shadow-[0_6px_16px_-12px_rgba(15,23,42,0.2)] transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-60" : "opacity-35"
        } hover:opacity-70 hover:shadow-[0_8px_18px_-12px_rgba(56,189,248,0.3)] hover:translate-x-0.5 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30`}
        aria-label={isOpen ? `Fermer ${title}` : `Ouvrir ${title}`}
        title={isOpen ? `Fermer ${title}` : `Ouvrir ${title}`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="rotate-180 [writing-mode:vertical-rl] text-[10px] tracking-[0.3em] text-[#0F172A]/70">
            {label}
          </span>
          <span
            className={`text-[#0F172A]/70 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▸
          </span>
        </div>
      </button>
    </aside>
  );
}
