import express from 'express';
import { upload, uploadToCloudinary, cloudinary } from '../config/cloudinary.js';
import Media from '../models/Media.js';

const router = express.Router();
// Upload a single file and return URL (for profile pictures, etc)
router.post('/upload-single', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        // Manual upload via stream
        const result = await uploadToCloudinary(req.file.buffer, 'profiles');
        res.json({ imageUrl: result.secure_url, publicId: result.public_id });
    } catch (error) {
        console.error('Single Upload Error Full Detail:', error);
        res.status(500).json({ message: 'Error uploading image', details: error.message });
    }
});

// Get all media of a specific type
router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const media = await Media.find({ type }).sort({ createdAt: -1 });
        res.json(media);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching media' });
    }
});

// Upload media
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        console.log('Upload Request Body:', req.body);
        console.log('Upload Request File:', req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'No file');

        const { type, title, subtext, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        console.log('Uploading to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer, 'media');
        console.log('Cloudinary Upload Result:', result);

        const newMedia = await Media.create({
            imageUrl: result.secure_url,
            publicId: result.public_id,
            type,
            title,
            subtext,
            category
        });

        res.status(201).json(newMedia);
    } catch (error) {
        console.error('Detailed Upload Error:', error);
        res.status(500).json({
            message: 'Error uploading media',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Delete media
router.delete('/:id', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(media.publicId);

        // Delete from DB
        await Media.findByIdAndDelete(req.params.id);

        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting media' });
    }
});

// Toggle active status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        media.isActive = !media.isActive;
        await media.save();
        res.json(media);
    } catch (error) {
        res.status(500).json({ message: 'Error updating media status' });
    }
});

export default router;
