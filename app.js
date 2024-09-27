// DOM Elements
const form = document.getElementById('reminder-form');
const minutesInput = document.getElementById('minutes');
const durationInput = document.getElementById('duration');
const titleInput = document.getElementById('title');
const noteInput = document.getElementById('note');
const output = document.getElementById('output');
const downloadBtn = document.getElementById('download-ics');
const alert1Toggle = document.getElementById('alert1-toggle');
const alert1Minutes = document.getElementById('alert1-minutes');
const alert2Toggle = document.getElementById('alert2-toggle');
const alert2Minutes = document.getElementById('alert2-minutes');
const repeatsSelect = document.getElementById('repeats');

let eventDetails = {};

// Helper Functions

/**
 * Formats a date object to YYYYMMDDTHHMMSSZ
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Escapes special characters in ICS fields
 * @param {string} text 
 * @returns {string}
 */
function escapeICS(text) {
  return text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

/**
 * Generates ICS file content
 * @param {object} details 
 * @returns {string}
 */
function generateICS(details) {
  const { title, description, start, end, alerts, repeats } = details;

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Quick Reminder//EN
BEGIN:VEVENT
UID:${Date.now()}@quickreminder.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${escapeICS(title)}
DESCRIPTION:${escapeICS(description)}
`;

  // Add Repeats if any
  if (repeats && repeats !== 'none') {
    let freq;
    switch (repeats) {
      case 'daily':
        freq = 'DAILY';
        break;
      case 'weekly':
        freq = 'WEEKLY';
        break;
      case 'monthly':
        freq = 'MONTHLY';
        break;
      default:
        freq = '';
    }
    if (freq) {
      icsContent += `RRULE:FREQ=${freq}\n`;
    }
  }

  // Add Alerts
  alerts.forEach((alert, index) => {
    if (alert.enabled && alert.minutes !== null) {
      icsContent += `BEGIN:VALARM
TRIGGER:-PT${alert.minutes}M
ACTION:DISPLAY
DESCRIPTION:${escapeICS(description)}
END:VALARM
`;
    }
  });

  icsContent += `END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Downloads the ICS file
 */
function downloadICS() {
  const icsContent = generateICS(eventDetails);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const sanitizedTitle = eventDetails.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  a.download = `${sanitizedTitle}_reminder.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event Listener for Form Submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const minutes = parseInt(minutesInput.value);
  const duration = parseInt(durationInput.value);
  const title = titleInput.value.trim();
  const note = noteInput.value.trim();

  if (isNaN(minutes) || minutes <= 0) {
    alert('Please enter a valid number of minutes.');
    return;
  }

  if (isNaN(duration) || duration <= 0) {
    alert('Please enter a valid duration in minutes.');
    return;
  }

  if (!title) {
    alert('Please enter a reminder name.');
    return;
  }

  const now = new Date();
  const start = new Date(now.getTime() + minutes * 60 * 1000);
  const end = new Date(start.getTime() + duration * 60 * 1000);

  // Handle Alerts
  const alerts = [];

  if (alert1Toggle.checked) {
    const alert1Time = parseInt(alert1Minutes.value);
    if (!isNaN(alert1Time) && alert1Time >= 0) {
      alerts.push({ enabled: true, minutes: alert1Time });
    }
  }

  if (alert2Toggle.checked) {
    const alert2Time = parseInt(alert2Minutes.value);
    if (!isNaN(alert2Time) && alert2Time >= 0) {
      alerts.push({ enabled: true, minutes: alert2Time });
    }
  }

  // Handle Repeats
  const repeats = repeatsSelect.value;

  eventDetails = {
    title,
    description: note || `Reminder: ${title}`,
    start,
    end,
    alerts,
    repeats
  };

  // Show output section
  output.classList.remove('hidden');

  // Set download button action
  downloadBtn.onclick = downloadICS;

  // Clear the form
  form.reset();

  // Reset alert inputs based on default toggle states
  alert1Toggle.checked = true;
  alert1Minutes.value = 0;
  alert2Toggle.checked = false;
  alert2Minutes.value = 0;
});
