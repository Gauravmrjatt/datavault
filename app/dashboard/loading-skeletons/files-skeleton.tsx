import { Skeleton } from "@/components/ui/skeleton";
import { GaiaCard } from "@/components/gaia/primitives";

export function FilesSkeleton() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <GaiaCard key={i} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="pt-2 flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </GaiaCard>
        ))}
      </div>
    </div>
  );
}
