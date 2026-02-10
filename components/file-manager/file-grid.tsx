"use client";

import { FileCard } from "@/components/file-card";
import { FolderCard } from "@/components/folder-card";
import { FileWithMetadata, Folder } from "@/lib/types";

interface FileGridProps {
  files: FileWithMetadata[];
  folders: Folder[];
  onFolderClick: (folderId: string) => void;
  onFileSelect: (fileId: string, selected: boolean) => void;
  onFolderSelect: (folderId: string, selected: boolean) => void;
  selectedFiles: string[];
  selectedFolders: string[];
  onFileAction: (action: string, file: FileWithMetadata) => void;
  onFolderAction: (action: string, folder: Folder) => void;
}

export function FileGrid({
  files,
  folders,
  onFolderClick,
  onFileSelect,
  onFolderSelect,
  selectedFiles,
  selectedFolders,
  onFileAction,
  onFolderAction,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols- p-4">
      {folders.map((folder) => (
        <FolderCard
          key={folder._id}
          folder={folder}ƒ
          onClick={() => onFolderClick(folder._id)}
          selected={selectedFolders.includes(folder._id)}
          onSelect={(checked) => onFolderSelect(folder._id, checked)}
          onRename={() => onFolderAction('rename', folder)}
          onDelete={() => onFolderAction('delete', folder)}
        />
      ))}
      
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          selected={selectedFiles.includes(file.id)}
          onSelect={(checked) => onFileSelect(file.id, checked)}
          onPreview={() => onFileAction('preview', file)}
          onDownload={() => onFileAction('download', file)}
          onShare={() => onFileAction('share', file)}
          onRename={() => onFileAction('rename', file)}
          onDelete={() => onFileAction('delete', file)}
        />
      ))}

      {files.length === 0 && folders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-[hsl(var(--gaia-muted))]">
              <p>No files or folders found</p>
          </div>
      )}
    </div>
  );
}
