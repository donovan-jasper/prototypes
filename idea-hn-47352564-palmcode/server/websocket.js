const pty = require('node-pty');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const { getSession, saveMessage, getMessages, saveTerminalHistory, getTerminalHistory } = db;

// Load AI agents
const agents = {
  claude: require('./agents/claude'),
  openai: require('./agents/openai'),
  gemini: require('./agents/gemini'),
};

// Map to store active session resources (pty, watcher, connected clients)
const activeSessions = new Map(); // Map<sessionId, { pty: PTY, watcher: Chokidar, clients: Set<string>, workspacePath: string }>

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

          // Initialize chokidar watcher
          const watcher = chokidar.watch(workspacePath, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: true, // Don't emit 'add' events for files existing when watcher starts
          });

          activeSessions.set(sessionId, {
            pty: ptyProcess,
            watcher: watcher,
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
              const sessionResources = activeSessions.get(sessionId);
              sessionResources.watcher.close();
              activeSessions.delete(sessionId);
              console.log(`Cleaned up resources for session ${sessionId} due to PTY exit.`);
              // Optionally, inform clients that the terminal session has ended
              sessionResources.clients.forEach(clientId => {
                io.to(clientId).emit('terminal-closed', { sessionId });
              });
            }
          });

          // Attach chokidar listeners
          watcher
            .on('add', filePath => {
              console.log(`File added: ${filePath}`);
              activeSessions.get(sessionId).clients.forEach(clientId => {
                io.to(clientId).emit('file-change', { type: 'add', path: path.relative(workspacePath, filePath) });
              });
            })
            .on('change', filePath => {
              console.log(`File changed: ${filePath}`);
              activeSessions.get(sessionId).clients.forEach(clientId => {
                io.to(clientId).emit('file-change', { type: 'change', path: path.relative(workspacePath, filePath) });
              });
            })
            .on('unlink', filePath => {
              console.log(`File removed: ${filePath}`);
              activeSessions.get(sessionId).clients.forEach(clientId => {
                io.to(clientId).emit('file-change', { type: 'unlink', path: path.relative(workspacePath, filePath) });
              });
            })
            .on('addDir', dirPath => {
              console.log(`Directory added: ${dirPath}`);
              activeSessions.get(sessionId).clients.forEach(clientId => {
                io.to(clientId).emit('file-change', { type: 'addDir', path: path.relative(workspacePath, dirPath) });
              });
            })
            .on('unlinkDir', dirPath => {
              console.log(`Directory removed: ${dirPath}`);
              activeSessions.get(sessionId).clients.forEach(clientId => {
                io.to(clientId).emit('file-change', { type: 'unlinkDir', path: path.relative(workspacePath, dirPath) });
              });
            })
            .on('error', error => console.error(`Watcher error for session ${sessionId}: ${error}`));

        }

        // Add current socket to the session's client set
        activeSessions.get(sessionId).clients.add(socket.id);
        socket.join(`session-${sessionId}`); // Join a room for session-specific broadcasts

        // Send initial data to the newly joined client
        const messages = await getMessages(sessionId);
        socket.emit('initial-messages', messages);

        const terminalHistory = await getTerminalHistory(sessionId);
        socket.emit('initial-terminal-history', terminalHistory);

        // Update last accessed timestamp
        await db.updateSessionAccess(sessionId);

      } catch (error) {
        console.error(`Error joining session ${sessionId}:`, error);
        socket.emit('error', { message: `Failed to join session: ${error.message}` });
      }
    });

    socket.on('send-message', async ({ sessionId, prompt }) => {
      if (!sessionId || !prompt) {
        socket.emit('error', { message: 'Invalid message payload.' });
        return;
      }

      console.log(`Received message for session ${sessionId}: ${prompt}`);

      try {
        const session = await getSession(sessionId);
        if (!session) {
          socket.emit('error', { message: `Session ${sessionId} not found.` });
          return;
        }

        // Save user message
        await saveMessage(sessionId, 'user', prompt);
        io.to(`session-${sessionId}`).emit('agent-response-chunk', { role: 'user', content: prompt, isComplete: true });


        const agentModule = agents[session.agent_type];
        if (!agentModule) {
          socket.emit('error', { message: `Agent type ${session.agent_type} not supported.` });
          return;
        }

        const conversationHistory = await getMessages(sessionId);
        let fullResponse = '';
        const responseStream = agentModule.sendMessage(prompt, conversationHistory);

        for await (const chunk of responseStream) {
          fullResponse += chunk;
          // Emit chunks to all clients in the session
          io.to(`session-${sessionId}`).emit('agent-response-chunk', { role: 'assistant', content: chunk, isComplete: false });
        }

        // Save agent's full response
        await saveMessage(sessionId, 'assistant', fullResponse);
        // Emit a final chunk to signal completion (optional, can be handled by isComplete: true on last chunk)
        io.to(`session-${sessionId}`).emit('agent-response-chunk', { role: 'assistant', content: '', isComplete: true });

      } catch (error) {
        console.error(`Error processing message for session ${sessionId}:`, error);
        socket.emit('error', { message: `Failed to get agent response: ${error.message}` });
        // Emit an error message as an agent response
        io.to(`session-${sessionId}`).emit('agent-response-chunk', { role: 'assistant', content: `Error: ${error.message}`, isComplete: true });
      }
    });

    socket.on('execute-command', async ({ sessionId, command }) => {
      if (!sessionId || !command) {
        socket.emit('error', { message: 'Invalid command payload.' });
        return;
      }

      console.log(`Executing command for session ${sessionId}: ${command}`);

      const sessionResources = activeSessions.get(sessionId);
      if (!sessionResources || !sessionResources.pty) {
        socket.emit('error', { message: `Terminal not active for session ${sessionId}.` });
        return;
      }

      const { pty: ptyProcess } = sessionResources;

      // Save command to history (output will be captured by pty.onData)
      // For now, we save command, and will update output once command finishes.
      // A more robust solution would involve capturing output per command.
      // For simplicity, we'll save command and then the full output from pty.onData
      // after a short delay or by trying to detect command completion.
      // For this prototype, we'll save the command, and the output will be streamed
      // and implicitly part of the terminal history.
      // A better approach for persistence would be to buffer output for a command
      // and save it once the command prompt returns.
      // For now, we'll just save the command, and the streaming output is the "history".
      // The `terminal_history` table is designed for command/output pairs.
      // We'll need to capture the output for a specific command.
      // This is tricky with node-pty's stream.
      // For this prototype, let's simplify: we save the command, and the output
      // is streamed. We'll save the *full* output of the command after it's done.
      // This requires buffering.

      let commandOutputBuffer = '';
      const outputListener = (data) => {
        commandOutputBuffer += data;
      };

      ptyProcess.onData(outputListener); // Temporarily listen to buffer output

      ptyProcess.write(command + '\r'); // Execute command

      // A simple heuristic: wait a bit, then assume command is done.
      // In a real app, you'd parse prompts or use a more sophisticated method.
      setTimeout(async () => {
        ptyProcess.removeListener('data', outputListener); // Stop buffering

        // Save command and its captured output
        await saveTerminalHistory(sessionId, command, commandOutputBuffer);
        commandOutputBuffer = ''; // Clear buffer for next command
      }, 1000); // Wait 1 second for command to execute and output

    });

    socket.on('resize-terminal', ({ sessionId, cols, rows }) => {
      const sessionResources = activeSessions.get(sessionId);
      if (sessionResources && sessionResources.pty) {
        sessionResources.pty.resize(cols, rows);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);

      if (currentSessionId && activeSessions.has(currentSessionId)) {
        const sessionResources = activeSessions.get(currentSessionId);
        sessionResources.clients.delete(socket.id);
        socket.leave(`session-${currentSessionId}`);

        if (sessionResources.clients.size === 0) {
          console.log(`No more clients for session ${currentSessionId}. Cleaning up resources.`);
          sessionResources.pty.kill();
          sessionResources.watcher.close();
          activeSessions.delete(currentSessionId);
        }
      }
    });
  });
};
