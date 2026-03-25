"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, BarChart3, BookOpenCheck, LayoutDashboard, Settings, Wifi } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: BookOpenCheck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/pinned", label: "Pinned Feed", icon: Wifi },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileDrawer({ currentPath }: { currentPath: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-2 hover:bg-zinc-800 transition"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 top-14 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-14 z-50 w-64 h-[calc(100vh-3.5rem)] bg-zinc-900/95 border-r border-zinc-800 p-4 backdrop-blur-sm transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{APP_NAME}</p>
          <h1 className="mt-1 text-lg font-semibold text-white">Momentum</h1>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
