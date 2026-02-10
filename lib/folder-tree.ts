import { Folder, FolderTreeNode, BreadcrumbItem } from './types'

/**
 * Build a hierarchical tree structure from a flat list of folders
 */
export function buildFolderTree(folders: Folder[]): FolderTreeNode[] {
    const folderMap = new Map<string, FolderTreeNode>()
    const rootNodes: FolderTreeNode[] = []

    // Create nodes for all folders
    folders.forEach(folder => {
        folderMap.set(folder.id, {
            folder,
            children: [],
            isExpanded: false,
            level: 0
        })
    })

    // Build the tree structure
    folders.forEach(folder => {
        const node = folderMap.get(folder.id)!

        if (folder.parent_id === null) {
            // Root level folder
            rootNodes.push(node)
        } else {
            // Child folder - add to parent's children
            const parentNode = folderMap.get(folder.parent_id)
            if (parentNode) {
                parentNode.children.push(node)
                node.level = (parentNode.level || 0) + 1
            } else {
                // Parent not found, treat as root
                rootNodes.push(node)
            }
        }
    })

    // Sort children alphabetically
    const sortChildren = (nodes: FolderTreeNode[]) => {
        nodes.sort((a, b) => a.folder.name.localeCompare(b.folder.name))
        nodes.forEach(node => sortChildren(node.children))
    }
    sortChildren(rootNodes)

    return rootNodes
}

/**
 * Get the full path of a folder as an array of folder IDs
 */
export function getFolderPath(folderId: string | null, folders: Folder[]): string[] {
    if (!folderId) return []

    const path: string[] = []
    let currentId: string | null = folderId
    const folderMap = new Map(folders.map(f => [f.id, f]))

    // Prevent infinite loops
    const visited = new Set<string>()

    while (currentId && !visited.has(currentId)) {
        visited.add(currentId)
        path.unshift(currentId)
        const folder = folderMap.get(currentId)
        currentId = folder?.parent_id || null
    }

    return path
}

/**
 * Generate breadcrumb items for navigation
 */
export function generateBreadcrumbs(
    currentFolderId: string | null,
    folders: Folder[]
): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
        { id: null, name: 'My Files', path: '/' }
    ]

    if (!currentFolderId) return breadcrumbs

    const path = getFolderPath(currentFolderId, folders)
    const folderMap = new Map(folders.map(f => [f.id, f]))

    path.forEach(folderId => {
        const folder = folderMap.get(folderId)
        if (folder) {
            breadcrumbs.push({
                id: folder.id,
                name: folder.name,
                path: `/dashboard/files?folder=${folder.id}`
            })
        }
    })

    return breadcrumbs
}

/**
 * Check if a folder is a descendant of another folder
 */
export function isDescendant(
    folderId: string,
    potentialAncestorId: string,
    folders: Folder[]
): boolean {
    const path = getFolderPath(folderId, folders)
    return path.includes(potentialAncestorId)
}

/**
 * Validate folder name
 */
export function validateFolderName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Folder name cannot be empty' }
    }

    if (name.length > 255) {
        return { valid: false, error: 'Folder name is too long (max 255 characters)' }
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/
    if (invalidChars.test(name)) {
        return { valid: false, error: 'Folder name contains invalid characters' }
    }

    // Check for reserved names
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4',
        'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2',
        'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
    if (reservedNames.includes(name.toUpperCase())) {
        return { valid: false, error: 'This folder name is reserved by the system' }
    }

    return { valid: true }
}

/**
 * Check for duplicate folder names in the same parent
 */
export function hasDuplicateName(
    name: string,
    parentId: string | null,
    folders: Folder[],
    excludeId?: string
): boolean {
    return folders.some(folder =>
        folder.name.toLowerCase() === name.toLowerCase() &&
        folder.parent_id === parentId &&
        folder.id !== excludeId
    )
}

/**
 * Get all descendant folder IDs (for bulk operations)
 */
export function getAllDescendantIds(folderId: string, folders: Folder[]): string[] {
    const descendants: string[] = []
    const queue = [folderId]

    while (queue.length > 0) {
        const currentId = queue.shift()!
        const children = folders.filter(f => f.parent_id === currentId)

        children.forEach(child => {
            descendants.push(child.id)
            queue.push(child.id)
        })
    }

    return descendants
}

/**
 * Calculate folder depth (for preventing too deep nesting)
 */
export function getFolderDepth(folderId: string, folders: Folder[]): number {
    return getFolderPath(folderId, folders).length
}

/**
 * Format folder path as string (e.g., "Documents/Projects/2024")
 */
export function formatFolderPath(folderId: string | null, folders: Folder[]): string {
    if (!folderId) return 'My Files'

    const path = getFolderPath(folderId, folders)
    const folderMap = new Map(folders.map(f => [f.id, f]))

    const names = path.map(id => folderMap.get(id)?.name || 'Unknown')
    return names.join(' / ')
}
