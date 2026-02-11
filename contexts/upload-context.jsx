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
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client before accessing localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load tasks from localStorage on mount
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out completed tasks older than 1 hour
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const filtered = parsed.filter(t => 
          t.status !== 'completed' || (t.completedAt && t.completedAt > oneHourAgo)
        );
        // Remove file objects as they can't be serialized
        const sanitized = filtered.map(t => ({ ...t, file: null }));
        setTasks(sanitized);
      }
    } catch (error) {
      console.error('Failed to load upload queue:', error);
    }
  }, [isClient]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!isClient) return;
    
    tasksRef.current = tasks;
    try {
      // Remove file objects before saving to localStorage
      const serializable = tasks.map(t => {
        const { file, ...rest } = t;
        return rest;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch (error) {
      console.error('Failed to save upload queue:', error);
    }
  }, [tasks, isClient]);

  // Auto-resume incomplete uploads when token is available
  useEffect(() => {
    if (!token || !isClient) return;
    
    const incompleteUploads = tasks.filter(
      t => (t.status === 'uploading' || t.status === 'queued') && t.uploadId && t.fileId
    );
    
    // Can't resume uploads without file data
    if (incompleteUploads.length > 0) {
      // Mark them as paused since we can't resume without file data
      setTasks(prev => prev.map(t => 
        incompleteUploads.find(u => u.id === t.id) 
          ? { ...t, status: 'paused', error: 'Resume not available - file data lost' }
          : t
      ));
    }
  }, [token, isClient]);

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
    if (!task || task.status === 'completed' || !task.file) {
      if (task && !task.file) {
        setTasks((prev) => prev.map((t) => 
          t.id === taskId ? { ...t, status: 'error', error: 'File data not available' } : t
        ));
      }
      return;
    }

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
    if (!files || files.length === 0) return;
    
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
      
      if (isCurrentlyPaused && task.file) {
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
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.file) {
      toast.error('Cannot retry - file data not available');
      return;
    }
    
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
