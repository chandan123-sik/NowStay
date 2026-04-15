import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';
import dashboardRoutes from './routes/dashboard.js';
import setupRoutes from './routes/setup.js';
import mediaRoutes from './routes/media.js';
import discountRoutes from './routes/discounts.js';
import paymentRoutes from './routes/payment.js';
import pricingRoutes from './routes/pricing.js';
import serviceRoutes from './routes/services.js';
import messageRoutes from './routes/messages.js';
import termsRoutes from './routes/terms.js';
import notificationRoutes from './routes/notifications.js';
import inventoryRoutes from './routes/inventory.js';
import fcmRoutes from './routes/fcm.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ADDED for better mobile app body parsing

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Clean up origins (remove trailing slashes, spaces)
        const cleanOrigin = origin.trim().replace(/\/$/, "");
        const cleanAllowed = allowedOrigins.map(o => o.trim().replace(/\/$/, ""));

        if (cleanAllowed.indexOf(cleanOrigin) !== -1 || cleanAllowed.includes('*')) {
            return callback(null, true);
        } else {
            console.warn(`CORS blocked for origin: ${origin}`);
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/fcm', fcmRoutes);


// Basic Route
app.get('/', (req, res) => {
    res.send('Hotel Ananya API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
