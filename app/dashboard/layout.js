"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DriveShell } from '@/components/gaia/drive-shell';
import { useAuth } from '@/contexts/auth-context';
import {DashboardSkeleton} from "@/app/dashboard/loading-skeletons/dashboard-skeleton"
export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <DashboardSkeleton/>;
  }
  return <DriveShell>{children}</DriveShell>;
}