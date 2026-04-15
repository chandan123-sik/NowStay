import mongoose from 'mongoose';

const couponSchema = mongoose.Schema({
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true },
    used: { type: Number, default: 0 },
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
