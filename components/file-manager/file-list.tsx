"use client";

import { Download, Eye, MoreVertical, Pencil, Share2, Trash2, Folder as FolderIcon } from "lucide-react";
import { Icon } from "@iconify/react";
import { GaiaCard } from "@/components/gaia/primitives";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileWithMetadata, Folder } from "@/lib/types";
import { getFileExtensionColor, getFileIcon, formatFileSize } from "@/lib/file-utils";
import { cn } from "@/lib/utils";

interface FileListProps {
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

export function FileList({
  files,
  folders,
  onFolderClick,
  onFileSelect,
  onFolderSelect,
  selectedFiles,
  selectedFolders,
  onFileAction,
  onFolderAction,
}: FileListProps) {
  return (
    
      <table className="w-full text-left text-sm ">
        <tbody className="divide-y divide-[hsl(var(--gaia-border))]">
          {folders.map((folder) => (
            <tr
              key={folder._id}
              className={cn(
                  "group transition-colors hover:bg-[hsl(var(--gaia-soft))]",
                  selectedFolders.includes(folder._id) ? "bg-[hsl(var(--gaia-soft))]" : ""
              )}
              onClick={() => onFolderClick(folder._id)}
            >
              <td className="p-3">
                <div 
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all cursor-pointer",
                    selectedFolders.includes(folder._id) 
                      ? "bg-[hsl(var(--gaia-accent))] border-[hsl(var(--gaia-accent))]" 
                      : "border-[hsl(var(--gaia-border))] hover:border-[hsl(var(--gaia-muted))]"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFolderSelect(folder._id, !selectedFolders.includes(folder._id));
                  }}
                >
                  {selectedFolders.includes(folder._id) && (
                    <Icon icon="lucide:check" className="h-3 w-3 text-white font-bold" />
                  )}
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <FolderIcon className="h-4 w-4 fill-current" />
                  </div>
                  <span className="font-medium text-[hsl(var(--gaia-text))]">{folder.name}</span>
                </div>
              </td>
              <td className="hidden p-3 text-[hsl(var(--gaia-muted))] sm:table-cell">-</td>
              <td className="hidden p-3 text-[hsl(var(--gaia-muted))] md:table-cell">
                {new Date(folder.updatedAt).toLocaleDateString()}
              </td>
              <td className="p-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--gaia-muted))] opacity-0 transition-opacity hover:bg-[hsl(var(--gaia-soft))] group-hover:opacity-100 data-[state=open]:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFolderClick(folder._id); }}>
                        Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFolderAction('rename', folder); }}>
                        <Pencil className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFolderAction('delete', folder); }} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}

          {files.map((file) => {
            const iconName = getFileIcon(file.extension);

            return (
              <tr
                key={file.id}
                className={cn(
                    "group transition-colors hover:bg-[hsl(var(--gaia-soft))]",
                    selectedFiles.includes(file.id) ? "bg-[hsl(var(--gaia-soft))]" : ""
                )}
                onDoubleClick={() => onFileAction('preview', file)}
              >
                <td className="p-3">
                  <div 
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all cursor-pointer",
                      selectedFiles.includes(file.id) 
                        ? "bg-[hsl(var(--gaia-accent))] border-[hsl(var(--gaia-accent))]" 
                        : "border-[hsl(var(--gaia-border))] hover:border-[hsl(var(--gaia-muted))]"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileSelect(file.id, !selectedFiles.includes(file.id));
                    }}
                  >
                    {selectedFiles.includes(file.id) && (
                      <Icon icon="lucide:check" className="h-3 w-3 text-white font-bold" />
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--gaia-soft))]")}>
                      <Icon icon={iconName} className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-[hsl(var(--gaia-text))]">{file.name}</span>
                  </div>
                </td>
                <td className="hidden p-3 text-[hsl(var(--gaia-muted))] sm:table-cell">{file.size}</td>
                <td className="hidden p-3 text-[hsl(var(--gaia-muted))] md:table-cell">
                  {new Date(file.updated_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--gaia-muted))] opacity-0 transition-opacity hover:bg-[hsl(var(--gaia-soft))] group-hover:opacity-100 data-[state=open]:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFileAction('preview', file); }}>
                        <Eye className="mr-2 h-4 w-4" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFileAction('download', file); }}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFileAction('share', file); }}>
                        <Share2 className="mr-2 h-4 w-4" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFileAction('rename', file); }}>
                        <Pencil className="mr-2 h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFileAction('delete', file); }} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
          
           {files.length === 0 && folders.length === 0 && (
              <tr>
                  <td colSpan={5} className="p-8 text-center text-[hsl(var(--gaia-muted))]">
                      No files or folders found
                  </td>
              </tr>
           )}
        </tbody>
      </table>
    
  );
}
