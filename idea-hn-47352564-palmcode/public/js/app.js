import SessionManager from './sessions.js';
import Terminal from './terminal.js';
// import FileManager from './editor.js'; // Assuming editor.js will export FileManager

document.addEventListener('DOMContentLoaded', () => {
  const socket = io(); // Initialize Socket.IO connection

  const sessionManager = new SessionManager();
  const terminal = new Terminal(
    document.getElementById('terminal-output'),
    document.getElementById('terminal-input')
  );
  // const fileManager = new FileManager(...); // Initialize FileManager when ready

  const sessionSelect = document.getElementById('session-select');
  const newSessionBtn = document.getElementById('new-session-btn');
  const newSessionModal = document.getElementById('new-session-modal');
  const createSessionForm = document.getElementById('create-session-form');
  const closeModalBtn = document.querySelector('.close-button');
  const deleteSessionBtn = document.getElementById('delete-session-btn');

  // --- Session Management ---
  async function populateSessions() {
    const sessions = await sessionManager.loadSessions();
    sessionSelect.innerHTML = '<option value="">Select a session</option>';
    sessions.forEach(session => {
      const option = document.createElement('option');
      option.value = session.id;
      option.textContent = `${session.name} (${session.agent_type})`;
      sessionSelect.appendChild(option);
    });

    // If there's a current session, try to select it
    if (sessionManager.currentSession) {
      sessionSelect.value = sessionManager.currentSession.id;
    } else if (sessions.length > 0) {
      // Auto-select the most recently accessed session if no current one
      sessionSelect.value = sessions[0].id;
      await switchSession(sessions[0].id);
    }
  }

  async function switchSession(sessionId) {
    if (!sessionId) {
      terminal.clear();
      // fileManager.clear(); // Clear file manager
      sessionManager.currentSession = null;
      deleteSessionBtn.style.display = 'none';
      return;
    }

    try {
      const session = await sessionManager.switchSession(sessionId);
      if (session) {
        console.log('Switched to session:', session);
        terminal.initialize(socket, session.id);
        // fileManager.loadFileTree(session.id); // Load file tree for new session
        deleteSessionBtn.style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Failed to switch session:', error);
      alert('Failed to switch session. See console for details.');
    }
  }

  sessionSelect.addEventListener('change', (event) => {
    const sessionId = event.target.value;
    switchSession(sessionId);
  });

  newSessionBtn.addEventListener('click', () => {
    newSessionModal.style.display = 'block';
  });

  closeModalBtn.addEventListener('click', () => {
    newSessionModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === newSessionModal) {
      newSessionModal.style.display = 'none';
    }
  });

  createSessionForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('session-name').value;
    const agentType = document.getElementById('agent-type').value;

    try {
      const newSession = await sessionManager.createSession(name, agentType);
      if (newSession) {
        alert(`Session "${newSession.name}" created!`);
        newSessionModal.style.display = 'none';
        createSessionForm.reset();
        await populateSessions();
        sessionSelect.value = newSession.id; // Select the newly created session
        await switchSession(newSession.id);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. See console for details.');
    }
  });

  deleteSessionBtn.addEventListener('click', async () => {
    if (sessionManager.currentSession && confirm(`Are you sure you want to delete session "${sessionManager.currentSession.name}"? This action cannot be undone.`)) {
      try {
        await sessionManager.deleteSession(sessionManager.currentSession.id);
        alert('Session deleted successfully.');
        await populateSessions();
        sessionSelect.value = ''; // Clear selection
        await switchSession(''); // Clear terminal/editor
      } catch (error) {
        console.error('Failed to delete session:', error);
        alert('Failed to delete session. See console for details.');
      }
    }
  });

  // --- Socket.IO Event Handling ---
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    // If a session is already selected, re-join it on reconnect
    if (sessionManager.currentSession) {
      terminal.initialize(socket, sessionManager.currentSession.id);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
    alert(`WebSocket Error: ${error.message}`);
  });

  // --- Initial Load ---
  populateSessions();

  // Mobile menu toggle (basic implementation)
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const leftSidebar = document.getElementById('left-sidebar');
  const rightSidebar = document.getElementById('right-sidebar');

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      leftSidebar.classList.toggle('active');
      rightSidebar.classList.remove('active'); // Close other sidebar if open
    });
  }

  // Example for right sidebar toggle (assuming an editor toggle button)
  const editorToggleButton = document.getElementById('editor-toggle-button');
  if (editorToggleButton) {
    editorToggleButton.addEventListener('click', () => {
      rightSidebar.classList.toggle('active');
      leftSidebar.classList.remove('active'); // Close other sidebar if open
    });
  }
});
