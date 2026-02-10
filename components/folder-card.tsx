"use client";

import { Folder, FolderOpen, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { GaiaCard } from '@/components/gaia/primitives';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Folder as FolderType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/file-utils';

interface FolderCardProps {
    folder: FolderType;
    onClick: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    selected?: boolean;
    onSelect?: (checked: boolean) => void;
    className?: string;
}

export function FolderCard({
    folder,
    onClick,
    onRename,
    onDelete,
    selected,
    onSelect,
    className
}: FolderCardProps) {
    return (
        <GaiaCard
            className={cn(
                'group relative flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg',
                selected ? 'ring-2 ring-[hsl(var(--gaia-accent))] bg-[hsl(var(--gaia-soft))]' : '',
                className
            )}
            onClick={() => onClick()}
            onContextMenu={(e) => {
                e.preventDefault();
                // We rely on the parent for context menu, 
                // but here we can just stop propagation to allow consistent behavior
            }}
        >
            <div className="flex items-start justify-between p-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shadow-sm">
                    <Folder className="h-5 w-5 fill-current" />
                </div>
                
                <div className="flex gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--gaia-muted))] opacity-0 transition-opacity hover:bg-[hsl(var(--gaia-soft))] group-hover:opacity-100 data-[state=open]:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 brounded-[2rem] border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-surface))] p-3 group relative flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.02]">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                                <FolderOpen className="mr-2 h-4 w-4" /> Open
                            </DropdownMenuItem>
                            {onRename && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
                                    <Pencil className="mr-2 h-4 w-4" /> Rename
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {onDelete && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-600 focus:text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="mt-3 space-y-1">
                <h3 className="truncate font-medium text-[hsl(var(--gaia-text))] text-sm" title={folder.name}>
                    {folder.name}
                </h3>
                 {/*
                 <div className="flex items-center gap-1 text-xs text-[hsl(var(--gaia-muted))]">
                    <span>{folder.file_count || 0} items</span>
                    {folder.total_size && (
                         <>
                             <span>•</span>
                             <span>{formatFileSize(folder.total_size)}</span>
                         </>
                    )}
                 </div>
                 */}
                 <div className="text-xs text-[hsl(var(--gaia-muted))]">Folder</div>
            </div>
        </GaiaCard>
    );
}
