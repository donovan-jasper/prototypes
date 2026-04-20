const sqlite3 = require('better-sqlite3');
const db = sqlite3('data/agenthub.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    workspace_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS terminal_history (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL,
    command TEXT NOT NULL,
    output TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
  );
`).run();

async function createSession(name, agentType, workspacePath) {
  const stmt = db.prepare('INSERT INTO sessions (name, agent_type, workspace_path) VALUES (?, ?, ?)');
  const result = stmt.run(name, agentType, workspacePath);
  return result.lastID;
}

async function getSessions() {
  const stmt = db.prepare('SELECT * FROM sessions ORDER BY last_accessed DESC');
  return stmt.all();
}

async function getSession(sessionId) {
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
  return stmt.get(sessionId);
}

async function deleteSession(sessionId) {
  // Delete related messages and terminal history first due to CASCADE
  db.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
  db.prepare('DELETE FROM terminal_history WHERE session_id = ?').run(sessionId);
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  stmt.run(sessionId);
}

async function updateSessionAccess(sessionId) {
  const stmt = db.prepare('UPDATE sessions SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(sessionId);
}

async function saveMessage(sessionId, role, content) {
  const stmt = db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)');
  const result = stmt.run(sessionId, role, content);
  return result.lastID;
}

async function getMessages(sessionId) {
  const stmt = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC');
  return stmt.all(sessionId);
}

async function saveTerminalHistory(sessionId, command, output) {
  const stmt = db.prepare('INSERT INTO terminal_history (session_id, command, output) VALUES (?, ?, ?)');
  const result = stmt.run(sessionId, command, output);
  return result.lastID;
}

async function getTerminalHistory(sessionId) {
  const stmt = db.prepare('SELECT * FROM terminal_history WHERE session_id = ? ORDER BY timestamp ASC');
  return stmt.all(sessionId);
}

module.exports = {
  createSession,
  getSessions,
  getSession,
  deleteSession,
  updateSessionAccess,
  saveMessage,
  getMessages,
  saveTerminalHistory,
  getTerminalHistory,
};
