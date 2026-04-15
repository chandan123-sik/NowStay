import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomVariant', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Pricing', required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    roomsCount: { type: Number, required: true },
    roomDetails: [{
        adults: { type: Number, required: true },
        children: { type: Number, default: 0 }
    }],
    totalPrice: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    bookingId: { type: String, required: true, unique: true },
    bookingStatus: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    paymentMethod: { type: String, default: 'wallet' },
    paymentId: { type: String }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
