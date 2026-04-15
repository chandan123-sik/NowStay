import mongoose from 'mongoose';

const ratePlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // e.g., EP, CP, MAP, AP
    description: { type: String },
    inclusions: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const RatePlan = mongoose.model('RatePlan', ratePlanSchema);
export default RatePlan;
