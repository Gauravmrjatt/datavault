"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, UploadCloud, X } from 'lucide-react';
import { Icon } from '@iconify/react';
import { GaiaBadge, GaiaButton, GaiaCard } from '@/components/gaia/primitives';
import { apiRequest, API_BASE } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { getFileIcon } from '@/lib/file-utils';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { UploadSkeleton } from '../loading-skeletons/upload-skeleton';

const CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_RETRIES = 3;

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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInput = useRef(null);
  const tasksRef = useRef([]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (token) {
      setLoading(false);
    }
  }, [token]);

  const addFiles = (files) => {
    const next = Array.from(files).map((file) => {
      const ext = file.name.split('.').pop() || '';
      return {
        id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        file,
        name: file.name,
        extension: ext,
        size: file.size,
        status: 'queued',
        progress: 0,
        uploadId: null,
        fileId: null,
        chunkIndex: 0,
        error: null,
        paused: false
      };
    });
    setTasks((prev) => [...next, ...prev]);
  };

  const uploadChunkWithRetry = async (fileId, uploadId, chunkIndex, buffer) => {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        await apiRequest(`/api/drive/files/${fileId}/chunks/${chunkIndex}`, {
          token,
          method: 'PUT',
          body: buffer,
          raw: true,
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Upload-Id': uploadId
          }
        });
        return;
      } catch (error) {
        attempt += 1;
        if (attempt >= MAX_RETRIES) throw error;
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  };

  const runTask = async (taskId) => {
    const task = tasksRef.current.find((t) => t.id === taskId);
    if (!task || task.status === 'completed') return;

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'uploading', error: null } : t)));

    try {
      // Initiate upload if not already started
      let { fileId, uploadId, chunkIndex } = task;
      
      if (!uploadId) {
        const init = await apiRequest('/api/drive/files/initiate-upload', {
          token,
          method: 'POST',
          body: {
            name: task.name,
            size: task.size,
            mimeType: task.file.type || 'application/octet-stream',
            chunkSize: CHUNK_SIZE
          }
        });
        fileId = init.fileId;
        uploadId = init.uploadId;
        chunkIndex = 0;
        
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, uploadId, fileId, chunkIndex } : t))
        );
      }

      const totalChunks = Math.ceil(task.size / CHUNK_SIZE);

      while (chunkIndex < totalChunks) {
        // Re-check status from ref in each iteration
        const currentTask = tasksRef.current.find((t) => t.id === taskId);
        if (!currentTask || currentTask.paused || currentTask.status !== 'uploading') {
          return;
        }

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, task.size);
        const chunkBuffer = await task.file.slice(start, end).arrayBuffer();

        await uploadChunkWithRetry(fileId, uploadId, chunkIndex, chunkBuffer);

        chunkIndex += 1;
        const progress = Math.round((chunkIndex / totalChunks) * 100);
        
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, progress, chunkIndex } : t))
        );
      }

      await apiRequest(`/api/drive/files/${fileId}/complete-upload`, {
        token,
        method: 'POST',
        body: { uploadId }
      });

      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t)));
      toast.success(`Completed: ${task.name}`);
    } catch (error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'error', error: error.message || 'Upload failed' } : t))
      );
      toast.error(`Failed: ${task.name}`);
    }
  };

  const startAll = async () => {
    const queuedTasks = tasks.filter(t => t.status === 'queued' || t.status === 'error' || t.status === 'paused');
    for (const task of queuedTasks) {
       runTask(task.id); // Run in parallel or sequential? Sequential is safer for rate limits.
       // For parallel, just call runTask(task.id) without await.
       // Let's do a small delay between starts.
       await new Promise(r => setTimeout(r, 100));
    }
  };

  const togglePause = (taskId) => {
    setTasks((prev) => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;
      
      const isCurrentlyPaused = task.status === 'paused';
      const nextStatus = isCurrentlyPaused ? 'uploading' : 'paused';
      
      const newTasks = prev.map((t) => (t.id === taskId ? { ...t, paused: !isCurrentlyPaused, status: nextStatus } : t));
      
      if (isCurrentlyPaused) {
         // Resume
         setTimeout(() => runTask(taskId), 0);
      }
      
      return newTasks;
    });
  };

  const removeTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const totalProgress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length);
  }, [tasks]);

  if (loading) {
    return <UploadSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Uploads</h1>
          <p className="text-[hsl(var(--gaia-muted))] mt-1">Manage your active and queued file transfers.</p>
        </div>
        <div className="flex gap-3">
          <input ref={fileInput} type="file" multiple className="hidden" onChange={(event) => addFiles(event.target.files || [])} />
          <GaiaButton variant="ghost" onClick={() => fileInput.current?.click()} className="rounded-2xl border-[hsl(var(--gaia-border))]">
            Add Files
          </GaiaButton>
          <GaiaButton onClick={startAll} disabled={tasks.length === 0} className="rounded-2xl shadow-lg shadow-[hsl(var(--gaia-accent)/0.3)]">
            <UploadCloud size={18} className="mr-2" /> Start All
          </GaiaButton>
        </div>
      </header>

      <section className="grid gap-6">
        <GaiaCard className="p-6 bg-gradient-to-br from-[hsl(var(--gaia-panel))] to-[hsl(var(--gaia-surface))] border-none shadow-xl">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="p-3 rounded-2xl bg-[hsl(var(--gaia-accent)/0.1)] text-[hsl(var(--gaia-accent))]">
                    <UploadCloud size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold">Queue Status</h3>
                    <p className="text-xs text-[hsl(var(--gaia-muted))] uppercase tracking-widest font-bold">{tasks.length} Total Tasks</p>
                 </div>
              </div>
              <div className="text-right">
                 <span className="text-3xl font-black">{totalProgress}%</span>
              </div>
           </div>
           <div className="h-3 rounded-full bg-[hsl(var(--gaia-soft))] overflow-hidden">
              <div 
                className="h-full bg-[hsl(var(--gaia-accent))] transition-all duration-500 ease-out shadow-[0_0_12px_hsl(var(--gaia-accent))]" 
                style={{ width: `${totalProgress}%` }} 
              />
           </div>
        </GaiaCard>

        <div className="space-y-3">
          {tasks.length === 0 ? (
             <FileDropzone onFilesDropped={addFiles} className="py-20" />
          ) : (
            tasks.map((task) => (
              <GaiaCard key={task.id} className="relative flex items-center gap-4 p-4 border-[hsl(var(--gaia-border)/0.5)] group overflow-hidden">
                {/* Laser/Scanner Effect */}
                {task.status === 'uploading' && (
                  <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--gaia-accent)/0.03)] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                      <div className="absolute top-0 bottom-0 w-[1px] bg-[hsl(var(--gaia-accent))] shadow-[0_0_15px_hsl(var(--gaia-accent))] opacity-30 animate-laser" />
                  </div>
                )}

                <div className={`relative z-10 p-3 rounded-2xl ${
                  task.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                  task.status === 'error' ? 'bg-red-500/10 text-red-500' :
                  'bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))]'
                }`}>
                  {task.status === 'completed' ? <Icon icon="lucide:check-circle-2" className="w-5 h-5" /> :
                   task.status === 'error' ? <Icon icon="lucide:alert-circle" className="w-5 h-5" /> :
                   task.status === 'uploading' ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> :
                   <Icon icon={getFileIcon(task.extension)} className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold truncate pr-4">{task.name}</p>
                    <span className="text-xs font-medium tabular-nums text-[hsl(var(--gaia-muted))]">
                      {human(task.size)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-[hsl(var(--gaia-soft))] overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 shadow-[0_0_8px_hsl(var(--gaia-accent)/0.4)] ${
                          task.status === 'error' ? 'bg-red-500' : 'bg-[hsl(var(--gaia-accent))]'
                        }`}
                        style={{ width: `${task.progress}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter w-8 text-right">
                      {task.progress}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {task.status === 'uploading' && (
                    <button onClick={() => togglePause(task.id)} className="p-2 rounded-xl hover:bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))] transition-colors">
                      <Pause size={16} />
                    </button>
                  )}
                  {task.status === 'paused' && (
                    <button onClick={() => togglePause(task.id)} className="p-2 rounded-xl hover:bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-accent))] transition-colors">
                      <Play size={16} />
                    </button>
                  )}
                  {task.status === 'error' && (
                    <button onClick={() => runTask(task.id)} className="p-2 rounded-xl hover:bg-[hsl(var(--gaia-soft))] text-red-500 transition-colors">
                      <RotateCcw size={16} />
                    </button>
                  )}
                  <button onClick={() => removeTask(task.id)} className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-[hsl(var(--gaia-muted))] transition-colors opacity-0 group-hover:opacity-100">
                    <X size={16} />
                  </button>
                </div>
              </GaiaCard>
            ))
          )}
        </div>
      </section>

      <footer className="pt-4">
         <GaiaCard className="p-4 bg-[hsl(var(--gaia-soft)/0.5)] border-none">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[hsl(var(--gaia-muted))] text-center">
              Distributed Telegram Storage Node: <span className="text-[hsl(var(--gaia-text))]">{API_BASE}</span>
            </p>
         </GaiaCard>
      </footer>
    </div>
  );
}