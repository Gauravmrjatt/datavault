"use client";

import { useEffect, useMemo, useState } from 'react';
import { X, MoreHorizontal, Folder as FolderIcon, FileText, Search, Filter, Grid3x3, List, Plus, Download, Trash2, Eye, Share2, Pencil, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';

import { GaiaCard, GaiaButton, GaiaInput } from '@/components/gaia/primitives';
import { API_BASE, apiRequest } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { Folder, FileWithMetadata, BreadcrumbItem } from '@/lib/types';
import { transformFile, getFileIcon, formatFileSize } from '@/lib/file-utils';

import { FolderBreadcrumbs } from '@/components/folder-breadcrumbs';
import { UploadDialog } from '@/components/file-manager/upload-dialog';
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
    const onOnline = () => setOffline(!false);
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
    <div className="flex flex-col h-screen bg-[hsl(var(--gaia-bg))]">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-[hsl(var(--gaia-bg))] border-b border-[hsl(var(--gaia-border))] p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Files</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsUploadDialogOpen(true)}
            className="p-2 rounded-lg bg-[hsl(var(--gaia-accent))] text-[hsl(var(--gaia-accent-foreground))]"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Toolbar - Mobile Optimized */}
        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--gaia-muted))]" />
            <GaiaInput
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Search files and folders..."
              className="pl-9"
            />
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-2">
            <button 
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              className="flex-1 flex items-center justify-center p-3 rounded-xl bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-text))]"
            >
              {view === 'grid' ? <List size={20} /> : <Grid3x3 size={20} />}
            </button>
            
            <button 
              onClick={onCreateFolder}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-text))]"
            >
              <Plus size={20} />
              <span>Folder</span>
            </button>
          </div>

          {/* Selected Items Actions */}
          {(selectedFiles.length > 0 || selectedFolders.length > 0) && (
            <div className="flex gap-2 p-3 rounded-xl bg-[hsl(var(--gaia-soft))]">
              <span className="font-semibold text-[hsl(var(--gaia-accent))] flex-1">
                {selectedFiles.length + selectedFolders.length} selected
              </span>
              <button 
                onClick={() => onBulkAction('download')}
                className="p-2 rounded-lg bg-[hsl(var(--gaia-accent)/0.1)] text-[hsl(var(--gaia-accent))]"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={() => onBulkAction('delete')}
                className="p-2 rounded-lg bg-red-500/10 text-red-500"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={() => { setSelectedFiles([]); setSelectedFolders([]); }}
                className="p-2 rounded-lg bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-text))]"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        <div className="px-4 pb-2">
          <FolderBreadcrumbs items={breadcrumbs} onFolderClick={onOpenFolder} className="flex-1" />
        </div>

        {/* Upload Status */}
        {uploadTasks.length > 0 && (
          <div className="px-4 pb-4 space-y-3">
          {uploadTasks.map((task) => (
            <GaiaCard key={task.id} className="relative flex items-center gap-3 p-3 border-[hsl(var(--gaia-border)/0.5)] group overflow-hidden">
              <div className={`p-2 rounded-xl ${
                task.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                task.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                'bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))]'
              }`}>
                {task.status === 'completed' ? <Icon icon="lucide:check-circle-2" className="w-4 h-4" /> :
                task.status === 'failed' ? <Icon icon="lucide:alert-circle" className="w-4 h-4" /> :
                task.status === 'uploading' ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> :
                <Icon icon={getFileIcon(task.extension || '')} className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold truncate">{task.name}</p>
                  <span className="text-xs font-medium tabular-nums text-[hsl(var(--gaia-muted))]">
                    {formatFileSize(task.size || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--gaia-soft))] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        task.status === 'failed' ? 'bg-red-500' :
                        task.status === 'completed' ? 'bg-green-500' :
                        'bg-[hsl(var(--gaia-accent))]'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter w-6 text-right">
                    {task.progress}%
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setUploadTasks(prev => prev.filter(t => t.id !== task.id))} 
                className="p-1 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-[hsl(var(--gaia-muted))] transition-colors"
              >
                <X size={16} />
              </button>
            </GaiaCard>
          ))}
          </div>
        )}

        {/* Content Area */}
        <div className="px-4 pb-4">
          {filteredItems.files.length === 0 && filteredItems.folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 rounded-full bg-[hsl(var(--gaia-soft))] flex items-center justify-center mb-4">
                <FolderIcon className="w-12 h-12 text-[hsl(var(--gaia-muted))]" />
              </div>
              <p className="text-[hsl(var(--gaia-muted))] text-center">No files or folders found</p>
              <button 
                onClick={() => setIsUploadDialogOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-[hsl(var(--gaia-accent))] text-[hsl(var(--gaia-accent-foreground))]"
              >
                Upload Files
              </button>
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
              <FileList
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
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--gaia-surface))] border-t border-[hsl(var(--gaia-border))] flex justify-around py-3 px-2 z-40 md:hidden">
        <button className="flex flex-col items-center gap-1 p-2 rounded-lg">
          <FolderIcon size={20} />
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[hsl(var(--gaia-soft))]">
          <FileText size={20} />
          <span className="text-xs">Files</span>
        </button>
        <button 
          onClick={() => setIsUploadDialogOpen(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-lg"
        >
          <UploadCloud size={20} />
          <span className="text-xs">Upload</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 rounded-lg">
          <MoreHorizontal size={20} />
          <span className="text-xs">More</span>
        </button>
      </nav>

      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onFilesDropped={handleUpload}
        currentFolderId={currentFolderId}
      />

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

function FileGrid({ 
  files, 
  folders, 
  onFolderClick, 
  onFileSelect, 
  onFolderSelect, 
  selectedFiles, 
  selectedFolders, 
  onFileAction, 
  onFolderAction 
}: any) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {folders.map((folder: Folder) => (
        <div 
          key={folder._id}
          className={`p-3 rounded-2xl border bg-[hsl(var(--gaia-panel))] ${
            selectedFolders.includes(folder._id) 
              ? 'border-[hsl(var(--gaia-accent))] bg-[hsl(var(--gaia-soft))]' 
              : 'border-[hsl(var(--gaia-border))]'
          }`}
          onClick={() => onFolderClick(folder._id)}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
              <FolderIcon className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-sm truncate w-full">{folder.name}</h3>
            <p className="text-xs text-[hsl(var(--gaia-muted))]">Folder</p>
          </div>
          
          <div className="absolute top-2 right-2">
            <input
              type="checkbox"
              checked={selectedFolders.includes(folder._id)}
              onChange={(e) => onFolderSelect(folder._id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 rounded border-[hsl(var(--gaia-border))] text-[hsl(var(--gaia-accent))] focus:ring-[hsl(var(--gaia-accent))]"
            />
          </div>
        </div>
      ))}

      {files.map((file: FileWithMetadata) => {
        const iconName = getFileIcon(file.extension);
        return (
          <div 
            key={file.id}
            className={`p-3 rounded-2xl border bg-[hsl(var(--gaia-panel))] ${
              selectedFiles.includes(file.id) 
                ? 'border-[hsl(var(--gaia-accent))] bg-[hsl(var(--gaia-soft))]' 
                : 'border-[hsl(var(--gaia-border))]'
            }`}
            onDoubleClick={() => onFileAction('preview', file)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--gaia-soft))] flex items-center justify-center mb-2">
                <Icon icon={iconName} className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-sm truncate w-full">{file.name}</h3>
              <p className="text-xs text-[hsl(var(--gaia-muted))]">{file.size}</p>
            </div>
            
            <div className="absolute top-2 right-2">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.id)}
                onChange={(e) => onFileSelect(file.id, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-5 rounded border-[hsl(var(--gaia-border))] text-[hsl(var(--gaia-accent))] focus:ring-[hsl(var(--gaia-accent))]"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FileList({ 
  files, 
  folders, 
  onFolderClick, 
  onFileSelect, 
  onFolderSelect, 
  selectedFiles, 
  selectedFolders, 
  onFileAction, 
  onFolderAction 
}: any) {
  return (
    <div className="space-y-1">
      {folders.map((folder: Folder) => (
        <div 
          key={folder._id}
          className={`flex items-center p-3 rounded-xl ${
            selectedFolders.includes(folder._id) 
              ? 'bg-[hsl(var(--gaia-soft))]' 
              : 'hover:bg-[hsl(var(--gaia-soft))]'
          }`}
          onClick={() => onFolderClick(folder._id)}
        >
          <input
            type="checkbox"
            checked={selectedFolders.includes(folder._id)}
            onChange={(e) => onFolderSelect(folder._id, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 rounded border-[hsl(var(--gaia-border))] text-[hsl(var(--gaia-accent))] focus:ring-[hsl(var(--gaia-accent))]"
          />
          <div className="flex items-center gap-3 ml-3 flex-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <FolderIcon className="h-4 w-4 fill-current" />
            </div>
            <span className="font-medium text-[hsl(var(--gaia-text))]">{folder.name}</span>
          </div>
          <span className="text-xs text-[hsl(var(--gaia-muted))]">Folder</span>
        </div>
      ))}

      {files.map((file: FileWithMetadata) => {
        const iconName = getFileIcon(file.extension);
        return (
          <div 
            key={file.id}
            className={`flex items-center p-3 rounded-xl ${
              selectedFiles.includes(file.id) 
                ? 'bg-[hsl(var(--gaia-soft))]' 
                : 'hover:bg-[hsl(var(--gaia-soft))]'
            }`}
            onDoubleClick={() => onFileAction('preview', file)}
          >
            <input
              type="checkbox"
              checked={selectedFiles.includes(file.id)}
              onChange={(e) => onFileSelect(file.id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 rounded border-[hsl(var(--gaia-border))] text-[hsl(var(--gaia-accent))] focus:ring-[hsl(var(--gaia-accent))]"
            />
            <div className="flex items-center gap-3 ml-3 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--gaia-soft))]">
                <Icon icon={iconName} className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[hsl(var(--gaia-text))] truncate">{file.name}</p>
                <p className="text-xs text-[hsl(var(--gaia-muted))]">{file.size}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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