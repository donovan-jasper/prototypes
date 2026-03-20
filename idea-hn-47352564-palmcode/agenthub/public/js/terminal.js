class Terminal {
  constructor() {
    this.socket = null;
    this.currentSessionId = null;
    this.terminalOutput = document.getElementById('terminal-output');
    this.terminalInput = document.getElementById('terminal-input');
  }

  initialize(socket, sessionId) {
    this.socket = socket;
    this.currentSessionId = sessionId;
    this.clear(); // Clear terminal when switching sessions or initializing

    this.socket.on('terminal-output', (data) => {
      this.appendOutput(data, 'output');
    });

    this.socket.on('agent-response', (data) => {
      // Agent responses are streamed chunks, append directly.
      // A newline will be sent by the server after the full response.
      this.appendOutput(data, 'agent');
    });

    // REMOVED: historical-messages listener is replaced by full-session-history
    // this.socket.on('historical-messages', (messages) => {
    //   this.clear(); // Clear before displaying history
    //   messages.forEach(msg => {
    //     if (msg.role === 'user') {
    //       this.appendOutput(`> ${msg.content}\n`, 'user');
    //     } else if (msg.role === 'assistant') {
    //       this.appendOutput(`${msg.content}\n`, 'agent'); // Add newline for full historical messages
    //     }
    //     // Other roles (e.g., 'system') are not explicitly handled for display in this UI
    //   });
    // });

    // NEW: Listener for combined full session history
    this.socket.on('full-session-history', (history) => {
      this.clear(); // Clear before displaying full history
      history.forEach(entry => {
        if (entry.type === 'message') {
          if (entry.role === 'user') {
            this.appendOutput(`> ${entry.content}\n`, 'user');
          } else if (entry.role === 'assistant') {
            this.appendOutput(`${entry.content}\n`, 'agent');
          }
        } else if (entry.type === 'terminal') {
          this.appendOutput(`$ ${entry.command}\n`, 'command');
          if (entry.output) {
            this.appendOutput(entry.output, 'output');
          }
        }
      });
      this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight; // Scroll to bottom after rendering history
    });


    this.terminalInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = this.terminalInput.value.trim();
        if (text) {
          if (text.startsWith('$')) {
            this.executeCommand(text.substring(1));
          } else {
            this.sendMessage(text);
          }
          this.terminalInput.value = '';
        }
      }
    });
  }

  sendMessage(text) {
    this.appendOutput(`> ${text}\n`, 'user'); // User input always gets a newline
    this.socket.emit('send-message', { sessionId: this.currentSessionId, text });
  }

  executeCommand(cmd) {
    this.appendOutput(`$ ${cmd}\n`, 'command'); // Command always gets a newline
    this.socket.emit('execute-command', { sessionId: this.currentSessionId, command: cmd });
  }

  appendOutput(text, type) {
    const span = document.createElement('span');
    span.className = `terminal-${type}`;
    span.textContent = text;
    this.terminalOutput.appendChild(span);
    this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
  }

  clear() {
    this.terminalOutput.innerHTML = '';
  }
}

export default Terminal;
