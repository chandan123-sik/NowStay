import admin from '../services/firebaseAdmin.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * Send Push Notification to specific user via their ID
 */
export const sendNotificationToUser = async (userId, title, body, data = {}) => {
    try {
        // First, save notification to Database for longevity (even if push fails)
        await Notification.create({
            userId,
            title,
            message: body,
            type: data.type || 'system',
            link: data.link || '',
            isRead: false
        }).catch(err => console.error('Error saving notification to DB:', err.message));

        const user = await User.findById(userId);
        if (!user) return;

        // Combine all tokens for this user and remove duplicates/nulls
        const tokens = [...(user.fcmTokens || []), ...(user.fcmTokenMobile || [])];
        const uniqueTokens = [...new Set(tokens.filter(t => t && t !== 'null' && t !== 'undefined'))];

        if (uniqueTokens.length === 0) return;

        // Ensure all data values are strings (FCM requirement)
        const stringifiedData = {};
        Object.keys(data).forEach(key => {
            stringifiedData[key] = String(data[key]);
        });
        stringifiedData.click_action = 'FLUTTER_NOTIFICATION_CLICK';
        stringifiedData.link = String(data.link || '/');

        const message = {
            notification: { title, body },
            data: stringifiedData
        };

        const response = await admin.messaging().sendEachForMulticast({
            ...message,
            tokens: uniqueTokens
        });

        // Cleanup invalid/expired tokens
        if (response.failureCount > 0) {
            const tokensToRemove = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    const tokenHead = uniqueTokens[idx].substring(0, 10);
                    console.error(`FCM Token Error [${tokenHead}...]:`, error.code);

                    // These codes indicate the token is permanently invalid and should be removed
                    if (error.code === 'messaging/registration-token-not-registered' ||
                        error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/invalid-argument') {
                        tokensToRemove.push(uniqueTokens[idx]);
                    }
                }
            });

            if (tokensToRemove.length > 0) {
                // Update both token lists in the user document
                user.fcmTokens = (user.fcmTokens || []).filter(t => !tokensToRemove.includes(t));
                user.fcmTokenMobile = (user.fcmTokenMobile || []).filter(t => !tokensToRemove.includes(t));
                await user.save();
                console.log(`Cleaned up ${tokensToRemove.length} invalid tokens from user: ${user.name}`);
            }
        }

        console.log(`Notification sent to ${user.name}: ${response.successCount} success, ${response.failureCount} failed.`);
    } catch (error) {
        console.error('Error sending notification to user:', error);
    }
};

/**
 * Send Notification to all Admins
 */
export const notifyAdmins = async (title, body, data = {}) => {
    try {
        const admins = await User.find({ role: 'admin' });

        for (const adminUser of admins) {
            await sendNotificationToUser(adminUser._id, title, body, data);
        }
    } catch (error) {
        console.error('Error notifying admins:', error);
    }
};
