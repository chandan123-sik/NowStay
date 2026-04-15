import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// Get all coupons
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons' });
    }
});

// Validate coupon
router.post('/validate', async (req, res) => {
    const { code } = req.body;
    try {
        const coupon = await Coupon.findOne({ code, active: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
        res.json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create coupon
router.post('/', async (req, res) => {
    try {
        const { code, type, value } = req.body;
        const coupon = await Coupon.create({ code, type, value });
        res.status(201).json(coupon);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Coupon code already exists' });
        res.status(500).json({ message: 'Error creating coupon' });
    }
});

// Toggle status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
        coupon.active = !coupon.active;
        await coupon.save();
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon' });
    }
});

// Delete coupon
router.delete('/:id', async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon' });
    }
});

export default router;
