"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Files,
  LayoutDashboard,
  LogOut,
  Settings,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { GaiaButton } from "./primitives";
import { GaiaThemeSwitcher } from "./theme-switcher";
import { useAuth } from "@/contexts/auth-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/files", label: "Files", icon: Files },
  { href: "/dashboard/upload", label: "Upload", icon: UploadCloud },
  { href: "/dashboard/trash", label: "Trash", icon: Trash2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DriveShell({ children }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-[hsl(var(--gaia-bg))] transition-colors pb-20 md:pb-0">
      {/* MOBILE HEADER */}
      <header className="flex items-center justify-center p-4 md:hidden relative">
        <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--gaia-accent))]">
          DataVault
        </h2>
        <div className="absolute right-4 flex items-center gap-2">
          <button 
            onClick={logout} 
            className="p-2 text-[hsl(var(--gaia-muted))] hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full flex-col gap-4 p-4 md:flex-row">
        {/* SIDEBAR (Desktop) */}
        <aside className="hidden md:flex w-full shrink-0 flex-col rounded-[2rem] border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-panel))] p-6 md:sticky md:top-4 md:h-[calc(100dvh-2rem)] md:w-64">
          
          {/* USER CARD (TOP) */}
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--gaia-accent))]">
              DataVault
            </h2>
            <p className="text-xs font-medium text-[hsl(var(--gaia-muted))] truncate">
              {user?.email}
            </p>
          </div>

          {/* NAV */}
          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-[hsl(var(--gaia-accent))] text-[hsl(var(--gaia-accent-foreground))] shadow-lg shadow-[hsl(var(--gaia-accent)/0.25)]"
                      : "text-[hsl(var(--gaia-muted))] hover:bg-[hsl(var(--gaia-soft))] hover:text-[hsl(var(--gaia-text))]"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? "animate-pulse"
                        : "transition-transform group-hover:scale-110"
                    }
                  />
                  {item.label === "Home" ? "Dashboard" : item.label}
                </Link>
              );
            })}
          </nav>

          {/* BOTTOM USER ACTIONS */}
          <div className="mt-auto flex flex-col gap-4 pt-6">
            <GaiaThemeSwitcher />
            <GaiaButton
              variant="ghost"
              onClick={logout}
              className="w-full rounded-2xl bg-[hsl(var(--gaia-soft))] hover:bg-red-500/10 hover:text-red-500"
            >
              Sign out
            </GaiaButton>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-h-[calc(100dvh-2rem)] rounded-[2.5rem] border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-surface))] p-4 md:p-6 shadow-sm">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around rounded-[2rem] rounded-b-none border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-panel))]/80 p-2 pt-4 backdrop-blur-lg shadow-2xl md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-bold transition-all ${
                active
                  ? "bg-[hsl(var(--gaia-accent))] text-[hsl(var(--gaia-accent-foreground))] shadow-lg shadow-[hsl(var(--gaia-accent)/0.2)]"
                  : "text-[hsl(var(--gaia-muted))] hover:bg-[hsl(var(--gaia-soft))]"
              }`}
            >
              <Icon size={20} />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
