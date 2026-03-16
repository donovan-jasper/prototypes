import SessionManager from './sessions.js';
import Terminal from './terminal.js';
import FileManager from './editor.js';

class App {
  constructor() {
    this.socket = io();
    this.sessionManager = new SessionManager();
    this.terminal = new Terminal();
    this.fileManager = new FileManager();

    this.newSessionModal = document.getElementById('new-session-modal');
    this.newSessionBtn = document.getElementById('new-session-btn');
    this.createSessionBtn = document.getElementById('create-session-btn');
    this.cancelSessionBtn = document.getElementById('cancel-session-btn');
    this.sessionNameInput = document.getElementById('session-name');
    this.agentTypeSelect = document.getElementById('agent-type');

    this.initEventListeners();
    this.initSocketListeners();
    this.sessionManager.loadSessions();
  }

  initEventListeners() {
    this.newSessionBtn.addEventListener('click', () => {
      this.newSessionModal.style.display = 'block';
    });

    this.createSessionBtn.addEventListener('click', () => {
      const name = this.sessionNameInput.value.trim();
      const agentType = this.agentTypeSelect.value;

      if (name) {
        this.sessionManager.createSession(name, agentType);
        this.newSessionModal.style.display = 'none';
        this.sessionNameInput.value = '';
      }
    });

    this.cancelSessionBtn.addEventListener('click', () => {
      this.newSessionModal.style.display = 'none';
      this.sessionNameInput.value = '';
    });
  }

  initSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('session-joined', (session) => {
      this.terminal.initialize(this.socket, session.id);
      this.fileManager.initialize(this.socket, session.id);
    });

    this.socket.on('error', (error) => {
      console.error('Error:', error);
      alert(`Error: ${error}`);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
