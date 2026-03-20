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
    FOREIGN KEY (session_id) REFERENCES sessions (id)
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS terminal_history (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL,
    command TEXT NOT NULL,
    output TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id)
  );
`).run();

async function createSession(name, agentType, workspacePath) {
  const stmt = db.prepare('INSERT INTO sessions (name, agent_type, workspace_path) VALUES (?, ?, ?)');
  const result = stmt.run(name, agentType, workspacePath);
  return result.lastID;
}

async function getSessions() {
  const stmt = db.prepare('SELECT * FROM sessions');
  return stmt.all();
}

async function getSession(sessionId) {
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
  return stmt.get(sessionId);
}

async function deleteSession(sessionId) {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  stmt.run(sessionId);
}

async function updateSessionAccess(sessionId) {
  const stmt = db.prepare('UPDATE sessions SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(sessionId);
}

module.exports = {
  createSession,
  getSessions,
  getSession,
  deleteSession,
  updateSessionAccess,
};
