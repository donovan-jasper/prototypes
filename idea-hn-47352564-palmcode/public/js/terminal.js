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
    this.lastScrollPosition = 0;
    this.isAtBottom = true;

    this.terminalInput.addEventListener('keydown', this.handleInput.bind(this));
    this.terminalInput.addEventListener('keyup', this.handleKeyUp.bind(this));
    this.terminalOutput.addEventListener('scroll', this.handleScroll.bind(this));

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
        this.appendMessage(msg.content, msg.role);
      });
      this.scrollToBottom();
    });

    this.socket.on('terminal-history', (history) => {
      history.forEach(entry => {
        this.appendCommand(entry.command, entry.output);
      });
      this.scrollToBottom();
    });

    // Listen for streaming terminal output
    this.socket.on('terminal-output', (data) => {
      this.appendTerminalOutput(data);
      this.scrollToBottomIfAtBottom();
    });

    // Listen for streaming agent responses
    this.socket.on('message-chunk', (data) => {
      if (data.role === 'user') {
        this.appendMessage(data.content, 'user');
      } else if (data.role === 'assistant') {
        if (!this.isAgentTyping) {
          this.isAgentTyping = true;
          this.typingIndicator = document.createElement('div');
          this.typingIndicator.classList.add('message-container', 'ai-message');
          this.typingIndicator.innerHTML = `
            <span class="message-icon">🤖</span>
            <span class="message-content typing-indicator">...</span>
          `;
          this.terminalOutput.appendChild(this.typingIndicator);
        }

        if (this.typingIndicator && this.typingIndicator.parentNode) {
          const contentSpan = this.typingIndicator.querySelector('.message-content');
          if (contentSpan) {
            contentSpan.textContent = data.content;
          }
        }

        if (data.isComplete) {
          this.isAgentTyping = false;
          this.typingIndicator = null;
        }
      }
      this.scrollToBottomIfAtBottom();
    });

    this.socket.on('error', (error) => {
      this.appendError(error.message);
      this.scrollToBottomIfAtBottom();
    });

    // Initial resize
    this.handleResize();
  }

  handleScroll() {
    const scrollTop = this.terminalOutput.scrollTop;
    const scrollHeight = this.terminalOutput.scrollHeight;
    const clientHeight = this.terminalOutput.clientHeight;

    this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    this.lastScrollPosition = scrollTop;
  }

  scrollToBottomIfAtBottom() {
    if (this.isAtBottom) {
      this.scrollToBottom();
    }
  }

  appendMessage(content, role) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    let icon = '';
    let messageClass = '';

    switch(role) {
      case 'user':
        icon = '👤';
        messageClass = 'user-message';
        break;
      case 'assistant':
        icon = '🤖';
        messageClass = 'ai-message';
        break;
      case 'system':
        icon = '💻';
        messageClass = 'system-message';
        break;
      default:
        icon = 'ℹ️';
        messageClass = 'system-message';
    }

    messageContainer.classList.add(messageClass);
    messageContainer.innerHTML = `
      <span class="message-icon">${icon}</span>
      <span class="message-content">${content}</span>
    `;

    this.terminalOutput.appendChild(messageContainer);
  }

  appendCommand(command, output) {
    const commandContainer = document.createElement('div');
    commandContainer.classList.add('message-container', 'command-message');
    commandContainer.innerHTML = `
      <span class="message-icon">$</span>
      <span class="message-content">
        <span class="command">$ ${command}</span>
        <span class="terminal-output">${output}</span>
      </span>
    `;

    this.terminalOutput.appendChild(commandContainer);
  }

  appendTerminalOutput(output) {
    const outputContainer = document.createElement('div');
    outputContainer.classList.add('message-container', 'terminal-message');
    outputContainer.innerHTML = `
      <span class="message-icon">></span>
      <span class="message-content terminal">${output}</span>
    `;

    this.terminalOutput.appendChild(outputContainer);
  }

  appendError(error) {
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('message-container', 'error-message');
    errorContainer.innerHTML = `
      <span class="message-icon">⚠️</span>
      <span class="message-content error">${error}</span>
    `;

    this.terminalOutput.appendChild(errorContainer);
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
          this.appendCommand(command, '');
        } else {
          // It's an AI message
          this.sendMessage(text);
          this.appendMessage(text, 'user');
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

  sendMessage(text) {
    if (this.socket && this.sessionId) {
      this.socket.emit('send-message', {
        sessionId: this.sessionId,
        content: text,
        role: 'user'
      });
    }
  }

  executeCommand(command) {
    if (this.socket && this.sessionId) {
      this.socket.emit('execute-command', {
        sessionId: this.sessionId,
        command: command
      });
    }
  }

  clear() {
    this.terminalOutput.innerHTML = '';
  }

  scrollToBottom() {
    this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    this.isAtBottom = true;
  }

  handleResize() {
    // Adjust terminal height based on window size
    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
    const inputHeight = this.terminalInput.offsetHeight;
    const availableHeight = window.innerHeight - headerHeight - inputHeight - 20; // 20px for margins

    this.terminalOutput.style.height = `${availableHeight}px`;
  }
}
