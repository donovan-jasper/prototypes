const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const fs = require('fs');

router.post('/', (req, res) => {
  const { name, agentType } = req.body;
  const workspaceName = `${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}`;
  const workspacePath = path.join(__dirname, '../../workspaces', workspaceName);

  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath);
  }

  const stmt = db.prepare('INSERT INTO sessions (name, agent_type, workspace_path) VALUES (?, ?, ?)');
  const info = stmt.run(name, agentType, workspacePath);

  res.json({
    id: info.lastInsertRowid,
    name,
    agentType,
    workspacePath,
  });
});

router.get('/', (req, res) => {
  const sessions = db.prepare('SELECT * FROM sessions ORDER BY last_accessed DESC').all();
  res.json(sessions);
});

router.get('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  const messages = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp').all(req.params.id);

  res.json({ session, messages });
});

router.delete('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);

  if (session && fs.existsSync(session.workspace_path)) {
    fs.rmSync(session.workspace_path, { recursive: true, force: true });
  }

  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM messages WHERE session_id = ?').run(req.params.id);
  db.prepare('DELETE FROM terminal_history WHERE session_id = ?').run(req.params.id);

  res.json({ success: true });
});

router.put('/:id/access', (req, res) => {
  db.prepare('UPDATE sessions SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
