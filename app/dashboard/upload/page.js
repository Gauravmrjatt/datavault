"use client";

import { useEffect, useRef , useState } from 'react';
import { Pause, Play, RotateCcw, UploadCloud, X } from 'lucide-react';
import { Icon } from '@iconify/react';
import { GaiaButton, GaiaCard } from '@/components/gaia/primitives';
import { API_BASE } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { useUpload } from '@/contexts/upload-context';
import { getFileIcon } from '@/lib/file-utils';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { UploadSkeleton } from '../loading-skeletons/upload-skeleton';
import { motion } from 'framer-motion';

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

export default function UploadManagerPage() {
  const { token } = useAuth();
  const { tasks, addFiles, togglePause, removeTask, retryTask, activeCount, queuedCount } = useUpload();
  const [loading, setLoading] = useState(true);
  const fileInput = useRef(null);

  useEffect(() => {
    if (token) {
      setLoading(false);
    }
  }, [token]);

  const totalProgress = tasks.length > 0 
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
    : 0;

  if (loading) {
    return <UploadSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 px-4 sm:px-0">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Uploads</h1>
          <p className="text-sm text-[hsl(var(--gaia-muted))] mt-1">Manage your file transfers</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <input ref={fileInput} type="file" multiple className="hidden" onChange={(event) => addFiles(Array.from(event.target.files || []))} />
          <GaiaButton 
            variant="ghost" 
            onClick={() => fileInput.current?.click()} 
            className="flex-1 sm:flex-none rounded-2xl border-[hsl(var(--gaia-border))] h-11"
          >
            <Icon icon="lucide:plus" className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Files</span>
          </GaiaButton>
        </div>
      </header>

      <section className="grid gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GaiaCard className="p-4 sm:p-6 bg-gradient-to-br from-[hsl(var(--gaia-panel))] to-[hsl(var(--gaia-surface))] border-none shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-2xl bg-[hsl(var(--gaia-accent)/0.1)] text-[hsl(var(--gaia-accent))]">
                  <UploadCloud size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Queue Status</h3>
                  <p className="text-[10px] sm:text-xs text-[hsl(var(--gaia-muted))] uppercase tracking-widest font-bold">
                    {tasks.length} Total • {activeCount} Active • {queuedCount} Queued
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black">{totalProgress}%</span>
              </div>
            </div>
            <div className="h-2 sm:h-3 rounded-full bg-[hsl(var(--gaia-soft))] overflow-hidden">
              <motion.div 
                className="h-full bg-[hsl(var(--gaia-accent))] transition-all duration-500 ease-out shadow-[0_0_12px_hsl(var(--gaia-accent))]" 
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
              />
            </div>
          </GaiaCard>
        </motion.div>

        <div className="space-y-2 sm:space-y-3">
          {tasks.length === 0 ? (
            <FileDropzone onFilesDropped={(files) => addFiles(files)} className="py-16 sm:py-20" />
          ) : (
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GaiaCard className="relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-[hsl(var(--gaia-border)/0.5)] group overflow-hidden">
                  {/* Laser/Scanner Effect */}
                  {task.status === 'uploading' && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--gaia-accent)/0.03)] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                      <div className="absolute top-0 bottom-0 w-[1px] bg-[hsl(var(--gaia-accent))] shadow-[0_0_15px_hsl(var(--gaia-accent))] opacity-30 animate-laser" />
                    </div>
                  )}

                  <div className={`relative z-10 p-2 sm:p-3 rounded-xl sm:rounded-2xl ${
                    task.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                    task.status === 'error' ? 'bg-red-500/10 text-red-500' :
                    'bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))]'
                  }`}>
                    {task.status === 'completed' ? <Icon icon="lucide:check-circle-2" className="w-4 h-4 sm:w-5 sm:h-5" /> :
                     task.status === 'error' ? <Icon icon="lucide:alert-circle" className="w-4 h-4 sm:w-5 sm:h-5" /> :
                     task.status === 'uploading' ? <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> :
                     <Icon icon={getFileIcon(task.extension)} className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs sm:text-sm font-bold truncate pr-2 sm:pr-4">{task.name}</p>
                      <span className="text-[10px] sm:text-xs font-medium tabular-nums text-[hsl(var(--gaia-muted))] flex-shrink-0">
                        {human(task.size)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-[hsl(var(--gaia-soft))] overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 shadow-[0_0_8px_hsl(var(--gaia-accent)/0.4)] ${
                            task.status === 'error' ? 'bg-red-500' : 'bg-[hsl(var(--gaia-accent))]'
                          }`}
                          style={{ width: `${task.progress}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter w-7 sm:w-8 text-right">
                        {task.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {task.status === 'uploading' && (
                      <button onClick={() => togglePause(task.id)} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))] transition-colors">
                        <Pause size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    )}
                    {task.status === 'paused' && (
                      <button onClick={() => togglePause(task.id)} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-accent))] transition-colors">
                        <Play size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    )}
                    {task.status === 'error' && (
                      <button onClick={() => retryTask(task.id)} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-[hsl(var(--gaia-soft))] text-red-500 transition-colors">
                        <RotateCcw size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    )}
                    <button onClick={() => removeTask(task.id)} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-red-500/10 hover:text-red-500 text-[hsl(var(--gaia-muted))] transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <X size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </GaiaCard>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <footer className="pt-4">
        <GaiaCard className="p-3 sm:p-4 bg-[hsl(var(--gaia-soft)/0.5)] border-none">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[hsl(var(--gaia-muted))] text-center">
            Storage Node: <span className="text-[hsl(var(--gaia-text))]">{API_BASE}</span>
          </p>
        </GaiaCard>
      </footer>
    </div>
  );
}