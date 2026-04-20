class Terminal {
  constructor(terminalOutputElement, terminalInputElement) {
    this.terminalOutput = terminalOutputElement;
    this.terminalInput = terminalInputElement;
    this.socket = null;
    this.sessionId = null;
    this.isAgentTyping = false;
    this.typingIndicator = null;

    this.terminalInput.addEventListener('keydown', this.handleInput.bind(this));
  }

  initialize(socket, sessionId) {
    this.socket = socket;
    this.sessionId = sessionId;
    this.clear(); // Clear previous session's output

    // Request to join the session on the server
    this.socket.emit('join-session', { sessionId: this.sessionId });

    // Listen for initial messages and terminal history
    this.socket.on('initial-messages', (messages) => {
      messages.forEach(msg => {
        this.appendOutput(msg.content, msg.role);
      });
      this.scrollToBottom();
    });

    this.socket.on('initial-terminal-history', (history) => {
      history.forEach(entry => {
        this.appendOutput(`$ ${entry.command}\n`, 'command');
        this.appendOutput(entry.output, 'terminal');
      });
      this.scrollToBottom();
    });

    // Listen for streaming terminal output
    this.socket.on('terminal-output', (data) => {
      this.appendOutput(data, 'terminal');
      this.scrollToBottom();
    });

    // Listen for streaming agent responses
    this.socket.on('agent-response-chunk', (data) => {
      if (data.role === 'user') {
        this.appendOutput(`> ${data.content}\n`, 'user');
      } else if (data.role === 'assistant') {
        if (!this.isAgentTyping) {
          this.isAgentTyping = true;
          this.typingIndicator = document.createElement('span');
          this.typingIndicator.classList.add('typing-indicator');
          this.typingIndicator.textContent = '...';
          this.terminalOutput.appendChild(this.typingIndicator);
        }
        // Remove typing indicator to append text
        if (this.typingIndicator && this.typingIndicator.parentNode) {
          this.typingIndicator.parentNode.removeChild(this.typingIndicator);
        }
        this.appendOutput(data.content, 'agent');
        // Re-add typing indicator if not complete
        if (!data.isComplete) {
          this.terminalOutput.appendChild(this.typingIndicator);
        } else {
          this.isAgentTyping = false;
          this.typingIndicator = null;
          this.appendOutput('\n', 'agent'); // Newline after agent response
        }
      }
      this.scrollToBottom();
    });

    this.socket.on('error', (error) => {
      this.appendOutput(`Error: ${error.message}\n`, 'error');
      this.scrollToBottom();
    });

    // Handle terminal resize (e.g., window resize)
    window.addEventListener('resize', this.resizeTerminal.bind(this));
    this.resizeTerminal(); // Initial resize
  }

  handleInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const text = this.terminalInput.value.trim();
      if (text) {
        this.terminalInput.value = ''; // Clear input immediately

        if (text.startsWith('$ ')) {
          // It's a shell command
          const command = text.substring(2);
          this.executeCommand(command);
          this.appendOutput(`$ ${command}\n`, 'command');
        } else {
          // It's an AI message
          this.sendMessage(text);
          // User message will be appended by the 'agent-response-chunk' listener
        }
      }
    }
  }

  sendMessage(prompt) {
    if (this.socket && this.sessionId) {
      this.socket.emit('send-message', { sessionId: this.sessionId, prompt });
    } else {
      console.error('Socket or Session ID not initialized for sending message.');
    }
  }

  executeCommand(command) {
    if (this.socket && this.sessionId) {
      this.socket.emit('execute-command', { sessionId: this.sessionId, command });
    } else {
      console.error('Socket or Session ID not initialized for executing command.');
    }
  }

  appendOutput(text, type = 'terminal') {
    const span = document.createElement('span');
    span.classList.add(type);
    span.textContent = text;
    this.terminalOutput.appendChild(span);
    this.scrollToBottom();
  }

  clear() {
    this.terminalOutput.innerHTML = '';
  }

  scrollToBottom() {
    this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
  }

  resizeTerminal() {
    if (!this.socket || !this.sessionId) return;

    // Calculate cols and rows based on terminalOutput dimensions and font size
    const charWidth = 8; // Approximate character width in pixels (adjust based on CSS)
    const lineHeight = 18; // Approximate line height in pixels (adjust based on CSS)

    const terminalWidth = this.terminalOutput.clientWidth;
    const terminalHeight = this.terminalOutput.clientHeight;

    const cols = Math.floor(terminalWidth / charWidth);
    const rows = Math.floor(terminalHeight / lineHeight);

    if (cols > 0 && rows > 0) {
      this.socket.emit('resize-terminal', { sessionId: this.sessionId, cols, rows });
    }
  }
}

export default Terminal;
