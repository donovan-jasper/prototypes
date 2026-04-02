const pty = require('node-pty');
const { v4: uuidv4 } = require('uuid');

class TerminalManager {
  constructor() {
    this.sessions = new Map(); // Map<sessionId, { term: PTY, createdAt: number, lastActivity: number }>
    this.sessionTimeouts = new Map(); // Map<sessionId, NodeJS.Timeout> for cleanup
    this.dataListeners = new Map(); // Map<sessionId, Set<Function>> for PTY data events
  }

  createSession(cols, rows) {
    const sessionId = uuidv4();
    
    // Use the shell specified in config, or default to /bin/zsh
    const shell = process.env.SHELL || '/bin/zsh'; 

    const term = pty.spawn(shell, [], {
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
    this.dataListeners.set(sessionId, new Set()); // Initialize set for listeners

    // Attach a single data listener to the PTY instance
    // This listener will then forward data to all registered callbacks for this session
    term.on('data', data => {
      const listeners = this.dataListeners.get(sessionId);
      if (listeners) {
        listeners.forEach(callback => callback(data));
      }
    });

    console.log(`Created new terminal session: ${sessionId}`);
    return sessionId;
  }

  getSession(id) {
    const session = this.sessions.get(id);
    if (session) {
      session.lastActivity = Date.now(); // Update activity on access
    }
    return session;
  }

  resizeSession(id, cols, rows) {
    const session = this.getSession(id); // getSession updates lastActivity
    if (session) {
      session.term.resize(cols, rows);
      console.log(`Resized session ${id} to ${cols}x${rows}`);
    }
  }

  writeToSession(id, data) {
    const session = this.getSession(id); // getSession updates lastActivity
    if (session) {
      session.term.write(data);
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
      // Remove all data listeners for this session
      if (this.dataListeners.has(id)) {
        this.dataListeners.delete(id);
      }
      console.log(`Destroyed terminal session: ${id}`);
    }
  }

  // Mark session for cleanup after timeout
  markForCleanup(id) {
    if (this.sessionTimeouts.has(id)) {
      clearTimeout(this.sessionTimeouts.get(id));
    }
    
    this.sessionTimeouts.set(id, setTimeout(() => {
      console.log(`Cleaning up session ${id} due to inactivity.`);
      this.destroySession(id);
      this.sessionTimeouts.delete(id);
    }, 5 * 60 * 1000)); // 5 minutes
    console.log(`Session ${id} marked for cleanup in 5 minutes.`);
  }

  // Cancel cleanup if user reconnects
  cancelCleanup(id) {
    if (this.sessionTimeouts.has(id)) {
      clearTimeout(this.sessionTimeouts.get(id));
      this.sessionTimeouts.delete(id);
      console.log(`Cancelled cleanup for session ${id}.`);
    }
  }

  // Register a callback for PTY data events for a specific session
  onData(sessionId, callback) {
    const listeners = this.dataListeners.get(sessionId);
    if (listeners) {
      listeners.add(callback);
    } else {
      console.warn(`Attempted to register data listener for non-existent session: ${sessionId}`);
    }
  }

  // Unregister a callback for PTY data events for a specific session
  offData(sessionId, callback) {
    const listeners = this.dataListeners.get(sessionId);
    if (listeners) {
      listeners.delete(callback);
    }
  }
}

module.exports = TerminalManager;
