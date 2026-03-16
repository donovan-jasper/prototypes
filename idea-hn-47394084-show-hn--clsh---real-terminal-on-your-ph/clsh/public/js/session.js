let sessions = [];

function createNewSession() {
    const sessionId = generateSessionId();
    const sessionName = `Session ${sessions.length + 1}`;
    
    sessions.push({
        id: sessionId,
        name: sessionName
    });
    
    addSessionTab(sessionId, sessionName);
    switchToSession(sessionId);
    
    // Save sessions to localStorage
    saveSessions();
}

function addSessionTab(sessionId, sessionName) {
    const tabsContainer = document.getElementById('session-tabs');
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.sessionId = sessionId;
    tab.textContent = sessionName;
    
    tab.addEventListener('click', () => {
        switchToSession(sessionId);
    });
    
    // Insert before the new session button
    const newSessionBtn = document.getElementById('new-session-btn');
    tabsContainer.insertBefore(tab, newSessionBtn);
}

function switchToSession(sessionId) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.sessionId === sessionId);
    });
    
    // Show/hide terminals
    Object.keys(terminals).forEach(id => {
        const termElement = document.getElementById(`terminal-${id}`);
        if (termElement) {
            termElement.style.display = (id === sessionId) ? 'block' : 'none';
        }
    });
    
    currentSessionId = sessionId;
    
    // Resize current terminal
    setTimeout(() => {
        resizeTerminal();
    }, 100);
}

function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

function saveSessions() {
    localStorage.setItem('clsh_sessions', JSON.stringify(sessions));
}

function loadSessions() {
    const saved = localStorage.getItem('clsh_sessions');
    if (saved) {
        try {
            sessions = JSON.parse(saved);
            sessions.forEach(session => {
                addSessionTab(session.id, session.name);
            });
            
            if (sessions.length > 0) {
                switchToSession(sessions[0].id);
            }
        } catch (e) {
            console.error('Failed to load sessions:', e);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for new session button
    document.getElementById('new-session-btn').addEventListener('click', () => {
        createNewSession();
    });
    
    // Load existing sessions
    loadSessions();
    
    // If no sessions exist, create one
    if (sessions.length === 0) {
        createNewSession();
    }
});
