"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Database, HardDrive, RefreshCw, Menu, ChevronRight, MoreHorizontal } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex flex-col min-h-screen bg-[hsl(var(--gaia-bg))]">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-[hsl(var(--gaia-bg))] border-b border-[hsl(var(--gaia-border))] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-[hsl(var(--gaia-soft))] transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <GaiaButton 
            variant="ghost" 
            onClick={fetchStats} 
            disabled={loading} 
            className="rounded-xl h-10 px-3"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </GaiaButton>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute top-0 left-0 h-full w-64 bg-[hsl(var(--gaia-surface))] border-r border-[hsl(var(--gaia-border))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--gaia-accent))] flex items-center justify-center">
                  <HardDrive className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">{user?.email || 'User'}</p>
                  <p className="text-xs text-[hsl(var(--gaia-muted))]">Data Vault</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <Link href="/dashboard" className="block p-3 rounded-lg bg-[hsl(var(--gaia-soft))]">
                  <span className="font-medium">Overview</span>
                </Link>
                <Link href="/dashboard/files" className="block p-3 rounded-lg hover:bg-[hsl(var(--gaia-soft))]">
                  <span className="font-medium">Files</span>
                </Link>
                <Link href="/dashboard/upload" className="block p-3 rounded-lg hover:bg-[hsl(var(--gaia-soft))]">
                  <span className="font-medium">Upload</span>
                </Link>
                <Link href="/dashboard/settings" className="block p-3 rounded-lg hover:bg-[hsl(var(--gaia-soft))]">
                  <span className="font-medium">Settings</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Storage Card - Full Width on Mobile */}
          <section className="relative group">
            <GaiaCard className="p-6 border-none bg-gradient-to-br from-[hsl(var(--gaia-panel))] to-[hsl(var(--gaia-surface))] shadow-xl overflow-hidden">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64" cy="64" r="54"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-[hsl(var(--gaia-soft))]"
                    />
                    <circle
                      cx="64" cy="64" r="54"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={339.3}
                      strokeDashoffset={339.3 - (339.3 * percent) / 100}
                      strokeLinecap="round"
                      className="text-[hsl(var(--gaia-accent))] transition-all duration-1000 ease-out"
                      style={{ filter: 'drop-shadow(0 0 8px hsl(var(--gaia-accent)))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <HardDrive className="text-[hsl(var(--gaia-accent))] mb-1" size={24} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium uppercase tracking-widest text-[hsl(var(--gaia-muted))]">Storage Capacity</p>
                    <h2 className="text-3xl font-black tabular-nums">
                      {human(stats.usedBytes)} <span className="text-lg font-normal text-[hsl(var(--gaia-muted))]">/ {human(user?.quotaBytes || 0)}</span>
                    </h2>
                  </div>
                  <div className="flex justify-center">
                     <GaiaBadge className="px-3 py-1 text-sm bg-[hsl(var(--gaia-accent)/0.1)] text-[hsl(var(--gaia-accent))] border border-[hsl(var(--gaia-accent)/0.2)]">
                       {percent.toFixed(1)}% Used
                     </GaiaBadge>
                  </div>
                  <p className="text-xs text-[hsl(var(--gaia-muted))]">Distributed across Telegram clusters</p>
                </div>
              </div>
            </GaiaCard>
          </section>

          {/* Metrics Cards - Stacked on Mobile */}
          <div className="grid gap-4 grid-cols-1">
             <Metric icon={Database} label="Total Assets" value={String(stats.totalFiles)} sub="Individual files stored" />
             <Metric icon={Activity} label="Directory Structure" value={String(stats.folders)} sub="Organized folders" />
          </div>

          {/* Quick Actions - Stacked on Mobile */}
          <div className="grid gap-4 grid-cols-1 pt-2">
            <Quick href="/dashboard/files" title="Drive Explorer" description="Browse and manage files" />
            <Quick href="/dashboard/upload" title="Upload Center" description="Add new content" />
            <Quick href="/dashboard/settings" title="Configuration" description="Account and node settings" />
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--gaia-surface))] border-t border-[hsl(var(--gaia-border))] flex justify-around py-3 px-2 z-40 md:hidden">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 rounded-lg">
          <Database size={20} />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/dashboard/files" className="flex flex-col items-center gap-1 p-2 rounded-lg">
          <HardDrive size={20} />
          <span className="text-xs">Files</span>
        </Link>
        <Link href="/dashboard/upload" className="flex flex-col items-center gap-1 p-2 rounded-lg">
          <RefreshCw size={20} />
          <span className="text-xs">Upload</span>
        </Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-1 p-2 rounded-lg">
          <MoreHorizontal size={20} />
          <span className="text-xs">More</span>
        </Link>
      </nav>
    </div>
  );
}

function Metric({ icon: Icon, label, value, sub }) {
  return (
    <GaiaCard className="flex items-center gap-4 p-4 border-[hsl(var(--gaia-border)/0.5)]">
      <div className="p-3 rounded-xl bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-accent))]">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--gaia-muted))]">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        <p className="text-xs text-[hsl(var(--gaia-muted))] mt-1">{sub}</p>
      </div>
      <ChevronRight size={20} className="text-[hsl(var(--gaia-muted))]" />
    </GaiaCard>
  );
}

function Quick({ href, title, description }) {
  return (
    <Link href={href}>
      <GaiaCard className="h-full p-4 transition-all hover:scale-[1.02] hover:shadow-lg border-transparent hover:border-[hsl(var(--gaia-accent)/0.3)] bg-[hsl(var(--gaia-panel))] flex items-center justify-between">
        <div>
          <p className="font-bold">{title}</p>
          <p className="mt-1 text-sm text-[hsl(var(--gaia-muted))] leading-relaxed">{description}</p>
        </div>
        <ChevronRight size={20} className="text-[hsl(var(--gaia-muted))]" />
      </GaiaCard>
    </Link>
  );
}