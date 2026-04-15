import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create or update user
        const userData = {
            name: 'Aryan User',
            email: 'b@gmail.com',
            password: '123456',
            role: 'user',
            mobile: '9669002380',
            city: 'Kolkata',
            country: 'India',
            walletBalance: 50000,
            isVerified: true
        };

        let user = await User.findOne({ email: 'b@gmail.com' });
        if (!user) {
            user = new User(userData);
        } else {
            Object.assign(user, userData);
        }

        user.password = '123456'; // Trigger pre-save hashing
        await user.save();

        console.log('\n✅ Live User created successfully!');
        console.log('-------------------------');
        console.log('  Email   : b@gmail.com');
        console.log('  Password: 123456');
        console.log('  Wallet  : ₹50,000');
        console.log('-------------------------\n');

        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedUser();
