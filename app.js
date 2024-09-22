// Replace with your actual Client ID
const CLIENT_ID = 'YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // Optional: If using API Key for certain operations

// Discovery doc URL for APIs used by the quick reminder app
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// DOM Elements
const form = document.getElementById('reminder-form');
const minutesInput = document.getElementById('minutes');
const titleInput = document.getElementById('title');
const noteInput = document.getElementById('note');
const output = document.getElementById('output');
const downloadBtn = document.getElementById('download-ics');
const addToCalendarBtn = document.getElementById('add-to-calendar');
const signOutBtn = document.getElementById('sign-out-button');

// Initialize the GAPI client
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS,
  });
  gapiInited = true;
  maybeEnableButtons();
}

// Initialize the GIS client
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    // Enable sign-in button or perform other actions
  }
}

// Load GAPI and GIS scripts
window.onload = () => {
  gapiLoaded();
  gisLoaded();
};

// Sign-In Success Callback
function onSignIn(googleUser) {
  // Handle successful sign-in
  // Show the reminder form and hide the sign-in button
  document.getElementById('g-signin2').classList.add('hidden');
  signOutBtn.classList.remove('hidden');
  form.classList.remove('hidden');
}

// Sign-Out Function
function signOut() {
  google.accounts.id.disableAutoSelect();
  document.getElementById('g-signin2').classList.remove('hidden');
  signOutBtn.classList.add('hidden');
  form.classList.add('hidden');
  output.classList.add('hidden');
}

// Event Listener for Sign-Out Button
signOutBtn.addEventListener('click', signOut);

// Helper Functions

/**
 * Escapes special characters in ICS fields
 * @param {string} text 
 * @returns {string}
 */
function escapeICS(text) {
  return text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

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

// Function to create a Google Calendar event via API
async function addEventToGoogleCalendar(details) {
  try {
    const event = {
      'summary': details.title,
      'description': details.description,
      'start': {
        'dateTime': details.start.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'end': {
        'dateTime': details.end.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'reminders': {
        'useDefault': false,
        'overrides': [
          {'method': 'popup', 'minutes': 0}
        ]
      }
    };

    const request = gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event,
    });

    await request.execute((event) => {
      alert('Event created: ' + event.htmlLink);
    });
  } catch (error) {
    console.error('Error creating event:', error);
    alert('Failed to create event. Please try again.');
  }
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

  const eventDetails = {
    title,
    description: note || `Reminder: ${title}`,
    start,
    end
  };

  // Show output section
  output.classList.remove('hidden');

  // Set download button action
  downloadBtn.onclick = downloadICS;

  // Set Add to Google Calendar button action
  addToCalendarBtn.onclick = () => addEventToGoogleCalendar(eventDetails);

  // Clear the form
  form.reset();
});
