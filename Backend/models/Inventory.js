import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    roomVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomVariant', required: true },
    date: { type: Date, required: true },
    roomsToSell: { type: Number }, // Manual override of rooms available for this date
    bookedUnits: { type: Number, default: 0 }, // Track actual occupancy
    isStopSell: { type: Boolean, default: false }, // Manual block
    rates: [{
        pricingPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Pricing' },
        adult1Price: Number,
        adult2Price: Number,
        extraAdultPrice: Number,
        childPrice: Number
    }]
}, { timestamps: true });

// Ensure unique entry per room type/variant and date
inventorySchema.index({ roomVariant: 1, date: 1 }, { unique: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
