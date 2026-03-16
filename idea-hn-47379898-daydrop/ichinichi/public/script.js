const db = require('../config/database');
const { encryptNote, decryptNote } = require('../config/encryption');

let password = '';
let salt = '';

document.getElementById('submit-password').addEventListener('click', () => {
  password = document.getElementById('password').value;
  if (password) {
    document.querySelector('.password-container').style.display = 'none';
    document.querySelector('.note-container').style.display = 'block';
    document.querySelector('.calendar-container').style.display = 'block';
    loadCurrentNote();
    loadCalendar();
  } else {
    alert('Please enter a password');
  }
});

function loadCurrentNote() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('note-date').textContent = today;

  db.get('SELECT * FROM notes WHERE date = ?', [today], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }

    if (row) {
      const decryptedNote = decryptNote(row.encrypted_note, password, row.salt);
      document.getElementById('note-text').value = decryptedNote;
      document.getElementById('note-text').readOnly = true;
      document.getElementById('save-note').style.display = 'none';
    } else {
      document.getElementById('note-text').readOnly = false;
      document.getElementById('save-note').style.display = 'block';
    }
  });
}

document.getElementById('save-note').addEventListener('click', () => {
  const today = new Date().toISOString().split('T')[0];
  const noteText = document.getElementById('note-text').value;

  if (noteText) {
    const { encrypted, salt } = encryptNote(noteText, password);

    db.run(
      'INSERT INTO notes (date, note, encrypted_note, salt) VALUES (?, ?, ?, ?)',
      [today, noteText, encrypted, salt],
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        document.getElementById('note-text').readOnly = true;
        document.getElementById('save-note').style.display = 'none';
        loadCalendar();
      }
    );
  } else {
    alert('Please enter a note');
  }
});

function loadCalendar() {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    const emptyDay = document.createElement('div');
    calendar.appendChild(emptyDay);
  }

  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.textContent = i;

    const date = new Date(today.getFullYear(), today.getMonth(), i).toISOString().split('T')[0];

    db.get('SELECT * FROM notes WHERE date = ?', [date], (err, row) => {
      if (err) {
        console.error(err);
        return;
      }

      if (row) {
        day.classList.add('has-note');
        day.addEventListener('click', () => {
          const decryptedNote = decryptNote(row.encrypted_note, password, row.salt);
          alert(`Note for ${date}:\n\n${decryptedNote}`);
        });
      }
    });

    calendar.appendChild(day);
  }
}
