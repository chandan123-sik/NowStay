import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the service account key
const serviceAccountPath = path.join(__dirname, '../config/ananya-hotel.json');

try {
    if (!admin.apps.length) {
        let serviceAccount;

        // Try getting from environment variable first (Vercel/Production Best Practice)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } else {
            // Fallback to local file for development
            serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        }

        // Fix for private_key in some environments
        if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized successfully');
    }
} catch (error) {
    console.error('Firebase Admin initialization error:', error.stack);
}

export default admin;
