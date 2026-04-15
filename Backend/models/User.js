import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    mobile: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    preferredLanguage: {
        type: String,
        default: 'English'
    },
    referralCode: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // For Multi-factor Auth and generic OTP
    otp: {
        type: String,
        default: null
    },
    // Push Notification Tokens
    fcmTokens: {
        type: [String],
        default: []
    },
    fcmTokenMobile: {
        type: [String],
        default: []
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
    wishlist: {
        type: [Number],
        default: []
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        next(err);
    }
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
