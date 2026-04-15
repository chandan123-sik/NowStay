import mongoose from 'mongoose';

const roomVariantSchema = new mongoose.Schema({
    roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    name: { type: String, required: true }, // e.g., 'Standard', 'Beach Facing'
    totalRooms: { type: Number, default: 10 },
    images: [{ type: String }],
    amenities: [{ type: String }], // additional variant amenities
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const RoomVariant = mongoose.model('RoomVariant', roomVariantSchema);
export default RoomVariant;
