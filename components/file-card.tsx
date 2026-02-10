"use client";

import { Download, MoreVertical, Share2, Trash2, Eye, Pencil } from 'lucide-react';
import { Icon } from '@iconify/react';
import { GaiaCard } from '@/components/gaia/primitives';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileWithMetadata } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getFileIcon, getFileExtensionColor } from '@/lib/file-utils';

interface FileCardProps {
    file: FileWithMetadata;
    selected?: boolean;
    onSelect?: (checked: boolean) => void;
    onPreview?: () => void;
    onDownload?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
    onRename?: () => void;
    className?: string;
}

export function FileCard({
    file,
    selected,
    onSelect,
    onPreview,
    onDownload,
    onShare,
    onDelete,
    onRename,
    className
}: FileCardProps) {
    const iconName = getFileIcon(file.extension);
    const extensionColor = getFileExtensionColor(file.extension);

    return (
        <GaiaCard
            className={cn(
                'group relative flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg',
                selected ? 'ring-2 ring-[hsl(var(--gaia-accent))] bg-[hsl(var(--gaia-soft))]' : '',
                className
            )}
            onClick={() => onSelect?.(!selected)}
            onContextMenu={(e) => {
                e.preventDefault();
                // We rely on the parent or a custom implementation for context menu, 
                // but here we can just stop propagation to allow consistent behavior
            }}
        >
            <div className="flex items-start justify-between p-1">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-transparent shadow-sm')}>
                    <Icon icon={iconName} className="h-8 w-8" />
                </div>
                
                <div className="flex gap-1">
                   <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--gaia-muted))] opacity-0 transition-opacity hover:bg-[hsl(var(--gaia-soft))] group-hover:opacity-100 data-[state=open]:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="brounded-[2rem] border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-surface))] p-3 group relative flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.02]">
                            {onPreview && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreview(); }}>
                                    <Eye className="mr-2 h-4 w-4" /> Preview
                                </DropdownMenuItem>
                            )}
                            {onDownload && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(); }}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </DropdownMenuItem>
                            )}
                            {onShare && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(); }}>
                                    <Share2 className="mr-2 h-4 w-4" /> Share
                                </DropdownMenuItem>
                            )}
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
                <h3 className="truncate font-medium text-[hsl(var(--gaia-text))] text-sm" title={file.name}>
                    {file.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-[hsl(var(--gaia-muted))]">
                    <span>{file.size}</span>
                    <span>{new Date(file.updated_at).toLocaleDateString()}</span>
                </div>
            </div>
        </GaiaCard>
    );
}
