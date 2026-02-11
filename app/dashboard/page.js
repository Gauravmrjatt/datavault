"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Database, HardDrive, RefreshCw } from 'lucide-react';
import { GaiaBadge, GaiaButton, GaiaCard } from '@/components/gaia/primitives';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/api-client';
import { DashboardSkeleton } from './loading-skeletons/dashboard-skeleton';

function human(bytes = 0) {
  const val = Number(bytes);
  if (!val || isNaN(val)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = val;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(1)} ${units[index]}`;
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({ usedBytes: 0, totalFiles: 0, folders: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const payload = await apiRequest('/api/drive/items', { token });
      setStats({
        usedBytes: payload.stats.usedBytes,
        totalFiles: payload.stats.totalFiles,
        folders: payload.folders.length
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const percent = user?.quotaBytes ? Math.min((stats.usedBytes / user.quotaBytes) * 100, 100) : 0;

  if (loading && stats.totalFiles === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Overview</h1>
          <p className="text-[hsl(var(--gaia-muted))] mt-1">Your decentralized storage at a glance.</p>
        </div>
        <GaiaButton variant="ghost" onClick={fetchStats} disabled={loading} className="rounded-2xl h-12 px-6">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="ml-2">Sync</span>
        </GaiaButton>
      </header>

      {/* Main Visual Focus: Storage Laser */}
      <section className="relative group">
        <GaiaCard className="p-8 border-none bg-gradient-to-br from-[hsl(var(--gaia-panel))] to-[hsl(var(--gaia-surface))] shadow-2xl overflow-hidden laser-focus">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium uppercase tracking-widest text-[hsl(var(--gaia-muted))]">Storage Capacity</p>
                <h2 className="text-5xl font-black tabular-nums">
                  {human(stats.usedBytes)} <span className="text-xl font-normal text-[hsl(var(--gaia-muted))]">/ {human(user?.quotaBytes || 0)}</span>
                </h2>
              </div>
              <div className="flex items-center gap-4">
                 <GaiaBadge className="px-3 py-1 text-sm bg-[hsl(var(--gaia-accent)/0.1)] text-[hsl(var(--gaia-accent))] border border-[hsl(var(--gaia-accent)/0.2)]">
                   {percent.toFixed(1)}% Used
                 </GaiaBadge>
                 <span className="text-xs text-[hsl(var(--gaia-muted))]">Distributed across Telegram clusters</span>
              </div>
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96" cy="96" r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-[hsl(var(--gaia-soft))]"
                />
                <circle
                  cx="96" cy="96" r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={502.4}
                  strokeDashoffset={502.4 - (502.4 * percent) / 100}
                  strokeLinecap="round"
                  className="text-[hsl(var(--gaia-accent))] transition-all duration-1000 ease-out"
                  style={{ filter: 'drop-shadow(0 0 8px hsl(var(--gaia-accent)))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <HardDrive className="text-[hsl(var(--gaia-accent))] mb-1" size={32} />
              </div>
            </div>
          </div>
        </GaiaCard>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
         <Metric icon={Database} label="Total Assets" value={String(stats.totalFiles)} sub="Individual files stored" />
         <Metric icon={Activity} label="Directory Structure" value={String(stats.folders)} sub="Organized folders" />
      </div>

      <div className="grid gap-4 md:grid-cols-3 pt-4">
        <Quick href="/dashboard/files" title="Drive Explorer" description="Browse and manage files" />
        <Quick href="/dashboard/upload" title="Upload Center" description="Add new content" />
        <Quick href="/dashboard/settings" title="Configuration" description="Account and node settings" />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, sub }) {
  return (
    <GaiaCard className="flex items-center gap-6 p-6 border-[hsl(var(--gaia-border)/0.5)]">
      <div className="p-4 rounded-2xl bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-accent))]">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--gaia-muted))]">{label}</p>
        <p className="text-3xl font-bold mt-0.5">{value}</p>
        <p className="text-xs text-[hsl(var(--gaia-muted))] mt-1">{sub}</p>
      </div>
    </GaiaCard>
  );
}

function Quick({ href, title, description }) {
  return (
    <Link href={href}>
      <GaiaCard className="h-full p-6 transition-all hover:scale-[1.02] hover:shadow-xl border-transparent hover:border-[hsl(var(--gaia-accent)/0.3)] bg-[hsl(var(--gaia-panel))]">
        <p className="font-bold text-lg">{title}</p>
        <p className="mt-1 text-sm text-[hsl(var(--gaia-muted))] leading-relaxed">{description}</p>
      </GaiaCard>
    </Link>
  );
}
