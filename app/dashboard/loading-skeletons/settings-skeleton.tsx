import { GaiaCard } from "@/components/gaia/primitives";
import { motion } from "framer-motion";

export function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-[hsl(var(--gaia-soft))] rounded-2xl animate-pulse" />
        <div className="h-4 w-80 max-w-full bg-[hsl(var(--gaia-soft))] rounded-xl animate-pulse" />
      </div>

      <GaiaCard className="space-y-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--gaia-accent)/0.03)] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        <div className="relative">
          <div className="h-4 w-24 bg-[hsl(var(--gaia-soft))] rounded-xl animate-pulse" />
          <div className="h-4 w-40 bg-[hsl(var(--gaia-soft))] rounded-xl animate-pulse mt-2" />
          <div className="h-3 w-48 bg-[hsl(var(--gaia-soft))] rounded-lg animate-pulse mt-1" />
        </div>
      </GaiaCard>

      <GaiaCard className="space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--gaia-accent)/0.03)] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        <div className="relative">
          <div className="h-4 w-48 bg-[hsl(var(--gaia-soft))] rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-[hsl(var(--gaia-soft))] rounded-2xl animate-pulse mt-3" />
          <div className="h-12 w-full bg-[hsl(var(--gaia-soft))] rounded-2xl animate-pulse mt-2" />
          <div className="flex items-center gap-2 mt-3">
            <div className="h-7 w-32 bg-[hsl(var(--gaia-soft))] rounded-full animate-pulse" />
            <div className="h-12 w-36 bg-[hsl(var(--gaia-accent)/0.2)] rounded-2xl animate-pulse" />
          </div>
        </div>
      </GaiaCard>

      {/* Mobile only appearance skeleton */}
      <GaiaCard className="md:hidden space-y-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--gaia-accent)/0.03)] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        <div className="relative">
          <div className="h-4 w-24 bg-[hsl(var(--gaia-soft))] rounded-xl animate-pulse" />
          <div className="flex items-center justify-between mt-3">
            <div className="h-3 w-48 bg-[hsl(var(--gaia-soft))] rounded-lg animate-pulse" />
            <div className="h-8 w-14 bg-[hsl(var(--gaia-soft))] rounded-full animate-pulse" />
          </div>
        </div>
      </GaiaCard>

      <GaiaCard className="space-y-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--gaia-accent)/0.03)] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        <div className="relative">
          <div className="h-4 w-20 bg-[hsl(var(--gaia-soft))] rounded-xl animate-pulse" />
          <div className="space-y-2 mt-2">
            <div className="h-3 w-full bg-[hsl(var(--gaia-soft))] rounded-lg animate-pulse" />
            <div className="h-3 w-5/6 bg-[hsl(var(--gaia-soft))] rounded-lg animate-pulse" />
            <div className="h-3 w-4/6 bg-[hsl(var(--gaia-soft))] rounded-lg animate-pulse" />
            <div className="h-3 w-3/4 bg-[hsl(var(--gaia-soft))] rounded-lg animate-pulse" />
          </div>
        </div>
      </GaiaCard>
    </div>
  );
}
