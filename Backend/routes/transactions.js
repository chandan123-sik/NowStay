import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { sendNotificationToUser, notifyAdmins } from '../utils/notificationHelper.js';

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Get user transactions
router.get('/my/:userId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// @desc    Create Razorpay Order
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order' });
    }
});

// @desc    Verify Payment and Add Funds
router.post('/verify-and-add', async (req, res) => {
    const { userId, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;
    try {
        // Verify signature
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return res.status(400).json({ message: 'Transaction not valid' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.walletBalance += Number(amount);
        await user.save();

        const transaction = await Transaction.create({
            user: userId,
            type: 'credit',
            amount,
            description: `Added ₹${amount} to Wallet (UPI/Card)`,
            razorpay_payment_id
        });

        if (transaction) {
            // PUSH NOTIFICATION: User (Funds Added)
            await sendNotificationToUser(
                userId,
                "Funds Added",
                `₹${amount} has been credited to your sanctuary wallet.`,
                { amount, type: 'wallet_recharge' }
            );

            // PUSH NOTIFICATION: Admin (High Revenue Alert)
            await notifyAdmins(
                "Wallet Pulse",
                `${user.name} added ₹${amount} to their wallet.`,
                { amount, user: user.name, type: 'revenue' }
            );
        }

        res.status(201).json({ balance: user.walletBalance, transaction });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

// @desc    Add funds to wallet (Direct/Manual)
router.post('/add-funds', async (req, res) => {
    const { userId, amount } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.walletBalance += Number(amount);
        await user.save();

        const transaction = await Transaction.create({
            user: userId,
            type: 'credit',
            amount,
            description: 'Funds Added via Portal'
        });

        if (transaction) {
            // PUSH NOTIFICATION: User
            await sendNotificationToUser(userId, "Funds Added", `₹${amount} has been added successfully.`, { type: 'wallet' });
            // PUSH NOTIFICATION: Admin
            await notifyAdmins("Wallet Pulse", `${user.name} was credited ₹${amount} manually.`, { type: 'admin_wallet' });
        }

        res.status(201).json({ balance: user.walletBalance, transaction });
    } catch (error) {
        res.status(500).json({ message: 'Error adding funds' });
    }
});

// @desc    Get all transactions (Admin)
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

export default router;
