import { Skeleton } from "@/components/ui/skeleton";
import { GaiaCard } from "@/components/gaia/primitives";

export function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-80" />
      </div>

      <GaiaCard className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-48" />
      </GaiaCard>

      <GaiaCard className="space-y-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-2xl" />
        </div>
      </GaiaCard>

      {/* Mobile only appearance skeleton */}
      <GaiaCard className="md:hidden space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
      </GaiaCard>

      <GaiaCard className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </GaiaCard>
    </div>
  );
}
