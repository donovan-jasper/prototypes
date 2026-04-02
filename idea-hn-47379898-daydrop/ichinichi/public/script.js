let password = '';

// Encryption functions using CryptoJS
function encryptNote(note, password, salt) {
  const key = CryptoJS.PBKDF2(password, salt, { keySize: 256/32, iterations: 1000 });
  const encrypted = CryptoJS.AES.encrypt(note, key.toString());
  return encrypted.toString();
}

function decryptNote(encryptedNote, password, salt) {
  const key = CryptoJS.PBKDF2(password, salt, { keySize: 256/32, iterations: 1000 });
  const decrypted = CryptoJS.AES.decrypt(encryptedNote, key.toString());
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function generateSalt() {
  return CryptoJS.lib.WordArray.random(128/8).toString();
}

function showPasswordPrompt() {
  document.querySelector('.password-container').style.display = 'block';
  document.querySelector('.note-container').style.display = 'none';
  document.querySelector('.calendar-container').style.display = 'none';
  document.getElementById('password').value = '';
}

function showMainContent() {
  document.querySelector('.password-container').style.display = 'none';
  document.querySelector('.note-container').style.display = 'block';
  document.querySelector('.calendar-container').style.display = 'block';
  loadCurrentNote();
  loadCalendar();
}

async function attemptAutoLogin() {
  const storedPassword = sessionStorage.getItem('ichinichi_password');

  if (storedPassword) {
    password = storedPassword;

    try {
      const response = await fetch('/api/notes');
      const notes = await response.json();

      if (notes.length > 0) {
        try {
          decryptNote(notes[0].encrypted_note, password, notes[0].salt);
          console.log("Stored password successfully decrypted a note. Auto-logging in.");
          showMainContent();
        } catch (decryptionError) {
          console.warn("Decryption failed with stored password, showing password prompt:", decryptionError);
          sessionStorage.removeItem('ichinichi_password');
          showPasswordPrompt();
        }
      } else {
        console.log("No notes found, proceeding with stored password without explicit validation.");
        showMainContent();
      }
    } catch (error) {
      console.error("Error during auto-login:", error);
      showPasswordPrompt();
    }
  } else {
    showPasswordPrompt();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.note-container').style.display = 'none';
  document.querySelector('.calendar-container').style.display = 'none';
  attemptAutoLogin();
});

document.getElementById('submit-password').addEventListener('click', () => {
  const enteredPassword = document.getElementById('password').value;
  if (enteredPassword) {
    password = enteredPassword;
    sessionStorage.setItem('ichinichi_password', password);
    showMainContent();
  } else {
    alert('Please enter a password');
  }
});

async function loadCurrentNote() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('note-date').textContent = today;

  try {
    const response = await fetch(`/api/notes/${today}`);
    
    if (response.ok) {
      const note = await response.json();
      const decryptedNote = decryptNote(note.encrypted_note, password, note.salt);
      document.getElementById('note-text').value = decryptedNote;
      document.getElementById('note-text').readOnly = true;
      document.getElementById('save-note').disabled = true;
    } else if (response.status === 404) {
      document.getElementById('note-text').value = '';
      document.getElementById('note-text').readOnly = false;
      document.getElementById('save-note').disabled = false;
    } else {
      console.error('Error loading note:', await response.text());
    }
  } catch (error) {
    console.error('Error loading note:', error);
  }
}

document.getElementById('save-note').addEventListener('click', async () => {
  const noteText = document.getElementById('note-text').value;
  const today = new Date().toISOString().split('T')[0];

  if (!noteText.trim()) {
    alert('Please write something before saving');
    return;
  }

  const salt = generateSalt();
  const encryptedNote = encryptNote(noteText, password, salt);

  try {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: today,
        encrypted_note: encryptedNote,
        salt: salt
      })
    });

    if (response.ok) {
      alert('Note saved successfully');
      document.getElementById('note-text').readOnly = true;
      document.getElementById('save-note').disabled = true;
      loadCalendar();
    } else if (response.status === 409) {
      alert('A note already exists for today');
    } else {
      const error = await response.json();
      alert('Error saving note: ' + error.error);
    }
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Error saving note');
  }
});

async function loadCalendar() {
  try {
    const response = await fetch('/api/notes');
    const notes = await response.json();

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    notes.forEach(note => {
      const noteElement = document.createElement('div');
      noteElement.className = 'calendar-item';
      noteElement.textContent = note.date;
      noteElement.addEventListener('click', () => viewNote(note));
      calendar.appendChild(noteElement);
    });
  } catch (error) {
    console.error('Error loading calendar:', error);
  }
}

function viewNote(note) {
  try {
    const decryptedNote = decryptNote(note.encrypted_note, password, note.salt);
    document.getElementById('note-date').textContent = note.date;
    document.getElementById('note-text').value = decryptedNote;
    document.getElementById('note-text').readOnly = true;
    document.getElementById('save-note').disabled = true;
  } catch (error) {
    console.error('Error decrypting note:', error);
    alert('Error decrypting note. Wrong password?');
  }
}
