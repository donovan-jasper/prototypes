class SessionManager {
  constructor() {
    this.sessions = [];
    this.currentSession = null;
  }

  async loadSessions() {
    try {
      const response = await fetch('/api/sessions');
      const sessions = await response.json();
      this.sessions = sessions;
      return sessions;
    } catch (error) {
      console.error(error);
    }
  }

  async createSession(name, agentType) {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, agentType }),
      });
      const session = await response.json();
      this.sessions.push(session);
      return session;
    } catch (error) {
      console.error(error);
    }
  }

  async switchSession(sessionId) {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      const session = await response.json();
      this.currentSession = session;
      return session;
    } catch (error) {
      console.error(error);
    }
  }

  async deleteSession(sessionId) {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      const message = await response.json();
      return message;
    } catch (error) {
      console.error(error);
    }
  }
}

export default SessionManager;
