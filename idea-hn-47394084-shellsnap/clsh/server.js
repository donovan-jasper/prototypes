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
  console.log('New client connected');

  socket.on('create-session', (data) => {
    const { cols, rows } = data;
    const sessionId = terminalManager.createSession(cols, rows);
    
    const session = terminalManager.getSession(sessionId);
    session.term.onData(output => {
      socket.emit('output', { sessionId, output });
    });
    
    socket.emit('session-created', { sessionId });
  });

  socket.on('attach-session', (data) => {
    const { sessionId } = data;
    const session = terminalManager.getSession(sessionId);
    
    if (session) {
      // Cancel cleanup since user is reconnecting
      terminalManager.cancelCleanup(sessionId);
      
      session.term.onData(output => {
        socket.emit('output', { sessionId, output });
      });
      
      socket.emit('session-attached', { sessionId });
    } else {
      socket.emit('error', { message: 'Session not found' });
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
    console.log('Client disconnected');
    // Mark all sessions for cleanup when client disconnects
    // In a real implementation, you might want to track which sessions belong to this client
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
