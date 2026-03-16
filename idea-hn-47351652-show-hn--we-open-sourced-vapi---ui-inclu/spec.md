# VoiceForge

## One-line pitch
Open-source visual platform for building real-time voice AI agents with drag-and-drop workflow design, multi-provider integration, and zero per-minute fees.

## Tech stack
- **Backend**: Node.js + Express
- **Database**: SQLite (with better-sqlite3)
- **Frontend**: Vanilla HTML/CSS/JS with Canvas API for visual editor
- **Real-time**: WebSocket (ws library)
- **Voice**: Web Audio API, WebRTC
- **AI Providers**: OpenAI (Whisper, TTS, GPT), Anthropic Claude (via API)
- **Telephony**: Twilio (optional integration)

## Core features

1. **Visual Workflow Builder**: Drag-and-drop canvas to design voice agent flows with nodes for STT, LLM, TTS, logic branches, and actions
2. **Multi-Provider Integration**: Configure and switch between OpenAI Whisper/GPT/TTS and Anthropic Claude with API key management
3. **Real-time Voice Testing**: Browser-based voice chat interface to test agents in real-time using WebRTC and Web Audio API
4. **Workflow Persistence**: Save, load, and deploy workflows with SQLite storage
5. **Simple Telephony Bridge**: Webhook endpoint for Twilio integration to connect workflows to phone calls

## File structure

```
voiceforge/
├── server/
│   ├── index.js                 # Express app entry point
│   ├── db.js                    # SQLite database setup
│   ├── routes/
│   │   ├── workflows.js         # CRUD for workflows
│   │   ├── providers.js         # AI provider config
│   │   └── telephony.js         # Twilio webhook handlers
│   ├── services/
│   │   ├── stt.js              # Speech-to-text service
│   │   ├── llm.js              # LLM service
│   │   ├── tts.js              # Text-to-speech service
│   │   └── executor.js         # Workflow execution engine
│   └── websocket.js            # WebSocket handler for real-time
├── public/
│   ├── index.html              # Main app page
│   ├── css/
│   │   └── style.css           # App styles
│   └── js/
│       ├── app.js              # Main app logic
│       ├── canvas.js           # Visual workflow editor
│       ├── nodes.js            # Node type definitions
│       ├── voice.js            # Voice chat interface
│       └── api.js              # API client
├── package.json
├── .env.example
└── README.md
```

## Implementation steps

### Step 1: Initialize project and dependencies

Create `package.json`:
```json
{
  "name": "voiceforge",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server/index.js",
    "dev": "node --watch server/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "ws": "^8.16.0",
    "openai": "^4.28.0",
    "anthropic": "^0.17.1",
    "dotenv": "^16.4.1",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1"
  }
}
```

Create `.env.example`:
```
PORT=3000
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
TWILIO_AUTH_TOKEN=your_twilio_token
```

### Step 2: Database setup

Create `server/db.js`:
- Initialize SQLite database with better-sqlite3
- Create tables:
  - `workflows`: id, name, data (JSON), created_at, updated_at
  - `provider_configs`: id, provider_name, api_key, config (JSON), created_at
  - `sessions`: id, workflow_id, status, started_at, ended_at, metadata (JSON)
- Export database instance and helper functions for CRUD operations

### Step 3: Express server setup

Create `server/index.js`:
- Load environment variables with dotenv
- Initialize Express app with JSON body parser and CORS
- Serve static files from `public/` directory
- Mount route handlers for `/api/workflows`, `/api/providers`, `/api/telephony`
- Create HTTP server and attach WebSocket server
- Start server on configured port

### Step 4: Workflow routes

Create `server/routes/workflows.js`:
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create new workflow with name and initial data
- `GET /api/workflows/:id` - Get workflow by ID
- `PUT /api/workflows/:id` - Update workflow data
- `DELETE /api/workflows/:id` - Delete workflow
- Each workflow data structure: `{ nodes: [], connections: [] }`

### Step 5: Provider configuration routes

Create `server/routes/providers.js`:
- `GET /api/providers` - List configured providers
- `POST /api/providers` - Add/update provider config (store API keys securely)
- `DELETE /api/providers/:name` - Remove provider config
- Support providers: openai-whisper, openai-gpt, openai-tts, anthropic-claude

### Step 6: AI service implementations

Create `server/services/stt.js`:
- Implement speech-to-text using OpenAI Whisper API
- Accept audio buffer, return transcribed text
- Handle errors and timeouts

Create `server/services/llm.js`:
- Implement LLM calls for OpenAI GPT and Anthropic Claude
- Accept prompt and provider config, return completion
- Support streaming responses

Create `server/services/tts.js`:
- Implement text-to-speech using OpenAI TTS API
- Accept text and voice config, return audio buffer
- Support different voice options

### Step 7: Workflow execution engine

Create `server/services/executor.js`:
- Implement workflow execution logic:
  - Parse workflow JSON (nodes and connections)
  - Execute nodes in order based on connections
  - Node types: start, stt, llm, tts, branch, end
  - Branch nodes evaluate conditions and route to different paths
  - Maintain execution context (variables, conversation history)
- Export `executeWorkflow(workflowData, audioInput, providerConfigs)` function
- Return execution results and audio output

### Step 8: WebSocket handler for real-time voice

Create `server/websocket.js`:
- Handle WebSocket connections on `/ws` path
- Message types:
  - `start_session`: Initialize voice session with workflow_id
  - `audio_chunk`: Receive audio data from client
  - `end_session`: Close session
- On audio_chunk:
  - Buffer audio until silence detected or timeout
  - Execute workflow with buffered audio
  - Send back `audio_response` message with TTS output
  - Send `transcript` and `llm_response` messages for UI display
- Maintain session state per connection

### Step 9: Telephony integration

Create `server/routes/telephony.js`:
- `POST /api/telephony/voice` - Twilio webhook for incoming calls
- Generate TwiML response to stream audio to WebSocket
- `POST /api/telephony/stream` - Handle Twilio media streams
- Execute workflow with incoming audio
- Return TTS audio to Twilio stream
- Log call sessions to database

### Step 10: Frontend HTML structure

Create `public/index.html`:
- Header with app title and navigation
- Main container with two sections:
  - Left sidebar: workflow list, provider config panel
  - Right main area: canvas editor and voice test panel (tabs)
- Canvas element for visual editor
- Voice test panel with record button, status display, transcript area
- Modals for creating/editing workflows and provider configs
- Include CSS and JS files

### Step 11: Frontend styles

Create `public/css/style.css`:
- Clean, modern design with CSS Grid layout
- Sidebar: 300px fixed width, scrollable
- Main area: flexible, full height
- Canvas: white background, grid pattern, zoom controls
- Node styles: rounded rectangles, color-coded by type (STT=blue, LLM=green, TTS=purple, Branch=orange)
- Connection lines: curved SVG paths
- Voice panel: centered controls, waveform visualization
- Responsive design for smaller screens

### Step 12: API client

Create `public/js/api.js`:
- Wrapper functions for all API endpoints
- `fetchWorkflows()`, `createWorkflow(name)`, `updateWorkflow(id, data)`, etc.
- `fetchProviders()`, `saveProvider(name, apiKey, config)`
- Handle errors and return JSON responses
- Export as module

### Step 13: Node type definitions

Create `public/js/nodes.js`:
- Define node types with properties:
  - `start`: Entry point, no config
  - `stt`: Speech-to-text, config: provider selection
  - `llm`: Language model, config: provider, system prompt, temperature
  - `tts`: Text-to-speech, config: provider, voice selection
  - `branch`: Conditional logic, config: condition expression
  - `end`: Exit point
- Each node has: id, type, position {x, y}, config, inputs, outputs
- Export node factory functions

### Step 14: Visual workflow editor

Create `public/js/canvas.js`:
- Initialize canvas with pan and zoom
- Render nodes as rounded rectangles with labels
- Render connections as bezier curves between node ports
- Drag-and-drop functionality:
  - Drag nodes from palette to canvas
  - Drag existing nodes to reposition
  - Drag from output port to input port to create connection
- Click node to open config panel
- Right-click node to delete
- Export workflow data as JSON
- Import workflow data to render on canvas
- Toolbar with node palette and save/load buttons

### Step 15: Voice chat interface

Create `public/js/voice.js`:
- Initialize WebSocket connection to `/ws`
- Use Web Audio API to capture microphone input
- Record button to start/stop recording
- Visualize audio waveform during recording
- Send audio chunks via WebSocket as base64
- Receive and play TTS audio responses
- Display transcripts and LLM responses in chat-like interface
- Handle session lifecycle (start, active, end)

### Step 16: Main app logic

Create `public/js/app.js`:
- Initialize app on page load
- Load workflow list from API
- Handle workflow selection and loading into canvas
- Handle provider configuration UI
- Switch between canvas and voice test tabs
- Connect canvas save button to API
- Connect voice test to selected workflow
- Handle errors and display notifications

### Step 17: Documentation

Create `README.md`:
- Project description and features
- Prerequisites (Node.js 18+)
- Installation steps:
  1. Clone repository
  2. Run `npm install`
  3. Copy `.env.example` to `.env` and add API keys
  4. Run `npm start`
  5. Open browser to `http://localhost:3000`
- Usage guide:
  - Configure AI providers in settings
  - Create new workflow
  - Add nodes to canvas and connect them
  - Save workflow
  - Test with voice interface
  - (Optional) Configure Twilio webhook for phone integration
- Architecture overview
- API documentation
- Contributing guidelines

## How to test it works

1. **Start the server**: Run `npm start` and verify server starts on port 3000
2. **Access UI**: Open `http://localhost:3000` in browser, verify page loads with canvas and sidebar
3. **Configure provider**: Click settings, add OpenAI API key, save, verify success message
4. **Create workflow**:
   - Click "New Workflow", name it "Test Agent"
   - Drag Start node to canvas
   - Drag STT node, connect Start to STT
   - Drag LLM node with prompt "You are a helpful assistant", connect STT to LLM
   - Drag TTS node, connect LLM to TTS
   - Drag End node, connect TTS to End
   - Click Save, verify workflow appears in sidebar
5. **Test voice interaction**:
   - Switch to Voice Test tab
   - Select "Test Agent" workflow
   - Click Record button, speak "Hello, how are you?"
   - Stop recording
   - Verify transcript appears
   - Verify LLM response appears
   - Verify audio plays back
6. **Test persistence**: Refresh page, verify workflow still loads from database
7. **Test Twilio (optional)**: Configure Twilio webhook to `https://your-domain/api/telephony/voice`, call number, verify voice agent responds