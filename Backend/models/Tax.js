import mongoose from 'mongoose';

const taxSchema = mongoose.Schema({
    name: { type: String, required: true },
    rate: { type: Number, required: true },
    type: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

const Tax = mongoose.model('Tax', taxSchema);
export default Tax;
