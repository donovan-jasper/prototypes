# SketchSync

## One-line pitch
Turn ideas into beautiful diagrams in seconds with AI-powered drawing and real-time team collaboration—all from your phone.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** Anyone who thinks visually but hates complex design tools.

- **Students** sketching study guides, mind maps, and project plans between classes
- **Freelancers and consultants** whiteboarding client ideas during coffee shop meetings
- **Parents and educators** creating visual lesson plans, chore charts, and family schedules
- **Small business owners** mapping workflows, org charts, and customer journeys without hiring designers
- **Hobbyists and makers** planning DIY projects, garden layouts, and event timelines

### What adjacent use cases does this enable?

Beyond "just drawing," SketchSync becomes:

- **A visual note-taking app** that replaces text-heavy apps with sketch-first thinking
- **A presentation builder** where hand-drawn slides feel authentic and engaging
- **A teaching tool** for tutors explaining concepts visually in real-time
- **A planning canvas** for life events (weddings, moves, renovations)
- **A social brainstorming space** where friends collaborate on trip itineraries or gift ideas

### Why would a non-technical person want this?

Because it removes the intimidation of "design software." You don't need to learn Figma or pay for Miro. Just draw like you would on paper, but with superpowers:

- **AI turns rough sketches into polished diagrams** (flowcharts, wireframes, org charts)
- **Templates for common needs** (weekly planners, project timelines, seating charts)
- **Instant sharing** via link—no account required for viewers
- **Offline-first** so you can sketch on planes, trains, or anywhere without WiFi

The magic is making visual thinking accessible to everyone, not just designers.

## Tech stack

- **React Native (Expo SDK 52+)** for iOS and Android
- **Expo Router** for file-based navigation
- **React Native Skia** for high-performance canvas drawing
- **SQLite (expo-sqlite)** for local storage of drawings and metadata
- **Expo FileSystem** for offline-first file management
- **Zustand** for lightweight state management
- **React Native Gesture Handler** for touch interactions
- **Expo Sharing** for export and collaboration
- **Optional: Supabase** for real-time sync and cloud storage (paid tier only)

## Core features (MVP)

1. **Touch-optimized canvas with hand-drawn feel**
   - Pressure-sensitive drawing with Apple Pencil/stylus support
   - Shape recognition (draw a circle, it snaps to perfect)
   - Undo/redo, layers, color palette

2. **AI diagram generator**
   - Text-to-diagram: "Create a flowchart for user onboarding"
   - Sketch-to-polish: Draw rough boxes and arrows, AI cleans them up
   - Smart templates: Pre-built layouts for common diagrams

3. **Offline-first with instant sync**
   - All drawings saved locally in SQLite
   - Optional cloud backup and real-time collaboration (paid)
   - Export as PNG, SVG, or shareable link

4. **Collaboration mode**
   - Generate a share link, others can view or edit in real-time
   - Cursor tracking shows who's drawing what
   - Comment threads on specific elements

5. **Template library**
   - Starter templates: mind maps, Kanban boards, wireframes, timelines
   - Community templates (user-submitted, curated)

## Monetization strategy

### Free tier (the hook)
- Unlimited local drawings (offline-only)
- Basic shapes and drawing tools
- Export as PNG
- 3 AI diagram generations per month
- View-only collaboration (can share links, others can view but not edit)

### Paid tier: $4.99/month or $39.99/year (the paywall)
- **Unlimited AI generations** (text-to-diagram, sketch-to-polish)
- **Real-time collaboration** with up to 10 editors per drawing
- **Cloud sync** across devices with 10GB storage
- **Advanced export** (SVG, PDF, Figma import)
- **Premium templates** and custom branding (remove watermark)
- **Version history** (restore previous versions)

### What makes people STAY subscribed?

- **AI becomes addictive** once you experience instant diagram generation
- **Cloud sync is essential** for multi-device users (phone → tablet → desktop web)
- **Collaboration locks in teams** (once your team is on it, switching is painful)
- **Templates save hours** for recurring tasks (weekly planning, client presentations)

### One-time purchase option
- $29.99 lifetime access to core features (no AI, no cloud sync)
- Targets users who want offline-only power tools without subscriptions

## File structure

```
sketchsync/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Gallery of drawings
│   │   ├── new.tsx                # Create new drawing
│   │   └── settings.tsx           # Settings and account
│   ├── canvas/[id].tsx            # Drawing canvas screen
│   ├── collaborate/[shareId].tsx  # Real-time collaboration view
│   └── _layout.tsx
├── components/
│   ├── Canvas.tsx                 # Main drawing canvas
│   ├── Toolbar.tsx                # Drawing tools (pen, shapes, colors)
│   ├── LayerPanel.tsx             # Layer management
│   ├── AIAssistant.tsx            # AI diagram generation UI
│   ├── CollaborationBar.tsx       # Active users and cursors
│   └── TemplateGallery.tsx        # Template browser
├── lib/
│   ├── db.ts                      # SQLite setup and queries
│   ├── drawing.ts                 # Drawing data models
│   ├── ai.ts                      # AI integration (OpenAI/Anthropic)
│   ├── sync.ts                    # Cloud sync logic (Supabase)
│   ├── export.ts                  # Export to PNG/SVG/PDF
│   └── collaboration.ts           # Real-time collaboration (WebSocket)
├── store/
│   └── useDrawingStore.ts         # Zustand store for canvas state
├── hooks/
│   ├── useCanvas.ts               # Canvas drawing logic
│   ├── useGestures.ts             # Touch gesture handlers
│   └── useCollaboration.ts        # Real-time sync hooks
├── constants/
│   ├── Colors.ts
│   └── Templates.ts               # Pre-built template definitions
├── __tests__/
│   ├── db.test.ts
│   ├── drawing.test.ts
│   ├── export.test.ts
│   └── ai.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/db.test.ts
import { openDatabase, createDrawing, getDrawings, deleteDrawing } from '../lib/db';

describe('Database operations', () => {
  it('should create and retrieve a drawing', async () => {
    const drawing = await createDrawing({ title: 'Test', data: '{}' });
    expect(drawing.id).toBeDefined();
    
    const drawings = await getDrawings();
    expect(drawings.length).toBeGreaterThan(0);
  });

  it('should delete a drawing', async () => {
    const drawing = await createDrawing({ title: 'Delete me', data: '{}' });
    await deleteDrawing(drawing.id);
    
    const drawings = await getDrawings();
    expect(drawings.find(d => d.id === drawing.id)).toBeUndefined();
  });
});

// __tests__/drawing.test.ts
import { serializeCanvas, deserializeCanvas, exportToPNG } from '../lib/drawing';

describe('Drawing serialization', () => {
  it('should serialize and deserialize canvas data', () => {
    const canvasData = { elements: [{ type: 'rect', x: 0, y: 0 }] };
    const serialized = serializeCanvas(canvasData);
    const deserialized = deserializeCanvas(serialized);
    
    expect(deserialized.elements.length).toBe(1);
    expect(deserialized.elements[0].type).toBe('rect');
  });
});

// __tests__/export.test.ts
import { exportToPNG, exportToSVG } from '../lib/export';

describe('Export functionality', () => {
  it('should export canvas to PNG', async () => {
    const mockCanvas = { elements: [] };
    const result = await exportToPNG(mockCanvas);
    
    expect(result).toBeDefined();
    expect(result.uri).toContain('.png');
  });
});

// __tests__/ai.test.ts
import { generateDiagram, polishSketch } from '../lib/ai';

describe('AI diagram generation', () => {
  it('should generate diagram from text prompt', async () => {
    const result = await generateDiagram('Create a simple flowchart');
    
    expect(result.elements).toBeDefined();
    expect(result.elements.length).toBeGreaterThan(0);
  });
});
```

## Implementation steps

### Phase 1: Project setup and database

1. Initialize Expo project with TypeScript
   ```bash
   npx create-expo-app sketchsync --template tabs
   cd sketchsync
   ```

2. Install dependencies
   ```bash
   npx expo install expo-sqlite expo-file-system expo-sharing
   npx expo install @shopify/react-native-skia react-native-gesture-handler
   npx expo install zustand
   npm install --save-dev jest @testing-library/react-native
   ```

3. Create SQLite database schema in `lib/db.ts`
   - Table: `drawings` (id, title, data, thumbnail, created_at, updated_at)
   - Table: `templates` (id, name, category, data, preview_url)
   - Functions: `createDrawing`, `getDrawings`, `updateDrawing`, `deleteDrawing`

4. Write tests for database operations in `__tests__/db.test.ts`

### Phase 2: Canvas and drawing engine

5. Build `Canvas.tsx` component using React Native Skia
   - Initialize Skia canvas with touch event handlers
   - Implement basic drawing tools: pen, eraser, shapes (rectangle, circle, line)
   - Add color picker and stroke width controls

6. Create `Toolbar.tsx` with tool selection UI
   - Tool buttons: pen, shapes, eraser, select, text
   - Color palette with preset colors
   - Undo/redo buttons

7. Implement gesture handling in `hooks/useGestures.ts`
   - Pan gesture for moving canvas
   - Pinch gesture for zoom
   - Long press for context menu

8. Create Zustand store in `store/useDrawingStore.ts`
   - State: current tool, color, stroke width, canvas elements, undo/redo stack
   - Actions: addElement, removeElement, updateElement, undo, redo

### Phase 3: Drawing persistence and gallery

9. Build gallery screen in `app/(tabs)/index.tsx`
   - Grid view of drawing thumbnails
   - Pull-to-refresh to reload from database
   - Swipe actions: delete, duplicate, share

10. Create canvas screen in `app/canvas/[id].tsx`
    - Load drawing data from SQLite by ID
    - Render canvas with loaded elements
    - Auto-save on changes (debounced)

11. Implement drawing serialization in `lib/drawing.ts`
    - `serializeCanvas`: Convert canvas state to JSON string
    - `deserializeCanvas`: Parse JSON and reconstruct canvas
    - `generateThumbnail`: Create preview image for gallery

12. Write tests for drawing operations in `__tests__/drawing.test.ts`

### Phase 4: Export functionality

13. Build export module in `lib/export.ts`
    - `exportToPNG`: Render canvas to PNG using Skia's snapshot API
    - `exportToSVG`: Convert canvas elements to SVG markup
    - Use `expo-sharing` to share exported files

14. Add export button to canvas toolbar
    - Show modal with export options (PNG, SVG)
    - Display success message after export

15. Write tests for export in `__tests__/export.test.ts`

### Phase 5: AI integration (optional for MVP, can be stubbed)

16. Create AI module in `lib/ai.ts`
    - `generateDiagram(prompt: string)`: Call OpenAI API to generate diagram JSON
    - `polishSketch(elements)`: Send rough sketch, receive cleaned-up version
    - Handle API errors and rate limiting

17. Build `AIAssistant.tsx` component
    - Text input for diagram prompt
    - "Generate" button that calls AI and adds elements to canvas
    - Loading state and error handling

18. Write tests for AI in `__tests__/ai.test.ts` (mock API calls)

### Phase 6: Templates

19. Define template data in `constants/Templates.ts`
    - Array of template objects with name, category, preview, and element data
    - Categories: Mind Maps, Flowcharts, Wireframes, Timelines, Kanban

20. Build `TemplateGallery.tsx` component
    - Horizontal scrollable list of template cards
    - Tap to create new drawing from template

21. Add "New from template" button to gallery screen

### Phase 7: Collaboration (paid feature, can be stubbed for MVP)

22. Set up Supabase project for real-time sync
    - Create `drawings` table with RLS policies
    - Create `collaborators` table for share links

23. Implement sync logic in `lib/sync.ts`
    - `uploadDrawing`: Save drawing to Supabase
    - `syncDrawing`: Subscribe to real-time updates
    - Conflict resolution for simultaneous edits

24. Build collaboration UI in `components/CollaborationBar.tsx`
    - Show active users with avatars
    - Display remote cursors on canvas

25. Create share link screen in `app/collaborate/[shareId].tsx`
    - Generate shareable link
    - Handle view-only vs edit permissions

### Phase 8: Settings and monetization

26. Build settings screen in `app/(tabs)/settings.tsx`
    - Account info (if logged in)
    - Subscription status and upgrade button
    - Export all drawings, clear cache

27. Integrate in-app purchases (Expo's `expo-in-app-purchases`)
    - Define subscription products in App Store Connect / Google Play Console
    - Implement purchase flow and receipt validation

28. Add paywall UI for premium features
    - Show upgrade prompt when AI limit reached
    - Lock collaboration features behind subscription

### Phase 9: Polish and testing

29. Add loading states and error boundaries
    - Skeleton loaders for gallery
    - Error messages for failed saves/exports

30. Implement offline detection
    - Show banner when offline
    - Queue sync operations for when online

31. Run all tests with `npm test` and fix failures

32. Test on physical devices (iOS and Android)
    - Verify touch gestures work smoothly
    - Check performance with large drawings

## How to verify it works

### Local development

1. Start Expo dev server:
   ```bash
   npx expo start
   ```

2. Open Expo Go app on your phone and scan QR code

3. Test core flows:
   - Create a new drawing → should open canvas
   - Draw shapes and lines → should render smoothly
   - Save drawing → should appear in gallery
   - Export as PNG → should save to device
   - Delete drawing → should remove from gallery

### Automated tests

4. Run Jest tests:
   ```bash
   npm test
   ```

5. All tests in `__tests__/` must pass:
   - Database CRUD operations
   - Drawing serialization/deserialization
   - Export to PNG/SVG
   - AI diagram generation (mocked)

### Device testing

6. Test on iOS simulator:
   ```bash
   npx expo run:ios
   ```

7. Test on Android emulator:
   ```bash
   npx expo run:android
   ```

8. Verify gestures:
   - Pinch to zoom should scale canvas
   - Pan should move viewport
   - Drawing should feel responsive (no lag)

9. Test offline mode:
   - Enable airplane mode
   - Create and save drawings → should work
   - Turn on WiFi → drawings should sync (if logged in)

### Success criteria

- Gallery loads and displays thumbnails within 1 second
- Drawing feels smooth at 60fps on mid-range devices
- Exported PNGs are high-resolution and accurate
- All Jest tests pass with >80% code coverage
- App launches in under 3 seconds on device