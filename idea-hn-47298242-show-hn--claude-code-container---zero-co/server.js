const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

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

// Security constants
const MAX_CODE_LENGTH = 50000; // 50KB max
const EXECUTION_TIMEOUT = 30000; // 30 seconds
const FORBIDDEN_PATTERNS = [
  /\$\(/g,           // Command substitution
  /`/g,              // Backticks
  /\|\|/g,           // OR operator
  /&&/g,             // AND operator
  /;/g,              // Command separator
  />/g,              // Redirect
  /</g,              // Redirect
  /\|/g,             // Pipe
  /\bexec\b/gi,      // exec calls
  /\beval\b/gi,      // eval calls
  /\bsystem\b/gi,    // system calls
  /\bpopen\b/gi,     // popen calls
  /\bfork\b/gi,      // fork calls
  /\bspawn\b/gi,     // spawn calls
];

const DANGEROUS_IMPORTS = [
  /import\s+os/gi,
  /import\s+subprocess/gi,
  /import\s+sys/gi,
  /require\s*\(\s*['"]child_process['"]\s*\)/gi,
  /require\s*\(\s*['"]fs['"]\s*\)/gi,
  /require\s*\(\s*['"]net['"]\s*\)/gi,
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'CodeCapsule Backend',
    version: '2.0.0',
    endpoints: {
      session: 'POST /api/session',
      run: 'POST /api/run/:sessionId',
      health: 'GET /health'
    }
  });
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

// Input validation function
function validateCode(code) {
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid code input');
  }

  if (code.length > MAX_CODE_LENGTH) {
    throw new Error(`Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`);
  }

  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(code)) {
      throw new Error('Code contains forbidden shell metacharacters or patterns');
    }
  }

  // Check for dangerous imports
  for (const pattern of DANGEROUS_IMPORTS) {
    if (pattern.test(code)) {
      throw new Error('Code contains forbidden system-level imports');
    }
  }

  return true;
}

// Write code to temporary file
async function writeCodeToTempFile(code, language) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codecapsule-'));
  const extension = getFileExtension(language);
  const filename = `code${extension}`;
  const filepath = path.join(tempDir, filename);

  await fs.writeFile(filepath, code, 'utf8');

  return { tempDir, filepath, filename };
}

function getFileExtension(language) {
  switch (language.toLowerCase()) {
    case 'python':
      return '.py';
    case 'javascript':
    case 'nodejs':
      return '.js';
    case 'go':
      return '.go';
    case 'java':
      return '.java';
    case 'c++':
    case 'cpp':
      return '.cpp';
    default:
      return '.js';
  }
}

function getDockerImage(language) {
  switch (language.toLowerCase()) {
    case 'python':
      return 'python:3.9-slim';
    case 'javascript':
    case 'nodejs':
      return 'node:16-slim';
    case 'go':
      return 'golang:1.17';
    case 'java':
      return 'openjdk:17-jdk-slim';
    case 'c++':
    case 'cpp':
      return 'gcc:11';
    default:
      return 'node:16-slim';
  }
}

function getCodeExecutionCommand(filename, language) {
  switch (language.toLowerCase()) {
    case 'python':
      return ['python3', `/workspace/${filename}`];
    case 'javascript':
    case 'nodejs':
      return ['node', `/workspace/${filename}`];
    case 'go':
      return ['go', 'run', `/workspace/${filename}`];
    case 'java':
      return ['javac', `/workspace/${filename}`, '&&', 'java', '-cp', '/workspace', 'Main'];
    case 'c++':
    case 'cpp':
      return ['g++', `/workspace/${filename}`, '-o', '/workspace/output', '&&', '/workspace/output'];
    default:
      return ['node', `/workspace/${filename}`];
  }
}

app.post('/api/run/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { code, language } = session;
  let container;

  try {
    // Validate code
    validateCode(code);

    // Write code to temporary file
    const { tempDir, filepath, filename } = await writeCodeToTempFile(code, language);

    // Create Docker container
    const image = getDockerImage(language);
    const command = getCodeExecutionCommand(filename, language);

    container = await docker.createContainer({
      Image: image,
      Cmd: command,
      HostConfig: {
        Binds: [`${tempDir}:/workspace`],
        AutoRemove: true,
        Memory: 256 * 1024 * 1024, // 256MB memory limit
        CPUShares: 512, // Limit CPU usage
        NetworkMode: 'none' // No network access
      },
      WorkingDir: '/workspace'
    });

    // Start container
    await container.start();

    // Stream output to client via WebSocket
    const socket = io.sockets.sockets.get(sessionId);
    if (socket) {
      const stream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true
      });

      stream.on('data', (chunk) => {
        const output = chunk.toString('utf8');
        socket.emit('output', output);
      });

      stream.on('end', () => {
        socket.emit('execution-complete');
      });
    }

    // Wait for container to finish with timeout
    await Promise.race([
      container.wait(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Execution timeout')), EXECUTION_TIMEOUT))
    ]);

    // Clean up
    await container.stop();
    await fs.rm(tempDir, { recursive: true, force: true });

    res.json({ success: true });
  } catch (error) {
    // Clean up if container exists
    if (container) {
      try {
        await container.stop();
      } catch (stopError) {
        console.error('Error stopping container:', stopError);
      }
    }

    console.error('Execution error:', error);
    res.status(500).json({ error: error.message || 'Execution failed' });
  }
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Client joined session ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
