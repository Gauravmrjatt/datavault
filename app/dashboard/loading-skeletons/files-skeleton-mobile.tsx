import { Skeleton } from "@/components/ui/skeleton";
import { GaiaCard } from "@/components/gaia/primitives";

export function FilesSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Mobile header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>

      {/* Search bar skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Action buttons skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>

      {/* Breadcrumbs skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Grid view skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <GaiaCard key={i} className="p-4 space-y-2">
            <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-3 w-1/2 mx-auto" />
          </GaiaCard>
        ))}
      </div>
    </div>
  );
}