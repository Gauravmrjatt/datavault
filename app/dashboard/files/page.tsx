"use client";

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';

import { GaiaCard, GaiaButton } from '@/components/gaia/primitives';
import { API_BASE, apiRequest } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { Folder, FileWithMetadata, BreadcrumbItem } from '@/lib/types';
import { transformFile, getFileIcon, formatFileSize } from '@/lib/file-utils';

import { FileManagerToolbar } from '@/components/file-manager/toolbar';
import { DropZone } from '@/components/file-manager/drop-zone';
import { FileGrid } from '@/components/file-manager/file-grid';
import { FileList as FileListView } from '@/components/file-manager/file-list';
import { FolderBreadcrumbs } from '@/components/folder-breadcrumbs';
import { UploadDialog } from '@/components/file-manager/upload-dialog';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { FilesSkeleton } from '../loading-skeletons/files-skeleton';

type UploadInlineTask = {
  id: string;
  name: string;
  progress: number;
  status: 'queued' | 'uploading' | 'completed' | 'failed';
  error?: string;
  size?: number;
  extension?: string;
};

const CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_RETRIES = 4;

export default function DriveFilesPage() {
  const { token } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState('');
  
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [previewFile, setPreviewFile] = useState<FileWithMetadata | null>(null);
  const [shareFile, setShareFile] = useState<FileWithMetadata | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [offline, setOffline] = useState(false);
  const [uploadTasks, setUploadTasks] = useState<UploadInlineTask[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const refresh = async (folderId = currentFolderId) => {
    setLoading(true);
    try {
      const query = folderId ? `?folderId=${folderId}` : '';
      const payload = await apiRequest(`/api/drive/items${query}`, { token });
      setFolders(payload.folders || []);
      
      const rawFiles = payload.files || [];
      const transformedFiles = rawFiles.map(transformFile);
      setFiles(transformedFiles);
      
      setBreadcrumbs(payload.breadcrumbs || []);
    } catch (error) {
      console.error("Failed to load drive items:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refresh(null);
    }
  }, [token]);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    setOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const filteredItems = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    
    let filteredF = files;
    let filteredFolders = folders;

    if (search) {
      filteredF = filteredF.filter((f) => f.name.toLowerCase().includes(lowerSearch));
      filteredFolders = filteredFolders.filter((f) => f.name.toLowerCase().includes(lowerSearch));
    }

    if (filter) {
      filteredF = filteredF.filter((f) => f.type.toLowerCase() === filter.toLowerCase());
       // Typically folders are always shown unless searching, but if filtering by file type, maybe hide folders?
       // For now, let's keep folders unless explicit search blocks them
       if (filter !== '') {
           // filteredFolders = []; // Uncomment to hide folders when filtering by type
       }
    }

    return { files: filteredF, folders: filteredFolders };
  }, [files, folders, search, filter]);

  const onOpenFolder = async (folderId: string | null) => {
    setCurrentFolderId(folderId);
    await refresh(folderId);
    setSelectedFiles([]);
    setSelectedFolders([]);
  };

  const onCreateFolder = async () => {
    const name = window.prompt('Folder name');
    if (!name) return;

    try {
      await apiRequest('/api/drive/folders', {
        token,
        method: 'POST',
        body: { name, parentId: currentFolderId }
      });
      await refresh(currentFolderId);
      toast.success("Folder created");
    } catch (_err) {
      toast.error("Failed to create folder");
    }
  };

  const onFileAction = async (action: string, file: FileWithMetadata) => {
      switch (action) {
          case 'preview':
              setPreviewFile(file);
              break;
          case 'download':
              window.open(`${API_BASE}/api/drive/files/${file.id}/download?token=${token}`);
              break;
          case 'share':
              setShareFile(file);
              break;
          case 'trash':
          case 'delete':
              if (confirm(`Are you sure you want to delete ${file.name}?`)) {
                  try {
                    await apiRequest(`/api/drive/files/${file.id}/trash`, { token, method: 'POST' });
                    setFiles(prev => prev.filter(f => f.id !== file.id));
                    toast.success("File moved to trash");
                  } catch (e) {
                      toast.error("Failed to delete file");
                  }
              }
              break;
          case 'rename':
               const newName = prompt("Rename file:", file.name);
               if (newName && newName !== file.name) {
                   // Implement rename API call here if available
                   toast.info("Rename functionality not fully connected yet");
               }
               break;
      }
  };

  const onFolderAction = async (action: string, folder: Folder) => {
      switch (action) {
          case 'delete':
              if (confirm(`Are you sure you want to delete ${folder.name}?`)) {
                  try {
                      await apiRequest(`/api/drive/folders/${folder._id}`, { token, method: 'DELETE' });
                      setFolders(prev => prev.filter(f => f._id !== folder._id));
                      toast.success("Folder deleted");
                  } catch (e: any) {
                      toast.error(e.message || "Failed to delete folder");
                  }
              }
              break;
          case 'rename':
               const newName = prompt("Rename folder:", folder.name);
               if (newName && newName !== folder.name) {
                   try {
                       await apiRequest(`/api/drive/folders/${folder._id}/rename`, {
                           token,
                           method: 'PATCH',
                           body: { name: newName }
                       });
                       setFolders(prev => prev.map(f => f._id === folder._id ? { ...f, name: newName } : f));
                       toast.success("Folder renamed");
                   } catch (e: any) {
                       toast.error(e.message || "Failed to rename folder");
                   }
               }
               break;
      }
  };

  const onCreateShareLink = async (fileId: string) => {
    try {
        const payload = await apiRequest(`/api/drive/files/${fileId}/share-links`, {
            token,
            method: 'POST',
            body: { permission: 'download', isPublic: true }
        });
        setShareUrl(payload.link.url);
    } catch (e) {
        toast.error("Failed to create share link");
    }
  };

  const updateTask = (id: string, patch: Partial<UploadInlineTask>) => {
    setUploadTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  };

  const uploadChunkWithRetry = async (fileId: string, uploadId: string, chunkIndex: number, buffer: ArrayBuffer) => {
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
      } catch (error: any) {
        attempt += 1;
        if (attempt >= MAX_RETRIES) throw error;
        await new Promise((resolve) => setTimeout(resolve, attempt * 700));
      }
    }
  };

  const handleUpload = async (fileList: FileList | File[]) => {
    if (!fileList || offline || !token) return;
    const list = Array.isArray(fileList) ? fileList : Array.from(fileList as ArrayLike<File>);

    for (const rawFile of list) {
      const taskId = `${rawFile.name}-${Date.now()}`;
      const ext = rawFile.name.split('.').pop() || '';
      setUploadTasks((prev) => [{ id: taskId, name: rawFile.name, progress: 0, status: 'queued', size: rawFile.size, extension: ext }, ...prev]);

      try {
        updateTask(taskId, { status: 'uploading', progress: 1 });
        const init = await apiRequest('/api/drive/files/initiate-upload', {
          token,
          method: 'POST',
          body: {
            name: rawFile.name,
            size: rawFile.size,
            mimeType: rawFile.type || 'application/octet-stream',
            folderId: currentFolderId,
            chunkSize: CHUNK_SIZE
          }
        });

        const totalChunks = Math.ceil(rawFile.size / CHUNK_SIZE);
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, rawFile.size);
          const chunkBuffer = await rawFile.slice(start, end).arrayBuffer();
          await uploadChunkWithRetry(init.fileId, init.uploadId, chunkIndex, chunkBuffer);
          updateTask(taskId, { progress: Math.round(((chunkIndex + 1) / totalChunks) * 95) });
        }

        await apiRequest(`/api/drive/files/${init.fileId}/complete-upload`, {
          token,
          method: 'POST',
          body: { uploadId: init.uploadId }
        });

        updateTask(taskId, { status: 'completed', progress: 100 });
        toast.success(`Uploaded ${rawFile.name}`);
      } catch (error: any) {
        console.error(error);
        updateTask(taskId, { status: 'failed', error: error.message || 'Upload failed' });
        toast.error(`Failed to upload ${rawFile.name}`);
      }
    }

    await refresh(currentFolderId);
  };

  const onBulkAction = async (action: string) => {
    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedFiles.length} files and ${selectedFolders.length} folders?`)) {
        let deletedFiles = 0;
        let deletedFolders = 0;

        // Delete Files
        for (const fileId of selectedFiles) {
           try {
               await apiRequest(`/api/drive/files/${fileId}/trash`, { token, method: 'POST' });
               deletedFiles++;
           } catch (e) { console.error(e); }
        }

        // Delete Folders
        for (const folderId of selectedFolders) {
           try {
               await apiRequest(`/api/drive/folders/${folderId}`, { token, method: 'DELETE' });
               deletedFolders++;
           } catch (e) { console.error(e); }
        }

        setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
        setFolders(prev => prev.filter(f => !selectedFolders.includes(f._id)));
        setSelectedFiles([]);
        setSelectedFolders([]);
        toast.success(`Deleted ${deletedFiles} files and ${deletedFolders} folders`);
      }
    } else if (action === 'download') {
       // Only download files for now
       selectedFiles.forEach(fileId => {
           window.open(`${API_BASE}/api/drive/files/${fileId}/download?token=${token}`);
       });
       toast.success(`Started download for ${selectedFiles.length} files`);
    }
  };

  if (loading) {
    return <FilesSkeleton />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <FileManagerToolbar
        search={search}
        onSearchChange={setSearch}
        view={view}
        onViewChange={setView}
        onUpload={() => setIsUploadDialogOpen(true)}
        onCreateFolder={onCreateFolder}
        filter={filter}
        onFilterChange={setFilter}
        selectedCount={selectedFiles.length + selectedFolders.length}
        onBulkAction={onBulkAction}
        onClearSelection={() => { setSelectedFiles([]); setSelectedFolders([]); }}
      />
      
      <UploadDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onFilesDropped={handleUpload}
        currentFolderId={currentFolderId}
      />

      <div className="flex-1 overflow-hidden pb-4">
        <DropZone onDrop={handleUpload} className="flex h-full flex-col gap-4">
             {/* Breadcrumbs */}
             <div className="flex items-center gap-2">
                <FolderBreadcrumbs items={breadcrumbs} onFolderClick={onOpenFolder} className="flex-1" />
             </div>

             {/* Upload Status */}
            {uploadTasks.length > 0 && (
                <div className="mb-4 space-y-3">
                {uploadTasks.map((task) => (
                    <GaiaCard key={task.id} className="relative flex items-center gap-4 p-4 border-[hsl(var(--gaia-border)/0.5)] group overflow-hidden animate-in slide-in-from-right-4 duration-300">
                      {/* Laser/Scanner Effect */}
                      {task.status === 'uploading' && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--gaia-accent)/0.03)] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                            <div className="absolute top-0 bottom-0 w-[1px] bg-[hsl(var(--gaia-accent))] shadow-[0_0_15px_hsl(var(--gaia-accent))] opacity-30 animate-laser" />
                        </div>
                      )}

                      <div className={`relative z-10 p-3 rounded-2xl ${
                        task.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        task.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                        'bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))]'
                      }`}>
                        {task.status === 'completed' ? <Icon icon="lucide:check-circle-2" className="w-5 h-5" /> :
                        task.status === 'failed' ? <Icon icon="lucide:alert-circle" className="w-5 h-5" /> :
                        task.status === 'uploading' ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> :
                        <Icon icon={getFileIcon(task.extension || '')} className="w-5 h-5" />}
                      </div>

                      <div className="relative z-10 flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold truncate pr-4">{task.name}</p>
                          <span className="text-xs font-medium tabular-nums text-[hsl(var(--gaia-muted))]">
                            {formatFileSize(task.size || 0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-[hsl(var(--gaia-soft))] overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 shadow-[0_0_8px_hsl(var(--gaia-accent)/0.4)] ${
                                task.status === 'failed' ? 'bg-red-500' : 
                                task.status === 'completed' ? 'bg-green-500 shadow-green-500/40' : 
                                'bg-[hsl(var(--gaia-accent))]'
                              }`}
                              style={{ width: `${task.progress}%` }} 
                            />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-tighter w-8 text-right">
                            {task.progress}%
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center gap-1">
                        <button onClick={() => setUploadTasks(prev => prev.filter(t => t.id !== task.id))} className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-[hsl(var(--gaia-muted))] transition-colors opacity-0 group-hover:opacity-100">
                          <X size={16} />
                        </button>
                      </div>
                    </GaiaCard>
                ))}
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto ">
                 {filteredItems.files.length === 0 && filteredItems.folders.length === 0 ? (
                    <div className="flex h-full items-center justify-center flex-col ">
                        {/* <FileDropzone onFilesDropped={handleUpload} className="max-w-2xl w-full" /> */}
                        <img src="/empty.svg" alt="Empty" className="max-w-[500px] w-full h-full object-contain" />
                        
                    </div>
                 ) : (
                    view === 'grid' ? (
                        <FileGrid
                            files={filteredItems.files}
                            folders={filteredItems.folders}
                            onFolderClick={onOpenFolder}
                            onFileSelect={(id, checked) => setSelectedFiles(prev => checked ? [...prev, id] : prev.filter(x => x !== id))}
                            onFolderSelect={(id, checked) => setSelectedFolders(prev => checked ? [...prev, id] : prev.filter(x => x !== id))}
                            selectedFiles={selectedFiles}
                            selectedFolders={selectedFolders}
                            onFileAction={onFileAction}
                            onFolderAction={onFolderAction}
                        />
                    ) : (
                        <FileListView
                            files={filteredItems.files}
                            folders={filteredItems.folders}
                            onFolderClick={onOpenFolder}
                            onFileSelect={(id, checked) => setSelectedFiles(prev => checked ? [...prev, id] : prev.filter(x => x !== id))}
                            onFolderSelect={(id, checked) => setSelectedFolders(prev => checked ? [...prev, id] : prev.filter(x => x !== id))}
                            selectedFiles={selectedFiles}
                            selectedFolders={selectedFolders}
                            onFileAction={onFileAction}
                            onFolderAction={onFolderAction}
                        />
                    )
                 )}
            </div>
        </DropZone>
      </div>

      {previewFile && <PreviewModal file={previewFile} token={token as string} onClose={() => setPreviewFile(null)} />}

      {shareFile && (
        <Modal title="Share file" onClose={() => { setShareFile(null); setShareUrl(''); }}>
          <p className="mb-2 text-sm">{shareFile.name}</p>
          {shareUrl ? (
            <GaiaCard>
              <p className="break-all text-xs">{shareUrl}</p>
              <GaiaButton size="sm" className="mt-2 w-full" onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); }}>
                  Copy Link
              </GaiaButton>
            </GaiaCard>
          ) : (
            <GaiaButton onClick={() => onCreateShareLink(shareFile.id)} className="w-full">Create public link</GaiaButton>
          )}
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <GaiaCard className="w-full max-w-lg shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-[hsl(var(--gaia-soft))]"><X size={18} /></button>
        </div>
        {children}
      </GaiaCard>
    </div>
  );
}

function PreviewModal({ file, token, onClose }: any) {
  const url = `${API_BASE}/api/drive/files/${file.id}/download?token=${token}`;

  return (
    <Modal title={file.name} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="relative flex min-h-[300px] items-center justify-center rounded-xl bg-[hsl(var(--gaia-soft))] overflow-hidden">
            {file.type === 'IMAGE' ? <img alt={file.name} src={url} className="max-h-[60vh] w-full object-contain" /> : null}
            {file.type === 'VIDEO' ? <video controls src={url} className="max-h-[60vh] w-full" /> : null}
            {file.type === 'AUDIO' ? <audio controls src={url} className="w-full p-4" /> : null}
            {file.type === 'PDF' ? <iframe title={file.name} src={url} className="h-[60vh] w-full" /> : null}
            {!['IMAGE', 'VIDEO', 'AUDIO', 'PDF'].includes(file.type) && (
                <div className="text-center p-8">
                    <p className="text-sm text-[hsl(var(--gaia-muted))]">Preview not available for this file type.</p>
                </div>
            )}
        </div>
        <div className="flex justify-end gap-2">
            <GaiaButton variant="ghost" onClick={onClose}>Close</GaiaButton>
            <a href={url} download={file.name} target="_blank" rel="noopener noreferrer">
                <GaiaButton>Download</GaiaButton>
            </a>
        </div>
      </div>
    </Modal>
  );
}
