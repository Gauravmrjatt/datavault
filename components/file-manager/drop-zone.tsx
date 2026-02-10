"use client";

import { UploadCloud } from "lucide-react";
import { useState, useCallback } from "react";

interface DropZoneProps {
  onDrop: (files: FileList) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function DropZone({ onDrop, children, className = "", disabled = false }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      
      if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onDrop(e.dataTransfer.files);
      }
    },
    [onDrop, disabled]
  );

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative h-full w-full ${className}`}
    >
      {isDragActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[2.5rem] bg-[hsl(var(--gaia-bg)/0.8)] backdrop-blur-sm border-2 border-dashed border-[hsl(var(--gaia-accent))] m-4">
          <div className="flex flex-col items-center gap-4 text-[hsl(var(--gaia-accent))] animate-in zoom-in duration-300">
            <div className="rounded-full bg-[hsl(var(--gaia-accent)/0.1)] p-8">
              <UploadCloud className="h-16 w-16" />
            </div>
            <p className="text-xl font-bold">Drop files to upload</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
