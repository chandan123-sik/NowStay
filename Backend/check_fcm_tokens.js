import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkTokens() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const usersWithTokens = await User.find({
            $or: [
                { fcmTokens: { $exists: true, $not: { $size: 0 } } },
                { fcmTokenMobile: { $exists: true, $not: { $size: 0 } } }
            ]
        });

        console.log(`Found ${usersWithTokens.length} users with FCM tokens`);
        usersWithTokens.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}`);
            console.log(`  Web Tokens: ${u.fcmTokens?.length || 0}`);
            console.log(`  Mobile Tokens: ${u.fcmTokenMobile?.length || 0}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTokens();
