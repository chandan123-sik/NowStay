import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Background handling logic is in public/firebase-messaging-sw.js
export const onMessageListener = () =>
    new Promise((resolve) => {
        if (messaging) {
            onMessage(messaging, (payload) => {
                resolve(payload);
            });
        }
    });

export { messaging };
export default app;
