import { cn } from '@/lib/utils';

export function GaiaCard({ className, ...props }) {
  return (
    <div
      className={cn(
        className,
        'rounded-[2rem] border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-surface))] p-4 shadow-xl shadow-[hsl(var(--gaia-accent)/0.03)]',
      )}
      {...props}
    />
  );
}

export function GaiaButton({ className, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-[hsl(var(--gaia-accent))] text-[hsl(var(--gaia-accent-foreground))] hover:opacity-90 shadow-lg shadow-[hsl(var(--gaia-accent)/0.2)]',
    ghost: 'bg-transparent border border-[hsl(var(--gaia-border))] text-[hsl(var(--gaia-text))] hover:bg-[hsl(var(--gaia-soft))]',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function GaiaInput({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-panel))] px-3 text-sm text-[hsl(var(--gaia-text))] outline-none placeholder:text-[hsl(var(--gaia-muted))] focus:ring-2 focus:ring-[hsl(var(--gaia-accent))]',
        className
      )}
      {...props}
    />
  );
}

export function GaiaBadge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-[hsl(var(--gaia-soft))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--gaia-text))]',
        className
      )}
      {...props}
    />
  );
}
