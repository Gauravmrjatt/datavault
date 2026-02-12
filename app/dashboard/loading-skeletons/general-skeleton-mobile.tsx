import { Skeleton } from "@/components/ui/skeleton";
import { GaiaCard } from "@/components/gaia/primitives";

export function GeneralSkeleton() {
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
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          
          <div className="space-y-3 mt-6">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
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