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

    this.socket.on('terminal-output', (data) => {
      this.appendOutput(data, 'output');
    });

    this.socket.on('agent-response', (data) => {
      this.appendOutput(data, 'agent');
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
    this.appendOutput(`> ${text}\n`, 'user');
    this.socket.emit('send-message', { sessionId: this.currentSessionId, text });
  }

  executeCommand(cmd) {
    this.appendOutput(`$ ${cmd}\n`, 'command');
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
