'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { BreadcrumbItem as BreadcrumbItemType } from '@/lib/types'

interface FolderBreadcrumbsProps {
    items: BreadcrumbItemType[]
    className?: string
    onFolderClick?: (id: string | null) => void
}

export function FolderBreadcrumbs({ items, className, onFolderClick }: FolderBreadcrumbsProps) {
    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1

                    return (
                        <div key={item.id || 'root'} className="flex items-center">
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="flex items-center gap-1.5 font-semibold text-[hsl(var(--gaia-text))]">
                                        {index === 0 && <Home className="h-4 w-4" />}
                                        {item.name}
                                    </BreadcrumbPage>
                                ) : (
                                    <button
                                        onClick={() => onFolderClick?.(item.id)}
                                        className="flex items-center gap-1.5 text-[hsl(var(--gaia-muted))] transition-colors hover:text-[hsl(var(--gaia-text))]"
                                    >
                                        {index === 0 && <Home className="h-4 w-4" />}
                                        {item.name}
                                    </button>
                                )}
                            </BreadcrumbItem>
                            {!isLast && (
                                <BreadcrumbSeparator className="text-[hsl(var(--gaia-muted))]">
                                    <ChevronRight className="h-4 w-4" />
                                </BreadcrumbSeparator>
                            )}
                        </div>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
