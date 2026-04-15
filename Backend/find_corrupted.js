import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function findCorrupted() {
    await mongoose.connect(process.env.MONGODB_URI);
    const allUsers = await User.find({});
    console.log(`Checking ${allUsers.length} total users...`);

    allUsers.forEach(u => {
        const tokens = [...(u.fcmTokens || []), ...(u.fcmTokenMobile || [])];
        const bad = tokens.filter(t => t.startsWith('TEST_') || t.startsWith('eyJ') || t.includes(' '));
        if (bad.length > 0) {
            console.log(`FOUND! User: ${u.email}`);
            console.log(`  Bad Tokens: ${JSON.stringify(bad)}`);
        }
    });

    await mongoose.disconnect();
}
findCorrupted();
