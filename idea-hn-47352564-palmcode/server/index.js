const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for development, restrict in production
    methods: ["GET", "POST", "PUT", "DELETE"] // Allow necessary HTTP methods
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database (this will create tables if they don't exist)
// No explicit function call needed, just requiring the module runs the setup code.
require('./db'); 

// Create workspaces directory if it doesn't exist
const workspacesDir = path.join(__dirname, '../workspaces');
if (!fs.existsSync(workspacesDir)) {
  console.log(`Creating workspaces directory: ${workspacesDir}`);
  fs.mkdirSync(workspacesDir);
}

// Routes
const sessionsRouter = require('./routes/sessions');
// const filesRouter = require('./routes/files'); // Not implemented yet
// const terminalRouter = require('./routes/terminal'); // Not implemented yet

app.use('/api', sessionsRouter);
// app.use('/api', filesRouter); // Uncomment when files.js is implemented
// app.use('/api', terminalRouter); // Uncomment when terminal.js is implemented

// WebSocket handler
// require('./websocket')(io); // Uncomment when websocket.js is implemented

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
