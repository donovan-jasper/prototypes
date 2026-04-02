const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { authenticateToken, config } = require('./lib/auth');
const TerminalManager = require('./lib/terminal-manager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const terminalManager = new TerminalManager();

// Map to track which sessions each socket is listening to, along with their specific data callback
// Map<socketId, Map<sessionId, Function>>
const socketSessionListeners = new Map();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Apply auth middleware to all routes
app.use(authenticateToken);

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (token === config.authToken) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socketSessionListeners.set(socket.id, new Map()); // Initialize map for this socket

  /**
   * Registers a data listener for a session and associates it with the current socket.
   * @param {string} sessionId The ID of the session.
   * @returns {boolean} True if listener was successfully registered, false otherwise.
   */
  const registerSessionListener = (sessionId) => {
    const session = terminalManager.getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: `Session ${sessionId} not found.` });
      return false;
    }

    // Create a unique callback function for this specific socket and session
    const dataCallback = (output) => {
      socket.emit('output', { sessionId, output });
    };

    terminalManager.onData(sessionId, dataCallback);
    socketSessionListeners.get(socket.id).set(sessionId, dataCallback);
    terminalManager.cancelCleanup(sessionId); // Cancel cleanup if client is actively listening
    return true;
  };

  socket.on('create-session', (data) => {
    const { cols, rows } = data;
    const sessionId = terminalManager.createSession(cols, rows);
    
    if (registerSessionListener(sessionId)) {
      socket.emit('session-created', { sessionId });
    } else {
      // This case should ideally not happen for create-session, as we just created it.
      // But if listener registration somehow fails, clean up the newly created session.
      terminalManager.destroySession(sessionId); 
      socket.emit('error', { message: 'Failed to create and attach to session.' });
    }
  });

  socket.on('attach-session', (data) => {
    const { sessionId } = data;
    if (registerSessionListener(sessionId)) {
      socket.emit('session-attached', { sessionId });
    } else {
      socket.emit('error', { message: `Failed to attach to session ${sessionId}.` });
    }
  });

  socket.on('input', (data) => {
    const { sessionId, input } = data;
    terminalManager.writeToSession(sessionId, input);
  });

  socket.on('resize', (data) => {
    const { sessionId, cols, rows } = data;
    terminalManager.resizeSession(sessionId, cols, rows);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const sessionsForSocket = socketSessionListeners.get(socket.id);

    if (sessionsForSocket) {
      // Iterate through all sessions this specific socket was listening to
      for (const [sessionId, dataCallback] of sessionsForSocket.entries()) {
        terminalManager.offData(sessionId, dataCallback); // Remove this socket's specific listener
        // Mark the session for cleanup. The terminalManager will check if any other listeners remain
        // after the 5-minute delay before actually destroying the session.
        terminalManager.markForCleanup(sessionId);
      }
      socketSessionListeners.delete(socket.id); // Clean up the map entry for the disconnected socket
    }
  });
});

const PORT = config.port;
server.listen(PORT, () => {
  const interfaces = require('os').networkInterfaces();
  let ipAddresses = [];
  
  Object.keys(interfaces).forEach(interfaceName => {
    const interface = interfaces[interfaceName];
    interface.forEach(iface => {
      if (!iface.internal && iface.family === 'IPv4') {
        ipAddresses.push(`http://${iface.address}:${PORT}?token=${config.authToken}`);
      }
    });
  });
  
  console.log(`Server running on:`);
  console.log(`Local: http://localhost:${PORT}?token=${config.authToken}`);
  ipAddresses.forEach(ip => console.log(`Network: ${ip}`));
});
