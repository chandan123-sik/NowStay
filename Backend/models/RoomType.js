import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    size: { type: String, required: true },
    capacity: { type: String, required: true },
    bedType: { type: String, required: true },
    amenities: [{ type: String }],
    totalRooms: { type: Number, default: 10 },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const RoomType = mongoose.model('RoomType', roomTypeSchema);
export default RoomType;
