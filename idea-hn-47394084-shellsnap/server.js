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
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

const terminalManager = new TerminalManager();

// Serve static files from the 'public' directory
// Apply auth middleware to all static file requests
app.use(authenticateToken, express.static(path.join(__dirname, 'public')));

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (token === config.authToken) {
    next();
  } else {
    next(new Error('Authentication error: Invalid token for Socket.IO'));
  }
});

io.on('connection', (socket) => {
  console.log('New client connected to Socket.IO');

  // Map to store data callbacks specific to this socket for each session it's attached to.
  // This allows us to remove the correct listener on disconnect.
  const socketDataListeners = new Map(); // Map<sessionId, Function>

  socket.on('create-session', (data) => {
    const { cols, rows } = data;
    const sessionId = terminalManager.createSession(cols, rows);
    
    // Register this socket's data listener for the new session
    const dataCallback = (output) => {
      socket.emit('output', { sessionId, output });
    };
    terminalManager.onData(sessionId, dataCallback);
    socketDataListeners.set(sessionId, dataCallback);
    
    socket.emit('session-created', { sessionId });
  });

  socket.on('attach-session', (data) => {
    const { sessionId } = data;
    const session = terminalManager.getSession(sessionId);
    
    if (session) {
      // Cancel cleanup since user is reconnecting to an existing session
      terminalManager.cancelCleanup(sessionId);
      
      // Register this socket's data listener for the existing session
      // Ensure we don't add multiple listeners if already attached (e.g., client refresh)
      if (!socketDataListeners.has(sessionId)) {
        const dataCallback = (output) => {
          socket.emit('output', { sessionId, output });
        };
        terminalManager.onData(sessionId, dataCallback);
        socketDataListeners.set(sessionId, dataCallback);
      }
      
      socket.emit('session-attached', { sessionId });
      // TODO: Implement sending scrollback if possible. node-pty doesn't buffer by default.
      // For MVP, we'll just attach and let new output flow.
    } else {
      socket.emit('error', { message: `Session ${sessionId} not found` });
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
    console.log('Client disconnected from Socket.IO');
    // For each session this specific socket was listening to:
    for (const [sessionId, dataCallback] of socketDataListeners.entries()) {
      // 1. Remove this socket's specific data listener from the terminal manager
      terminalManager.offData(sessionId, dataCallback);
      // 2. Mark the session for cleanup. If no other clients are attached, it will be cleaned up.
      terminalManager.markForCleanup(sessionId); 
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
  
  console.log(`\nClsh Server running on:`);
  console.log(`Local: http://localhost:${PORT}?token=${config.authToken}`);
  ipAddresses.forEach(ip => console.log(`Network: ${ip}`));
  console.log(`\nAuth Token: ${config.authToken}`);
  console.log(`Shell: ${config.shell}`);
});
