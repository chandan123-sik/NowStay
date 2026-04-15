importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Real Firebase Configuration for Background Messaging
firebase.initializeApp({
    apiKey: "AIzaSyDbYVaJeVWgtEH4QPiyfxS7I6c6LapraFQ",
    authDomain: "ananya-hotel.firebaseapp.com",
    projectId: "ananya-hotel",
    storageBucket: "ananya-hotel.firebasestorage.app",
    messagingSenderId: "949092926737",
    appId: "1:949092926737:web:67d164a26f8cabecaa38b0",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title || 'Ananya Hotel';
    const notificationOptions = {
        body: payload.notification.body || 'You have a new update.',
        icon: '/logo.png',
        data: payload.data,
        vibrate: [200, 100, 200],
        tag: 'hotel-ananya-notif',
        renotify: true
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click - Redirect to app or specific link
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.link || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If the app is already open, focus it
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

