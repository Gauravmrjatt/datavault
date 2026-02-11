"use client";

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { GaiaBadge } from '@/components/gaia/primitives';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
      <GaiaBadge className="px-4 py-2 bg-red-500/10 text-red-500 border-red-500/20 shadow-lg">
        <WifiOff size={14} className="mr-2" />
        You're offline
      </GaiaBadge>
    </div>
  );
}
