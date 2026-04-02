const express = require('express');
const path = require('path');
const db = require('./config/database');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Get note for a specific date
app.get('/api/notes/:date', (req, res) => {
  const { date } = req.params;
  
  db.get('SELECT * FROM notes WHERE date = ?', [date], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({
      id: row.id,
      date: row.date,
      encrypted_note: row.encrypted_note,
      salt: row.salt
    });
  });
});

// Save a new note
app.post('/api/notes', (req, res) => {
  const { date, encrypted_note, salt } = req.body;
  
  if (!date || !encrypted_note || !salt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if note already exists for this date
  db.get('SELECT id FROM notes WHERE date = ?', [date], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row) {
      return res.status(409).json({ error: 'Note already exists for this date' });
    }
    
    // Insert new note
    db.run(
      'INSERT INTO notes (date, encrypted_note, salt) VALUES (?, ?, ?)',
      [date, encrypted_note, salt],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save note' });
        }
        
        res.status(201).json({
          id: this.lastID,
          date,
          encrypted_note,
          salt
        });
      }
    );
  });
});

// Get all notes for calendar view
app.get('/api/notes', (req, res) => {
  db.all('SELECT date, encrypted_note, salt FROM notes ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Ichinichi app listening at http://localhost:${port}`);
});
