import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PendingUser from '../models/PendingUser.js';
import { sendOTP } from '../utils/smsHelper.js';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Helper for OTP generation
const getGeneratedOtp = () => {
    const isOtpEnabled = process.env.OTP_ENABLED === 'true';
    return isOtpEnabled ? Math.floor(100000 + Math.random() * 900000).toString() : '123456';
};

// @desc    Check identifier availability
// @route   POST /api/auth/check-availability
// @access  Public
router.post('/check-availability', async (req, res) => {
    const { email, mobile } = req.body;
    try {
        const query = { $or: [] };
        if (email) query.$or.push({ email: email.toLowerCase() });
        if (mobile) query.$or.push({ mobile });

        if (query.$or.length === 0) return res.json({ available: true });

        const user = await User.findOne(query);
        if (user) {
            const conflict = user.mobile === mobile ? 'Mobile number' : 'Email address';
            return res.json({ available: false, message: `${conflict} already registered.` });
        }
        res.json({ available: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error check availability' });
    }
});

// @desc    Initiate Registration (Temporary Storage)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const {
        name, email, password, role,
        mobile, country, city, profilePicture,
        preferredLanguage, referralCode
    } = req.body;

    try {
        // 1. Check if user already exists permanently by email OR mobile
        const query = { $or: [{ mobile }] };
        if (email) query.$or.push({ email: email.toLowerCase() });

        const userExists = await User.findOne(query);
        if (userExists) {
            const conflict = userExists.mobile === mobile ? 'Mobile number' : 'Email address';
            return res.status(400).json({ message: `${conflict} already registered.` });
        }

        // 2. Clear old pending signups for this identifier if any
        await PendingUser.deleteMany(query);

        // 3. Create Pending User Record
        const otp = getGeneratedOtp();
        const pendingUser = await PendingUser.create({
            name, email, password, mobile, country, city, profilePicture,
            preferredLanguage, referralCode, role: role || 'user',
            otp: otp
        });

        if (pendingUser) {
            await sendOTP(mobile, otp);
            res.status(201).json({
                success: true,
                message: 'OTP sent to mobile. Verification pending.',
                email: email,
                mobile: mobile
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// @desc    Verify OTP & Finalize Registration (or Login 2FA)
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body; // 'email' might be mobile number for login flow

    try {
        // 1. First, check if there's a PENDING registration for this identifier (Email-only for pending)
        const pending = await PendingUser.findOne({
            $or: [{ email: email.toLowerCase() }, { mobile: email }]
        });

        if (pending) {
            // Flow: Finalize Registration
            if (pending.otp === otp) {
                // Create actual user (Permanent DB entry)
                const user = await User.create({
                    name: pending.name,
                    email: pending.email,
                    password: pending.password,
                    role: pending.role,
                    mobile: pending.mobile,
                    country: pending.country,
                    city: pending.city,
                    profilePicture: pending.profilePicture,
                    preferredLanguage: pending.preferredLanguage,
                    referralCode: pending.referralCode,
                    isVerified: true
                });

                // Clear temporary record
                await PendingUser.findByIdAndDelete(pending._id);

                return res.json({
                    success: true,
                    message: 'Registration finalized successfully',
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        mobile: user.mobile,
                        role: user.role,
                        fcmTokens: user.fcmTokens || [],
                        fcmTokenMobile: user.fcmTokenMobile || [],
                        token: generateToken(user._id)
                    }
                });
            } else {
                return res.status(400).json({ success: false, message: 'Invalid OTP' });
            }
        }

        // 2. If no pending, check for EXISTING user (Flow: Login 2FA)
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { mobile: email }]
        });
        if (!existingUser) return res.status(404).json({ message: 'Session expired or invalid user.' });

        if (existingUser.otp === otp) {
            existingUser.otp = null;
            await existingUser.save();

            return res.json({
                success: true,
                message: 'Login OTP verified',
                user: {
                    _id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    mobile: existingUser.mobile,
                    role: existingUser.role,
                    profilePicture: existingUser.profilePicture,
                    fcmTokens: existingUser.fcmTokens || [],
                    fcmTokenMobile: existingUser.fcmTokenMobile || [],
                    token: generateToken(existingUser._id)
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('OTP Verification Logic Failed:', error);
        res.status(500).json({ message: 'OTP verification failed' });
    }
});

// @desc    Auth user & Send Login OTP (2FA)
router.post('/login', async (req, res) => {
    const { email, password } = req.body; // 'email' field can now accept phone number too

    try {
        // Find user by email or mobile number
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { mobile: email }
            ]
        });
        if (user && (await user.matchPassword(password))) {
            // BYPASS OTP for admins and special test user
            if (user.role === 'admin' || user.email === 'b@gmail.com') {
                return res.json({
                    success: true,
                    message: `${user.role === 'admin' ? 'Admin' : 'Test'} login successful`,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        mobile: user.mobile,
                        role: user.role,
                        profilePicture: user.profilePicture,
                        fcmTokens: user.fcmTokens || [],
                        fcmTokenMobile: user.fcmTokenMobile || [],
                        token: generateToken(user._id)
                    }
                });
            }

            const otp = getGeneratedOtp();
            user.otp = otp;
            await user.save();
            await sendOTP(user.mobile, otp);

            res.json({
                otpRequired: true,
                email: user.email,
                mobile: user.mobile,
                message: 'OTP sent for 2FA verification'
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
});

// @desc    Request Password Reset OTP
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { mobile: email }]
        });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = getGeneratedOtp();
        user.otp = otp;
        await user.save();
        await sendOTP(user.mobile, otp);

        res.json({ success: true, message: 'Reset OTP sent to mobile' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending reset OTP' });
    }
});

// @desc    Reset Password with OTP
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { mobile: email }]
        });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.otp === otp) {
            user.password = newPassword;
            user.otp = null;
            user.isVerified = true;
            await user.save();
            res.json({ success: true, message: 'Password reset successful' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// @desc    Get current user profile
router.get('/me/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
