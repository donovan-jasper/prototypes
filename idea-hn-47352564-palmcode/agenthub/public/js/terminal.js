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

    // New listener for historical messages
    this.socket.on('historical-messages', (messages) => {
      this.clear(); // Clear before displaying history
      messages.forEach(msg => {
        if (msg.role === 'user') {
          this.appendOutput(`> ${msg.content}\n`, 'user');
        } else if (msg.role === 'assistant') {
          this.appendOutput(`${msg.content}\n`, 'agent'); // Add newline for full historical messages
        }
        // Other roles (e.g., 'system') are not explicitly handled for display in this UI
      });
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
