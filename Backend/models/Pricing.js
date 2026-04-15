import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema({
    roomVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomVariant', required: true },
    ratePlan: { type: mongoose.Schema.Types.ObjectId, ref: 'RatePlan' },
    planName: { type: String, required: true },
    adult1Price: { type: Number, required: true },
    adult2Price: { type: Number, required: true },
    extraAdultPrice: { type: Number, required: true },
    childPrice: { type: Number, required: true },
    mealsIncluded: { type: String, required: true },
    planImage: { type: String }
}, { timestamps: true });

const Pricing = mongoose.model('Pricing', pricingSchema);
export default Pricing;
