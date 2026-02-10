const Folder = require('../models/Folder');
const File = require('../models/FileManager');

// Create Folder
exports.createFolder = async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        const userId = req.user.id || req.user._id;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        // Check if parent folder exists (if parent_id provided)
        if (parent_id) {
            const parentFolder = await Folder.findOne({ _id: parent_id, user_id: userId });
            if (!parentFolder) {
                return res.status(404).json({ error: 'Parent folder not found' });
            }
        }

        // Check for duplicate name in the same parent
        const existing = await Folder.findOne({
            user_id: userId,
            name: name.trim(),
            parent_id: parent_id || null
        });

        if (existing) {
            return res.status(409).json({ error: 'A folder with this name already exists in this location' });
        }

        const folder = new Folder({
            name: name.trim(),
            parent_id: parent_id || null,
            user_id: userId
        });

        await folder.save();

        res.status(201).json({
            message: 'Folder created successfully',
            folder
        });
    } catch (err) {
        console.error('Create folder error:', err);
        res.status(500).json({ error: 'Failed to create folder', details: err.message });
    }
};

// List Folders
exports.listFolders = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { parent_id } = req.query;

        const query = { user_id: userId };
        if (parent_id) {
            query.parent_id = parent_id;
        }

        const folders = await Folder.find(query).sort({ name: 1 }).lean();

        // Calculate file counts and sizes for each folder
        for (let folder of folders) {
            const files = await File.find({ userId, folder_id: folder._id });
            folder.file_count = files.length;
            folder.total_size = files.reduce((sum, file) => {
                const size = typeof file.file_size === 'object' && file.file_size.low !== undefined
                    ? Number(file.file_size.low)
                    : Number(file.file_size || 0);
                return sum + size;
            }, 0);
        }

        res.status(200).json({
            folders
        });
    } catch (err) {
        console.error('List folders error:', err);
        res.status(500).json({ error: 'Failed to list folders', details: err.message });
    }
};

// Get Folder by ID
exports.getFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id || req.user._id;

        const folder = await Folder.findOne({ _id: id, user_id: userId });
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Get file count and total size
        const files = await File.find({ userId, folder_id: id });
        folder.file_count = files.length;
        folder.total_size = files.reduce((sum, file) => {
            const size = typeof file.file_size === 'object' && file.file_size.low !== undefined
                ? Number(file.file_size.low)
                : Number(file.file_size || 0);
            return sum + size;
        }, 0);

        res.status(200).json({ folder });
    } catch (err) {
        console.error('Get folder error:', err);
        res.status(500).json({ error: 'Failed to get folder', details: err.message });
    }
};

// Rename Folder
exports.renameFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.id || req.user._id;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const folder = await Folder.findOne({ _id: id, user_id: userId });
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Check for duplicate name in the same parent
        const existing = await Folder.findOne({
            _id: { $ne: id },
            user_id: userId,
            name: name.trim(),
            parent_id: folder.parent_id
        });

        if (existing) {
            return res.status(409).json({ error: 'A folder with this name already exists in this location' });
        }

        folder.name = name.trim();
        await folder.save();

        res.status(200).json({
            message: 'Folder renamed successfully',
            folder
        });
    } catch (err) {
        console.error('Rename folder error:', err);
        res.status(500).json({ error: 'Failed to rename folder', details: err.message });
    }
};

// Delete Folder
exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id || req.user._id;

        const folder = await Folder.findOne({ _id: id, user_id: userId });
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Check if folder has subfolders
        const subfolders = await Folder.find({ parent_id: id, user_id: userId });
        if (subfolders.length > 0) {
            return res.status(400).json({ error: 'Cannot delete folder with subfolders. Delete subfolders first.' });
        }

        // Check if folder has files
        const files = await File.find({ userId, folder_id: id });
        if (files.length > 0) {
            return res.status(400).json({ error: 'Cannot delete folder with files. Move or delete files first.' });
        }

        await Folder.deleteOne({ _id: id, user_id: userId });

        res.status(200).json({ message: 'Folder deleted successfully' });
    } catch (err) {
        console.error('Delete folder error:', err);
        res.status(500).json({ error: 'Failed to delete folder', details: err.message });
    }
};

// Move Folder
exports.moveFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { parent_id } = req.body;
        const userId = req.user.id || req.user._id;

        const folder = await Folder.findOne({ _id: id, user_id: userId });
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Prevent moving folder into itself or its descendants
        if (parent_id === id) {
            return res.status(400).json({ error: 'Cannot move folder into itself' });
        }

        // Check if destination parent exists (if parent_id provided)
        if (parent_id) {
            const parentFolder = await Folder.findOne({ _id: parent_id, user_id: userId });
            if (!parentFolder) {
                return res.status(404).json({ error: 'Destination folder not found' });
            }

            // Check for circular reference
            let current = parentFolder;
            while (current.parent_id) {
                if (current.parent_id.toString() === id) {
                    return res.status(400).json({ error: 'Cannot move folder into its own subfolder' });
                }
                current = await Folder.findById(current.parent_id);
                if (!current) break;
            }
        }

        // Check for duplicate name in destination
        const existing = await Folder.findOne({
            _id: { $ne: id },
            user_id: userId,
            name: folder.name,
            parent_id: parent_id || null
        });

        if (existing) {
            return res.status(409).json({ error: 'A folder with this name already exists in the destination' });
        }

        folder.parent_id = parent_id || null;
        await folder.save();

        res.status(200).json({
            message: 'Folder moved successfully',
            folder
        });
    } catch (err) {
        console.error('Move folder error:', err);
        res.status(500).json({ error: 'Failed to move folder', details: err.message });
    }
};
