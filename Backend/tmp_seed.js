import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Room from './models/Room.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Clear existing data
        await Category.deleteMany({});
        await Room.deleteMany({});

        const categories = await Category.insertMany([
            {
                type: 'Deluxe Suite',
                count: 5,
                price: 4500,
                size: '450 sqft',
                capacity: '2 Guests',
                bed: 'King Size',
                amenities: ['Wifi', 'TV', 'AC', 'Mini Bar'],
                image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a'
            },
            {
                type: 'Executive Room',
                count: 10,
                price: 3200,
                size: '350 sqft',
                capacity: '2 Guests',
                bed: 'Queen Size',
                amenities: ['Wifi', 'TV', 'AC'],
                image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32'
            }
        ]);

        console.log('Categories seeded');

        const rooms = [
            { roomNumber: '101', category: categories[0]._id, status: 'available' },
            { roomNumber: '102', category: categories[0]._id, status: 'available' },
            { roomNumber: '201', category: categories[1]._id, status: 'available' },
            { roomNumber: '202', category: categories[1]._id, status: 'available' },
        ];

        await Room.insertMany(rooms);
        console.log('Rooms seeded');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
