// Main application logic
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Socket.IO connection
  const socket = io();

  // DOM elements
  const terminalOutput = document.getElementById('terminal-output');
  const terminalInput = document.getElementById('terminal-input');
  const sessionSelect = document.getElementById('session-select');
  const newSessionBtn = document.getElementById('new-session-btn');
  const deleteSessionBtn = document.getElementById('delete-session-btn');
  const newSessionModal = document.getElementById('new-session-modal');
  const closeModalBtn = document.querySelector('.close-button');
  const createSessionForm = document.getElementById('create-session-form');
  const fileTree = document.getElementById('file-tree');
  const editorContent = document.getElementById('editor-content');
  const currentFileName = document.getElementById('current-file-name');
  const saveFileBtn = document.getElementById('save-file-btn');

  // Initialize components
  const terminal = new Terminal(terminalOutput, terminalInput);
  let currentSessionId = null;
  let currentFilePath = null;

  // Session management
  async function loadSessions() {
    try {
      const response = await fetch('/api/sessions');
      const sessions = await response.json();

      // Clear existing options except the first one
      while (sessionSelect.options.length > 1) {
        sessionSelect.remove(1);
      }

      // Add sessions to dropdown
      sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        option.textContent = `${session.name} (${session.agent_type})`;
        sessionSelect.appendChild(option);
      });

      // If no sessions, show empty state
      if (sessions.length === 0) {
        terminal.clear();
        terminal.appendMessage('No sessions available. Create a new session to get started.', 'system');
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      terminal.appendError('Failed to load sessions. Please refresh the page.');
    }
  }

  async function createSession(name, agentType) {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, agentType })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const session = await response.json();
      await loadSessions();
      sessionSelect.value = session.id;
      switchSession(session.id);
    } catch (error) {
      console.error('Error creating session:', error);
      terminal.appendError('Failed to create session. Please try again.');
    }
  }

  async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      await loadSessions();
      if (currentSessionId === sessionId) {
        currentSessionId = null;
        terminal.clear();
        terminal.appendMessage('Session deleted. Select or create a new session to continue.', 'system');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      terminal.appendError('Failed to delete session. Please try again.');
    }
  }

  function switchSession(sessionId) {
    if (currentSessionId === sessionId) return;

    currentSessionId = sessionId;
    terminal.initialize(socket, sessionId);
    loadFileTree(sessionId);

    // Update UI
    deleteSessionBtn.style.display = 'inline-block';

    // Update last accessed time
    fetch(`/api/sessions/${sessionId}/access`, {
      method: 'PUT'
    }).catch(error => console.error('Error updating session access time:', error));
  }

  // File management
  async function loadFileTree(sessionId) {
    try {
      const response = await fetch(`/api/files/${sessionId}`);
      const files = await response.json();

      // Clear existing file tree
      fileTree.innerHTML = '';

      // Build file tree
      function buildTree(files, parentElement, path = '') {
        files.forEach(file => {
          const fileItem = document.createElement('div');
          fileItem.classList.add('file-tree-item');

          const icon = file.type === 'directory' ? '📁' : '📄';
          const fullPath = path ? `${path}/${file.name}` : file.name;

          fileItem.innerHTML = `
            <span class="icon">${icon}</span>
            <span class="file-name">${file.name}</span>
          `;

          fileItem.addEventListener('click', () => {
            if (file.type === 'file') {
              openFile(fullPath);
            }
          });

          parentElement.appendChild(fileItem);

          if (file.type === 'directory' && file.children) {
            const childrenContainer = document.createElement('div');
            childrenContainer.classList.add('file-tree-children');
            childrenContainer.style.marginLeft = '1rem';
            parentElement.appendChild(childrenContainer);
            buildTree(file.children, childrenContainer, fullPath);
          }
        });
      }

      buildTree(files, fileTree);
    } catch (error) {
      console.error('Error loading file tree:', error);
      terminal.appendError('Failed to load file tree. Please try again.');
    }
  }

  async function openFile(path) {
    try {
      const response = await fetch(`/api/files/${currentSessionId}/content?path=${encodeURIComponent(path)}`);
      const content = await response.text();

      editorContent.value = content;
      currentFileName.textContent = path.split('/').pop();
      currentFilePath = path;

      // Highlight syntax if needed
      if (path.endsWith('.js') || path.endsWith('.html') || path.endsWith('.css')) {
        editorContent.classList.add('hljs');
        hljs.highlightElement(editorContent);
      } else {
        editorContent.classList.remove('hljs');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      terminal.appendError('Failed to open file. Please try again.');
    }
  }

  async function saveFile() {
    if (!currentFilePath) {
      terminal.appendError('No file selected to save.');
      return;
    }

    try {
      const response = await fetch(`/api/files/${currentSessionId}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: currentFilePath,
          content: editorContent.value
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save file');
      }

      terminal.appendMessage(`File ${currentFilePath} saved successfully.`, 'system');
    } catch (error) {
      console.error('Error saving file:', error);
      terminal.appendError('Failed to save file. Please try again.');
    }
  }

  // Event listeners
  newSessionBtn.addEventListener('click', () => {
    newSessionModal.style.display = 'flex';
  });

  closeModalBtn.addEventListener('click', () => {
    newSessionModal.style.display = 'none';
  });

  createSessionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('session-name').value;
    const agentType = document.getElementById('agent-type').value;

    if (name && agentType) {
      createSession(name, agentType);
      newSessionModal.style.display = 'none';
      createSessionForm.reset();
    }
  });

  sessionSelect.addEventListener('change', () => {
    const sessionId = sessionSelect.value;
    if (sessionId) {
      switchSession(sessionId);
    }
  });

  deleteSessionBtn.addEventListener('click', () => {
    if (currentSessionId) {
      deleteSession(currentSessionId);
    }
  });

  saveFileBtn.addEventListener('click', saveFile);

  // Initialize the app
  loadSessions();

  // Handle socket connection status
  socket.on('connect', () => {
    terminal.appendMessage('Connected to server', 'system');
  });

  socket.on('disconnect', () => {
    terminal.appendError('Disconnected from server. Attempting to reconnect...');
  });

  socket.on('reconnect', () => {
    terminal.appendMessage('Reconnected to server', 'system');
    if (currentSessionId) {
      terminal.initialize(socket, currentSessionId);
    }
  });

  // Handle file changes from server
  socket.on('file-change', (data) => {
    if (data.sessionId === currentSessionId) {
      terminal.appendMessage(`File ${data.path} has been ${data.type}.`, 'system');
      loadFileTree(currentSessionId);

      // If the changed file is the one currently open, reload it
      if (currentFilePath === data.path) {
        openFile(currentFilePath);
      }
    }
  });
});
