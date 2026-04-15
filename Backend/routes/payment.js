import express from 'express';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

const router = express.Router();

// Create Order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;
        console.log('--- Razorpay order request ---');
        console.log('Amount:', amount, 'Receipt:', receipt);

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        console.log('Order created successfully:', order.id);
        res.status(200).json(order);
    } catch (error) {
        console.error('Razorpay Error Details:', error);
        res.status(500).json({
            message: 'Error creating Razorpay order',
            details: error.message || 'Unknown error'
        });
    }
});

// Verify Payment
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ message: "Payment verified successfully", success: true });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!", success: false });
        }
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
