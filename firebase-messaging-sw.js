importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBQPRt_XeXmwJz6FCJFYzn5PcPOeC1tzWo",
  authDomain: "smart-reminder-fc804.firebaseapp.com",
  projectId: "smart-reminder-fc804",
  messagingSenderId: "710675286752",
  appId: "1:710675286752:web:0bb9ca761d73e597475e85"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png"
  });
});
