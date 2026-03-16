const pty = require('node-pty');
const { v4: uuidv4 } = require('uuid');

class TerminalManager {
  constructor() {
    this.sessions = new Map();
    this.sessionTimeouts = new Map(); // To handle cleanup after disconnection
  }

  createSession(cols, rows) {
    const sessionId = uuidv4();
    
    const term = pty.spawn(process.env.SHELL || '/bin/zsh', [], {
      name: 'xterm-color',
      cols: cols || 80,
      rows: rows || 24,
      cwd: process.env.HOME,
      env: process.env
    });

    this.sessions.set(sessionId, {
      term,
      createdAt: Date.now(),
      lastActivity: Date.now()
    });

    return sessionId;
  }

  getSession(id) {
    return this.sessions.get(id);
  }

  resizeSession(id, cols, rows) {
    const session = this.getSession(id);
    if (session) {
      session.term.resize(cols, rows);
      session.lastActivity = Date.now();
    }
  }

  writeToSession(id, data) {
    const session = this.getSession(id);
    if (session) {
      session.term.write(data);
      session.lastActivity = Date.now();
    }
  }

  destroySession(id) {
    const session = this.sessions.get(id);
    if (session) {
      session.term.kill();
      this.sessions.delete(id);
      
      // Clear any pending timeout
      if (this.sessionTimeouts.has(id)) {
        clearTimeout(this.sessionTimeouts.get(id));
        this.sessionTimeouts.delete(id);
      }
    }
  }

  // Mark session for cleanup after timeout
  markForCleanup(id) {
    if (this.sessionTimeouts.has(id)) {
      clearTimeout(this.sessionTimeouts.get(id));
    }
    
    this.sessionTimeouts.set(id, setTimeout(() => {
      this.destroySession(id);
      this.sessionTimeouts.delete(id);
    }, 5 * 60 * 1000)); // 5 minutes
  }

  // Cancel cleanup if user reconnects
  cancelCleanup(id) {
    if (this.sessionTimeouts.has(id)) {
      clearTimeout(this.sessionTimeouts.get(id));
      this.sessionTimeouts.delete(id);
    }
  }
}

module.exports = TerminalManager;
