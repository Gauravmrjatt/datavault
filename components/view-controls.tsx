'use client'

import { Grid3x3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type ViewMode = 'grid' | 'list'
export type SortBy = 'name' | 'size' | 'date' | 'type'
export type SortDirection = 'asc' | 'desc'

interface ViewControlsProps {
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
    sortBy: SortBy
    sortDirection: SortDirection
    onSortChange: (sortBy: SortBy, direction: SortDirection) => void
}

export function ViewControls({
    viewMode,
    onViewModeChange,
    sortBy,
    sortDirection,
    onSortChange
}: ViewControlsProps) {
    const sortOptions: { value: SortBy; label: string }[] = [
        { value: 'name', label: 'Name' },
        { value: 'date', label: 'Date Modified' },
        { value: 'size', label: 'Size' },
        { value: 'type', label: 'Type' },
    ]

    return (
        <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        Sort: {sortOptions.find(o => o.value === sortBy)?.label}
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {sortOptions.map(option => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => {
                                if (sortBy === option.value) {
                                    // Toggle direction if same field
                                    onSortChange(option.value, sortDirection === 'asc' ? 'desc' : 'asc')
                                } else {
                                    // Default to ascending for new field
                                    onSortChange(option.value, 'asc')
                                }
                            }}
                        >
                            {option.label}
                            {sortBy === option.value && (
                                <span className="ml-auto">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md">
                <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                    className="rounded-r-none"
                >
                    <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    className="rounded-l-none"
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
