const pty = require('node-pty');
const { v4: uuidv4 } = require('uuid');

class TerminalManager {
  constructor() {
    this.sessions = new Map(); // Map<sessionId, { term: PTY, createdAt: number, lastActivity: number }>
    this.sessionTimeouts = new Map(); // Map<sessionId, NodeJS.Timeout> for cleanup timers
    this.dataListeners = new Map(); // Map<sessionId, Set<Function>> for PTY data events
  }

  /**
   * Creates a new PTY session.
   * @param {number} cols The number of columns for the terminal.
   * @param {number} rows The number of rows for the terminal.
   * @param {string} shellPath The path to the shell executable (e.g., '/bin/zsh').
   * @returns {string} The unique ID of the new session.
   */
  createSession(cols, rows, shellPath) {
    const sessionId = uuidv4();
    
    const term = pty.spawn(shellPath, [], {
      name: 'xterm-color',
      cols: cols || 80,
      rows: rows || 24,
      cwd: process.env.HOME, // Start in the user's home directory
      env: process.env // Inherit environment variables
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

    // Handle PTY exit event to clean up resources
    term.on('exit', (code, signal) => {
      console.log(`PTY session ${sessionId} exited with code ${code}, signal ${signal}. Cleaning up.`);
      this.destroySession(sessionId); // Ensure full cleanup if PTY process terminates
    });

    console.log(`Created new terminal session: ${sessionId} with shell ${shellPath}`);
    return sessionId;
  }

  /**
   * Retrieves an existing PTY session. Updates its last activity timestamp.
   * @param {string} id The session ID.
   * @returns {{term: import('node-pty').IPty, createdAt: number, lastActivity: number}|undefined} The session object, or undefined if not found.
   */
  getSession(id) {
    const session = this.sessions.get(id);
    if (session) {
      session.lastActivity = Date.now(); // Update activity on access
    }
    return session;
  }

  /**
   * Resizes a PTY session.
   * @param {string} id The session ID.
   * @param {number} cols The new number of columns.
   * @param {number} rows The new number of rows.
   */
  resizeSession(id, cols, rows) {
    const session = this.getSession(id); // getSession updates lastActivity
    if (session) {
      session.term.resize(cols, rows);
      console.log(`Resized session ${id} to ${cols}x${rows}`);
    }
  }

  /**
   * Writes data to a PTY session's input.
   * @param {string} id The session ID.
   * @param {string} data The data to write.
   */
  writeToSession(id, data) {
    const session = this.getSession(id); // getSession updates lastActivity
    if (session) {
      session.term.write(data);
    }
  }

  /**
   * Destroys a terminal session, killing its PTY process and cleaning up all associated resources.
   * This method should only be called if the timer expires and no active listeners remain,
   * or if the PTY process exits.
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
        this.dataListeners.delete(id); // Remove the entire Set of listeners
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
    const timeout = setTimeout(() => {
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
    }, 5 * 60 * 1000); // 5 minutes
    
    this.sessionTimeouts.set(id, timeout);
    console.log(`Session ${id} marked for cleanup in 5 minutes.`);
  }

  /**
   * Cancels a pending cleanup for a session, typically when a client reconnects or attaches.
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
   * Registers a callback function to receive data from a specific PTY session.
   * If this is the first listener for the session, it cancels any pending cleanup.
   * @param {string} sessionId The ID of the session.
   * @param {Function} callback The callback function (data) => void.
   */
  registerDataCallback(sessionId, callback) {
    let listeners = this.dataListeners.get(sessionId);
    if (!listeners) {
      listeners = new Set();
      this.dataListeners.set(sessionId, listeners);
    }
    
    const wasEmpty = listeners.size === 0;
    listeners.add(callback);
    
    if (wasEmpty) {
      this.cancelCleanup(sessionId); // A client is now active, cancel cleanup
      console.log(`Registered first listener for session ${sessionId}. Cleanup cancelled.`);
    } else {
      console.log(`Registered additional listener for session ${sessionId}.`);
    }
  }

  /**
   * Unregisters a callback function from a specific PTY session.
   * If, after unregistering, there are no more listeners, it marks the session for cleanup.
   * @param {string} sessionId The ID of the session.
   * @param {Function} callback The callback function to remove.
   */
  unregisterDataCallback(sessionId, callback) {
    const listeners = this.dataListeners.get(sessionId);
    if (listeners) {
      listeners.delete(callback);
      console.log(`Unregistered listener for session ${sessionId}. Remaining listeners: ${listeners.size}`);
      if (listeners.size === 0) {
        this.markForCleanup(sessionId); // No more active listeners, mark for cleanup
        console.log(`No more listeners for session ${sessionId}. Marked for cleanup.`);
      }
    }
  }
}

module.exports = TerminalManager;
