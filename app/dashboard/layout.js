"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DriveShell } from '@/components/gaia/drive-shell';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="p-10 text-sm">Loading session...</div>;
  }

  return <DriveShell>{children}</DriveShell>;
}
