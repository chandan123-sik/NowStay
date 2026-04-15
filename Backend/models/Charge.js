import mongoose from 'mongoose';

const chargeSchema = mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    icon: { type: String, default: 'Star' },
}, { timestamps: true });

const Charge = mongoose.model('Charge', chargeSchema);
export default Charge;
