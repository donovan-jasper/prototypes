const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:sessionId/history', (req, res) => {
  const history = db.prepare('SELECT * FROM terminal_history WHERE session_id = ? ORDER BY timestamp').all(req.params.sessionId);
  res.json(history);
});

module.exports = router;
