import { Skeleton } from "@/components/ui/skeleton";
import { GaiaCard } from "@/components/gaia/primitives";

export function UploadSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <header className="flex items-end justify-between">
        <div>
          <Skeleton className="h-10 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-28 rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>
      </header>

      <section className="grid gap-6">
        <GaiaCard className="p-6 bg-gradient-to-br from-[hsl(var(--gaia-panel))] to-[hsl(var(--gaia-surface))] border-none shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-16" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </GaiaCard>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <GaiaCard key={i} className="flex items-center gap-4 p-4 border-[hsl(var(--gaia-border)/0.5)]">
              <Skeleton className="h-11 w-11 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
            </GaiaCard>
          ))}
        </div>
      </section>
    </div>
  );
}
