'use client'

import { useState } from 'react'
import { X, Download, Share2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileWithMetadata } from '@/lib/types'
import { canPreviewFile } from '@/lib/file-utils'

interface FilePreviewDialogProps {
    file: FileWithMetadata | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onDownload?: () => void
    onShare?: () => void
    onNext?: () => void
    onPrevious?: () => void
    hasNext?: boolean
    hasPrevious?: boolean
}

export function FilePreviewDialog({
    file,
    open,
    onOpenChange,
    onDownload,
    onShare,
    onNext,
    onPrevious,
    hasNext,
    hasPrevious
}: FilePreviewDialogProps) {
    if (!file) return null

    const canPreview = canPreviewFile(file.extension)
    const previewUrl = `${process.env.NEXT_PUBLIC_API_BACKEND || 'http://localhost:5000'}/api/file/preview/${file.message_id}`

    const renderPreview = () => {
        if (!canPreview) {
            return (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="p-6 rounded-full bg-muted mb-4">
                        <ExternalLink className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Preview not available</h3>
                    <p className="text-muted-foreground mb-4">
                        This file type cannot be previewed in the browser
                    </p>
                    {onDownload && (
                        <Button onClick={onDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download File
                        </Button>
                    )}
                </div>
            )
        }

        switch (file.type) {
            case 'IMAGE':
                return (
                    <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4">
                        <img
                            src={previewUrl}
                            alt={file.name}
                            className="max-w-full max-h-[70vh] object-contain rounded"
                        />
                    </div>
                )

            case 'VIDEO':
                return (
                    <div className="bg-black rounded-lg">
                        <video
                            src={previewUrl}
                            controls
                            className="w-full max-h-[70vh] rounded"
                        >
                            Your browser does not support video playback.
                        </video>
                    </div>
                )

            case 'AUDIO':
                return (
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="w-full max-w-md">
                            <audio
                                src={previewUrl}
                                controls
                                className="w-full"
                            >
                                Your browser does not support audio playback.
                            </audio>
                        </div>
                    </div>
                )

            case 'PDF':
                return (
                    <div className="h-[70vh] bg-muted/50 rounded-lg">
                        <iframe
                            src={`${previewUrl}#toolbar=0`}
                            className="w-full h-full rounded"
                            title={file.name}
                        />
                    </div>
                )

            case 'TEXT':
                return (
                    <div className="bg-muted/50 rounded-lg p-4 h-[70vh] overflow-auto">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                            {/* Text content would be loaded here */}
                            Loading...
                        </pre>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="truncate">{file.name}</DialogTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">{file.type}</Badge>
                                <span className="text-sm text-muted-foreground">{file.size}</span>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(file.updated_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {renderPreview()}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                        {onDownload && (
                            <Button onClick={onDownload} variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        )}
                        {onShare && (
                            <Button onClick={onShare} variant="outline">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        )}
                    </div>

                    {(hasNext || hasPrevious) && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onPrevious}
                                disabled={!hasPrevious}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onNext}
                                disabled={!hasNext}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
