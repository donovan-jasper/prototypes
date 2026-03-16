let socket;
let terminals = {};
let currentSessionId = null;
let fitAddon;

function initializeSocket() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    socket = io({ query: { token } });
    
    socket.on('session-created', (data) => {
        const { sessionId } = data;
        createTerminal(sessionId);
    });
    
    socket.on('session-attached', (data) => {
        const { sessionId } = data;
        createTerminal(sessionId);
    });
    
    socket.on('output', (data) => {
        const { sessionId, output } = data;
        const term = terminals[sessionId];
        if (term) {
            term.write(output);
        }
    });
    
    socket.on('error', (data) => {
        console.error('Socket error:', data.message);
    });
}

function createTerminal(sessionId) {
    const terminalContainer = document.getElementById('terminal-container');
    const termElement = document.createElement('div');
    termElement.id = `terminal-${sessionId}`;
    termElement.style.display = 'none';
    terminalContainer.appendChild(termElement);
    
    const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, monospace',
        theme: {
            background: '#1e1e1e',
            foreground: '#d4d4d4',
            cursor: '#ffffff'
        }
    });
    
    term.open(termElement);
    
    // Load fit addon dynamically
    if (typeof FitAddon !== 'undefined') {
        fitAddon = new FitAddon.FitAddon();
        term.loadAddon(fitAddon);
        fitAddon.fit();
    }
    
    term.onData(data => {
        socket.emit('input', { sessionId, input: data });
    });
    
    terminals[sessionId] = term;
    currentSessionId = sessionId;
    
    // Resize terminal when window changes
    window.addEventListener('resize', () => {
        resizeTerminal();
    });
    
    // Initial resize
    setTimeout(() => {
        resizeTerminal();
    }, 100);
    
    return term;
}

function resizeTerminal() {
    if (currentSessionId && terminals[currentSessionId] && fitAddon) {
        fitAddon.fit();
        const term = terminals[currentSessionId];
        const cols = term.cols;
        const rows = term.rows;
        socket.emit('resize', { sessionId: currentSessionId, cols, rows });
    }
}

function createNewSession() {
    const cols = 80; // Default value, will be resized later
    const rows = 24;
    socket.emit('create-session', { cols, rows });
}

function attachToSession(sessionId) {
    socket.emit('attach-session', { sessionId });
}

initializeSocket();
