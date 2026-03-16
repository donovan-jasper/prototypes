const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const fs = require('fs');

router.get('/:sessionId', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat && stat.isDirectory()) {
        results.push({
          name: file,
          path: filePath.replace(session.workspace_path, ''),
          type: 'directory',
          children: walk(filePath),
        });
      } else {
        results.push({
          name: file,
          path: filePath.replace(session.workspace_path, ''),
          type: 'file',
        });
      }
    });

    return results;
  };

  const files = walk(session.workspace_path);
  res.json(files);
});

router.get('/:sessionId/content', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const filePath = path.join(session.workspace_path, req.query.path);

  if (!filePath.startsWith(session.workspace_path)) {
    return res.status(403).json({ error: 'Invalid file path' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const content = fs.readFileSync(filePath, 'utf8');
  res.json({ content });
});

router.put('/:sessionId/content', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const filePath = path.join(session.workspace_path, req.body.path);

  if (!filePath.startsWith(session.workspace_path)) {
    return res.status(403).json({ error: 'Invalid file path' });
  }

  fs.writeFileSync(filePath, req.body.content);
  res.json({ success: true });
});

router.post('/:sessionId/mkdir', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const dirPath = path.join(session.workspace_path, req.body.path);

  if (!dirPath.startsWith(session.workspace_path)) {
    return res.status(403).json({ error: 'Invalid directory path' });
  }

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  res.json({ success: true });
});

router.delete('/:sessionId', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const filePath = path.join(session.workspace_path, req.query.path);

  if (!filePath.startsWith(session.workspace_path)) {
    return res.status(403).json({ error: 'Invalid file path' });
  }

  if (fs.existsSync(filePath)) {
    if (fs.statSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
  }

  res.json({ success: true });
});

module.exports = router;
