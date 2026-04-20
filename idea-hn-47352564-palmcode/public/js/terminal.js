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
            contentSpan.textContent += data.content;
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

  scrollToBottom() {
    this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
  }

  handleResize() {
    // Adjust terminal height based on window size
    const headerHeight = document.querySelector('.header').offsetHeight;
    const inputHeight = this.terminalInput.offsetHeight;
    const availableHeight = window.innerHeight - headerHeight - inputHeight - 20; // 20px for padding/margin

    this.terminalOutput.style.height = `${availableHeight}px`;
  }

  handleInput(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const inputText = this.terminalInput.value.trim();

      if (inputText) {
        // Check if it's a command (starts with $ or !)
        if (inputText.startsWith('$') || inputText.startsWith('!')) {
          const command = inputText.substring(1).trim();
          this.socket.emit('execute-command', { sessionId: this.sessionId, command });
          this.appendCommand(command, '');
        } else {
          this.socket.emit('send-message', { sessionId: this.sessionId, content: inputText, role: 'user' });
          this.appendMessage(inputText, 'user');
        }

        // Add to command history
        this.commandHistory.push(inputText);
        this.historyIndex = this.commandHistory.length;

        // Clear input
        this.terminalInput.value = '';
        this.scrollToBottom();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.terminalInput.value = this.commandHistory[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.terminalInput.value = this.commandHistory[this.historyIndex];
      } else {
        this.historyIndex = this.commandHistory.length;
        this.terminalInput.value = '';
      }
    }
  }

  handleKeyUp(e) {
    // Handle key up events if needed
  }

  appendMessage(content, role) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    if (role === 'user') {
      messageContainer.classList.add('user-message');
      messageContainer.innerHTML = `
        <span class="message-icon">👤</span>
        <span class="message-content">${this.escapeHtml(content)}</span>
      `;
    } else {
      messageContainer.classList.add('ai-message');
      messageContainer.innerHTML = `
        <span class="message-icon">🤖</span>
        <span class="message-content">${this.escapeHtml(content)}</span>
      `;
    }

    this.terminalOutput.appendChild(messageContainer);
  }

  appendCommand(command, output) {
    const commandContainer = document.createElement('div');
    commandContainer.classList.add('command-container');

    commandContainer.innerHTML = `
      <div class="command-input">$ ${this.escapeHtml(command)}</div>
      <div class="command-output">${this.escapeHtml(output)}</div>
    `;

    this.terminalOutput.appendChild(commandContainer);
  }

  appendTerminalOutput(data) {
    if (data.type === 'command') {
      this.appendCommand(data.command, '');
    } else if (data.type === 'output') {
      const lastCommand = this.terminalOutput.querySelector('.command-container:last-child');
      if (lastCommand) {
        const outputElement = lastCommand.querySelector('.command-output');
        if (outputElement) {
          outputElement.textContent += data.content;
        }
      }
    } else if (data.type === 'error') {
      this.appendError(data.content);
    }
  }

  appendError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('error-container');
    errorContainer.textContent = `Error: ${this.escapeHtml(message)}`;
    this.terminalOutput.appendChild(errorContainer);
  }

  clear() {
    this.terminalOutput.innerHTML = '';
    this.commandHistory = [];
    this.historyIndex = -1;
    this.isAgentTyping = false;
    this.typingIndicator = null;
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
