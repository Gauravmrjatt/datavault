'use client'

import { useState } from 'react'
import { Edit3 } from 'lucide-react'
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

interface RenameDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentName: string
    itemType: 'file' | 'folder'
    onRename: (newName: string) => Promise<void>
}

export function RenameDialog({
    open,
    onOpenChange,
    currentName,
    itemType,
    onRename
}: RenameDialogProps) {
    const [newName, setNewName] = useState(currentName)
    const [error, setError] = useState<string | null>(null)
    const [isRenaming, setIsRenaming] = useState(false)

    const handleRename = async () => {
        setError(null)

        if (!newName.trim()) {
            setError('Name cannot be empty')
            return
        }

        if (newName === currentName) {
            onOpenChange(false)
            return
        }

        setIsRenaming(true)
        try {
            await onRename(newName)
            onOpenChange(false)
        } catch (err: any) {
            setError(err.message || 'Failed to rename')
        } finally {
            setIsRenaming(false)
        }
    }

    const handleClose = () => {
        setNewName(currentName)
        setError(null)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5" />
                        Rename {itemType}
                    </DialogTitle>
                    <DialogDescription>
                        Enter a new name for this {itemType}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-name">New Name</Label>
                        <Input
                            id="new-name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newName.trim()) {
                                    handleRename()
                                }
                            }}
                            autoFocus
                            onFocus={(e) => {
                                // Select filename without extension for files
                                if (itemType === 'file') {
                                    const lastDot = newName.lastIndexOf('.')
                                    if (lastDot > 0) {
                                        e.target.setSelectionRange(0, lastDot)
                                    } else {
                                        e.target.select()
                                    }
                                } else {
                                    e.target.select()
                                }
                            }}
                        />
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isRenaming}>
                        Cancel
                    </Button>
                    <Button onClick={handleRename} disabled={!newName.trim() || isRenaming}>
                        {isRenaming ? 'Renaming...' : 'Rename'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
