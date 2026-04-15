import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// @desc    Update user profile or role (works for both user updating their own profile and admin updating role)
// @route   PUT /api/users/:id
router.put('/:id', async (req, res) => {
    try {
        const updateData = {};
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.email !== undefined) updateData.email = req.body.email.toLowerCase();
        if (req.body.mobile !== undefined) updateData.mobile = req.body.mobile;
        if (req.body.city !== undefined) updateData.city = req.body.city;
        if (req.body.country !== undefined) updateData.country = req.body.country;
        if (req.body.profilePicture !== undefined) updateData.profilePicture = req.body.profilePicture;
        if (req.body.role !== undefined) updateData.role = req.body.role;
        if (req.body.walletBalance !== undefined) updateData.walletBalance = req.body.walletBalance;
        if (req.body.status !== undefined) updateData.status = req.body.status;
        if (req.body.wishlist !== undefined) updateData.wishlist = req.body.wishlist;

        if (req.body.password) {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            if (!req.body.oldPassword) {
                return res.status(400).json({ message: 'Old password is required to set a new password' });
            }
            const isMatch = await user.matchPassword(req.body.oldPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid old password' });
            }
            user.password = req.body.password;
            await user.save(); // Password hashing requires save() hook
            delete updateData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

export default router;
