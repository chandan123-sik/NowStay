import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    type: { type: String, required: true, unique: true },
    count: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    capacity: { type: String, required: true },
    bed: { type: String, required: true },
    amenities: [{ type: String }],
    image: { type: String, required: true }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
