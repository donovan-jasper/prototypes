const express = require('express');
const path = require('path');
const db = require('./config/database');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check if date is in the past
const checkImmutability = (req, res, next) => {
  const { date } = req.params;
  const today = new Date().toISOString().split('T')[0];
  
  if (date < today) {
    return res.status(403).json({ error: 'Past entries are immutable' });
  }
  
  next();
};

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
  
  // Validate that the date is today
  const today = new Date().toISOString().split('T')[0];
  if (date !== today) {
    return res.status(403).json({ error: 'Can only create notes for today' });
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

// Update a note (only for today's date)
app.put('/api/notes/:date', checkImmutability, (req, res) => {
  const { date } = req.params;
  const { encrypted_note, salt } = req.body;
  
  if (!encrypted_note || !salt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    'UPDATE notes SET encrypted_note = ?, salt = ? WHERE date = ?',
    [encrypted_note, salt, date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update note' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json({
        date,
        encrypted_note,
        salt
      });
    }
  );
});

// Delete a note (only for today's date)
app.delete('/api/notes/:date', checkImmutability, (req, res) => {
  const { date } = req.params;
  
  db.run('DELETE FROM notes WHERE date = ?', [date], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete note' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
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
