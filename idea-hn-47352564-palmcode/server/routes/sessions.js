const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs');
const path = require('path');

// POST /api/sessions - Create a new session
router.post('/sessions', async (req, res) => {
  try {
    const { name, agentType } = req.body;

    if (!name || !agentType) {
      return res.status(400).json({ message: 'Name and agentType are required' });
    }

    // Create unique workspace directory
    const workspaceName = `${name.replace(/\s+/g, '_')}_${Date.now()}`; // Sanitize name for directory
    const workspacePath = path.join(__dirname, '../../workspaces', workspaceName);

    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    const sessionId = await db.createSession(name, agentType, workspacePath);
    const newSession = await db.getSession(sessionId); // Fetch the newly created session to get all default fields

    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

// GET /api/sessions - Retrieve a list of all existing sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await db.getSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/:id - Fetch details for a specific session
router.get('/sessions/:id', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const session = await db.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Get messages and terminal history
    const messages = await db.getMessages(sessionId);
    const terminalHistory = await db.getTerminalHistory(sessionId);

    res.json({
      ...session,
      messages,
      terminalHistory
    });
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ message: 'Failed to fetch session details' });
  }
});

// DELETE /api/sessions/:id - Delete a session and its associated workspace directory
router.delete('/sessions/:id', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const session = await db.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Delete workspace directory
    if (fs.existsSync(session.workspace_path)) {
      fs.rmSync(session.workspace_path, { recursive: true, force: true });
    }

    await db.deleteSession(sessionId);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Failed to delete session' });
  }
});

// PUT /api/sessions/:id/access - Update the last_accessed timestamp for a session
router.put('/sessions/:id/access', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    // Check if session exists before updating
    const session = await db.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await db.updateSessionAccess(sessionId);
    // Optionally return the updated session or just a success message
    const updatedSession = await db.getSession(sessionId);
    res.json({ message: 'Session last_accessed updated successfully', session: updatedSession });
  } catch (error) {
    console.error('Error updating session access timestamp:', error);
    res.status(500).json({ message: 'Failed to update session access timestamp' });
  }
});

module.exports = router;
