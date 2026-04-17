import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'a@gmail.com';
        const password = '1234';

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            existingAdmin.name = 'NowStay Admin';
            existingAdmin.password = '1234'; // Actually update password
            await existingAdmin.save();
            console.log('Admin password updated successfully for a@gmail.com');
        } else {
            await User.create({
                name: 'NowStay Admin',
                email,
                password, // Hashing done by middleware
                role: 'admin',
                mobile: '0000000000',
                city: 'Indore',
                country: 'India',
                isVerified: true
            });
            console.log('Admin created: a@gmail.com / 1234');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
