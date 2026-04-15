import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function debugTokens() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const total = await User.countDocuments();
        const withWeb = await User.countDocuments({ fcmTokens: { $exists: true, $not: { $size: 0 } } });
        const withMobile = await User.countDocuments({ fcmTokenMobile: { $exists: true, $not: { $size: 0 } } });

        console.log(`Total Users: ${total}`);
        console.log(`Users with Web Tokens: ${withWeb}`);
        console.log(`Users with Mobile Tokens: ${withMobile}`);

        const sample = await User.findOne({ email: 'a@gmail.com' });
        if (sample) {
            console.log('Sample User (a@gmail.com):');
            console.log('  fcmTokens:', JSON.stringify(sample.fcmTokens));
            console.log('  fcmTokenMobile:', JSON.stringify(sample.fcmTokenMobile));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

debugTokens();
