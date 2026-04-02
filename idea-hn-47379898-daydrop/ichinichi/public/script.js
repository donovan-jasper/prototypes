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

// API functions
async function saveNoteToAPI(date, encryptedNote, salt) {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      date: date,
      encrypted_note: encryptedNote,
      salt: salt
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save note');
  }
  
  return await response.json();
}

async function getNoteFromAPI(date) {
  const response = await fetch(`/api/notes/${date}`);
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch note');
  }
  
  return await response.json();
}

async function getAllNotesFromAPI() {
  const response = await fetch('/api/notes');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch notes');
  }
  
  return await response.json();
}

async function deleteNoteFromAPI(date) {
  const response = await fetch(`/api/notes/${date}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete note');
  }
  
  return await response.json();
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
      const notes = await getAllNotesFromAPI();

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
      console.error("Error fetching notes:", error);
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
    const note = await getNoteFromAPI(today);
    
    if (note) {
      try {
        const decryptedNote = decryptNote(note.encrypted_note, password, note.salt);
        document.getElementById('note-text').value = decryptedNote;
        updateUIForDateState(today, true, decryptedNote);
      } catch (error) {
        console.error('Error decrypting note:', error);
        document.getElementById('note-text').value = '';
        updateUIForDateState(today, false);
      }
    } else {
      document.getElementById('note-text').value = '';
      updateUIForDateState(today, false);
    }
  } catch (error) {
    console.error('Error loading note:', error);
    document.getElementById('note-text').value = '';
    updateUIForDateState(today, false);
  }
}

document.getElementById('save-note').addEventListener('click', async () => {
  const noteText = document.getElementById('note-text').value;
  const today = new Date().toISOString().split('T')[0];

  if (!noteText.trim()) {
    alert('Please enter a note');
    return;
  }

  try {
    const salt = generateSalt();
    const encryptedNote = encryptNote(noteText, password, salt);
    
    await saveNoteToAPI(today, encryptedNote, salt);
    
    updateUIForDateState(today, true, noteText);
    loadCalendar();
    alert('Note saved successfully!');
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Error saving note: ' + error.message);
  }
});

async function loadCalendar() {
  try {
    notesCache = await getAllNotesFromAPI();
    renderCalendar();
  } catch (error) {
    console.error('Error loading calendar:', error);
  }
}

function renderCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  const monthYear = document.getElementById('month-year');

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  monthYear.textContent = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  calendarGrid.innerHTML = '';

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });

  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;

    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasNote = notesCache.some(note => note.date === dateString);

    if (hasNote) {
      dayElement.classList.add('has-note');
    }

    const today = new Date().toISOString().split('T')[0];
    if (dateString === today) {
      dayElement.classList.add('today');
    }

    dayElement.addEventListener('click', () => loadNoteForDate(dateString));

    calendarGrid.appendChild(dayElement);
  }
}

async function loadNoteForDate(dateString) {
  document.getElementById('note-date').textContent = dateString;

  try {
    const note = await getNoteFromAPI(dateString);
    
    if (note) {
      try {
        const decryptedNote = decryptNote(note.encrypted_note, password, note.salt);
        document.getElementById('note-text').value = decryptedNote;
        updateUIForDateState(dateString, true, decryptedNote);
      } catch (error) {
        console.error('Error decrypting note:', error);
        document.getElementById('note-text').value = '';
        updateUIForDateState(dateString, false);
        alert('Error decrypting note. Please check your password.');
      }
    } else {
      document.getElementById('note-text').value = '';
      updateUIForDateState(dateString, false);
    }
  } catch (error) {
    console.error('Error loading note:', error);
    document.getElementById('note-text').value = '';
    updateUIForDateState(dateString, false);
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
