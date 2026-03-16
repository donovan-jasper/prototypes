# CloudCLI Implementation Spec

## 1. App Name
**AgentHub**

## 2. One-line pitch
A lightweight web interface that lets you manage and interact with AI coding agents (Claude, Codex, Gemini) from any device with real-time terminal streaming and session persistence.

## 3. Tech Stack
- **Backend**: Node.js + Express
- **Database**: SQLite (with better-sqlite3)
- **Frontend**: Vanilla HTML/CSS/JS with WebSocket support
- **Real-time**: Socket.IO for terminal streaming
- **AI Integration**: Direct API calls to Anthropic, OpenAI, and Google AI
- **Terminal**: node-pty for pseudo-terminal emulation
- **File System**: chokidar for file watching

## 4. Core Features

### Feature 1: Multi-Agent Session Management
- Create and switch between coding sessions for different AI agents
- Each session maintains its own working directory, conversation history, and terminal state
- Sessions persist across browser refreshes and device switches

### Feature 2: Real-time Terminal Interface
- Interactive terminal that streams AI agent responses and command execution
- Support for running shell commands through the agent
- Terminal history and output persistence per session

### Feature 3: File Browser & Editor
- Browse project files in the current session's working directory
- Simple code editor with syntax highlighting
- Real-time file change detection and display

### Feature 4: Cross-Device Session Sync
- Sessions accessible from any device via web browser
- Mobile-responsive interface for on-the-go code review and agent interaction
- Session state automatically syncs across connected clients

## 5. File Structure

```
agenthub/
├── server/
│   ├── index.js                 # Express server setup
│   ├── db.js                    # SQLite database initialization
│   ├── agents/
│   │   ├── claude.js            # Claude API integration
│   │   ├── openai.js            # OpenAI Codex integration
│   │   └── gemini.js            # Gemini API integration
│   ├── routes/
│   │   ├── sessions.js          # Session CRUD endpoints
│   │   ├── files.js             # File system operations
│   │   └── terminal.js          # Terminal command execution
│   └── websocket.js             # Socket.IO event handlers
├── public/
│   ├── index.html               # Main app interface
│   ├── css/
│   │   └── style.css            # Application styles
│   └── js/
│       ├── app.js               # Main application logic
│       ├── terminal.js          # Terminal UI component
│       ├── editor.js            # File editor component
│       └── sessions.js          # Session management UI
├── data/
│   └── agenthub.db              # SQLite database (auto-created)
├── workspaces/                  # Session working directories
├── package.json
├── .env.example
└── README.md
```

## 6. Implementation Steps

### Step 1: Project Setup
1. Create project directory and initialize npm
2. Install dependencies:
   ```
   npm init -y
   npm install express socket.io better-sqlite3 node-pty chokidar dotenv cors body-parser
   npm install --save-dev nodemon
   ```
3. Create `.env.example` with:
   ```
   PORT=3000
   ANTHROPIC_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   GOOGLE_API_KEY=your_key_here
   ```
4. Add scripts to `package.json`:
   ```json
   "scripts": {
     "start": "node server/index.js",
     "dev": "nodemon server/index.js"
   }
   ```

### Step 2: Database Schema
Create `server/db.js`:
- Initialize SQLite database with better-sqlite3
- Create tables:
  - `sessions`: id, name, agent_type (claude/codex/gemini), workspace_path, created_at, last_accessed
  - `messages`: id, session_id, role (user/assistant/system), content, timestamp
  - `terminal_history`: id, session_id, command, output, timestamp

### Step 3: Express Server Setup
Create `server/index.js`:
- Set up Express app with CORS and body-parser
- Serve static files from `public/`
- Initialize Socket.IO
- Mount route handlers for sessions, files, and terminal
- Create `workspaces/` directory if it doesn't exist
- Start server on specified port

### Step 4: Session Management Routes
Create `server/routes/sessions.js`:
- `POST /api/sessions` - Create new session with agent type and name
  - Generate unique workspace directory
  - Insert session record into database
  - Return session object
- `GET /api/sessions` - List all sessions with last accessed time
- `GET /api/sessions/:id` - Get session details and recent messages
- `DELETE /api/sessions/:id` - Delete session and workspace
- `PUT /api/sessions/:id/access` - Update last accessed timestamp

### Step 5: AI Agent Integrations
Create agent modules in `server/agents/`:

**claude.js**:
- Export `sendMessage(prompt, conversationHistory)` function
- Use Anthropic API with streaming support
- Return async generator that yields response chunks
- Handle API errors gracefully

**openai.js**:
- Export `sendMessage(prompt, conversationHistory)` function
- Use OpenAI API with streaming support
- Return async generator that yields response chunks
- Handle API errors gracefully

**gemini.js**:
- Export `sendMessage(prompt, conversationHistory)` function
- Use Google Generative AI API with streaming support
- Return async generator that yields response chunks
- Handle API errors gracefully

### Step 6: File System Routes
Create `server/routes/files.js`:
- `GET /api/files/:sessionId` - List files in session workspace (recursive tree structure)
- `GET /api/files/:sessionId/content` - Read file content (query param: path)
- `PUT /api/files/:sessionId/content` - Write file content
- `POST /api/files/:sessionId/mkdir` - Create directory
- `DELETE /api/files/:sessionId` - Delete file or directory

### Step 7: WebSocket Terminal Handler
Create `server/websocket.js`:
- Handle `connection` event
- On `join-session` event:
  - Load session from database
  - Initialize node-pty terminal in session workspace
  - Set up file watcher with chokidar
- On `send-message` event:
  - Save user message to database
  - Get appropriate agent module based on session type
  - Stream agent response chunks via socket
  - Save complete response to database
- On `execute-command` event:
  - Write command to pty terminal
  - Stream output back via socket
  - Save to terminal_history
- On `file-change` event from chokidar:
  - Emit file update to all clients in session
- Handle `disconnect` event and cleanup

### Step 8: Frontend HTML Structure
Create `public/index.html`:
- Header with app name and session selector dropdown
- Three-column layout:
  - Left sidebar: File browser tree (25% width)
  - Center: Terminal/chat interface (50% width)
  - Right sidebar: File editor (25% width, collapsible)
- New session modal with agent type selection
- Mobile-responsive: stack columns vertically on small screens
- Include Socket.IO client library from CDN
- Link CSS and JS files

### Step 9: Frontend Styles
Create `public/css/style.css`:
- Dark theme optimized for code (background: #1e1e1e, text: #d4d4d4)
- Flexbox layout for three-column structure
- Terminal styling with monospace font
- File tree with indentation and icons (use Unicode symbols)
- Code editor with line numbers
- Mobile breakpoints: stack layout below 768px
- Button and input styling consistent with dark theme
- Loading states and animations

### Step 10: Session Management UI
Create `public/js/sessions.js`:
- Export `SessionManager` class
- Methods:
  - `loadSessions()` - Fetch and populate session dropdown
  - `createSession(name, agentType)` - POST new session
  - `switchSession(sessionId)` - Load session and emit join-session event
  - `deleteSession(sessionId)` - DELETE session with confirmation
- Handle new session modal interactions
- Update UI when session changes

### Step 11: Terminal UI Component
Create `public/js/terminal.js`:
- Export `Terminal` class
- Methods:
  - `initialize(socket, sessionId)` - Set up socket listeners
  - `sendMessage(text)` - Emit send-message event
  - `executeCommand(cmd)` - Emit execute-command event
  - `appendOutput(text, type)` - Add to terminal display
  - `clear()` - Clear terminal
- Handle input submission (detect if message or command)
- Display streaming responses with typing indicator
- Auto-scroll to bottom on new output

### Step 12: File Browser & Editor
Create `public/js/editor.js`:
- Export `FileManager` class
- Methods:
  - `loadFileTree(sessionId)` - Fetch and render file tree
  - `openFile(path)` - Load file content into editor
  - `saveFile(path, content)` - PUT file content
  - `createFile(path)` - Create new file
  - `deleteFile(path)` - Delete with confirmation
- Simple textarea-based editor with syntax highlighting (use highlight.js from CDN)
- Handle file tree click events
- Listen for file-change socket events and refresh tree

### Step 13: Main Application Logic
Create `public/js/app.js`:
- Initialize Socket.IO connection
- Instantiate SessionManager, Terminal, and FileManager
- Set up event listeners for UI interactions
- Handle connection/disconnection states
- Coordinate between components (e.g., when session switches, update all components)
- Handle errors and display user-friendly messages
- Implement mobile menu toggle for sidebar visibility

### Step 14: Error Handling & Validation
- Add try-catch blocks in all async functions
- Validate API keys exist before making agent calls
- Return appropriate HTTP status codes
- Display error messages in UI (toast notifications)
- Handle WebSocket disconnections gracefully
- Validate file paths to prevent directory traversal

### Step 15: Documentation
Create `README.md`:
- Project description and features
- Prerequisites (Node.js version)
- Installation steps
- Configuration (API keys)
- How to run
- Usage guide with screenshots descriptions
- API endpoint documentation
- Troubleshooting common issues

## 7. How to Test It Works

### Test 1: Session Creation
1. Start the server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Click "New Session" button
4. Enter session name "Test Project" and select "Claude" as agent
5. Verify session appears in dropdown and workspace directory created in `workspaces/`

### Test 2: AI Agent Interaction
1. In the terminal input, type: "Create a simple hello.js file that prints Hello World"
2. Verify streaming response appears in terminal
3. Check that `hello.js` appears in file browser
4. Click on `hello.js` in file tree
5. Verify file content loads in editor with correct code

### Test 3: Terminal Command Execution
1. In terminal input, type: `node hello.js` (prefix with `$` or detect as command)
2. Verify command executes and output "Hello World" appears
3. Check terminal_history table in database contains the command and output

### Test 4: File Editing
1. Click on `hello.js` in file browser
2. Modify the message in the editor to "Hello AgentHub"
3. Click Save or use Ctrl+S
4. In terminal, run `node hello.js` again
5. Verify output shows "Hello AgentHub"

### Test 5: Cross-Device Session Sync
1. With session open in one browser tab, note the session ID
2. Open a second browser tab or different device to `http://localhost:3000`
3. Select the same session from dropdown
4. Send a message in one tab
5. Verify the message and response appear in both tabs in real-time

### Test 6: Session Persistence
1. Create a session and send several messages
2. Close the browser completely
3. Reopen browser to `http://localhost:3000`
4. Select the previous session
5. Verify all messages and files are still present

### Test 7: Mobile Responsiveness
1. Open browser developer tools
2. Toggle device emulation to mobile view (e.g., iPhone)
3. Verify layout stacks vertically
4. Test that all features work: session switching, sending messages, viewing files
5. Verify touch interactions work properly

### Success Criteria
- All three AI agents (Claude, Codex, Gemini) can be selected and respond to prompts
- Terminal streams responses in real-time with visible typing effect
- Files created by agents appear immediately in file browser
- Sessions persist across browser refreshes
- Multiple browser tabs can connect to same session and see updates
- Mobile layout is usable on phone-sized screens
- No console errors during normal operation