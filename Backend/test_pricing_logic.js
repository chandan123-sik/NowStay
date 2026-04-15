import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const PricingSchema = new mongoose.Schema({
    adult1Price: Number,
    adult2Price: Number,
    extraAdultPrice: Number,
    childPrice: Number,
    roomVariant: mongoose.Schema.Types.ObjectId
}, { collection: 'pricings' });

const Pricing = mongoose.model('PricingTest', PricingSchema);

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    const variantId = "69bbd200fea518e35942e0b5"; // From previous check

    const plans = await Pricing.find({ roomVariant: new mongoose.Types.ObjectId(variantId) });
    console.log('Plans found:', plans.length);

    const results = plans.map(plan => {
        let stayTotal = plan.adult2Price;
        return {
            ...plan.toObject(),
            dynamicTotal: stayTotal,
            avgNightly: stayTotal
        };
    });

    console.log('Results Sample:', results[0]);
    process.exit();
}

test();
