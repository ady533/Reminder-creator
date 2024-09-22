// DOM Elements
const form = document.getElementById('event-form');
const output = document.getElementById('output');
const downloadBtn = document.getElementById('download-ics');
const googleCalendarLink = document.getElementById('google-calendar');
const appleCalendarLink = document.getElementById('apple-calendar');
const outlookCalendarLink = document.getElementById('outlook-calendar');

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
 * Generates ICS file content
 * @param {object} details 
 * @returns {string}
 */
function generateICS(details) {
  const { title, description, start, end } = details;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Company//Quick Calendar Event//EN
BEGIN:VEVENT
UID:${Date.now()}@quickcalendar.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
}

/**
 * Generates Google Calendar link
 * @param {object} details 
 * @returns {string}
 */
function generateGoogleCalendarLink(details) {
  const { title, description, start, end } = details;
  const formatDateStart = formatDate(start).replace(/[-:]/g, '').replace('Z', '');
  const formatDateEnd = formatDate(end).replace(/[-:]/g, '').replace('Z', '');
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&dates=${formatDateStart}/${formatDateEnd}`;
}

/**
 * Generates Apple Calendar link using webcal protocol
 * Note: Apple Calendar doesn't support direct URL additions, so we'll use the ICS file
 */
function generateAppleCalendarLink() {
  // Apple users will need to download the ICS file and open it
  return '#';
}

/**
 * Generates Outlook Calendar link
 * @param {object} details 
 * @returns {string}
 */
function generateOutlookCalendarLink(details) {
  const { title, description, start, end } = details;
  const formatDateStart = formatDate(start).replace(/[-:]/g, '').replace('Z', '');
  const formatDateEnd = formatDate(end).replace(/[-:]/g, '').replace('Z', '');
  
  return `https://outlook.live.com/owa/?path=/calendar/action/compose&subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}`;
}

// Event Listener for Form Submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get form values
  const title = document.getElementById('title').value.trim();
  const date = document.getElementById('date').value;
  const startTime = document.getElementById('start-time').value;
  const endTime = document.getElementById('end-time').value;
  const description = document.getElementById('description').value.trim();

  // Validate inputs
  if (!title || !date || !startTime || !endTime) {
    alert('Please fill in all required fields.');
    return;
  }

  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);

  if (end <= start) {
    alert('End time must be after start time.');
    return;
  }

  eventDetails = {
    title,
    description,
    start,
    end
  };

  // Show output section
  output.classList.remove('hidden');

  // Generate calendar links
  googleCalendarLink.href = generateGoogleCalendarLink(eventDetails);
  outlookCalendarLink.href = generateOutlookCalendarLink(eventDetails);
  // Apple Calendar will use the ICS file

  // Update download button
  downloadBtn.onclick = () => downloadICS();
});

/**
 * Downloads the ICS file
 */
function downloadICS() {
  const icsContent = generateICS(eventDetails);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${eventDetails.title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
