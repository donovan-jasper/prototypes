const pty = require('node-pty');
const chokidar = require('chokidar');
const db = require('./db');
const claude = require('./agents/claude');
const openai = require('./agents/openai');
const gemini = require('./agents/gemini');

module.exports = (io) => {
  io.on('connection', (socket) => {
    let terminal;
    let watcher;
    let currentSessionId = null; // Track current session for cleanup

    socket.on('join-session', (sessionId) => {
      // Clean up previous session's terminal and watcher if switching sessions
      if (terminal) {
        terminal.kill();
        terminal = null;
      }
      if (watcher) {
        watcher.close();
        watcher = null;
      }

      currentSessionId = sessionId; // Update current session ID

      const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      terminal = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: session.workspace_path,
        env: process.env,
      });

      terminal.onData((data) => {
        socket.emit('terminal-output', data);
      });

      watcher = chokidar.watch(session.workspace_path, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true, // Don't emit 'add' events for files that already exist
      });

      watcher.on('all', (event, path) => {
        // Only emit if the event is for the current session
        if (currentSessionId === sessionId) {
          socket.emit('file-change', { event, path: path.replace(session.workspace_path, '') });
        }
      });

      socket.emit('session-joined', session);

      // Load and send historical messages
      const historicalMessages = db.prepare('SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp').all(sessionId);
      socket.emit('historical-messages', historicalMessages);
    });

    socket.on('send-message', async (data) => {
      const { sessionId, text } = data;
      const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      // Save user message to database
      db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'user', text);

      // Retrieve conversation history as an array of objects
      const conversationHistory = db.prepare('SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp').all(sessionId);

      let agent;
      switch (session.agent_type) {
        case 'claude':
          agent = claude;
          break;
        case 'codex': // Assuming 'codex' maps to openai
          agent = openai;
          break;
        case 'gemini':
          agent = gemini;
          break;
        default:
          socket.emit('error', 'Invalid agent type');
          return;
      }

      let fullAgentResponse = '';
      try {
        // Pass the conversation history array directly to the agent's sendMessage
        for await (const chunk of agent.sendMessage(text, conversationHistory)) {
          if (chunk) { // Ensure chunk is not null/undefined
            fullAgentResponse += chunk;
            socket.emit('agent-response', chunk);
          }
        }
        // Emit a newline after the full streamed response for better terminal display
        socket.emit('agent-response', '\n');

        // Save the complete agent response to the database
        db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'assistant', fullAgentResponse);
      } catch (error) {
        console.error(`Error during agent response for session ${sessionId}:`, error);
        socket.emit('error', `Agent error: ${error.message}`);
      }
    });

    socket.on('execute-command', (data) => {
      const { sessionId, command } = data;
      const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      if (terminal && currentSessionId === sessionId) { // Ensure command is for the active terminal
        terminal.write(`${command}\r`);
        db.prepare('INSERT INTO terminal_history (session_id, command) VALUES (?, ?)').run(sessionId, command);
      } else {
        socket.emit('error', 'Terminal not active for this session.');
      }
    });

    socket.on('disconnect', () => {
      if (terminal) {
        terminal.kill();
      }
      if (watcher) {
        watcher.close();
      }
      currentSessionId = null; // Clear current session on disconnect
    });
  });
};
