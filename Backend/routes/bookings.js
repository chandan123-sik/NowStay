import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Inventory from '../models/Inventory.js';
import RoomVariant from '../models/RoomVariant.js';
import { sendNotificationToUser, notifyAdmins } from '../utils/notificationHelper.js';

const router = express.Router();

const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current < end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
};

// @desc    Create a new booking (multifaceted)
router.post('/', async (req, res) => {
    const {
        userId, roomType, variant, plan, checkIn, checkOut, roomsCount, roomDetails,
        totalPrice, amountPaid = totalPrice, bookingId, paymentMethod = 'wallet', paymentId,
        paymentStatus = 'paid'
    } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const variantDoc = await RoomVariant.findById(variant);
        if (!variantDoc) return res.status(404).json({ message: 'Room Variant not found' });

        // 1. Validate Availability for all dates
        const datesInRange = getDatesInRange(checkIn, checkOut);

        for (const date of datesInRange) {
            const inventory = await Inventory.findOne({ roomVariant: variant, date });
            const totalForDate = inventory?.roomsToSell ?? variantDoc.totalRooms;
            const currentBooked = inventory?.bookedUnits ?? 0;

            if (inventory?.isStopSell) {
                return res.status(400).json({ message: `Rooms are closed for sale on ${new Date(date).toLocaleDateString()}` });
            }

            if (totalForDate - currentBooked < roomsCount) {
                return res.status(400).json({ message: `Only ${totalForDate - currentBooked} rooms available for ${new Date(date).toLocaleDateString()}` });
            }
        }

        // 2. Process Payment
        if (paymentMethod === 'wallet' && user.walletBalance < amountPaid) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        if (paymentMethod === 'wallet') {
            user.walletBalance -= amountPaid;
            await user.save();
        }

        // 3. Create transaction record
        await Transaction.create({
            user: userId,
            type: 'debit',
            amount: amountPaid,
            description: `Room Booking #${bookingId} (${paymentStatus} payment) via ${paymentMethod}`
        });

        // 4. Create booking
        const booking = await Booking.create({
            user: userId,
            roomType,
            variant,
            plan,
            checkIn,
            checkOut,
            roomsCount,
            roomDetails,
            totalPrice,
            amountPaid,
            remainingBalance: totalPrice - amountPaid,
            bookingId,
            paymentMethod,
            paymentId,
            paymentStatus,
            bookingStatus: 'confirmed'
        });

        // 5. Update Inventory (Deduct availability)
        if (booking) {
            for (const date of datesInRange) {
                await Inventory.findOneAndUpdate(
                    { roomVariant: variant, date },
                    {
                        $inc: { bookedUnits: roomsCount },
                        $setOnInsert: { roomType, roomsToSell: variantDoc.totalRooms }
                    },
                    { upsert: true, new: true }
                );
            }

            // PUSH NOTIFICATION: User (Booking Success)
            await sendNotificationToUser(
                userId,
                "Stay Confirmed!",
                `Your stay for ${checkIn} to ${checkOut} has been successfully booked.`,
                { bookingId: booking._id.toString(), type: 'booking' }
            );

            // PUSH NOTIFICATION: Admin (New Booking)
            await notifyAdmins(
                "Incoming Booking!",
                `Guest ${user.name} just booked room for ${checkIn} to ${checkOut}.`,
                { bookingId: booking._id.toString(), type: 'admin_booking' }
            );
        }

        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating booking' });
    }
});

// @desc    Get user bookings
router.get('/my/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId })
            .populate('roomType')
            .populate('variant')
            .populate({ path: 'plan', populate: { path: 'ratePlan' } })
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user bookings' });
    }
});

// @desc    Get all bookings (Admin)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email mobile profilePicture')
            .populate('roomType')
            .populate('variant')
            .populate({ path: 'plan', populate: { path: 'ratePlan' } })
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all bookings' });
    }
});

// @desc    Update booking status
router.put('/:id/status', async (req, res) => {
    try {
        const { status: newStatus } = req.body;
        const currentBooking = await Booking.findById(req.params.id);

        if (!currentBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Logic: once updated, not get to previous status
        const currentStatus = currentBooking.bookingStatus;

        // Terminal states cannot be changed
        if (currentStatus === 'cancelled' || currentStatus === 'completed') {
            return res.status(400).json({ message: `Cannot change status once it is ${currentStatus}` });
        }

        // Progression check: Cannot move back to pending
        if (currentStatus !== 'pending' && newStatus === 'pending') {
            return res.status(400).json({ message: 'Cannot revert status to pending' });
        }

        const booking = await Booking.findByIdAndUpdate(req.params.id, { bookingStatus: newStatus }, { new: true });

        if (booking) {
            // PUSH NOTIFICATION: User (Update Status)
            await sendNotificationToUser(
                booking.user,
                "Booking Update",
                `Your booking #${booking.bookingId} status has been changed to ${req.body.status}.`,
                { bookingId: booking._id.toString(), status: req.body.status, type: 'status_update' }
            );
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
});

export default router;
