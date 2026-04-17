import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";
import api from "./api"; // Use custom api instance with auth headers

/**
 * Request notification permission and get token
 */
export const requestPermissionAndGetToken = async (userId) => {
    try {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications.');
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // Robust Service Worker Registration
            let registration;
            if ('serviceWorker' in navigator) {
                registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                    scope: '/'
                });

                // CRUCIAL: Wait for the service worker to be active before getting token
                await navigator.serviceWorker.ready;
                console.log('Service Worker registered and ready:', registration);
            }

            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration
            });

            if (token) {
                console.log('FCM Token Generated:', token);

                // Always try to register with backend for sync, backend uses addToSet (idempotent)
                await registerTokenWithBackend(userId, token);
                localStorage.setItem('fcmToken', token);

                // Initialize foreground listener
                setupForegroundListener();

                return token;
            } else {

                console.warn('No FCM token obtained.');
                return null;
            }
        } else {
            console.warn('Notification permission denied.');
            return null;
        }
    } catch (error) {
        console.error('Push Notification Setup Failed:', error);
        return null;
    }
};

/**
 * Handle messages when the app is in foreground
 */
export const setupForegroundListener = () => {
    onMessage(messaging, (payload) => {
        console.log('Foreground Message Received:', payload);

        // Show a standard browser notification when in foreground
        if (Notification.permission === 'granted') {
            const notificationTitle = payload.notification?.title || 'NowStay';
            const notificationOptions = {
                body: payload.notification?.body || 'New message received',
                icon: '/logo.png',
                data: payload.data,
                tag: 'nowstay-sync',
                renotify: true
            };

            new Notification(notificationTitle, notificationOptions);
        }
    });
};

/**
 * Logic to register the token with the backend using authenticated API
 */
const registerTokenWithBackend = async (userId, token) => {
    try {
        // userId is provided but the backend uses protect middleware to get userId from token
        const response = await api.post('/fcm/register', {
            token,
            platform: 'web'
        });

        if (response.data.success) {
            console.log('Web FCM Token successfully registered in Database');
        }
    } catch (error) {
        console.error('Error registering token with backend:', error.response?.data?.message || error.message);
    }
};

