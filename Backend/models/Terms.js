import mongoose from 'mongoose';

const termsSchema = new mongoose.Schema({
    lastUpdated: { type: String, default: 'October 15, 2025' },
    sections: [{
        icon: { type: String, default: 'FileText' }, // lucide icon name
        title: { type: String, default: '' },
        content: { type: String, default: '' }
    }]
}, { timestamps: true });

export default mongoose.model('Terms', termsSchema);
