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

// LocalStorage functions
function saveNoteToLocalStorage(date, encryptedNote, salt) {
  const noteData = {
    encrypted_note: encryptedNote,
    salt: salt,
    date: date
  };
  localStorage.setItem(`note_${date}`, JSON.stringify(noteData));
}

function getNoteFromLocalStorage(date) {
  const noteData = localStorage.getItem(`note_${date}`);
  return noteData ? JSON.parse(noteData) : null;
}

function getAllNotesFromLocalStorage() {
  const notes = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('note_')) {
      const noteData = JSON.parse(localStorage.getItem(key));
      notes.push(noteData);
    }
  }
  return notes.sort((a, b) => b.date.localeCompare(a.date));
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

function attemptAutoLogin() {
  const storedPassword = sessionStorage.getItem('ichinichi_password');

  if (storedPassword) {
    password = storedPassword;

    const notes = getAllNotesFromLocalStorage();

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

function loadCurrentNote() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('note-date').textContent = today;

  const note = getNoteFromLocalStorage(today);
  
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
}

function loadNoteForDate(dateString) {
  document.getElementById('note-date').textContent = dateString;

  const note = getNoteFromLocalStorage(dateString);
  
  if (note) {
    try {
      const decryptedNote = decryptNote(note.encrypted_note, password, note.salt);
      document.getElementById('note-text').value = decryptedNote;
      updateUIForDateState(dateString, true, decryptedNote);
    } catch (error) {
      console.error('Error decrypting note:', error);
      document.getElementById('note-text').value = '';
      updateUIForDateState(dateString, false);
    }
  } else {
    document.getElementById('note-text').value = '';
    updateUIForDateState(dateString, false);
  }
}

document.getElementById('save-note').addEventListener('click', async () => {
  const noteText = document.getElementById('note-text').value;
  const today = new Date().toISOString().split('T')[0];
  
  if (!noteText.trim()) {
    alert('Please enter some text for your note');
    return;
  }

  const existingNote = getNoteFromLocalStorage(today);
  if (existingNote) {
    alert('A note already exists for today');
    return;
  }

  const salt = generateSalt();
  const encryptedNote = encryptNote(noteText, password, salt);
  
  saveNoteToLocalStorage(today, encryptedNote, salt);
  
  updateUIForDateState(today, true, noteText);
  loadCalendar();
  alert('Note saved successfully!');
});

function loadCalendar() {
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
  
  const notes = getAllNotesFromLocalStorage();
  notesCache = notes;
  
  const noteDates = new Set(notes.map(note => note.date));
  
  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (dateString === today) {
      dayElement.classList.add('today');
    }
    
    if (noteDates.has(dateString)) {
      dayElement.classList.add('has-note');
    }
    
    dayElement.addEventListener('click', () => {
      loadNoteForDate(dateString);
    });
    
    calendarGrid.appendChild(dayElement);
  }
}

document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  loadCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  loadCalendar();
});
