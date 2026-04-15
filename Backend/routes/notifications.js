import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications for a specific user
router.get('/my/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// Mark a single notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read' });
    }
});

// Mark all notifications as read for a user
router.patch('/read-all/:userId', async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.params.userId, isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking all notifications as read' });
    }
});

// Delete a notification (optional)
router.delete('/:id', async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification' });
    }
});

// Post a notification (For testing/Internal use)
router.post('/', async (req, res) => {
    try {
        const notif = await Notification.create(req.body);
        res.status(201).json(notif);
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification' });
    }
});

export default router;
