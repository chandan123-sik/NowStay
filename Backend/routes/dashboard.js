import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Room from '../models/Room.js';

const router = express.Router();

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalRevenueResult = await Booking.aggregate([
            { $match: { bookingStatus: { $in: ['confirmed', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        const rooms = await Room.find({});
        const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
        const totalRooms = rooms.length;
        const occupancyRate = totalRooms > 0 ? ((occupiedCount / totalRooms) * 100).toFixed(1) : 0;

        const checkIns = await Booking.countDocuments({ bookingStatus: 'confirmed' });
        const checkOuts = await Booking.countDocuments({ bookingStatus: 'completed' });

        res.json({
            totalBookings,
            totalUsers,
            totalRevenue,
            occupancyRate,
            checkIns,
            checkOuts,
            occupiedCount,
            totalRooms
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

export default router;
