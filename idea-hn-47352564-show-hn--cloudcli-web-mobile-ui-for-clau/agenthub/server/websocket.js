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

    socket.on('join-session', (sessionId) => {
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
        ignored: /(^|[\/\\])\../,
        persistent: true,
      });

      watcher.on('all', (event, path) => {
        socket.emit('file-change', { event, path: path.replace(session.workspace_path, '') });
      });

      socket.emit('session-joined', session);
    });

    socket.on('send-message', async (data) => {
      const { sessionId, text } = data;
      const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'user', text);

      const conversationHistory = db.prepare('SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp').all(sessionId)
        .map(msg => `${msg.role}: ${msg.content}`).join('\n');

      let agent;
      switch (session.agent_type) {
        case 'claude':
          agent = claude;
          break;
        case 'codex':
          agent = openai;
          break;
        case 'gemini':
          agent = gemini;
          break;
        default:
          socket.emit('error', 'Invalid agent type');
          return;
      }

      try {
        for await (const chunk of agent.sendMessage(text, conversationHistory)) {
          socket.emit('agent-response', chunk);
        }

        const response = db.prepare('SELECT content FROM messages WHERE session_id = ? ORDER BY timestamp DESC LIMIT 1').get(sessionId).content;
        db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'assistant', response);
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    socket.on('execute-command', (data) => {
      const { sessionId, command } = data;
      const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      terminal.write(`${command}\r`);

      db.prepare('INSERT INTO terminal_history (session_id, command) VALUES (?, ?)').run(sessionId, command);
    });

    socket.on('disconnect', () => {
      if (terminal) {
        terminal.kill();
      }
      if (watcher) {
        watcher.close();
      }
    });
  });
};
