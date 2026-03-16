class SessionManager {
  constructor() {
    this.socket = io();
    this.currentSessionId = null;
    this.sessions = [];
  }

  async loadSessions() {
    try {
      const response = await fetch('/api/sessions');
      this.sessions = await response.json();
      this.renderSessionDropdown();
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }

  renderSessionDropdown() {
    const dropdown = document.getElementById('session-dropdown');
    dropdown.innerHTML = '';

    this.sessions.forEach(session => {
      const option = document.createElement('option');
      option.value = session.id;
      option.textContent = `${session.name} (${session.agent_type})`;
      dropdown.appendChild(option);
    });

    if (this.currentSessionId) {
      dropdown.value = this.currentSessionId;
    }

    dropdown.addEventListener('change', (e) => {
      this.switchSession(e.target.value);
    });
  }

  async createSession(name, agentType) {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, agentType }),
      });

      const newSession = await response.json();
      this.sessions.push(newSession);
      this.renderSessionDropdown();
      this.switchSession(newSession.id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }

  switchSession(sessionId) {
    this.currentSessionId = sessionId;
    this.socket.emit('join-session', sessionId);

    // Update the dropdown to reflect the current session
    const dropdown = document.getElementById('session-dropdown');
    dropdown.value = sessionId;

    // Update the UI to show the current session
    const currentSession = this.sessions.find(s => s.id == sessionId);
    document.querySelector('header h1').textContent = `AgentHub - ${currentSession.name}`;

    // Update last accessed time
    fetch(`/api/sessions/${sessionId}/access`, {
      method: 'PUT',
    });
  }

  async deleteSession(sessionId) {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await fetch(`/api/sessions/${sessionId}`, {
          method: 'DELETE',
        });

        this.sessions = this.sessions.filter(s => s.id != sessionId);
        this.renderSessionDropdown();

        if (this.currentSessionId == sessionId) {
          this.currentSessionId = null;
          document.querySelector('header h1').textContent = 'AgentHub';
        }
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  }
}

export default SessionManager;
