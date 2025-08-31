importScripts('https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyCLpAN79CDXf7mwDtlubyvg0ezsWnae99s",
  authDomain: "ward-reminder.firebaseapp.com",
  projectId: "ward-reminder",
  storageBucket: "ward-reminder.firebasestorage.app",
  messagingSenderId: "19609491838",
  appId: "1:19609491838:web:15362b256a004ad41a3b2f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(payload.notification.title,{
    body: payload.notification.body,
    icon: 'icon-192.png'
  });
});
