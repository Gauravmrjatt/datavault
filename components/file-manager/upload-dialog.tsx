"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileDropzone } from "@/components/ui/file-dropzone";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesDropped: (files: File[]) => void;
  currentFolderId: string | null;
}

export function UploadDialog({
  open,
  onOpenChange,
  onFilesDropped,
  currentFolderId,
}: UploadDialogProps) {
  const handleFilesDropped = (files: File[]) => {
    onFilesDropped(files);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-surface))] rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--gaia-text))]">Upload Files</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <FileDropzone 
            onFilesDropped={handleFilesDropped}
            className="w-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
