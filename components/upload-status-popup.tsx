"use client";

import { useUpload } from '@/contexts/upload-context';
import { Icon } from '@iconify/react';
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw, X, Trash2 } from 'lucide-react';
import { getFileIcon } from '@/lib/file-utils';
import { motion, AnimatePresence } from 'framer-motion';

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

export function UploadStatusPopup() {
  const { 
    tasks, 
    isMinimized, 
    setIsMinimized, 
    togglePause, 
    removeTask, 
    retryTask,
    clearCompleted,
    activeCount,
    queuedCount,
    hasActive
  } = useUpload();

  if (tasks.length === 0) return null;

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const totalProgress = tasks.length > 0 
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
    : 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 right-4 z-50 w-full max-w-md px-4 sm:px-0"
    >
      <div className="bg-[hsl(var(--gaia-panel))] border border-[hsl(var(--gaia-border))] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[hsl(var(--gaia-soft)/0.5)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--gaia-accent)/0.1)] flex items-center justify-center">
                {hasActive ? (
                  <div className="w-5 h-5 border-2 border-[hsl(var(--gaia-accent))] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-[hsl(var(--gaia-accent))]" />
                )}
              </div>
              {hasActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[hsl(var(--gaia-accent))] rounded-full animate-pulse" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[hsl(var(--gaia-text))]">
                {hasActive ? `Uploading ${activeCount + queuedCount} file${activeCount + queuedCount > 1 ? 's' : ''}` : 'Uploads complete'}
              </p>
              <p className="text-xs text-[hsl(var(--gaia-muted))]">
                {totalProgress}% • {tasks.length} total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {completedTasks.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearCompleted();
                }}
                className="p-2 rounded-xl hover:bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))] transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
            {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="h-2 rounded-full bg-[hsl(var(--gaia-soft))] overflow-hidden">
            <motion.div 
              className="h-full bg-[hsl(var(--gaia-accent))] shadow-[0_0_12px_hsl(var(--gaia-accent)/0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Task List */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-96 overflow-y-auto px-4 pb-4 space-y-2">
                {activeTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative bg-[hsl(var(--gaia-surface))] rounded-2xl p-3 group"
                  >
                    {/* Scanning effect for active uploads */}
                    {task.status === 'uploading' && (
                      <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--gaia-accent)/0.05)] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                      </div>
                    )}

                    <div className="relative flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        task.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        task.status === 'error' ? 'bg-red-500/10 text-red-500' :
                        'bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))]'
                      }`}>
                        {task.status === 'completed' ? <Icon icon="lucide:check-circle-2" className="w-4 h-4" /> :
                         task.status === 'error' ? <Icon icon="lucide:alert-circle" className="w-4 h-4" /> :
                         task.status === 'uploading' ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> :
                         <Icon icon={getFileIcon(task.extension)} className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-[hsl(var(--gaia-text))]">{task.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--gaia-soft))] overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                task.status === 'error' ? 'bg-red-500' : 'bg-[hsl(var(--gaia-accent))]'
                              }`}
                              style={{ width: `${task.progress}%` }} 
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[hsl(var(--gaia-muted))] w-8 text-right">
                            {task.progress}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {task.status === 'uploading' && (
                          <button 
                            onClick={() => togglePause(task.id)} 
                            className="p-1.5 rounded-lg hover:bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))] transition-colors"
                          >
                            <Pause size={14} />
                          </button>
                        )}
                        {task.status === 'paused' && (
                          <button 
                            onClick={() => togglePause(task.id)} 
                            className="p-1.5 rounded-lg hover:bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-accent))] transition-colors"
                          >
                            <Play size={14} />
                          </button>
                        )}
                        {task.status === 'error' && (
                          <button 
                            onClick={() => retryTask(task.id)} 
                            className="p-1.5 rounded-lg hover:bg-[hsl(var(--gaia-soft))] text-red-500 transition-colors"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => removeTask(task.id)} 
                          className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-[hsl(var(--gaia-muted))] transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {completedTasks.length > 0 && (
                  <div className="pt-2 border-t border-[hsl(var(--gaia-border))]">
                    <p className="text-xs font-bold text-[hsl(var(--gaia-muted))] mb-2 px-1">
                      Completed ({completedTasks.length})
                    </p>
                    {completedTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-2 px-1 py-1.5">
                        <Icon icon="lucide:check-circle-2" className="w-3 h-3 text-green-500" />
                        <p className="text-xs truncate flex-1 text-[hsl(var(--gaia-muted))]">{task.name}</p>
                        <span className="text-[10px] text-[hsl(var(--gaia-muted))]">{human(task.size)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
