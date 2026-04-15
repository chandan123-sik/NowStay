import express from 'express';
import Service from '../models/Service.js';

const router = express.Router();

// @desc    Get services by type
// @route   GET /api/services/:type
router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const services = await Service.find({ type, isActive: true });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services' });
    }
});

// @desc    Get all services (Admin)
// @route   GET /api/services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services' });
    }
});

// @desc    Create a new service item
// @route   POST /api/services
router.post('/', async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error creating service item' });
    }
});

// @desc    Update a service item
// @route   PUT /api/services/:id
router.put('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error updating service item' });
    }
});

// @desc    Delete a service item
// @route   DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json({ message: 'Service item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service item' });
    }
});

export default router;
