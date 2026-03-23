// The following require statements are problematic for a browser environment.
// For the purpose of this task, we assume `db` and `encryptNote`/`decryptNote`
// are made available globally or through other means in the browser context.
// In a real browser environment, you would typically load these as global scripts
// or use a module bundler like Webpack.
const db = require('../config/database');
const { encryptNote, decryptNote } = require('../config/encryption');

let password = ''; // This will hold the currently active password for the session

// --- Helper Functions for UI State Management ---

/**
 * Displays the password input container and hides the main content.
 * Clears the password input field.
 */
function showPasswordPrompt() {
  document.querySelector('.password-container').style.display = 'block';
  document.querySelector('.note-container').style.display = 'none';
  document.querySelector('.calendar-container').style.display = 'none';
  document.getElementById('password').value = ''; // Clear password field for re-entry
}

/**
 * Hides the password input container and displays the main note and calendar content.
 * Also triggers loading of the current note and calendar view.
 */
function showMainContent() {
  document.querySelector('.password-container').style.display = 'none';
  document.querySelector('.note-container').style.display = 'block';
  document.querySelector('.calendar-container').style.display = 'block';
  loadCurrentNote();
  loadCalendar();
}

// --- Auto-Login Logic using sessionStorage ---

/**
 * Attempts to automatically log in the user using a password stored in sessionStorage.
 * If a password is found, it tries to validate it by decrypting an existing note.
 * If successful (or if no notes exist yet), it shows the main content.
 * Otherwise, it displays the password prompt.
 */
function attemptAutoLogin() {
  const storedPassword = sessionStorage.getItem('ichinichi_password');

  if (storedPassword) {
    password = storedPassword; // Set the global password variable

    // Attempt to validate the stored password by trying to decrypt *any* existing note.
    // This provides a basic check that the stored password is correct.
    // If no notes exist, we assume the password is valid for a new user.
    db.get('SELECT encrypted_note, salt FROM notes LIMIT 1', [], (err, row) => {
      if (err) {
        console.error("Database error during auto-login validation:", err);
        // If there's a database error, we can't validate, so fall back to prompt.
        showPasswordPrompt();
        return;
      }

      if (row) {
        // A note exists, try to decrypt it with the stored password to validate.
        try {
          // We don't need the decrypted content, just to see if decryption succeeds without error.
          decryptNote(row.encrypted_note, password, row.salt);
          console.log("Stored password successfully decrypted a note. Auto-logging in.");
          showMainContent(); // Decryption successful, show main content
        } catch (decryptionError) {
          // Decryption failed (e.g., wrong password, corrupted data).
          // This indicates the stored session password is no longer valid.
          console.warn("Decryption failed with stored password, showing password prompt:", decryptionError);
          sessionStorage.removeItem('ichinichi_password'); // Clear potentially invalid session password
          showPasswordPrompt();
        }
      } else {
        // No notes exist yet, so we can't validate the password by decrypting.
        // In this case, we assume the stored password is correct and proceed.
        console.log("No notes found, proceeding with stored password without explicit validation.");
        showMainContent();
      }
    });
  } else {
    // No password found in sessionStorage, display the password prompt.
    showPasswordPrompt();
  }
}

// --- Event Listeners ---

// Initialize the app when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
  // Initially hide the main content containers until a password is confirmed.
  document.querySelector('.note-container').style.display = 'none';
  document.querySelector('.calendar-container').style.display = 'none';
  attemptAutoLogin(); // Try to auto-login
});

// Handle password submission.
document.getElementById('submit-password').addEventListener('click', () => {
  const enteredPassword = document.getElementById('password').value;
  if (enteredPassword) {
    password = enteredPassword; // Set the global password for the session
    sessionStorage.setItem('ichinichi_password', password); // Store in session storage
    showMainContent(); // Show main content after successful password entry
  } else {
    alert('Please enter a password');
  }
});

// --- Existing Core Functions (modified to use global 'password' and handle decryption errors) ---

/**
 * Loads and displays the note for the current date.
 * If a note exists, it decrypts and displays it in read-only mode.
 * Otherwise, it enables the editor for a new note.
 */
function loadCurrentNote() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('note-date').textContent = today;

  db.get('SELECT encrypted_note, salt FROM notes WHERE date = ?', [today], (err, row) => {
    if (err) {
      console.error("Error fetching current note:", err);
      return;
    }

    if (row) {
      try {
        // Attempt to decrypt the note using the current global password.
        const decryptedNote = decryptNote(row.encrypted_note, password, row.salt);
        document.getElementById('note-text').value = decryptedNote;
        document.getElementById('note-text').readOnly = true;
        document.getElementById('save-note').style.display = 'none';
      } catch (decryptionError) {
        console.error("Error decrypting current note with active password:", decryptionError);
        // If decryption fails here, it implies the active 'password' is incorrect for this note.
        // This is a critical failure, so we clear the session and re-prompt.
        password = ''; // Clear the global password
        sessionStorage.removeItem('ichinichi_password'); // Clear the session password
        showPasswordPrompt(); // Show the password prompt again
        alert('Failed to decrypt today\'s note. Please re-enter your password.');
      }
    } else {
      // No note for today, allow creation.
      document.getElementById('note-text').value = ''; // Clear any previous text
      document.getElementById('note-text').readOnly = false;
      document.getElementById('save-note').style.display = 'block';
    }
  });
}

/**
 * Saves the current note to the database.
 * Encrypts the note content before saving.
 */
document.getElementById('save-note').addEventListener('click', () => {
  const today = new Date().toISOString().split('T')[0];
  const noteText = document.getElementById('note-text').value;

  if (noteText) {
    // Ensure a password is set before attempting to encrypt.
    if (!password) {
      alert('Password not set. Please refresh and enter your password.');
      showPasswordPrompt();
      return;
    }
    const { encrypted, salt } = encryptNote(noteText, password);

    db.run(
      'INSERT INTO notes (date, encrypted_note, salt) VALUES (?, ?, ?)',
      [today, encrypted, salt],
      (err) => {
        if (err) {
          console.error("Error saving note:", err);
          // Check for unique constraint violation if trying to save twice for same day.
          if (err.message && err.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed')) {
            alert('A note for today already exists and cannot be edited.');
          } else {
            alert('Failed to save note.');
          }
          return;
        }
        document.getElementById('note-text').readOnly = true;
        document.getElementById('save-note').style.display = 'none';
        loadCalendar(); // Refresh calendar to show the new note
      }
    );
  } else {
    alert('Please enter a note');
  }
});

/**
 * Populates the calendar view with days and highlights days that have notes.
 * Allows clicking on a day with a note to view its content.
 */
function loadCalendar() {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = ''; // Clear previous calendar days

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Add empty divs for days before the 1st of the month to align with weekdays.
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    const emptyDay = document.createElement('div');
    calendar.appendChild(emptyDay);
  }

  // Populate days of the month.
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.textContent = i;

    const date = new Date(today.getFullYear(), today.getMonth(), i).toISOString().split('T')[0];

    // Check if a note exists for this date.
    db.get('SELECT encrypted_note, salt FROM notes WHERE date = ?', [date], (err, row) => {
      if (err) {
        console.error("Error fetching calendar note:", err);
        return;
      }

      if (row) {
        day.classList.add('has-note'); // Highlight days with notes
        day.addEventListener('click', () => {
          try {
            // Attempt to decrypt and display the note content.
            const decryptedNote = decryptNote(row.encrypted_note, password, row.salt);
            alert(`Note for ${date}:\n\n${decryptedNote}`);
          } catch (decryptionError) {
            console.error("Error decrypting calendar note on click:", decryptionError);
            alert('Failed to decrypt this note. The password might be incorrect or the note corrupted.');
            // For calendar view, we don't necessarily force a re-login, just inform the user.
          }
        });
      }
    });

    calendar.appendChild(day);
  }
}
