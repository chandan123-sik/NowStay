import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

import { sendNotificationToUser } from '../utils/notificationHelper.js';

const router = express.Router();

// Health check for FCM routes
router.get('/ping', (req, res) => {
    res.json({ message: 'FCM Register Route is Healthy' });
});

// Register Web/App FCM Token for Push Notifications
router.post('/register', protect, async (req, res) => {
    const { token, platform } = req.body;
    const tokenStr = String(token || '').trim();
    const userId = req.user._id;

    // Log basic registration attempt
    console.log(`[FCM REGISTER ATTEMPT] User: ${req.user.email} | Platform Received: ${platform || 'NONE'} | Token start: ${tokenStr.substring(0, 10) || 'NULL'}`);

    try {
        // FCM tokens are typically long strings without spaces
        if (!tokenStr || tokenStr.length < 50 || tokenStr.includes(' ')) {
            console.warn(`[FCM REJECTED] Malformed or too short token for user ${req.user.email}`);
            return res.status(400).json({ message: 'Valid token is required' });
        }

        // Avoid saving Mock headers, JWT tokens, or literal null/undefined strings
        const invalidStarts = ['eyJ', 'TEST_', 'mock_', 'null', 'undefined', 'Bearer '];
        if (invalidStarts.some(start => tokenStr.startsWith(start)) || tokenStr.toLowerCase() === 'null') {
            console.warn(`[FCM REJECTED] Invalid token format for user ${userId} (${tokenStr.substring(0, 10)}...).`);
            return res.status(400).json({ message: 'Invalid token format' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ensure token exists in ONLY ONE field (prevents duplicate notifications)
        // Broadened platform list (added 'flutter', 'dart')
        const mobilePlatforms = ['app', 'android', 'ios', 'mobile', 'flutter', 'dart'];
        const isMobile = mobilePlatforms.includes(platform?.toLowerCase());

        const field = isMobile ? 'fcmTokenMobile' : 'fcmTokens';
        const otherField = isMobile ? 'fcmTokens' : 'fcmTokenMobile';

        // Remove from the other list if exists
        user[otherField].pull(token);

        // Add to the target list (addToSet prevents duplicates in the same list)
        user[field].addToSet(token);

        await user.save();

        // Return success and explicit logging
        console.log(`[FCM SUCCESS] User: ${user.email} | Saved in: ${field} | Tokens in field: ${user[field].length}`);

        res.json({
            success: true,
            message: `Token registered in ${field}`,
            field: field,
            tokens_count: user[field].length
        });
    } catch (error) {
        console.error('[FCM ERROR] Registration Logic Failed:', error.message);
        res.status(500).json({ message: 'Failed to register FCM token' });
    }
});

/**
 * Test Notification to oneself (Admin tool)
 */
router.post('/test-self', protect, async (req, res) => {
    try {
        const { title = 'Deep Analysis Test', body = 'If you see this, FCM is working perfectly!' } = req.body;

        await sendNotificationToUser(
            req.user._id,
            title,
            body,
            { type: 'test_notification', timestamp: new Date().toISOString() }
        );

        res.json({ success: true, message: 'Test notification triggered. Check your device/browser.' });
    } catch (error) {
        console.error('Test Self Error:', error.message);
        res.status(500).json({ message: 'Failed to trigger test notification' });
    }
});

export default router;

