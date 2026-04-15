import mongoose from 'mongoose';

const mediaSchema = mongoose.Schema({
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['banner', 'gallery']
    },
    title: { type: String },
    subtext: { type: String },
    category: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Media = mongoose.model('Media', mediaSchema);
export default Media;
