import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pricing from './models/Pricing.js';

dotenv.config();

const update = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const results = await Pricing.updateMany(
            { planName: { $regex: /BLSD/i } },
            { $set: { planName: 'Room with breakfast, lunch, snacks and dinner' } }
        );

        console.log(`Updated ${results.modifiedCount} pricing plans.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

update();
