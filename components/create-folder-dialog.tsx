'use client'

import { useState } from 'react'
import { FolderPlus } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateFolderName, hasDuplicateName } from '@/lib/folder-tree'
import { Folder } from '@/lib/types'

interface CreateFolderDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    parentId: string | null
    existingFolders: Folder[]
    onCreateFolder: (name: string, parentId: string | null) => Promise<void>
}

export function CreateFolderDialog({
    open,
    onOpenChange,
    parentId,
    existingFolders,
    onCreateFolder
}: CreateFolderDialogProps) {
    const [folderName, setFolderName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    const handleCreate = async () => {
        setError(null)

        // Validate folder name
        const validation = validateFolderName(folderName)
        if (!validation.valid) {
            setError(validation.error!)
            return
        }

        // Check for duplicates
        if (hasDuplicateName(folderName, parentId, existingFolders)) {
            setError('A folder with this name already exists in this location')
            return
        }

        setIsCreating(true)
        try {
            await onCreateFolder(folderName, parentId)
            setFolderName('')
            onOpenChange(false)
        } catch (err: any) {
            setError(err.message || 'Failed to create folder')
        } finally {
            setIsCreating(false)
        }
    }

    const handleClose = () => {
        setFolderName('')
        setError(null)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="h-5 w-5" />
                        Create New Folder
                    </DialogTitle>
                    <DialogDescription>
                        Enter a name for your new folder
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="folder-name">Folder Name</Label>
                        <Input
                            id="folder-name"
                            placeholder="My Folder"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && folderName.trim()) {
                                    handleCreate()
                                }
                            }}
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={!folderName.trim() || isCreating}>
                        {isCreating ? 'Creating...' : 'Create Folder'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
