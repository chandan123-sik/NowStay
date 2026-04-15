import express from 'express';
import Tax from '../models/Tax.js';
import Charge from '../models/Charge.js';
import RatePlan from '../models/RatePlan.js';
import Property from '../models/Property.js';

const router = express.Router();

// Property Routes
router.get('/property', async (req, res) => {
    try {
        let property = await Property.findOne();
        if (!property) {
            property = await Property.create({}); // Initialize if doesn't exist
        }
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property data' });
    }
});

router.put('/property', async (req, res) => {
    try {
        const property = await Property.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Error updating property data' });
    }
});

// Rate Plan Routes
router.get('/rate-plans', async (req, res) => {
    try {
        const plans = await RatePlan.find({});
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rate plans' });
    }
});

router.post('/rate-plans', async (req, res) => {
    try {
        const plan = await RatePlan.create(req.body);
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Error creating rate plan' });
    }
});

router.put('/rate-plans/:id', async (req, res) => {
    try {
        const plan = await RatePlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Error updating rate plan' });
    }
});

router.delete('/rate-plans/:id', async (req, res) => {
    try {
        await RatePlan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rate plan deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting rate plan' });
    }
});

// Tax Routes
router.get('/taxes', async (req, res) => {
    try {
        const taxes = await Tax.find({});
        res.json(taxes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching taxes' });
    }
});

router.post('/taxes', async (req, res) => {
    try {
        const tax = await Tax.create(req.body);
        res.status(201).json(tax);
    } catch (error) {
        res.status(500).json({ message: 'Error creating tax' });
    }
});

router.put('/taxes/:id', async (req, res) => {
    try {
        const tax = await Tax.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(tax);
    } catch (error) {
        res.status(500).json({ message: 'Error updating tax' });
    }
});

router.delete('/taxes/:id', async (req, res) => {
    try {
        await Tax.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tax deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tax' });
    }
});

// Charge Routes
router.get('/charges', async (req, res) => {
    try {
        const charges = await Charge.find({});
        res.json(charges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching charges' });
    }
});

router.post('/charges', async (req, res) => {
    try {
        const charge = await Charge.create(req.body);
        res.status(201).json(charge);
    } catch (error) {
        res.status(500).json({ message: 'Error creating charge' });
    }
});

router.put('/charges/:id', async (req, res) => {
    try {
        const charge = await Charge.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(charge);
    } catch (error) {
        res.status(500).json({ message: 'Error updating charge' });
    }
});

router.delete('/charges/:id', async (req, res) => {
    try {
        await Charge.findByIdAndDelete(req.params.id);
        res.json({ message: 'Charge deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting charge' });
    }
});

export default router;
