import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: false, unique: true, sparse: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'English' },
    referralCode: { type: String, default: '' },
    role: { type: String, default: 'user' },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 mins (600 seconds)
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);
export default PendingUser;
