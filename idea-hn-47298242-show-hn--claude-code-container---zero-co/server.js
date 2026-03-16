const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

// Docker setup
const docker = new Docker();

// In-memory storage for sessions (in production, use Redis or DB)
const sessions = new Map();

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/api/session', (req, res) => {
  const sessionId = uuidv4();
  sessions.set(sessionId, {
    id: sessionId,
    createdAt: new Date(),
    language: req.body.language || 'javascript',
    code: req.body.code || '',
    output: [],
    status: 'active'
  });
  
  res.json({ sessionId });
});

app.post('/api/run/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const { code, language } = req.body;
  session.code = code;
  
  try {
    // Create a temporary container for code execution
    const container = await docker.createContainer({
      Image: getDockerImage(language),
      Cmd: getCodeExecutionCommand(code, language),
      HostConfig: {
        Memory: 128 * 1024 * 1024, // 128MB memory limit
        NetworkMode: 'none', // No network access
        Binds: ['/tmp:/tmp'] // Limited volume access
      },
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    });
    
    await container.start();
    
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      timestamps: false
    });
    
    const output = logs.toString();
    
    // Clean up container
    await container.stop();
    await container.remove();
    
    session.output.push({
      timestamp: new Date(),
      output: output,
      language: language
    });
    
    // Emit to client via WebSocket
    io.to(sessionId).emit('output', {
      output: output,
      language: language,
      timestamp: new Date()
    });
    
    res.json({ success: true, output });
  } catch (error) {
    console.error('Execution error:', error);
    const errorMessage = error.message || 'Execution failed';
    session.output.push({
      timestamp: new Date(),
      output: errorMessage,
      language: language
    });
    
    io.to(sessionId).emit('output', {
      output: errorMessage,
      language: language,
      timestamp: new Date()
    });
    
    res.status(500).json({ error: errorMessage });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Helper functions
function getDockerImage(language) {
  switch (language.toLowerCase()) {
    case 'python':
      return 'python:3.11-alpine';
    case 'javascript':
    case 'nodejs':
      return 'node:18-alpine';
    case 'go':
      return 'golang:1.21-alpine';
    case 'java':
      return 'openjdk:17-jdk-alpine';
    case 'c++':
    case 'cpp':
      return 'gcc:latest';
    default:
      return 'node:18-alpine';
  }
}

function getCodeExecutionCommand(code, language) {
  switch (language.toLowerCase()) {
    case 'python':
      return ['python', '-c', code];
    case 'javascript':
    case 'nodejs':
      return ['node', '-e', code];
    case 'go':
      return ['sh', '-c', `echo "${code}" | go run -`];
    case 'java':
      return ['sh', '-c', `echo "${code}" > Main.java && javac Main.java && java Main`];
    case 'c++':
    case 'cpp':
      return ['sh', '-c', `echo "${code}" > main.cpp && g++ main.cpp -o main && ./main`];
    default:
      return ['node', '-e', code];
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`CodeCapsule server running on port ${PORT}`);
});
