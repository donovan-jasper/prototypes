const pty = require('node-pty');
const { v4: uuidv4 } = require('uuid');

class TerminalManager {
  constructor() {
    this.sessions = new Map(); // Map<sessionId, { term: PTY, createdAt: number, lastActivity: number }>
    this.sessionTimeouts = new Map(); // Map<sessionId, NodeJS.Timeout> for cleanup timers
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
    this.dataListeners.set(sessionId, new Set()); // Initialize set for listeners for this new session

    // Attach a single data listener to the PTY instance.
    // This listener acts as a multiplexer, forwarding data to all registered callbacks for this session.
    term.on('data', data => {
      const listeners = this.dataListeners.get(sessionId);
      if (listeners) {
        // Update last activity whenever data is received from the PTY
        const session = this.sessions.get(sessionId);
        if (session) {
          session.lastActivity = Date.now();
        }
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

  /**
   * Destroys a terminal session, killing its PTY process and cleaning up all associated resources.
   * This method should only be called if the timer expires and no active listeners remain,
   * as determined by the `markForCleanup` logic.
   * @param {string} id The session ID to destroy.
   */
  destroySession(id) {
    const session = this.sessions.get(id);
    if (session) {
      session.term.kill(); // Kill the PTY process
      this.sessions.delete(id); // Remove from active sessions map
      
      // Clear any pending cleanup timeout for this session
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

  /**
   * Marks a session for cleanup after a 5-minute timeout.
   * The session will only be destroyed if, at the time of timeout expiration,
   * there are no active data listeners for that session.
   * @param {string} id The session ID to mark for cleanup.
   */
  markForCleanup(id) {
    // Clear any existing timeout for this session to reset the timer
    if (this.sessionTimeouts.has(id)) {
      clearTimeout(this.sessionTimeouts.get(id));
    }
    
    // Set a new timeout for 5 minutes
    this.sessionTimeouts.set(id, setTimeout(() => {
      const listeners = this.dataListeners.get(id);
      // Check if there are no active listeners for this session
      if (!listeners || listeners.size === 0) {
        console.log(`Cleaning up session ${id} due to timer expiration and no active listeners.`);
        this.destroySession(id); // Call destroySession only if conditions are met
      } else {
        console.log(`Session ${id} timer expired, but still has ${listeners.size} active listeners. Keeping alive.`);
        // If there are still listeners, the session remains active and is not destroyed.
        // The timeout is cleared, so it won't attempt to destroy again until markForCleanup is called again.
      }
      this.sessionTimeouts.delete(id); // Always delete the timeout reference after it fires
    }, 5 * 60 * 1000)); // 5 minutes
    console.log(`Session ${id} marked for cleanup in 5 minutes.`);
  }

  /**
   * Cancels a pending cleanup for a session, typically when a client reconnects.
   * @param {string} id The session ID for which to cancel cleanup.
   */
  cancelCleanup(id) {
    if (this.sessionTimeouts.has(id)) {
      clearTimeout(this.sessionTimeouts.get(id));
      this.sessionTimeouts.delete(id);
      console.log(`Cancelled cleanup for session ${id}.`);
    }
  }

  /**
   * Registers a callback function to receive data events from a specific PTY session.
   * @param {string} sessionId The ID of the session.
   * @param {Function} callback The function to call when data is received.
   */
  onData(sessionId, callback) {
    const listeners = this.dataListeners.get(sessionId);
    if (listeners) {
      listeners.add(callback);
      // Update last activity when a listener is added (client attaches)
      const session = this.sessions.get(sessionId);
      if (session) {
        session.lastActivity = Date.now();
      }
    } else {
      console.warn(`Attempted to register data listener for non-existent session: ${sessionId}`);
    }
  }

  /**
   * Unregisters a callback function from receiving data events for a specific PTY session.
   * @param {string} sessionId The ID of the session.
   * @param {Function} callback The function to remove.
   */
  offData(sessionId, callback) {
    const listeners = this.dataListeners.get(sessionId);
    if (listeners) {
      listeners.delete(callback);
    }
  }
}

module.exports = TerminalManager;
