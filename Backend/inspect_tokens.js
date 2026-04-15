import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function debugTokens() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({
        $or: [
            { fcmTokens: { $exists: true, $not: { $size: 0 } } },
            { fcmTokenMobile: { $exists: true, $not: { $size: 0 } } }
        ]
    });

    users.forEach(u => {
        console.log(`User: ${u.email}`);
        console.log(`  Web: ${JSON.stringify(u.fcmTokens)}`);
        console.log(`  Mob: ${JSON.stringify(u.fcmTokenMobile)}`);
    });
    await mongoose.disconnect();
}
debugTokens();
