import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Simple model definitions for debugging
const PricingSchema = new mongoose.Schema({
    adult1Price: Number,
    adult2Price: Number,
    extraAdultPrice: Number,
    childPrice: Number,
    pricingPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'RatePlan' },
    roomVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomVariant' }
}, { collection: 'pricings' });

const InventorySchema = new mongoose.Schema({
    date: Date,
    roomVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomVariant' },
    rates: [{
        pricingPlan: mongoose.Schema.Types.ObjectId,
        adult1Price: Number,
        adult2Price: Number,
        extraAdultPrice: Number,
        childPrice: Number
    }]
}, { collection: 'inventories' });

const Pricing = mongoose.model('PricingCheck', PricingSchema);
const Inventory = mongoose.model('InventoryCheck', InventorySchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');

    const plans = await Pricing.find().limit(5);
    console.log('Sample Pricing Plans:');
    plans.forEach(p => {
        console.log(`Plan ID: ${p._id}, Variant: ${p.roomVariant}, A1: ${p.adult1Price}, A2: ${p.adult2Price}, EA: ${p.extraAdultPrice}, C: ${p.childPrice}`);
    });

    const overrides = await Inventory.find({ 'rates.0': { $exists: true } }).limit(2);
    console.log('Sample Inventory Overrides:');
    overrides.forEach(o => {
        console.log(`Date: ${o.date}, Variant: ${o.roomVariant}, Rates Count: ${o.rates?.length}`);
        if (o.rates.length > 0) {
            console.log('First Rate sample:', o.rates[0]);
        }
    });

    process.exit();
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
