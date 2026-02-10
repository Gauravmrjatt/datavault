"use client";

import { useState, useCallback, useRef } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GaiaButton } from "@/components/gaia/primitives";
import { toast } from "sonner";

interface FileDropzoneProps {
  onFilesDropped: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function FileDropzone({
  onFilesDropped,
  accept,
  multiple = true,
  maxSize = 1000 * 1024 * 1024, // 10MB
  maxFiles = 10,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const validateFiles = (files: File[]): File[] => {
    let validFiles = [...files];

    if (maxFiles && validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      validFiles = validFiles.slice(0, maxFiles);
    }

    validFiles = validFiles.filter((file) => {
      if (maxSize && file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
        return false;
      }
      return true;
    });

    return validFiles;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = validateFiles(droppedFiles);
        if (validFiles.length > 0) {
          onFilesDropped(validFiles);
        }
      }
    },
    [onFilesDropped, disabled, maxSize, maxFiles]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length > 0) {
        onFilesDropped(validFiles);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-surface))] p-12 transition-all duration-300",
        isDragActive && !disabled && "border-[hsl(var(--gaia-accent))] bg-[hsl(var(--gaia-accent)/0.05)] scale-[0.99]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4 text-center">
        <div className={cn(
          "rounded-full p-6 transition-colors duration-300",
          isDragActive ? "bg-[hsl(var(--gaia-accent)/0.2)]" : "bg-[hsl(var(--gaia-soft))]"
        )}>
          <UploadCloud className={cn(
            "h-12 w-12 transition-colors duration-300",
            isDragActive ? "text-[hsl(var(--gaia-accent))]" : "text-[hsl(var(--gaia-muted))]"
          )} />
        </div>
        
        <div className="space-y-2">
          <p className="text-xl font-bold text-[hsl(var(--gaia-text))]">
            {isDragActive ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-sm text-[hsl(var(--gaia-muted))]">
            Or click the button below to browse your files
          </p>
        </div>

        <GaiaButton 
          onClick={onButtonClick} 
          disabled={disabled}
          variant="ghost"
          className="mt-2"
        >
          Select Files
        </GaiaButton>

        {accept && (
          <p className="mt-2 text-xs text-[hsl(var(--gaia-muted))]">
            Accepted files: {accept}
          </p>
        )}
      </div>
    </div>
  );
}
