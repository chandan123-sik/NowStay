import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    name: { type: String, default: 'NowStay' },
    slogan: { type: String, default: 'Elegance in Every Detail' },
    about: { type: String, default: 'NowStay is a beacon of luxury and refined hospitality in Indore.' },
    email: { type: String, default: 'frontdesk@nowstay.com' },
    phone: { type: String, default: '+91 98765 43210' },
    website: { type: String, default: 'www.nowstay.com' },
    address: { type: String, default: 'Indore, MP, India' },
    checkInTime: { type: String, default: '12:00 PM' },
    checkOutTime: { type: String, default: '11:00 AM' },
    cancellationWindow: { type: String, default: '24 Hours' },
    logo: { type: String },
    heroImage: { type: String },
    payAtHotelEnabled: { type: Boolean, default: true },
    partialPaymentPercentage: { type: Number, default: 25 }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);
export default Property;
