import { Skeleton } from "@/components/ui/skeleton";
import { GaiaCard } from "@/components/gaia/primitives";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--gaia-bg))] p-4">
      <GaiaCard className="w-full max-w-md space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full mt-6" />
        </div>
        <Skeleton className="h-4 w-48 mx-auto" />
      </GaiaCard>
    </div>
  );
}
