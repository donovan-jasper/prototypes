const pty = require('node-pty');
const path = require('path');
const db = require('./db');
const { getSession, saveMessage, saveTerminalHistory } = db;

// Load AI agents
const agents = {
  claude: require('./agents/claude'),
  openai: require('./agents/openai'),
  gemini: require('./agents/gemini'),
};

// Map to store active session resources (pty, connected clients)
const activeSessions = new Map(); // Map<sessionId, { pty: PTY, clients: Set<string>, workspacePath: string }>

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Store the session ID associated with this socket
    let currentSessionId = null;

    socket.on('join-session', async ({ sessionId }) => {
      if (!sessionId) {
        console.error('join-session event received without sessionId.');
        return;
      }

      currentSessionId = sessionId;
      console.log(`Socket ${socket.id} joining session ${sessionId}`);

      try {
        const session = await getSession(sessionId);
        if (!session) {
          socket.emit('error', { message: `Session ${sessionId} not found.` });
          return;
        }

        const workspacePath = path.resolve(session.workspace_path);

        if (!activeSessions.has(sessionId)) {
          console.log(`Initializing new resources for session ${sessionId}`);
          // Initialize node-pty
          const ptyProcess = pty.spawn('bash', [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: workspacePath,
            env: process.env,
          });

          activeSessions.set(sessionId, {
            pty: ptyProcess,
            clients: new Set(),
            workspacePath: workspacePath,
          });

          // Attach pty data listener
          ptyProcess.onData((data) => {
            // Emit terminal output to all clients in this session
            activeSessions.get(sessionId).clients.forEach(clientId => {
              io.to(clientId).emit('terminal-output', data);
            });
          });

          ptyProcess.onExit(({ exitCode, signal }) => {
            console.log(`PTY for session ${sessionId} exited with code ${exitCode}, signal ${signal}`);
            // Clean up if PTY exits unexpectedly
            if (activeSessions.has(sessionId)) {
              activeSessions.delete(sessionId);
              console.log(`Cleaned up resources for session ${sessionId} due to PTY exit.`);
              // Optionally, inform clients that the terminal session has ended
              socket.emit('terminal-closed', { sessionId });
            }
          });
        }

        // Add this client to the session's client set
        activeSessions.get(sessionId).clients.add(socket.id);

        // Send initial terminal history
        const terminalHistory = await db.getTerminalHistory(sessionId);
        socket.emit('terminal-history', terminalHistory);

        // Send initial messages
        const messages = await db.getMessages(sessionId);
        socket.emit('message-history', messages);

      } catch (error) {
        console.error('Error in join-session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    socket.on('send-message', async ({ sessionId, message }) => {
      if (!sessionId || !message) {
        console.error('send-message event received with missing data.');
        return;
      }

      try {
        // Save user message to database
        await saveMessage(sessionId, 'user', message);

        // Broadcast the message to all clients in the session
        io.to(sessionId).emit('message', {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        });

        // Get the appropriate agent
        const session = await getSession(sessionId);
        const agent = agents[session.agent_type];

        if (!agent) {
          socket.emit('message', {
            role: 'assistant',
            content: `Error: Agent type ${session.agent_type} not supported.`,
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Get conversation history
        const messages = await db.getMessages(sessionId);

        // Stream agent response
        const responseStream = agent.sendMessage(message, messages);

        let fullResponse = '';
        for await (const chunk of responseStream) {
          fullResponse += chunk;
          io.to(sessionId).emit('message-chunk', {
            role: 'assistant',
            content: chunk,
            timestamp: new Date().toISOString()
          });
        }

        // Save complete response to database
        await saveMessage(sessionId, 'assistant', fullResponse);

      } catch (error) {
        console.error('Error in send-message:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    socket.on('execute-command', async ({ sessionId, command }) => {
      if (!sessionId || !command) {
        console.error('execute-command event received with missing data.');
        return;
      }

      try {
        if (!activeSessions.has(sessionId)) {
          socket.emit('error', { message: 'Terminal session not initialized' });
          return;
        }

        const session = activeSessions.get(sessionId);
        const ptyProcess = session.pty;

        // Save command to history
        await saveTerminalHistory(sessionId, command, '');

        // Write command to pty
        ptyProcess.write(command + '\r');

        // The pty's onData handler will emit the output to all clients

      } catch (error) {
        console.error('Error in execute-command:', error);
        socket.emit('error', { message: 'Failed to execute command' });
      }
    });

    socket.on('resize-terminal', ({ sessionId, cols, rows }) => {
      if (!sessionId || !cols || !rows) {
        console.error('resize-terminal event received with missing data.');
        return;
      }

      if (activeSessions.has(sessionId)) {
        const session = activeSessions.get(sessionId);
        session.pty.resize(cols, rows);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (currentSessionId && activeSessions.has(currentSessionId)) {
        const session = activeSessions.get(currentSessionId);
        session.clients.delete(socket.id);

        // If no more clients in this session, clean up
        if (session.clients.size === 0) {
          console.log(`No more clients in session ${currentSessionId}, cleaning up PTY`);
          session.pty.kill();
          activeSessions.delete(currentSessionId);
        }
      }
    });
  });
};
