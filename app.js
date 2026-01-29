// 🔥 Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBQPRt_XeXmwJz6FCJFYzn5PcPOeC1tzWo",
  authDomain: "smart-reminder-fc804.firebaseapp.com",
  projectId: "smart-reminder-fc804",
  messagingSenderId: "710675286752",
  appId: "1:710675286752:web:0bb9ca761d73e597475e85"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

navigator.serviceWorker.register("firebase-messaging-sw.js");

// Enable push permission
async function enableNotifications() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Permission denied");
    return;
  }

  const token = await messaging.getToken({
    vapidKey: "BOnjfhYBuyhtUFQyLfkXn-OC0RxQWkLQBu9BrrKTMuV7XcPyUFFpJyBsp6gvPnNqb3RMbUNCZHSx01B6AnFrVS4"
  });

  localStorage.setItem("fcmToken", token);
  alert("Notifications enabled!");
  console.log("FCM Token:", token);
}

// Save reminder
function addReminder() {
  const title = document.getElementById("title").value;
  const time = new Date(document.getElementById("time").value).getTime();
  const token = localStorage.getItem("fcmToken");

  if (!token) {
    alert("Enable notifications first");
    return;
  }

  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  reminders.push({ title, time });
  localStorage.setItem("reminders", JSON.stringify(reminders));

  alert("Monthly reminder saved!");
}
