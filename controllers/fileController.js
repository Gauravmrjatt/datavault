const axios = require('axios');
const fs = require("fs-extra");
const path = require("path");
const multer = require("multer");
const File = require("../models/FileManager");
const User = require("../models/User");

const upload = multer({
    storage: multer.diskStorage({
        destination: './uploads/',
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    })
}).single('file');

// Upload File
exports.uploadFile = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload error', details: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const filePath = req.file.path;
            const sentMsg = await bot.sendDocument(process.env.CHANNEL_USERNAME, filePath);
            const doc = sentMsg.document;

            // Clean up the temporary file
            await fs.remove(filePath);

            const userId = req.user.id || req.user._id;

            const fileStorage = new File({
                userId: userId,
                message_id: sentMsg.message_id,
                file_id: doc.file_id,
                file_unique_id: doc.file_unique_id,
                original_name: doc.file_name,
                extension: path.extname(doc.file_name),
                file_size: doc.file_size,
                download: 0
            });

            await fileStorage.save();

            res.status(200).json({
                message: 'File uploaded',
                message_id: sentMsg.message_id
            });

        } catch (err) {
            res.status(500).json({
                error: 'Upload failed',
                details: err.message
            });
        }
    });
};

// Download File
exports.downloadFile = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id || req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const entry = await File.findOne({
            message_id: messageId,
            $or: [
                { userId: userId },
                { allowedUsers: userId }
            ]
        });

        if (!entry) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }

        const isOwner = entry.userId.toString() === userId.toString();
        const isShared = entry.allowedUsers.some(id => id.toString() === userId.toString());

        if (!isOwner && !isShared) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Increment download count
        entry.download += 1;
        await entry.save();

        // Get file from Telegram
        const file = await bot.getFile(entry.file_id);
        if (!file || !file.file_path) {
            return res.status(500).json({ error: 'Could not fetch file from Telegram' });
        }

        const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
        const fileName = entry.file_unique_id + entry.extension;
        const filePath = path.join(process.cwd(), 'downloads', fileName);

        await fs.ensureDir(path.dirname(filePath));

        const response = await axios({
            url: fileUrl,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const fileBuffer = await fs.readFile(filePath);
        await fs.unlink(filePath); // Cleanup temp file

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${entry.original_name}"`,
        });

        res.status(200).send(fileBuffer);
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Download failed', details: err.message });
    }
};

// My Files
exports.myFiles = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const files = await File.find({
            $or: [
                { userId },
                { allowedUsers: userId }
            ]
        }).lean();
        const totalFiles = files.length;
        // Convert gRPC-style file_size object to number or BigInt
        const getFileSize = (size) => {
            if (typeof size === 'object' && size.low !== undefined && size.high !== undefined) {
                return BigInt(size.low) + (BigInt(size.high) << 32n);
            }
            return BigInt(size || 0);
        };

        const totalStorage = files.reduce((sum, file) => {
            return sum + getFileSize(file.file_size);
        }, 0n);

        const formatStorage = (bytes) => {
            const k = 1024n;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0n) return '0 Bytes';
            let i = 0;
            let value = bytes;
            while (value >= k && i < sizes.length - 1) {
                value /= k;
                i++;
            }
            return `${Number(value.toFixed ? value.toFixed(2) : value).toFixed(2)} ${sizes[i]}`;
        };

        res.status(200).json({
            data: files || [],
            stats: {
                totalFiles,
                totalStorage: totalStorage.toString(), // raw total in bytes
                readableStorage: formatStorage(totalStorage),
                averageFileSize: totalFiles > 0 ? formatStorage(totalStorage / BigInt(totalFiles)) : '0 Bytes'
            }
        });

    } catch (err) {
        console.error('Error in myFiles:', err);
        res.status(500).json({ error: 'Failed to fetch files', details: err.message });
    }
};

exports.shareFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const userId = req.user.id || req.user._id;
        const user = await User.findById(userId);
        if (email === req.user.email) return res.status(400).json({ error: 'You can\'t share with yourself' });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userUser = await User.findOne({ email });
        if (!userUser) {
            return res.status(404).json({ error: 'Email not found' });
        }
        const file = await File.findOne({ userId, _id: id });
        if (!file) {
            return res.status(404).json({ error: 'File not found or Access denied' });
        }
        file.allowedUsers.includes(userUser._id) ? file.allowedUsers.pull(userUser._id) : file.allowedUsers.push(userUser._id);
        await file.save();
        res.status(200).json({
            message: 'File shared',

        })
    } catch (err) {
        res.status(500).json({ error: 'Share failed', details: err.message });
    }
};

// Delete File
exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id || req.user._id;

        const file = await File.findOne({ userId, _id: id });
        if (!file) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }

        // Delete from Telegram
        try {
            await bot.deleteMessage(process.env.CHANNEL_USERNAME, file.message_id);
        } catch (telegramErr) {
            console.error('Telegram deletion error:', telegramErr);
            // Continue with database deletion even if Telegram deletion fails
        }

        // Delete from database
        await File.deleteOne({ _id: id, userId });

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Delete failed', details: err.message });
    }
}