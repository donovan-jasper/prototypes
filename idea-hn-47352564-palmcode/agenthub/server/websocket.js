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
    let currentSessionId = null;
    let currentCommandHistoryId = null; // New state: ID of the terminal_history entry for the current command
    let outputBuffer = ''; // New state: Buffer for accumulating terminal output
    let outputTimeout = null; // New state: Debounce timeout for saving output
    const DEBOUNCE_TIME = 200; // Time in ms to wait before saving buffered output

    // Helper function to save accumulated terminal output to the database
    const saveTerminalOutput = () => {
      if (outputTimeout) {
        clearTimeout(outputTimeout);
        outputTimeout = null;
      }
      if (currentCommandHistoryId && outputBuffer.length > 0) {
        // Append to existing output, or set if null. COALESCE handles initial NULL values.
        db.prepare('UPDATE terminal_history SET output = COALESCE(output, "") || ? WHERE id = ?').run(outputBuffer, currentCommandHistoryId);
        outputBuffer = ''; // Clear buffer after saving
      }
    };

    socket.on('join-session', (sessionId) => {
      // Before switching, save any pending output from the previous session's command
      saveTerminalOutput();

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
      currentCommandHistoryId = null; // Reset command history ID for new session
      outputBuffer = ''; // Reset output buffer for new session

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
        socket.emit('terminal-output', data); // Emit in real-time

        // If a command is active, buffer its output and debounce saving
        if (currentCommandHistoryId) {
          outputBuffer += data;
          if (outputTimeout) {
            clearTimeout(outputTimeout);
          }
          outputTimeout = setTimeout(() => {
            saveTerminalOutput();
          }, DEBOUNCE_TIME);
        }
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

      // Fetch and send combined historical data (messages and terminal history)
      const fullHistory = db.prepare(`
        SELECT id, session_id, role, content, timestamp, 'message' as type, NULL as command, NULL as output FROM messages WHERE session_id = ?
        UNION ALL
        SELECT id, session_id, NULL as role, NULL as content, timestamp, 'terminal' as type, command, output FROM terminal_history WHERE session_id = ?
        ORDER BY timestamp;
      `).all(sessionId, sessionId); // Pass sessionId twice for the UNION ALL

      socket.emit('full-session-history', fullHistory);
    });

    socket.on('send-message', async (data) => {
      const { sessionId, text } = data;
      const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      // Save any pending terminal output before processing a new chat message
      saveTerminalOutput();
      currentCommandHistoryId = null; // No command is active during chat

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

      // Finalize and save any pending output from the previous command
      saveTerminalOutput();

      if (terminal && currentSessionId === sessionId) { // Ensure command is for the active terminal
        // Insert the new command into terminal_history and get its ID
        const insertStmt = db.prepare('INSERT INTO terminal_history (session_id, command) VALUES (?, ?)');
        const info = insertStmt.run(sessionId, command);
        currentCommandHistoryId = info.lastInsertRowid; // Store the ID for subsequent output
        outputBuffer = ''; // Reset buffer for the new command

        terminal.write(`${command}\r`);
      } else {
        socket.emit('error', 'Terminal not active for this session.');
      }
    });

    socket.on('disconnect', () => {
      // On disconnect, ensure any pending output is saved
      saveTerminalOutput();

      if (terminal) {
        terminal.kill();
      }
      if (watcher) {
        watcher.close();
      }
      currentSessionId = null; // Clear current session on disconnect
      currentCommandHistoryId = null;
      outputBuffer = '';
    });
  });
};
