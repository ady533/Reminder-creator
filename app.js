// DOM Elements
const form = document.getElementById('reminder-form');
const minutesInput = document.getElementById('minutes');
const titleInput = document.getElementById('title');
const noteInput = document.getElementById('note');
const output = document.getElementById('output');
const downloadBtn = document.getElementById('download-ics');

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
  const { title, description, start, end } = details;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Quick Reminder//EN
BEGIN:VEVENT
UID:${Date.now()}@quickreminder.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${escapeICS(title)}
DESCRIPTION:${escapeICS(description)}
BEGIN:VALARM
TRIGGER:-PT0M
ACTION:DISPLAY
DESCRIPTION:${escapeICS(description)}
END:VALARM
END:VEVENT
END:VCALENDAR`;
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
  const title = titleInput.value.trim();
  const note = noteInput.value.trim();

  if (isNaN(minutes) || minutes <= 0) {
    alert('Please enter a valid number of minutes.');
    return;
  }

  if (!title) {
    alert('Please enter a reminder name.');
    return;
  }

  const now = new Date();
  const start = new Date(now.getTime() + minutes * 60 * 1000);
  const end = new Date(start.getTime() + 1 * 60 * 1000); // 1 minute duration

  eventDetails = {
    title,
    description: note || `Reminder: ${title}`,
    start,
    end
  };

  // Show output section
  output.classList.remove('hidden');

  // Set download button action
  downloadBtn.onclick = downloadICS;

  // Clear the form
  form.reset();
});
