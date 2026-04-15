import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function cleanupDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // 1. Identify users with potentially invalid tokens
        // This includes JWT tokens, mock tokens, and malformed strings
        const invalidPrefixes = ['eyJ', 'TEST_', 'mock_', 'null', 'undefined', 'Bearer '];

        const users = await User.find({
            $or: [
                { fcmTokens: { $exists: true, $not: { $size: 0 } } },
                { fcmTokenMobile: { $exists: true, $not: { $size: 0 } } }
            ]
        });

        console.log(`Analyzing ${users.length} users for corrupted tokens...`);

        const isTokenValid = (t) => {
            if (!t || typeof t !== 'string') return false;
            const token = t.trim();
            if (token.length < 50) return false; // FCM tokens are long
            if (token.includes(' ')) return false; // FCM tokens have no spaces
            if (invalidPrefixes.some(pre => token.startsWith(pre))) return false;
            if (token.toLowerCase() === 'null' || token.toLowerCase() === 'undefined') return false;
            return true;
        };

        for (const user of users) {
            const oldWebCount = user.fcmTokens?.length || 0;
            const oldMobCount = user.fcmTokenMobile?.length || 0;

            const newWeb = (user.fcmTokens || []).filter(isTokenValid);
            const newMob = (user.fcmTokenMobile || []).filter(isTokenValid);

            if (newWeb.length !== oldWebCount || newMob.length !== oldMobCount) {
                user.fcmTokens = newWeb;
                user.fcmTokenMobile = newMob;
                await user.save();
                console.log(`[CLEANED] ${user.email}: Web Removed: ${oldWebCount - newWeb.length}, Mobile Removed: ${oldMobCount - newMob.length}`);
            }
        }

        await mongoose.disconnect();
        console.log('Cleanup finished.');
    } catch (err) {
        console.error(err);
    }
}

cleanupDb();
