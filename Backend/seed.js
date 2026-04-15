import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Room from './models/Room.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const categories = [
    {
        type: 'Double Bed A/C',
        count: 20,
        price: 2500,
        size: '120 sq. ft.',
        capacity: '2 + 1 pax',
        bed: 'King Size',
        amenities: ['Electric Kettle', 'Flat TV', 'Free WiFi', 'Geyser', 'Split AC'],
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    },
    {
        type: 'Deluxe Triple Bed',
        count: 16,
        price: 3500,
        size: '230 sq. ft',
        capacity: '3 + 1 pax',
        bed: 'King + Single',
        amenities: ['Electric Kettle', 'Flat TV', 'Free WiFi', 'Geyser', 'Sofa', 'Split AC'],
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'
    },
    {
        type: 'Four Bed Suite',
        count: 10,
        price: 5500,
        size: '330 sq. ft',
        capacity: '4 + 2 pax',
        bed: '2 Queen Size',
        amenities: ['Electric Kettle', 'Flat TV', 'Free WiFi', 'Geyser', 'Sofa', 'Split AC', 'Tea Table', 'Toiletries'],
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
    }
];

const seedData = async () => {
    try {
        await Category.deleteMany();
        await Room.deleteMany();

        const createdCategories = await Category.insertMany(categories);

        let rooms = [];
        let roomNo = 101;

        createdCategories.forEach(cat => {
            for (let i = 0; i < cat.count; i++) {
                rooms.push({
                    roomNumber: roomNo.toString(),
                    category: cat._id,
                    status: 'available',
                });
                roomNo++;
            }
        });

        await Room.insertMany(rooms);

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
