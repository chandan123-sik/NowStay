import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RoomType from './models/RoomType.js';
import RoomVariant from './models/RoomVariant.js';
import Pricing from './models/Pricing.js';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await RoomType.deleteMany();
        await RoomVariant.deleteMany();
        await Pricing.deleteMany();
        console.log('Cleared existing data');

        const roomTypesData = [
            {
                name: 'Classic Double Bed A/C Room',
                size: '120 sq ft',
                capacity: '2 Adults + 1 Extra Person',
                bedType: 'King Size Bed',
                amenities: ['Split AC', 'Television', 'WiFi', 'Geyser', 'Toiletries'],
                totalRooms: 10,
                images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427']
            },
            {
                name: 'Deluxe Triple Bed A/C Room',
                size: '180 sq ft',
                capacity: '3 Adults + 1 Extra Person',
                bedType: '1 King + 1 Single',
                amenities: ['Split AC', 'Television', 'WiFi', 'Geyser', 'Toiletries', 'Mini Fridge'],
                totalRooms: 8,
                images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a']
            },
            {
                name: 'Four Bed Suite A/C Room',
                size: '250 sq ft',
                capacity: '4 Adults + 1 Extra Person',
                bedType: '2 King Size Beds',
                amenities: ['Split AC', 'Television', 'WiFi', 'Geyser', 'Toiletries', 'Mini Fridge', 'Living Area'],
                totalRooms: 5,
                images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b']
            }
        ];

        for (const rtData of roomTypesData) {
            const rt = await RoomType.create(rtData);

            // Variants for each Room Type
            const variants = [
                { name: rt.name, roomType: rt._id, totalRooms: rtData.name.includes('Double') ? Math.floor(rt.totalRooms * 0.7) : rt.totalRooms }
            ];

            // Only add View Facing for Double Bed
            if (rtData.name.includes('Double')) {
                variants.push({
                    name: rt.name + ' View Facing',
                    roomType: rt._id,
                    totalRooms: Math.floor(rt.totalRooms * 0.3),
                    amenities: ['Balcony', 'Ocean View']
                });
            }

            for (const vData of variants) {
                const variant = await RoomVariant.create(vData);

                // Pricing Plans for each Variant
                const isBeachFacing = vData.name.includes('Beach Facing');
                const multiplier = isBeachFacing ? 1.3 : 1.0;

                // Base prices for Double Bed
                let basePrice = 2200;
                let singlePrice = 1700;
                let extraAdult = 700;
                let child = 500;

                if (rtData.name.includes('Triple')) {
                    basePrice = 3500;
                    singlePrice = 2800;
                    extraAdult = 900;
                    child = 600;
                } else if (rtData.name.includes('Four')) {
                    basePrice = 5000;
                    singlePrice = 4200;
                    extraAdult = 1200;
                    child = 800;
                }

                const plans = [
                    {
                        roomVariant: variant._id,
                        planName: 'Normal Room (Room Only)',
                        adult1Price: Math.round(singlePrice * multiplier),
                        adult2Price: Math.round(basePrice * multiplier),
                        extraAdultPrice: Math.round(extraAdult * multiplier),
                        childPrice: Math.round(child * multiplier),
                        mealsIncluded: 'Room Only'
                    },
                    {
                        roomVariant: variant._id,
                        planName: 'Room with Breakfast',
                        adult1Price: Math.round((singlePrice + 300) * multiplier),
                        adult2Price: Math.round((basePrice + 500) * multiplier),
                        extraAdultPrice: Math.round((extraAdult + 250) * multiplier),
                        childPrice: Math.round((child + 200) * multiplier),
                        mealsIncluded: 'Breakfast'
                    },
                    {
                        roomVariant: variant._id,
                        planName: 'Room with breakfast, lunch, snacks and dinner',
                        adult1Price: Math.round((singlePrice + 1200) * multiplier),
                        adult2Price: Math.round((basePrice + 2000) * multiplier),
                        extraAdultPrice: Math.round((extraAdult + 900) * multiplier),
                        childPrice: Math.round((child + 700) * multiplier),
                        mealsIncluded: 'Breakfast, Lunch, Snacks, Dinner'
                    }
                ];

                await Pricing.insertMany(plans);
            }
        }

        console.log('Full Database Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seed();
