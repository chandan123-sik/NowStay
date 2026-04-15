import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB:', mongoose.connection.name);

        // Create or update admin
        const adminData = {
            name: 'Hotel Ananya Admin',
            email: 'a@gmail.com',
            password: '1234',
            role: 'admin',
            mobile: '9669002380',
            country: 'India',
            city: 'Digha',
            isVerified: true,
            walletBalance: 0
        };

        let admin = await User.findOne({ email: 'a@gmail.com' });
        if (!admin) {
            admin = new User(adminData);
        } else {
            Object.assign(admin, adminData);
        }

        admin.password = '1234'; // Trigger pre-save hash
        await admin.save();

        console.log('✅ Admin account seeded: a@gmail.com / 1234');
        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
