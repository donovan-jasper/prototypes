const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/api/sessions', async (req, res) => {
  try {
    const { name, agentType } = req.body;
    const workspacePath = `workspaces/${name}`;
    const sessionId = await db.createSession(name, agentType, workspacePath);
    res.json({ sessionId, name, agentType, workspacePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

router.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await db.getSessions();
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve sessions' });
  }
});

router.get('/api/sessions/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await db.getSession(sessionId);
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: 'Session not found' });
  }
});

router.delete('/api/sessions/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    await db.deleteSession(sessionId);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete session' });
  }
});

router.put('/api/sessions/:id/access', async (req, res) => {
  try {
    const sessionId = req.params.id;
    await db.updateSessionAccess(sessionId);
    res.json({ message: 'Session access updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update session access' });
  }
});

module.exports = router;
