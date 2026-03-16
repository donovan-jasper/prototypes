# PromptVault Mobile App Specification

## 1. App Name

**FlowForge**

## 2. One-Line Pitch

Design, test, and share AI workflows visually—no coding required.

## 3. Expanded Vision

### Who is this REALLY for?

**Primary Audience:**
- Small business owners automating customer service, lead generation, or content creation
- Marketing teams building chatbots, email sequences, or social media automation
- Educators creating interactive learning assistants or grading workflows
- Freelancers and consultants offering AI automation as a service to clients

**Broadest Audience:**
This serves anyone who wants to harness AI's power without technical barriers. Think of it as "Canva for AI workflows"—democratizing automation for the 99% who don't code.

**Adjacent Use Cases:**
- Personal productivity (morning routine automation, habit tracking with AI coaching)
- Content creators building interactive storytelling experiences
- Event planners automating RSVPs, reminders, and follow-ups
- Healthcare workers creating patient intake or appointment reminder flows
- Real estate agents automating property tours and lead qualification

**Why Non-Technical Users Want This:**
- Visual drag-and-drop removes intimidation factor
- Real-time testing with device sensors (camera, mic, location) makes AI tangible
- Share workflows via link/QR code—instant collaboration without accounts
- Templates for common use cases (customer support bot, lead qualifier, content scheduler)
- Mobile-first means you can design while commuting, test in real-world contexts, and share instantly

## 4. Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **UI:** React Native Paper (Material Design components)
- **State Management:** Zustand (lightweight, minimal boilerplate)
- **Local Storage:** expo-sqlite for workflow persistence
- **Visualization:** react-native-svg + custom canvas for node-based workflow editor
- **AI Integration:** OpenAI API (GPT-4) via edge functions (Expo can't directly call OpenAI from client)
- **Backend (optional for sync):** Supabase (PostgreSQL + Auth + Storage)
- **Testing:** Jest + React Native Testing Library
- **Gestures:** react-native-gesture-handler + react-native-reanimated

## 5. Core Features (MVP)

### 1. Visual Workflow Builder
Drag-and-drop nodes (Trigger → AI Agent → Action) on an infinite canvas. Nodes include:
- Triggers: Manual button, scheduled time, location-based, camera input, voice input
- AI Agents: Text processor, image analyzer, decision maker
- Actions: Send notification, save to database, share via messaging app

### 2. Real-Time Testing
Tap "Test Flow" to execute the workflow immediately. Use device sensors (camera for image input, mic for voice, GPS for location triggers). See results in real-time with step-by-step execution logs.

### 3. Template Library
Pre-built workflows for common use cases:
- "Customer Support Bot" (text input → AI response → save conversation)
- "Lead Qualifier" (form input → AI scoring → send to CRM)
- "Content Idea Generator" (voice input → AI brainstorm → save to notes)

### 4. One-Tap Sharing
Generate a shareable link or QR code for any workflow. Recipients can run it without installing the app (web view fallback).

### 5. Version History
Auto-save every change. Revert to previous versions with one tap. See diff view of what changed.

## 6. Monetization Strategy

### Free Tier (Hook)
- Up to 3 workflows
- 50 AI executions/month
- Access to template library
- Local storage only (no cloud sync)
- Basic sharing (link expires in 7 days)

### Paid Tier: FlowForge Pro ($9.99/month or $99/year)
- Unlimited workflows
- 1,000 AI executions/month (then $0.01/execution)
- Cloud sync across devices
- Team collaboration (invite up to 5 members)
- Permanent shareable links
- Priority support
- Advanced nodes (webhooks, API integrations, conditional logic)

### Why People Stay Subscribed
- **Habit formation:** Once you automate 5+ workflows, you depend on them daily
- **Network effects:** Teams collaborate, making it sticky
- **Data lock-in:** Cloud-synced workflows become part of your business infrastructure
- **Incremental value:** As you add more workflows, the $9.99 feels trivial compared to time saved

### Price Point Reasoning
$9.99/month positions FlowForge between Zapier ($19.99) and Notion ($10), targeting prosumers who want automation without enterprise complexity. Annual discount (17% off) encourages long-term commitment.

## 7. Market Viability

**NOT SKIPPING** — Clear gap exists:
- Zapier/Make are desktop-first, overwhelming for non-technical users
- Airtable lacks visual workflow design and real-time mobile testing
- No incumbent offers mobile-native AI workflow design with device sensor integration
- Market is growing (no-code AI tools raised $2B+ in 2025)

## 8. File Structure

```
flowforge/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home (workflow list)
│   │   ├── templates.tsx             # Template library
│   │   ├── settings.tsx              # Settings & account
│   ├── workflow/
│   │   ├── [id].tsx                  # Workflow editor
│   │   ├── test.tsx                  # Test execution view
│   ├── _layout.tsx                   # Root layout
├── components/
│   ├── workflow/
│   │   ├── Canvas.tsx                # Infinite canvas for nodes
│   │   ├── Node.tsx                  # Individual workflow node
│   │   ├── NodePicker.tsx            # Node type selector
│   │   ├── ConnectionLine.tsx        # Visual connections between nodes
│   ├── ui/
│   │   ├── Button.tsx                # Reusable button
│   │   ├── Card.tsx                  # Workflow card
│   │   ├── Modal.tsx                 # Modal dialogs
├── lib/
│   ├── db/
│   │   ├── schema.ts                 # SQLite schema
│   │   ├── queries.ts                # Database queries
│   ├── ai/
│   │   ├── executor.ts               # AI workflow execution engine
│   │   ├── openai.ts                 # OpenAI API wrapper
│   ├── storage/
│   │   ├── workflows.ts              # Workflow CRUD operations
│   │   ├── versions.ts               # Version history management
│   ├── sharing/
│   │   ├── generator.ts              # Shareable link generation
├── store/
│   ├── workflowStore.ts              # Zustand store for workflow state
│   ├── userStore.ts                  # User preferences & auth
├── constants/
│   ├── templates.ts                  # Pre-built workflow templates
│   ├── nodeTypes.ts                  # Node type definitions
├── __tests__/
│   ├── lib/
│   │   ├── executor.test.ts          # AI execution tests
│   │   ├── workflows.test.ts         # Workflow CRUD tests
│   │   ├── versions.test.ts          # Version history tests
│   ├── components/
│   │   ├── Canvas.test.tsx           # Canvas interaction tests
│   │   ├── Node.test.tsx             # Node rendering tests
├── app.json                          # Expo config
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### Core Logic Tests

**`__tests__/lib/executor.test.ts`**
- Test workflow execution with mock AI responses
- Test error handling for invalid nodes
- Test execution logging and step tracking

**`__tests__/lib/workflows.test.ts`**
- Test creating, reading, updating, deleting workflows
- Test workflow validation (no orphaned nodes, valid connections)
- Test workflow duplication

**`__tests__/lib/versions.test.ts`**
- Test auto-save on workflow changes
- Test version retrieval and restoration
- Test diff generation between versions

**`__tests__/components/Canvas.test.tsx`**
- Test node drag-and-drop positioning
- Test connection creation between nodes
- Test canvas pan and zoom gestures

**`__tests__/components/Node.test.tsx`**
- Test node rendering with different types
- Test node configuration modal
- Test node deletion

## 10. Implementation Steps

### Phase 1: Project Setup & Database (Day 1)

1. Initialize Expo project:
   ```bash
   npx create-expo-app flowforge --template tabs
   cd flowforge
   ```

2. Install dependencies:
   ```bash
   npx expo install expo-sqlite react-native-paper zustand react-native-svg react-native-gesture-handler react-native-reanimated
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```

3. Create SQLite schema in `lib/db/schema.ts`:
   - `workflows` table: id, name, description, nodes (JSON), connections (JSON), created_at, updated_at
   - `versions` table: id, workflow_id, snapshot (JSON), created_at
   - `executions` table: id, workflow_id, status, logs (JSON), created_at

4. Implement database initialization in `lib/db/queries.ts`:
   - `initDatabase()` to create tables
   - `migrateIfNeeded()` for schema updates

### Phase 2: Workflow Storage & State (Day 2)

5. Create Zustand store in `store/workflowStore.ts`:
   - State: `workflows`, `currentWorkflow`, `selectedNode`
   - Actions: `loadWorkflows()`, `createWorkflow()`, `updateWorkflow()`, `deleteWorkflow()`, `selectNode()`

6. Implement workflow CRUD in `lib/storage/workflows.ts`:
   - `getAllWorkflows()` - fetch from SQLite
   - `getWorkflowById(id)` - fetch single workflow
   - `saveWorkflow(workflow)` - insert or update
   - `deleteWorkflow(id)` - soft delete with flag

7. Implement version history in `lib/storage/versions.ts`:
   - `saveVersion(workflowId, snapshot)` - auto-save on change
   - `getVersions(workflowId)` - fetch all versions
   - `restoreVersion(versionId)` - revert to previous state

### Phase 3: Visual Workflow Editor (Days 3-4)

8. Create infinite canvas in `components/workflow/Canvas.tsx`:
   - Use `react-native-gesture-handler` for pan/zoom
   - Render nodes as draggable components
   - Draw connection lines with `react-native-svg`

9. Implement node component in `components/workflow/Node.tsx`:
   - Display node type icon and label
   - Show connection ports (input/output)
   - Handle tap to open configuration modal

10. Create node picker in `components/workflow/NodePicker.tsx`:
    - Bottom sheet with node categories (Triggers, AI Agents, Actions)
    - Tap to add node to canvas at center position

11. Implement connection logic:
    - Drag from output port to input port
    - Validate connection types (e.g., text output → text input)
    - Store connections in workflow state

### Phase 4: AI Execution Engine (Days 5-6)

12. Create executor in `lib/ai/executor.ts`:
    - `executeWorkflow(workflow, inputs)` - traverse nodes in order
    - For each node, call appropriate handler (trigger, AI, action)
    - Log each step with timestamp and result

13. Implement OpenAI wrapper in `lib/ai/openai.ts`:
    - `callGPT(prompt, context)` - send request to OpenAI API
    - Handle streaming responses for real-time feedback
    - Cache responses to reduce API calls during testing

14. Create test execution view in `app/workflow/test.tsx`:
    - Display execution logs in real-time
    - Show input/output for each node
    - Highlight errors with retry button

### Phase 5: Templates & Sharing (Day 7)

15. Define templates in `constants/templates.ts`:
    - Customer Support Bot (text input → GPT-4 → save conversation)
    - Lead Qualifier (form → GPT-4 scoring → conditional action)
    - Content Idea Generator (voice input → GPT-4 → save to notes)

16. Implement template library in `app/(tabs)/templates.tsx`:
    - Display templates as cards with preview
    - Tap to duplicate template into user's workflows

17. Create sharing generator in `lib/sharing/generator.ts`:
    - `generateShareLink(workflowId)` - create unique URL
    - Store link in database with expiration date
    - Generate QR code with `react-native-qrcode-svg`

### Phase 6: UI Polish & Settings (Day 8)

18. Implement home screen in `app/(tabs)/index.tsx`:
    - List workflows as cards with preview
    - Swipe to delete or duplicate
    - FAB button to create new workflow

19. Create settings screen in `app/(tabs)/settings.tsx`:
    - Account info (email, subscription status)
    - Usage stats (executions this month)
    - Export/import workflows as JSON

20. Add onboarding flow:
    - Welcome screen with app benefits
    - Quick tutorial on creating first workflow
    - Prompt to try a template

### Phase 7: Testing & Optimization (Day 9)

21. Write unit tests for all core logic:
    - Workflow CRUD operations
    - Version history
    - AI execution engine
    - Node validation

22. Write component tests:
    - Canvas interactions
    - Node rendering
    - Connection creation

23. Performance optimization:
    - Memoize node rendering with `React.memo`
    - Debounce auto-save to reduce database writes
    - Lazy load templates and version history

### Phase 8: Deployment Prep (Day 10)

24. Configure `app.json`:
    - Set app name, slug, version
    - Add iOS/Android icons and splash screens
    - Configure permissions (camera, microphone, location)

25. Build for testing:
    ```bash
    npx expo prebuild
    npx expo run:ios
    npx expo run:android
    ```

26. Submit to TestFlight/Google Play Internal Testing

## 11. How to Verify It Works

### Local Development

1. Start Expo dev server:
   ```bash
   npx expo start
   ```

2. Open in Expo Go on physical device or simulator

3. Verify core flows:
   - Create a new workflow from scratch
   - Add 3 nodes (Trigger → AI Agent → Action)
   - Connect nodes by dragging between ports
   - Tap "Test Flow" and verify execution logs appear
   - Save workflow and verify it appears on home screen
   - Duplicate a template and verify it's editable
   - Generate a share link and verify QR code displays

### Automated Tests

Run Jest test suite:
```bash
npm test
```

All tests must pass:
- Workflow CRUD operations (create, read, update, delete)
- Version history (save, restore, diff)
- AI execution (mock responses, error handling)
- Canvas interactions (drag, zoom, connect)
- Node rendering (different types, configuration)

### Manual Testing Checklist

- [ ] Create workflow with 5+ nodes
- [ ] Test workflow with real device sensors (camera, mic)
- [ ] Verify auto-save triggers after 2 seconds of inactivity
- [ ] Restore previous version and verify changes revert
- [ ] Share workflow via QR code and open on second device
- [ ] Delete workflow and verify it's removed from home screen
- [ ] Test on both iOS and Android
- [ ] Verify app works offline (local storage only)
- [ ] Test with poor network (AI calls should timeout gracefully)

### Performance Benchmarks

- Workflow with 20 nodes should render in <500ms
- Auto-save should complete in <100ms
- AI execution should start within 1 second of tapping "Test"
- Canvas should support 50+ nodes without lag