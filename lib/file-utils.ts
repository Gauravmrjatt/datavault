import { File, FileWithMetadata } from './types'

/**
 * Format file size to human-readable format
 */
export function formatFileSize(sizeInBytes: number): string {
    const val = Number(sizeInBytes);
    if (!val || isNaN(val)) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(val) / Math.log(1024))
    return `${(val / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

/**
 * Get file type category from extension
 */
export function getFileType(extension: string): string {
    const ext = extension.toLowerCase().replace('.', '')

    const typeMap: Record<string, string> = {
        // Images
        jpg: 'IMAGE', jpeg: 'IMAGE', png: 'IMAGE', gif: 'IMAGE',
        webp: 'IMAGE', svg: 'IMAGE', bmp: 'IMAGE', ico: 'IMAGE',

        // Videos
        mp4: 'VIDEO', webm: 'VIDEO', avi: 'VIDEO', mov: 'VIDEO',
        mkv: 'VIDEO', flv: 'VIDEO', wmv: 'VIDEO',

        // Audio
        mp3: 'AUDIO', wav: 'AUDIO', ogg: 'AUDIO', m4a: 'AUDIO',
        flac: 'AUDIO', aac: 'AUDIO',

        // Documents
        pdf: 'PDF', doc: 'DOC', docx: 'DOC', txt: 'TEXT',
        rtf: 'DOC', odt: 'DOC',

        // Spreadsheets
        xls: 'SHEET', xlsx: 'SHEET', csv: 'SHEET', ods: 'SHEET',

        // Presentations
        ppt: 'SLIDE', pptx: 'SLIDE', odp: 'SLIDE',

        // Archives
        zip: 'ARCHIVE', rar: 'ARCHIVE', '7z': 'ARCHIVE',
        tar: 'ARCHIVE', gz: 'ARCHIVE',

        // Code
        js: 'CODE', ts: 'CODE', jsx: 'CODE', tsx: 'CODE',
        py: 'CODE', java: 'CODE', cpp: 'CODE', c: 'CODE',
        html: 'CODE', css: 'CODE', json: 'CODE', xml: 'CODE',
    }

    return typeMap[ext] || ext.toUpperCase()
}

/**
 * Check if file can be previewed
 */
export function canPreviewFile(extension: string): boolean {
    const type = getFileType(extension)
    return ['IMAGE', 'VIDEO', 'PDF', 'TEXT', 'AUDIO'].includes(type)
}

/**
 * Get file icon name based on type (Iconify format)
 */
export function getFileIcon(extension: string): string {
    const ext = extension.toLowerCase().replace('.', '')
    const type = getFileType(extension)

    // 1. High-priority specific extension mapping
    const specificMap: Record<string, string> = {
        // Documents
        pdf: 'vscode-icons:file-type-pdf2',
        doc: 'vscode-icons:file-type-word',
        docx: 'vscode-icons:file-type-word',
        xls: 'vscode-icons:file-type-excel',
        xlsx: 'vscode-icons:file-type-excel',
        csv: 'vscode-icons:file-type-excel',
        ppt: 'vscode-icons:file-type-powerpoint',
        pptx: 'vscode-icons:file-type-powerpoint',
        txt: 'vscode-icons:file-type-text',
        md: 'vscode-icons:file-type-markdown',
        
        // Multimedia
        mp4: 'vscode-icons:file-type-video',
        mkv: 'vscode-icons:file-type-video',
        mov: 'vscode-icons:file-type-video',
        mp3: 'vscode-icons:file-type-audio',
        wav: 'vscode-icons:file-type-audio',
        flac: 'vscode-icons:file-type-audio',
        png: 'vscode-icons:file-type-image',
        jpg: 'vscode-icons:file-type-image',
        jpeg: 'vscode-icons:file-type-image',
        gif: 'vscode-icons:file-type-image',
        svg: 'vscode-icons:file-type-svg',
        
        // Archives
        zip: 'vscode-icons:file-type-zip',
        rar: 'vscode-icons:file-type-zip',
        '7z': 'vscode-icons:file-type-zip',
        tar: 'vscode-icons:file-type-zip',
    }

    if (specificMap[ext]) return specificMap[ext]

    // 2. Code-specific mapping
    if (type === 'CODE') {
        const codeMap: Record<string, string> = {
            js: 'vscode-icons:file-type-js',
            ts: 'vscode-icons:file-type-typescript',
            jsx: 'vscode-icons:file-type-reactjs',
            tsx: 'vscode-icons:file-type-reactts',
            py: 'vscode-icons:file-type-python',
            java: 'vscode-icons:file-type-java',
            cpp: 'vscode-icons:file-type-cpp',
            c: 'vscode-icons:file-type-c',
            html: 'vscode-icons:file-type-html',
            css: 'vscode-icons:file-type-css',
            json: 'vscode-icons:file-type-json',
            xml: 'vscode-icons:file-type-xml',
            php: 'vscode-icons:file-type-php',
            go: 'vscode-icons:file-type-go',
            rs: 'vscode-icons:file-type-rust',
            sql: 'vscode-icons:file-type-sql',
            rb: 'vscode-icons:file-type-ruby',
            sh: 'vscode-icons:file-type-shell',
        }
        return codeMap[ext] || 'vscode-icons:file-type-js'
    }

    // 3. Fallback to category icon
    const iconMap: Record<string, string> = {
        IMAGE: 'vscode-icons:file-type-image',
        VIDEO: 'vscode-icons:file-type-video',
        AUDIO: 'vscode-icons:file-type-audio',
        PDF: 'vscode-icons:file-type-pdf2',
        DOC: 'vscode-icons:file-type-word',
        TEXT: 'vscode-icons:file-type-text',
        SHEET: 'vscode-icons:file-type-excel',
        SLIDE: 'vscode-icons:file-type-powerpoint',
        ARCHIVE: 'vscode-icons:file-type-zip',
    }

    return iconMap[type] || 'vscode-icons:default-file'
}

/**
 * Transform API file to FileWithMetadata
 */
export function transformFile(apiFile: any): FileWithMetadata {
    const name = apiFile.name || apiFile.original_name || 'Unnamed File';
    const sizeInBytes = apiFile.size || apiFile.file_size || 0;
    
    return {
        id: apiFile._id,
        name: name,
        original_name: name,
        extension: apiFile.extension || '',
        file_size: sizeInBytes,
        folder_id: apiFile.folderId || apiFile.folder_id || null,
        user_id: apiFile.ownerId || apiFile.user_id,
        message_id: apiFile.message_id,
        download_count: apiFile.download || 0,
        is_trashed: apiFile.is_trashed || apiFile.isTrashed || false,
        trashed_at: apiFile.trashedAt || apiFile.trashed_at || null,
        created_at: apiFile.createdAt,
        updated_at: apiFile.updatedAt,
        shared_with: apiFile.shared_with || [],
        type: getFileType(apiFile.extension || ''),
        size: formatFileSize(sizeInBytes),
        sizeInBytes: sizeInBytes,
        updatedAtDate: new Date(apiFile.updatedAt)
    }
}

/**
 * Get file extension color for badges
 */
export function getFileExtensionColor(extension: string): string {
    const type = getFileType(extension)

    const colorMap: Record<string, string> = {
        IMAGE: 'bg-blue-500',
        VIDEO: 'bg-purple-500',
        AUDIO: 'bg-pink-500',
        PDF: 'bg-red-500',
        DOC: 'bg-blue-600',
        TEXT: 'bg-gray-500',
        SHEET: 'bg-green-500',
        SLIDE: 'bg-orange-500',
        ARCHIVE: 'bg-yellow-600',
        CODE: 'bg-indigo-500',
    }

    return colorMap[type] || 'bg-gray-400'
}
