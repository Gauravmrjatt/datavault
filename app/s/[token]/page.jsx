"use client";

import { useEffect, useState } from 'react';
import { GaiaButton, GaiaCard } from '@/components/gaia/primitives';
import { API_BASE } from '@/lib/api-client';

export default function SharePage({ params }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/share/${params.token}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Invalid share token');
        setPayload(data);
      })
      .catch((err) => setError(err.message));
  }, [params.token]);

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  if (!payload) {
    return <div className="p-6 text-sm">Loading shared file...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--gaia-bg))] p-4">
      <GaiaCard className="w-full max-w-lg">
        <p className="text-xs text-[hsl(var(--gaia-muted))]">Shared file</p>
        <h1 className="mt-1 font-[var(--font-space)] text-2xl font-semibold">{payload.file.name}</h1>
        <p className="mt-2 text-sm text-[hsl(var(--gaia-muted))]">Permission: {payload.permission}</p>
        <GaiaButton className="mt-4" onClick={() => window.open(`${API_BASE}/api/share/${params.token}/download`, '_blank')}>
          Download
        </GaiaButton>
      </GaiaCard>
    </div>
  );
}
