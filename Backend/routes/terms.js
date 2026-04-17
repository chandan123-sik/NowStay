import express from 'express';
import Terms from '../models/Terms.js';

const router = express.Router();

// Get Terms
router.get('/', async (req, res) => {
    try {
        let terms = await Terms.findOne();
        if (!terms) {
            // Seed default if none exists
            terms = await Terms.create({
                lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                sections: [
                    { icon: 'FileText', title: 'Agreement to Terms', content: 'By accessing or using the NowStay platform, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use our services.' },
                    { icon: 'Users', title: 'User Obligations', content: 'Guests must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.' }
                ]
            });
        }
        res.json(terms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching terms' });
    }
});

// Update Terms (For Admin)
router.post('/', async (req, res) => {
    try {
        const { lastUpdated, sections } = req.body;
        const updateDoc = {
            lastUpdated: lastUpdated || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            sections: sections || []
        };

        const terms = await Terms.findOneAndUpdate({}, updateDoc, { upsert: true, new: true, runValidators: true });
        res.status(200).json(terms);
    } catch (error) {
        console.error('Update terms error:', error);
        res.status(500).json({ message: 'Error updating terms' });
    }
});

export default router;
