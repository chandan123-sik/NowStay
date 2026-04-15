import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RoomType from './models/RoomType.js';
import Pricing from './models/Pricing.js';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        await RoomType.deleteMany();
        await Pricing.deleteMany();

        const doubleBedAC = await RoomType.create({
            name: 'Double Bed A/C Room',
            size: '120 sq ft',
            capacity: '2 Adults + 1 Extra Person',
            bedType: 'King Size Bed',
            amenities: ['Split AC', 'Television', 'WiFi', 'Geyser', 'Toiletries', 'Sofa', 'Tea Table'],
            totalRooms: 10,
            images: [
                'https://images.unsplash.com/photo-1590490360182-c33d57733427',
                'https://images.unsplash.com/photo-1566665797739-1674de7a421a'
            ]
        });

        const plans = [
            {
                roomType: doubleBedAC._id,
                planName: 'Classic Double Bed A/C',
                adult1Price: 2200,
                adult2Price: 2200,
                extraAdultPrice: 0,
                childPrice: 0,
                mealsIncluded: 'Room Only'
            },
            {
                roomType: doubleBedAC._id,
                planName: 'Room with Breakfast',
                adult1Price: 1700,
                adult2Price: 2200,
                extraAdultPrice: 700,
                childPrice: 500,
                mealsIncluded: 'Breakfast'
            },
            {
                roomType: doubleBedAC._id,
                planName: 'Room with All Meals',
                adult1Price: 3000,
                adult2Price: 3000,
                extraAdultPrice: 1100,
                childPrice: 900,
                mealsIncluded: 'Breakfast, Lunch, Snacks, Dinner'
            }
        ];

        await Pricing.insertMany(plans);

        console.log('Seeded Room Type and Pricing Successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
