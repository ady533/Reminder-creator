// script.js
document.getElementById("reminder-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("reminder-title").value;
    const note = document.getElementById("reminder-note").value;
    const timeDelay = parseInt(document.getElementById("reminder-time").value);

    // Calculate the reminder time
    const currentTime = new Date();
    const reminderTime = new Date(currentTime.getTime() + timeDelay * 60000);

    // Create the reminder (works on iOS/macOS with Reminders app)
    if (window.webkit && window.webkit.messageHandlers) {
        try {
            window.webkit.messageHandlers.createReminder.postMessage({
                title: title,
                note: note,
                date: reminderTime.toISOString()
            });
            document.getElementById("status-message").textContent = "Reminder set successfully!";
        } catch (error) {
            document.getElementById("status-message").textContent = "Failed to set reminder.";
        }
    } else {
        document.getElementById("status-message").textContent = "This feature is only supported on iOS/Mac devices.";
    }

    // Reset form
    document.getElementById("reminder-form").reset();
});
