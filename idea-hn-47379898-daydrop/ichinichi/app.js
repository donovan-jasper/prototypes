const express = require('express');
const path = require('path');
const db = require('./config/database');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET all notes
app.get('/api/notes', (req, res) => {
  db.all('SELECT date, encrypted_note, salt FROM notes ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET note by date
app.get('/api/notes/:date', (req, res) => {
  const { date } = req.params;
  db.get('SELECT date, encrypted_note, salt FROM notes WHERE date = ?', [date], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(row);
  });
});

// POST new note
app.post('/api/notes', (req, res) => {
  const { date, encrypted_note, salt } = req.body;
  
  if (!date || !encrypted_note || !salt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO notes (date, encrypted_note, salt) VALUES (?, ?, ?)',
    [date, encrypted_note, salt],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Note already exists for this date' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, date, encrypted_note, salt });
    }
  );
});

// DELETE note by date
app.delete('/api/notes/:date', (req, res) => {
  const { date } = req.params;
  const today = new Date().toISOString().split('T')[0];
  
  if (date < today) {
    return res.status(403).json({ error: 'Cannot delete past entries' });
  }

  db.run('DELETE FROM notes WHERE date = ?', [date], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Ichinichi app listening at http://localhost:${port}`);
});
