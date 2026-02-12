import { Skeleton } from "@/components/ui/skeleton";
import { GaiaCard } from "@/components/gaia/primitives";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--gaia-bg))]">
      {/* Mobile header skeleton */}
      <header className="sticky top-0 z-40 bg-[hsl(var(--gaia-bg))] border-b border-[hsl(var(--gaia-border))] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </header>

      {/* Main content skeleton */}
      <main className="flex-1 p-4 pb-20">
        <div className="space-y-6">
          {/* Storage card skeleton */}
          <section>
            <GaiaCard className="p-6 border-none bg-[hsl(var(--gaia-panel))] shadow-xl overflow-hidden">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="w-32 h-32 rounded-full mb-4" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-32 mx-auto" />
                  <Skeleton className="h-8 w-48 mx-auto" />
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              </div>
            </GaiaCard>
          </section>

          {/* Metrics cards skeleton */}
          <div className="grid gap-4 grid-cols-1">
            <GaiaCard className="flex items-center gap-4 p-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-5" />
            </GaiaCard>
            
            <GaiaCard className="flex items-center gap-4 p-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-5" />
            </GaiaCard>
          </div>

          {/* Quick actions skeleton */}
          <div className="grid gap-4 grid-cols-1 pt-2">
            <GaiaCard className="h-full p-4 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-5 w-5" />
            </GaiaCard>
            
            <GaiaCard className="h-full p-4 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-5 w-5" />
            </GaiaCard>
            
            <GaiaCard className="h-full p-4 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-5 w-5" />
            </GaiaCard>
          </div>
        </div>
      </main>

      {/* Bottom nav skeleton */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--gaia-surface))] border-t border-[hsl(var(--gaia-border))] flex justify-around py-3 px-2 z-40 md:hidden">
        <div className="flex flex-col items-center gap-1 p-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex flex-col items-center gap-1 p-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex flex-col items-center gap-1 p-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex flex-col items-center gap-1 p-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-3 w-8" />
        </div>
      </nav>
    </div>
  );
}