# Clsh - Cloud Shell for Mobile

## One-line pitch
A Mac-based terminal server with a mobile-optimized web interface featuring a custom virtual keyboard designed for real terminal work.

## Tech stack
- **Backend**: Node.js + Express
- **Terminal**: node-pty (PTY interface), xterm.js (terminal emulation)
- **Frontend**: Vanilla HTML/CSS/JS with Socket.IO for real-time communication
- **Storage**: JSON file for basic config (no database needed for MVP)
- **Security**: Simple token-based authentication

## Core features
1. **Terminal Server**: Spawns and manages shell sessions on the host Mac
2. **Mobile Web Interface**: Responsive web UI accessible from any device on local network
3. **Smart Virtual Keyboard**: Custom keyboard overlay with ESC, CTRL, arrows, TAB, and common shortcuts
4. **Session Persistence**: Reconnect to existing terminal sessions without losing state
5. **Multi-session Support**: Create and switch between multiple terminal tabs

## File structure
```
clsh/
├── server.js                 # Main Express + Socket.IO server
├── package.json
├── config.json              # Server configuration
├── lib/
│   ├── terminal-manager.js  # PTY session management
│   └── auth.js              # Simple token authentication
├── public/
│   ├── index.html           # Main web interface
│   ├── css/
│   │   ├── main.css         # Base styles
│   │   └── keyboard.css     # Virtual keyboard styles
│   └── js/
│       ├── terminal.js      # xterm.js integration
│       ├── keyboard.js      # Virtual keyboard logic
│       └── session.js       # Session management
└── README.md
```

## Implementation steps

### Step 1: Initialize project
- Create `package.json` with dependencies: `express`, `socket.io`, `node-pty`, `uuid`
- Create `config.json` with default settings:
  ```json
  {
    "port": 3000,
    "shell": "/bin/zsh",
    "authToken": "generated-on-first-run"
  }
  ```

### Step 2: Build terminal manager (`lib/terminal-manager.js`)
- Create `TerminalManager` class that:
  - Maintains a Map of session IDs to PTY instances
  - `createSession(cols, rows)`: Spawns new PTY with node-pty, returns session ID
  - `getSession(id)`: Returns existing PTY instance
  - `resizeSession(id, cols, rows)`: Resizes PTY
  - `writeToSession(id, data)`: Writes input to PTY
  - `destroySession(id)`: Kills PTY process
  - Handles PTY data events and forwards to callback

### Step 3: Build authentication (`lib/auth.js`)
- Generate random token on first run if not in config
- Export middleware function that checks `?token=` query param
- Return 401 if token doesn't match

### Step 4: Build Express server (`server.js`)
- Set up Express with static file serving from `public/`
- Initialize Socket.IO with auth middleware
- On socket connection:
  - Handle `create-session` event: create new PTY, emit session ID
  - Handle `attach-session` event: attach to existing session, send scrollback
  - Handle `input` event: write data to PTY
  - Handle `resize` event: resize PTY
  - Handle `disconnect`: keep session alive for 5 minutes
- Forward PTY output to socket with `output` event
- Start server and print access URL with token

### Step 5: Build HTML interface (`public/index.html`)
- Create layout with:
  - Header with app name and session tabs
  - Terminal container div (`#terminal`)
  - Virtual keyboard container (`#keyboard`)
  - New session button
- Load xterm.js from CDN (v5.x)
- Load Socket.IO client from CDN
- Include custom CSS and JS files

### Step 6: Build terminal integration (`public/js/terminal.js`)
- Initialize xterm.js Terminal with mobile-friendly options:
  - `cursorBlink: true`
  - `fontSize: 14`
  - `fontFamily: 'Menlo, Monaco, monospace'`
  - `theme`: dark theme with good contrast
- Connect to Socket.IO with token from URL
- On `create-session` response: attach terminal to DOM
- Handle terminal `data` event: emit to server via socket
- Handle socket `output` event: write to terminal
- Implement `fitAddon` to resize terminal on window resize
- Export functions: `createNewSession()`, `attachToSession(id)`, `resizeTerminal()`

### Step 7: Build virtual keyboard (`public/js/keyboard.js`)
- Create keyboard layout with rows:
  - **Row 1**: ESC, TAB, CTRL, ALT, arrows (←↑↓→)
  - **Row 2**: Common shortcuts (Ctrl+C, Ctrl+D, Ctrl+Z, Ctrl+L)
  - **Row 3**: Special chars (|, &, >, <, ~, `, $)
  - **Toggle**: Show/hide native keyboard button
- Implement key press handlers:
  - Send appropriate escape sequences for special keys
  - Handle modifier key combinations
  - Emit data through terminal instance
- Add visual feedback on key press (highlight animation)
- Make keyboard sticky at bottom on mobile
- Export `initKeyboard(terminalInstance)` function

### Step 8: Style the interface (`public/css/main.css` and `keyboard.css`)
- **main.css**:
  - Full-height layout with flexbox
  - Header with tabs (horizontal scroll on mobile)
  - Terminal container fills remaining space
  - Responsive breakpoints for mobile/desktop
  - Dark theme matching terminal
- **keyboard.css**:
  - Fixed position keyboard at bottom
  - Grid layout for keys with touch-friendly sizing (min 44px)
  - Key styling with pressed state
  - Slide-up animation
  - Hide on desktop (media query)

### Step 9: Build session management (`public/js/session.js`)
- Maintain array of active sessions with IDs and names
- Implement tab switching:
  - Hide/show terminal containers
  - Update active tab styling
- Implement new session creation:
  - Call `createNewSession()` from terminal.js
  - Add new tab to header
  - Switch to new session
- Store session list in localStorage for reconnection
- On page load: attempt to reconnect to stored sessions

### Step 10: Add README with setup instructions
- Installation steps: `npm install`
- How to start: `node server.js`
- How to access from phone: connect to same WiFi, visit `http://[mac-ip]:3000?token=[token]`
- How to find Mac IP: `ifconfig | grep inet`
- Security note: only use on trusted networks

## How to test it works

1. **Start the server**:
   ```bash
   npm install
   node server.js
   ```
   Note the access URL and token printed to console

2. **Test on Mac**:
   - Open browser to `http://localhost:3000?token=[token]`
   - Verify terminal appears and accepts input
   - Type `ls`, `pwd`, `echo "test"` - should work normally
   - Create new session tab, verify multiple sessions work

3. **Test on phone**:
   - Connect phone to same WiFi network
   - Find Mac IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Open phone browser to `http://[mac-ip]:3000?token=[token]`
   - Verify virtual keyboard appears at bottom
   - Test special keys: ESC, TAB, arrows, Ctrl+C
   - Test typing commands with virtual keyboard
   - Test native keyboard toggle works

4. **Test session persistence**:
   - Start a long-running command (e.g., `top`)
   - Close browser tab
   - Reopen within 5 minutes
   - Verify session reconnects and command still running

5. **Test multi-session**:
   - Create 3 terminal sessions
   - Run different commands in each
   - Switch between tabs
   - Verify each maintains independent state