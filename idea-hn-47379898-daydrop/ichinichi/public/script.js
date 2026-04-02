let password = '';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let notesCache = [];

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

function updateUIForDateState(dateString, hasNote, noteContent = '') {
  const today = new Date().toISOString().split('T')[0];
  const isPastDate = dateString < today;
  const warningBanner = document.getElementById('immutable-warning');
  const saveButton = document.getElementById('save-note');
  const noteTextarea = document.getElementById('note-text');

  if (isPastDate) {
    warningBanner.style.display = 'block';
    saveButton.textContent = 'Past Entry - Cannot Edit';
    saveButton.disabled = true;
    noteTextarea.readOnly = true;
  } else {
    warningBanner.style.display = 'none';
    if (hasNote) {
      saveButton.textContent = 'Save Note';
      saveButton.disabled = true;
      noteTextarea.readOnly = true;
    } else {
      saveButton.textContent = 'Save Note';
      saveButton.disabled = false;
      noteTextarea.readOnly = false;
    }
  }
}

async function loadCurrentNote() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('note-date').textContent = today;

  try {
    const response = await fetch(`/api/notes/${today}`);
    
    if (response.ok) {
      const note = await response.json();
      const decryptedNote = decryptNote(note.encrypted_note, password, note.salt);
      document.getElementById('note-text').value = decryptedNote;
      updateUIForDateState(today, true, decryptedNote);
    } else if (response.status === 404) {
      document.getElementById('note-text').value = '';
      updateUIForDateState(today, false);
    } else {
      console.error('Error loading note:', await response.text());
    }
  } catch (error) {
    console.error('Error loading note:', error);
  }
}

async function loadNoteForDate(dateString) {
  document.getElementById('note-date').textContent = dateString;

  try {
    const response = await fetch(`/api/notes/${dateString}`);
    
    if (response.ok) {
      const note = await response.json();
      const decryptedNote = decryptNote(note.encrypted_note, password, note.salt);
      document.getElementById('note-text').value = decryptedNote;
      updateUIForDateState(dateString, true, decryptedNote);
    } else if (response.status === 404) {
      document.getElementById('note-text').value = '';
      updateUIForDateState(dateString, false);
    } else {
      console.error('Error loading note:', await response.text());
    }
  } catch (error) {
    console.error('Error loading note:', error);
  }
}

document.getElementById('save-note').addEventListener('click', async () => {
  const noteText = document.getElementById('note-text').value;
  const dateString = document.getElementById('note-date').textContent;
  const today = new Date().toISOString().split('T')[0];

  if (dateString !== today) {
    alert('Cannot save notes for past dates');
    return;
  }

  if (!noteText.trim()) {
    alert('Please enter a note');
    return;
  }

  const salt = generateSalt();
  const encryptedNote = encryptNote(noteText, password, salt);

  try {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: dateString,
        encrypted_note: encryptedNote,
        salt: salt
      }),
    });

    if (response.ok) {
      alert('Note saved successfully');
      document.getElementById('note-text').readOnly = true;
      document.getElementById('save-note').disabled = true;
      loadCalendar();
    } else {
      const errorText = await response.text();
      alert('Error saving note: ' + errorText);
    }
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Error saving note');
  }
});

async function loadCalendar() {
  try {
    const response = await fetch('/api/notes');
    notesCache = await response.json();
    renderCalendar();
  } catch (error) {
    console.error('Error loading calendar:', error);
  }
}

function renderCalendar() {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';

  const monthYear = document.getElementById('calendar-month-year');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';
    dayHeader.textContent = day;
    calendar.appendChild(dayHeader);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendar.appendChild(emptyDay);
  }

  const today = new Date().toISOString().split('T')[0];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = day;

    const hasNote = notesCache.some(note => note.date === dateString);
    if (hasNote) {
      dayDiv.classList.add('has-note');
    }

    if (dateString === today) {
      dayDiv.classList.add('today');
    }

    dayDiv.addEventListener('click', () => {
      loadNoteForDate(dateString);
    });

    calendar.appendChild(dayDiv);
  }
}

document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});
