// xterm.js and xterm-addon-fit are expected to be loaded from CDN in index.html,
// making `Terminal` and `FitAddon` globally available.

let socket;
let terminals = {}; // Map<sessionId, { xtermInstance: Terminal, domElement: HTMLElement, fitAddon: FitAddon }>
let currentSessionId = null;

/**
 * Initializes the Socket.IO connection and sets up event listeners.
 * Retrieves the authentication token from the URL query parameters.
 */
function initializeSocket() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    socket = io({ query: { token } });
    
    socket.on('session-created', (data) => {
        const { sessionId } = data;
        console.log(`Socket: Session created: ${sessionId}`);
        createOrGetTerminal(sessionId);
        activateTerminal(sessionId);
        // TODO: This is where session.js would be notified to add a new tab
        // For now, we just activate it.
    });
    
    socket.on('session-attached', (data) => {
        const { sessionId } = data;
        console.log(`Socket: Session attached: ${sessionId}`);
        createOrGetTerminal(sessionId);
        activateTerminal(sessionId);
        // TODO: This is where session.js would be notified to activate/add tab
    });
    
    socket.on('output', (data) => {
        const { sessionId, output } = data;
        const termEntry = terminals[sessionId];
        if (termEntry && termEntry.xtermInstance) {
            termEntry.xtermInstance.write(output);
        }
    });
    
    socket.on('error', (data) => {
        console.error('Socket error:', data.message);
        alert(`Socket Error: ${data.message}`); // Provide user feedback
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        alert(`Connection Error: ${error.message}. Please check your token or server status.`);
    });
}

/**
 * Creates a new xterm.js terminal instance and its DOM element, or returns an existing one.
 * @param {string} sessionId The ID of the session.
 * @returns {{xtermInstance: Terminal, domElement: HTMLElement, fitAddon: FitAddon}} The terminal entry.
 */
function createOrGetTerminal(sessionId) {
    if (terminals[sessionId]) {
        return terminals[sessionId];
    }

    const terminalContainer = document.getElementById('terminal-container');
    if (!terminalContainer) {
        console.error('Terminal container #terminal-container not found!');
        return;
    }

    const termElement = document.createElement('div');
    termElement.id = `terminal-${sessionId}`;
    termElement.className = 'terminal-instance'; // Add a class for styling/hiding
    termElement.style.display = 'none'; // Hidden by default until activated
    terminalContainer.appendChild(termElement);
    
    const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, monospace',
        theme: {
            background: '#1e1e1e',
            foreground: '#d4d4d4',
            cursor: '#ffffff',
            selectionBackground: '#525252',
            black: '#000000',
            red: '#e06c75',
            green: '#98c379',
            yellow: '#e5c07b',
            blue: '#61afef',
            magenta: '#c678dd',
            cyan: '#56b6c2',
            white: '#d4d4d4',
            brightBlack: '#5c6370',
            brightRed: '#e06c75',
            brightGreen: '#98c379',
            brightYellow: '#e5c07b',
            brightBlue: '#61afef',
            brightMagenta: '#c678dd',
            brightCyan: '#56b6c2',
            brightWhite: '#ffffff'
        },
        allowTransparency: true,
        drawBoldTextInBrightColors: false,
        letterSpacing: 0,
        lineHeight: 1.2,
        scrollback: 10000,
        tabStopWidth: 8
    });
    
    term.open(termElement);
    
    const fitAddon = new FitAddon.FitAddon(); // Instantiate FitAddon per terminal
    term.loadAddon(fitAddon);
    
    term.onData(data => {
        socket.emit('input', { sessionId, input: data });
    });
    
    terminals[sessionId] = { xtermInstance: term, domElement: termElement, fitAddon: fitAddon };
    
    return terminals[sessionId];
}

/**
 * Activates a specific terminal session, making its DOM element visible and focusing the terminal.
 * @param {string} sessionId The ID of the session to activate.
 */
function activateTerminal(sessionId) {
    if (!terminals[sessionId]) {
        console.warn(`Attempted to activate non-existent terminal: ${sessionId}`);
        return;
    }

    // Hide all terminal DOM elements
    Object.values(terminals).forEach(termEntry => {
        termEntry.domElement.style.display = 'none';
    });

    // Show and focus the target terminal
    const targetTermEntry = terminals[sessionId];
    targetTermEntry.domElement.style.display = 'block';
    targetTermEntry.xtermInstance.focus();
    currentSessionId = sessionId;

    // Resize the activated terminal to fit its container
    resizeTerminal();
}

/**
 * Resizes the currently active terminal to fit its container and informs the server.
 */
function resizeTerminal() {
    if (currentSessionId && terminals[currentSessionId] && terminals[currentSessionId].fitAddon) {
        const termEntry = terminals[currentSessionId];
        termEntry.fitAddon.fit();
        const cols = termEntry.xtermInstance.cols;
        const rows = termEntry.xtermInstance.rows;
        socket.emit('resize', { sessionId: currentSessionId, cols, rows });
    }
}

/**
 * Requests the server to create a new terminal session.
 */
function createNewSession() {
    // Initial cols/rows can be default, as fitAddon will resize immediately on activation
    const cols = 80; 
    const rows = 24;
    socket.emit('create-session', { cols, rows });
}

/**
 * Requests the server to attach to an existing terminal session.
 * If the terminal already exists on the client, it's simply activated.
 * @param {string} sessionId The ID of the session to attach to.
 */
function attachToSession(sessionId) {
    if (terminals[sessionId]) {
        // If the terminal instance already exists on the client, just activate it.
        activateTerminal(sessionId);
    } else {
        // Otherwise, request the server to attach to it.
        // The server will then emit 'session-attached', which will create/activate it.
        socket.emit('attach-session', { sessionId });
    }
}

// Initialize socket connection when script loads
initializeSocket();

// Resize terminal when window changes
window.addEventListener('resize', () => {
    resizeTerminal();
});

// Export functions for other modules to use (e.g., session.js)
window.createNewSession = createNewSession;
window.attachToSession = attachToSession;
window.resizeTerminal = resizeTerminal;
window.activateTerminal = activateTerminal; // Export activateTerminal for session.js management
