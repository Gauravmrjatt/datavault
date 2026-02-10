"use client";

import { Download, Filter, Grid3x3, List, Plus, Search, Trash2, UploadCloud, X } from "lucide-react";
import { GaiaButton, GaiaInput } from "@/components/gaia/primitives";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  onUpload: () => void;
  onCreateFolder: () => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}

export function FileManagerToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
  onUpload,
  onCreateFolder,
  filter,
  onFilterChange,
  selectedCount,
  onBulkAction,
  onClearSelection,
}: ToolbarProps) {
  if (selectedCount > 0) {
    return (
      <div className="flex gap-4 border-b sticky top-5 z-50 left-0 right-0 rounded-full border-[hsl(var(--gaia-border))] bg-muted p-4 md:flex-row items-center justify-between animate-in slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-4">
          <button onClick={() => onClearSelection()} className="gap-2 p-0 rounded-full aspect-square bg-[hsl(var(--gaia-accent))] hover:bg-[hsl(var(--gaia-accent)/0.8)] hover:text-[hsl(var(--gaia-accent))] p-2">
            <Icon icon="lucide:check" className="h-4 w-4 text-[hsl(var(--gaia-accent-foreground))] font-bold" />
          </button>
          <span className="font-semibold text-[hsl(var(--gaia-accent))]">{selectedCount} selected</span>
        </div>

        <div className="flex items-center gap-2">
          <GaiaButton variant="ghost" onClick={() => onBulkAction('download')} className="gap-2 hover:bg-[hsl(var(--gaia-accent)/0.2)] hover:text-[hsl(var(--gaia-accent))]">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </GaiaButton>
          <GaiaButton variant="ghost" onClick={() => onBulkAction('delete')} className="gap-2 hover:bg-red-500/10 hover:text-red-500 text-red-500">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </GaiaButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border-b border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-surface))] p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--gaia-muted))]" />
          <GaiaInput
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder="Search files and folders..."
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <GaiaButton variant="ghost" className="h-10 w-10 p-0 md:w-auto md:px-3">
              <Filter className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{filter || "Filter"}</span>
            </GaiaButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onFilterChange("")}>All Files</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("image")}>Images</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("video")}>Videos</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("document")}>Documents</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("audio")}>Audio</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-xl border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-panel))] p-1">
          <button
            onClick={() => onViewChange("grid")}
            className={`rounded-lg p-2 transition-all ${view === "grid"
              ? "bg-[hsl(var(--gaia-accent))] text-[hsl(var(--gaia-accent-foreground))]"
              : "text-[hsl(var(--gaia-muted))] hover:text-[hsl(var(--gaia-text))]"
              }`}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={`rounded-lg p-2 transition-all ${view === "list"
              ? "bg-[hsl(var(--gaia-accent))] text-[hsl(var(--gaia-accent-foreground))]"
              : "text-[hsl(var(--gaia-muted))] hover:text-[hsl(var(--gaia-text))]"
              }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <GaiaButton onClick={onUpload} className="hidden gap-2 md:flex">
          <UploadCloud className="h-4 w-4" />
          Upload
        </GaiaButton>

        <GaiaButton onClick={onCreateFolder} variant="ghost" className="hidden gap-2 md:flex border border-[hsl(var(--gaia-border))]">
          <Plus className="h-4 w-4" />
          New Folder
        </GaiaButton>

        {/* Mobile Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <GaiaButton variant="primary" className="px-3"><Plus className="h-4 w-4" /></GaiaButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onUpload}>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateFolder}>
              <Plus className="mr-2 h-4 w-4" /> New Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}
