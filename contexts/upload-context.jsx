"use client";

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './auth-context';
import { apiRequest } from '@/lib/api-client';
import { toast } from 'sonner';

const UploadContext = createContext(null);

const CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_RETRIES = 3;
const STORAGE_KEY = 'gaia_upload_queue';

export function UploadProvider({ children }) {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const tasksRef = useRef([]);
  const activeUploadsRef = useRef(new Set());

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out completed tasks older than 1 hour
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const filtered = parsed.filter(t => 
          t.status !== 'completed' || (t.completedAt && t.completedAt > oneHourAgo)
        );
        setTasks(filtered);
      }
    } catch (error) {
      console.error('Failed to load upload queue:', error);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    tasksRef.current = tasks;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save upload queue:', error);
    }
  }, [tasks]);

  // Auto-resume incomplete uploads when token is available
  useEffect(() => {
    if (!token) return;
    
    const incompleteUploads = tasks.filter(
      t => t.status === 'uploading' || t.status === 'queued'
    );
    
    incompleteUploads.forEach(task => {
      if (!activeUploadsRef.current.has(task.id)) {
        setTimeout(() => runTask(task.id), 100);
      }
    });
  }, [token]);

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
    if (activeUploadsRef.current.has(taskId)) return;
    
    const task = tasksRef.current.find((t) => t.id === taskId);
    if (!task || task.status === 'completed') return;

    activeUploadsRef.current.add(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'uploading', error: null } : t)));

    try {
      let { fileId, uploadId, chunkIndex } = task;
      
      if (!uploadId) {
        const init = await apiRequest('/api/drive/files/initiate-upload', {
          token,
          method: 'POST',
          body: {
            name: task.name,
            size: task.size,
            mimeType: task.file?.type || 'application/octet-stream',
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
        const currentTask = tasksRef.current.find((t) => t.id === taskId);
        if (!currentTask || currentTask.paused || currentTask.status !== 'uploading') {
          activeUploadsRef.current.delete(taskId);
          return;
        }

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, task.size);
        
        // For resumed uploads, we need to reconstruct the file from stored data
        if (!task.file) {
          throw new Error('File data not available for upload');
        }
        
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

      setTasks((prev) => prev.map((t) => 
        t.id === taskId ? { ...t, status: 'completed', progress: 100, completedAt: Date.now() } : t
      ));
      toast.success(`Uploaded: ${task.name}`);
    } catch (error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'error', error: error.message || 'Upload failed' } : t))
      );
      toast.error(`Failed: ${task.name}`);
    } finally {
      activeUploadsRef.current.delete(taskId);
    }
  };

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
        paused: false,
        addedAt: Date.now()
      };
    });
    setTasks((prev) => [...next, ...prev]);
    setIsMinimized(false);
    
    // Auto-start uploads
    next.forEach(task => {
      setTimeout(() => runTask(task.id), 100);
    });
  };

  const togglePause = (taskId) => {
    setTasks((prev) => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;
      
      const isCurrentlyPaused = task.status === 'paused';
      const nextStatus = isCurrentlyPaused ? 'uploading' : 'paused';
      
      const newTasks = prev.map((t) => (t.id === taskId ? { ...t, paused: !isCurrentlyPaused, status: nextStatus } : t));
      
      if (isCurrentlyPaused) {
        setTimeout(() => runTask(taskId), 0);
      }
      
      return newTasks;
    });
  };

  const removeTask = (taskId) => {
    activeUploadsRef.current.delete(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => t.status !== 'completed'));
  };

  const retryTask = (taskId) => {
    setTasks((prev) => prev.map((t) => 
      t.id === taskId ? { ...t, status: 'queued', error: null, progress: 0 } : t
    ));
    setTimeout(() => runTask(taskId), 100);
  };

  const activeCount = tasks.filter(t => t.status === 'uploading').length;
  const queuedCount = tasks.filter(t => t.status === 'queued').length;
  const hasActive = activeCount > 0 || queuedCount > 0;

  return (
    <UploadContext.Provider value={{
      tasks,
      addFiles,
      togglePause,
      removeTask,
      clearCompleted,
      retryTask,
      runTask,
      isMinimized,
      setIsMinimized,
      activeCount,
      queuedCount,
      hasActive
    }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within UploadProvider');
  }
  return context;
}
