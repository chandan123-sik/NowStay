import express from 'express';
import Pricing from '../models/Pricing.js';
import RoomVariant from '../models/RoomVariant.js';

const router = express.Router();

// @desc    Upsert standard pricing using Room Type + Variant + Meal Plan
router.post('/upsert-standard', async (req, res) => {
    try {
        const { roomTypeId, variantName, planName, price } = req.body;

        // 1. Find or Create RoomVariant for this RoomType
        let variant = await RoomVariant.findOne({ roomType: roomTypeId, name: variantName });
        if (!variant) {
            variant = await RoomVariant.create({ roomType: roomTypeId, name: variantName });
        }

        // 2. Upsert Pricing for this Variant + Plan
        const p = parseFloat(price) || 0;
        const pricing = await Pricing.findOneAndUpdate(
            { roomVariant: variant._id, planName: planName },
            {
                $set: {
                    adult1Price: p,
                    adult2Price: p,
                    extraAdultPrice: 0,
                    childPrice: 0,
                    mealsIncluded: planName.toUpperCase().includes('DINNER') ? 'All Meals' : (planName.toUpperCase().includes('BREAKFAST') ? 'Breakfast Included' : 'Room Only'),
                }
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, pricing });
    } catch (error) {
        console.error('Upsert Error:', error);
        res.status(500).json({ message: 'Error upserting pricing' });
    }
});

// @desc    Get pricing for a room variant
// @route   GET /api/pricing/:variantId
router.get('/:variantId', async (req, res) => {
    try {
        const plans = await Pricing.find({ roomVariant: req.params.variantId });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pricing plans' });
    }
});

// @desc    Get all pricing plans
router.get('/', async (req, res) => {
    try {
        const plans = await Pricing.find({}).populate({
            path: 'roomVariant',
            populate: { path: 'roomType' }
        }).populate('ratePlan').sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all pricing plans' });
    }
});

router.post('/', async (req, res) => {
    try {
        const plan = await Pricing.create(req.body);
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Error creating pricing plan' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const plan = await Pricing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Error updating pricing plan' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Pricing.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pricing plan deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting pricing plan' });
    }
});

export default router;
