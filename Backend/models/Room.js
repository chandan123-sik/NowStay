import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    },
    lastCleaned: { type: String, default: new Date().toISOString().split('T')[0] }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

export default Room;
