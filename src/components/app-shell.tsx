import Link from "next/link";
import { BarChart3, BookOpenCheck, LayoutDashboard, Settings, Wifi } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { getMode, getSessionUser } from "@/lib/auth-helpers";
import { MobileDrawer } from "@/components/mobile-drawer";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: BookOpenCheck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/pinned", label: "Pinned Feed", icon: Wifi },
  { href: "/settings", label: "Settings", icon: Settings },
];

export async function AppShell({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath: string;
}) {
  const mode = await getMode();
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#23313b_0%,transparent_40%),radial-gradient(circle_at_80%_0%,#1e2330_0%,transparent_35%),#0b0f14] text-zinc-100">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 md:hidden border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{APP_NAME}</p>
            <h1 className="text-sm font-semibold text-white">Momentum</h1>
          </div>
          <MobileDrawer currentPath={currentPath} />
        </div>
      </header>

      {/* Desktop + Main Content */}
      <div className="mx-auto grid w-full max-w-[1400px] gap-4 p-4 md:grid-cols-[260px_1fr] md:p-6">
        {/* Desktop Sidebar */}
        <aside className="hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/75 p-4 backdrop-blur-sm md:block md:h-[calc(100vh-3rem)] md:sticky md:top-6">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{APP_NAME}</p>
            <h1 className="mt-1 text-lg font-semibold text-white">Momentum Grid</h1>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
        </aside>

        <main className="space-y-4">
          <header className="flex flex-col gap-3 rounded-2xl border border-zinc-800/90 bg-zinc-900/75 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">Mode</p>
              <p className="text-sm font-semibold text-zinc-100">{mode === "OWNER" ? "Owner" : "Visitor"}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">Profile</p>
              <p className="text-sm font-semibold text-zinc-100 truncate">{user?.email ?? "visitor@demo"}</p>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
