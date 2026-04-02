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
  const warningBanner = document.getElementById('immutable-warning');
  const saveButton = document.getElementById('save-note');
  const noteTextarea = document.getElementById('note-text');
  const lockIcon = document.getElementById('lock-icon');

  if (hasNote) {
    // Any saved note is immutable - show locked state
    warningBanner.style.display = 'block';
    warningBanner.textContent = '🔒 This entry is saved and cannot be edited';
    saveButton.textContent = 'Entry Saved - Cannot Edit';
    saveButton.disabled = true;
    noteTextarea.readOnly = true;
    noteTextarea.classList.add('locked');
    lockIcon.style.display = 'inline';
  } else {
    // No note exists - allow editing
    warningBanner.style.display = 'none';
    saveButton.textContent = 'Save Note';
    saveButton.disabled = false;
    noteTextarea.readOnly = false;
    noteTextarea.classList.remove('locked');
    lockIcon.style.display = 'none';
  }

  noteTextarea.value = noteContent;
}

async function loadNoteForDate(dateString) {
  try {
    const noteData = await getNoteFromAPI(dateString);
    
    if (noteData) {
      const decryptedNote = decryptNote(noteData.encrypted_note, password, noteData.salt);
      updateUIForDateState(dateString, true, decryptedNote);
    } else {
      updateUIForDateState(dateString, false, '');
    }
    
    document.getElementById('current-date').textContent = dateString;
  } catch (error) {
    console.error('Error loading note:', error);
    alert('Failed to load note. Please check your password.');
  }
}

async function loadCurrentNote() {
  const today = new Date().toISOString().split('T')[0];
  await loadNoteForDate(today);
}

document.getElementById('save-note').addEventListener('click', async () => {
  const noteText = document.getElementById('note-text').value;
  const currentDate = document.getElementById('current-date').textContent;
  
  if (!noteText.trim()) {
    alert('Please enter a note before saving');
    return;
  }
  
  try {
    const salt = generateSalt();
    const encryptedNote = encryptNote(noteText, password, salt);
    
    await saveNoteToAPI(currentDate, encryptedNote, salt);
    
    alert('Note saved successfully!');
    await loadNoteForDate(currentDate);
    await loadCalendar();
  } catch (error) {
    console.error('Error saving note:', error);
    alert(error.message || 'Failed to save note');
  }
});

async function loadCalendar() {
  try {
    const notes = await getAllNotesFromAPI();
    notesCache = notes;
    renderCalendar();
  } catch (error) {
    console.error('Error loading calendar:', error);
    alert('Failed to load calendar');
  }
}

function renderCalendar() {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  document.getElementById('current-month-year').textContent = 
    `${monthNames[currentMonth]} ${currentYear}`;
  
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
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    const hasNote = notesCache.some(note => note.date === dateString);
    if (hasNote) {
      dayElement.classList.add('has-note');
    }
    
    if (dateString === today) {
      dayElement.classList.add('today');
    }
    
    dayElement.addEventListener('click', () => {
      loadNoteForDate(dateString);
    });
    
    calendar.appendChild(dayElement);
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
