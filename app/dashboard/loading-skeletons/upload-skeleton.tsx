import { Skeleton } from "@/components/ui/skeleton";
import { GaiaCard } from "@/components/gaia/primitives";

export function UploadSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <GaiaCard className="h-64 border-dashed border-2 flex flex-col items-center justify-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </GaiaCard>

      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <GaiaCard key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 ml-4 rounded-lg" />
            </GaiaCard>
          ))}
        </div>
      </div>
    </div>
  );
}
