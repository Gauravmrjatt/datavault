import { ReactNode } from 'react';

interface LoadingWrapperProps {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  showSkeletonWhen?: boolean;
}

/**
 * Reusable loading wrapper component
 * Shows skeleton while loading, then displays children
 * 
 * @example
 * <LoadingWrapper loading={isLoading} skeleton={<DashboardSkeleton />}>
 *   <DashboardContent />
 * </LoadingWrapper>
 */
export function LoadingWrapper({ 
  loading, 
  skeleton, 
  children,
  showSkeletonWhen = true 
}: LoadingWrapperProps) {
  if (loading && showSkeletonWhen) {
    return <>{skeleton}</>;
  }
  
  return <>{children}</>;
}
