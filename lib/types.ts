export interface TelegramFileRef {
  chunkIndex: number;
  messageId: number;
  chatId: string;
  telegramFileId: string;
  telegramFileUniqueId: string;
  size: number;
  checksum: string;
}

export interface File {
  id: string;
  ownerId: string;
  folderId: string | null;
  name: string;
  mimeType: string;
  extension: string;
  size: number;
  checksum: string;
  chunkSize: number;
  chunksCount: number;
  telegramRefs: TelegramFileRef[];
  status: 'uploading' | 'active' | 'trashed' | 'failed';
  isTrashed: boolean;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  _id: string;
  ownerId: string;
  name: string;
  parentId: string | null;
  path: string;
  isTrashed: boolean;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadTask {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileId: string | null;
  uploadId: string | null;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number;
  progressPercent: number;
  status: 'queued' | 'uploading' | 'paused' | 'retrying' | 'failed' | 'completed';
  error: string | null;
  retryCount: number;
  optimistic: boolean;
  offlineQueued: boolean;
}

export interface UserSession {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    usedBytes: number;
    quotaBytes: number;
  };
  isOnline: boolean;
  lastSyncAt: string | null;
}

export interface DriveState {
  currentFolderId: string | null;
  files: File[];
  folders: Folder[];
  uploads: UploadTask[];
  selectedFileIds: string[];
  hasOfflineChanges: boolean;
  error: string | null;
}

export interface FileWithMetadata {
  id: string;
  name: string;
  original_name: string;
  extension: string;
  file_size: number;
  folder_id: string | null;
  user_id: string;
  message_id?: number;
  download_count: number;
  is_trashed: boolean;
  trashed_at: string | null;
  created_at: string;
  updated_at: string;
  shared_with: string[];
  type: string;
  size: string;
  sizeInBytes: number;
  updatedAtDate: Date;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}
