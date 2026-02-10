import { Skeleton } from "@/components/ui/skeleton";
import { GaiaCard } from "@/components/gaia/primitives";

export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      <header className="flex items-end justify-between">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-24 rounded-2xl" />
      </header>

      <section>
        <GaiaCard className="p-8 border-none bg-[hsl(var(--gaia-panel))] shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-64" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="w-48 h-48 rounded-full" />
          </div>
        </GaiaCard>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <GaiaCard key={i} className="flex items-center gap-6 p-6">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </GaiaCard>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3 pt-4">
        {[1, 2, 3].map((i) => (
          <GaiaCard key={i} className="h-full p-6 bg-[hsl(var(--gaia-panel))]">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </GaiaCard>
        ))}
      </div>
    </div>
  );
}
