import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure memory storage instead of disk or direct CloudinaryStorage
// This is more reliable for different environments
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = (buffer, folder = 'media') => {
    return new Promise((resolve, reject) => {
        console.log(`Starting Cloudinary stream upload to folder: nowstay/${folder}`);
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `nowstay/${folder}`,
                // Removed strict allowed_formats to avoid case-sensitivity issues
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Stream Error:', error);
                    return reject(error);
                }
                console.log('Cloudinary Upload Successful');
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

export { cloudinary, upload, uploadToCloudinary };
