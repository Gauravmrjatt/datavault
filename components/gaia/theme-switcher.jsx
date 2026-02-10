"use client";

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const OPTIONS = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor }
];

export function GaiaThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-surface))] p-1">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1 text-xs transition ${
              active ? 'bg-[hsl(var(--gaia-accent))] text-[hsl(var(--gaia-accent-foreground))]' : 'hover:bg-[hsl(var(--gaia-soft))]'
            }`}
          >
            <Icon size={12} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
