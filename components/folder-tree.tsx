'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FolderTreeNode } from '@/lib/types'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Button } from '@/components/ui/button'

interface FolderTreeProps {
    nodes: FolderTreeNode[]
    currentFolderId: string | null
    onFolderClick: (folderId: string | null) => void
    onFolderRename?: (folderId: string) => void
    onFolderDelete?: (folderId: string) => void
    onCreateSubfolder?: (parentId: string) => void
    className?: string
}

export function FolderTree({
    nodes,
    currentFolderId,
    onFolderClick,
    onFolderRename,
    onFolderDelete,
    onCreateSubfolder,
    className
}: FolderTreeProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev)
            if (next.has(folderId)) {
                next.delete(folderId)
            } else {
                next.add(folderId)
            }
            return next
        })
    }

    const renderNode = (node: FolderTreeNode, level: number = 0) => {
        const isExpanded = expandedFolders.has(node.folder.id)
        const isActive = currentFolderId === node.folder.id
        const hasChildren = node.children.length > 0

        return (
            <div key={node.folder.id} className="select-none">
                <ContextMenu>
                    <ContextMenuTrigger>
                        <div
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors group',
                                'hover:bg-accent hover:text-accent-foreground',
                                isActive && 'bg-accent text-accent-foreground font-medium'
                            )}
                            style={{ paddingLeft: `${level * 16 + 12}px` }}
                            onClick={() => onFolderClick(node.folder.id)}
                        >
                            {hasChildren && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleFolder(node.folder.id)
                                    }}
                                    className="p-0.5 hover:bg-accent-foreground/10 rounded"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>
                            )}
                            {!hasChildren && <div className="w-5" />}

                            {isExpanded || isActive ? (
                                <FolderOpen className="h-4 w-4 text-blue-500" />
                            ) : (
                                <Folder className="h-4 w-4 text-blue-500" />
                            )}

                            <span className="flex-1 truncate text-sm">{node.folder.name}</span>

                            {node.folder.file_count !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                    {node.folder.file_count}
                                </span>
                            )}
                        </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent>
                        <ContextMenuItem onClick={() => onFolderClick(node.folder.id)}>
                            Open
                        </ContextMenuItem>
                        {onCreateSubfolder && (
                            <ContextMenuItem onClick={() => onCreateSubfolder(node.folder.id)}>
                                New Subfolder
                            </ContextMenuItem>
                        )}
                        {onFolderRename && (
                            <ContextMenuItem onClick={() => onFolderRename(node.folder.id)}>
                                Rename
                            </ContextMenuItem>
                        )}
                        {onFolderDelete && (
                            <ContextMenuItem
                                onClick={() => onFolderDelete(node.folder.id)}
                                className="text-destructive"
                            >
                                Delete
                            </ContextMenuItem>
                        )}
                    </ContextMenuContent>
                </ContextMenu>

                {isExpanded && hasChildren && (
                    <div className="mt-0.5">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={cn('space-y-0.5', className)}>
            {nodes.map(node => renderNode(node))}
        </div>
    )
}
