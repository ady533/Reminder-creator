// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(reg => console.log('Service Worker registered', reg))
    .catch(err => console.log('Service Worker registration failed', err));
}

// DOM Elements
const form = document.getElementById('reminder-form');
const timeInput = document.getElementById('time');
const noteInput = document.getElementById('note');
const reminderList = document.getElementById('reminder-list');

// Load reminders from localStorage
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
renderReminders();

// Form Submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const minutes = parseInt(timeInput.value);
  const note = noteInput.value.trim();
  
  if (isNaN(minutes) || minutes <= 0) {
    alert('Please enter a valid number of minutes.');
    return;
  }
  
  const reminderTime = Date.now() + minutes * 60 * 1000;
  
  const reminder = {
    id: Date.now(),
    time: reminderTime,
    note
  };
  
  reminders.push(reminder);
  localStorage.setItem('reminders', JSON.stringify(reminders));
  renderReminders();
  scheduleNotification(reminder);
  
  form.reset();
});

// Render Reminders
function renderReminders() {
  reminderList.innerHTML = '';
  
  reminders.forEach(reminder => {
    const li = document.createElement('li');
    const timeLeft = getTimeLeft(reminder.time);
    li.textContent = `${reminder.note} - in ${timeLeft}`;
    reminderList.appendChild(li);
  });
}

// Calculate Time Left
function getTimeLeft(timestamp) {
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff <= 0) return '0 minutes';
  
  const minutes = Math.floor(diff / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);
  
  return `${minutes}m ${seconds}s`;
}

// Schedule Notification
function scheduleNotification(reminder) {
  if (Notification.permission === 'granted') {
    const delay = reminder.time - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        showNotification(reminder);
        removeReminder(reminder.id);
      }, delay);
    }
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        scheduleNotification(reminder);
      }
    });
  }
}

// Show Notification
function showNotification(reminder) {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) {
        reg.showNotification('Reminder', {
          body: reminder.note,
          icon: 'icon.png', // Optional: Add an icon
          tag: `${reminder.id}`
        });
      }
    });
  }
}

// Remove Reminder
function removeReminder(id) {
  reminders = reminders.filter(r => r.id !== id);
  localStorage.setItem('reminders', JSON.stringify(reminders));
  renderReminders();
}

// Initialize Scheduled Notifications on Load
reminders.forEach(reminder => {
  scheduleNotification(reminder);
});
