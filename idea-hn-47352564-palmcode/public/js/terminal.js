class Terminal {
  constructor(terminalOutputElement, terminalInputElement) {
    this.terminalOutput = terminalOutputElement;
    this.terminalInput = terminalInputElement;
    this.socket = null;
    this.sessionId = null;
    this.commandHistory = [];
    this.historyIndex = -1;
    this.isAgentTyping = false;
    this.typingIndicator = null;

    this.terminalInput.addEventListener('keydown', this.handleInput.bind(this));
    this.terminalInput.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Handle terminal resizing
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  initialize(socket, sessionId) {
    this.socket = socket;
    this.sessionId = sessionId;
    this.clear(); // Clear previous session's output

    // Request to join the session on the server
    this.socket.emit('join-session', { sessionId: this.sessionId });

    // Listen for initial messages and terminal history
    this.socket.on('message-history', (messages) => {
      messages.forEach(msg => {
        this.appendOutput(msg.content, msg.role);
      });
      this.scrollToBottom();
    });

    this.socket.on('terminal-history', (history) => {
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
    this.socket.on('message-chunk', (data) => {
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

    // Initial resize
    this.handleResize();
  }

  handleInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const text = this.terminalInput.value.trim();
      if (text) {
        // Add to command history
        this.commandHistory.push(text);
        this.historyIndex = this.commandHistory.length;
        this.terminalInput.value = ''; // Clear input immediately

        if (text.startsWith('$ ')) {
          // It's a shell command
          const command = text.substring(2);
          this.executeCommand(command);
          this.appendOutput(`$ ${command}\n`, 'command');
        } else {
          // It's an AI message
          this.sendMessage(text);
          // User message will be appended by the 'message-chunk' listener
        }
      }
    } else if (event.key === 'ArrowUp') {
      // Navigate command history
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.terminalInput.value = this.commandHistory[this.historyIndex];
      }
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.terminalInput.value = this.commandHistory[this.historyIndex];
      } else if (this.historyIndex === this.commandHistory.length - 1) {
        this.historyIndex++;
        this.terminalInput.value = '';
      }
      event.preventDefault();
    }
  }

  handleKeyUp(event) {
    // Handle tab completion for commands
    if (event.key === 'Tab') {
      event.preventDefault();
      const currentInput = this.terminalInput.value;
      if (currentInput.startsWith('$ ')) {
        // Simple command completion - in a real app, you'd implement proper command completion
        const command = currentInput.substring(2);
        if (command === '') {
          this.terminalInput.value = '$ ls';
        } else if (command === 'ls') {
          this.terminalInput.value = '$ ls -la';
        } else if (command === 'cd') {
          this.terminalInput.value = '$ cd ';
        }
      }
    }
  }

  sendMessage(prompt) {
    if (this.socket && this.sessionId) {
      this.socket.emit('send-message', { sessionId: this.sessionId, message: prompt });
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
    this.commandHistory = [];
    this.historyIndex = -1;
  }

  scrollToBottom() {
    this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
  }

  handleResize() {
    if (!this.socket || !this.sessionId) return;

    // Calculate cols and rows based on terminalOutput dimensions and font size
    const charWidth = 8; // Approximate character width in pixels (adjust based on CSS)
    const lineHeight = 18; // Approximate line height in pixels (adjust based on CSS)

    const terminalWidth = this.terminalOutput.clientWidth;
    const terminalHeight = this.terminalOutput.clientHeight;

    const cols = Math.floor(terminalWidth / charWidth);
    const rows = Math.floor(terminalHeight / lineHeight);

    if (cols > 0 && rows > 0) {
      this.socket.emit('resize-terminal', {
        sessionId: this.sessionId,
        cols,
        rows
      });
    }
  }

  destroy() {
    // Clean up event listeners
    this.terminalInput.removeEventListener('keydown', this.handleInput.bind(this));
    this.terminalInput.removeEventListener('keyup', this.handleKeyUp.bind(this));
    window.removeEventListener('resize', this.handleResize.bind(this));

    // Remove socket listeners
    if (this.socket) {
      this.socket.off('message-history');
      this.socket.off('terminal-history');
      this.socket.off('terminal-output');
      this.socket.off('message-chunk');
      this.socket.off('error');
    }
  }
}
