if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

function enableNotifications() {
  Notification.requestPermission().then(p => {
    alert("Permission: " + p);
  });
}

function addReminder() {
  const title = document.getElementById('title').value;
  const time = new Date(document.getElementById('time').value).getTime();
  const delay = time - Date.now();

  if (delay <= 0) {
    alert("Choose future time");
    return;
  }

  setTimeout(() => {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification("Reminder", {
        body: title,
        icon: "icon.png"
      });
    });
  }, delay);

  alert("Reminder set!");
}

let total = 0;

function addExpense() {
  const amount = Number(document.getElementById('expenseAmount').value);
  total += amount;
  document.getElementById('total').innerText = "Total: ₹" + total;
}
