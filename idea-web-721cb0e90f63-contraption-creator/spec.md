# MechaLab

## One-line pitch
Build, test, and share working machines in seconds — no engineering degree required.

## Expanded vision

### Who is this REALLY for?

**Primary audiences:**
- **Curious kids (8-14)** who want to understand how things work without reading textbooks
- **Parents** looking for screen time that's actually educational and engaging
- **Hobbyists and makers** (woodworkers, garage tinkerers, escape room designers) who want to prototype mechanical solutions before building them physically
- **Educators** needing interactive demos that work on any device without setup

**Adjacent use cases:**
- **Game designers** prototyping physics-based puzzle mechanics
- **Content creators** making satisfying Rube Goldberg videos for TikTok/Instagram
- **Engineering students** visualizing statics and dynamics problems
- **Therapists** using it as a calming, creative sandbox for neurodivergent clients

**Why non-technical people want this:**
- It's tactile and visual — drag, drop, tap to test. No code, no CAD complexity
- Instant gratification — see your contraption work (or hilariously fail) in real-time
- Social proof — share creations as videos, not static screenshots
- Low stakes — failure is fun, not frustrating

**The gap:**
Tinkercad is too CAD-focused. Kerbal is too game-y. Physics puzzle games don't let you CREATE. MechaLab is the first app that feels like playing with LEGO Technic on your phone — creative, educational, and shareable.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Physics engine:** Matter.js (2D physics, battle-tested, mobile-optimized)
- **Local storage:** SQLite (expo-sqlite) for saved contraptions
- **State management:** Zustand (lightweight, no boilerplate)
- **UI:** React Native Paper (Material Design, accessible)
- **Video export:** expo-av + expo-media-library
- **Analytics:** Expo built-in (no third-party trackers in MVP)

## Core features (MVP)

1. **Drag-and-drop sandbox** — 10 basic parts (ramps, wheels, ropes, weights, springs, levers, pulleys, gears, platforms, balls). Tap to place, pinch to resize, drag to connect. Hit "Play" to run physics simulation.

2. **One-tap video export** — Record your contraption in action (5-15 sec clips) and share directly to social media or save to camera roll. This is the viral loop.

3. **Guided tutorials** — 5 starter challenges ("Build a catapult," "Make a marble run," "Create a pulley system") with step-by-step hints. Unlocks confidence and teaches mechanics.

4. **Community gallery** — Browse and remix top contraptions from other users. One-tap "Open in MechaLab" button. No login required to browse.

5. **Premium materials pack** — Unlock 15 advanced parts (motors, magnets, hinges, chains, hydraulics) + cloud sync for $4.99/month. Free users get 3 saves max; premium gets unlimited.

## Monetization strategy

**Free tier (the hook):**
- Full access to 10 basic parts
- Unlimited play sessions
- 3 saved contraptions
- Video export with watermark
- Browse community gallery

**Premium ($4.99/month or $39.99/year):**
- 15 advanced parts (motors, sensors, etc.)
- Unlimited saves + cloud sync across devices
- Watermark-free video export
- Early access to new parts and tutorials
- "Teacher Mode" — create assignments and track student progress (targets educators)

**Why people stay subscribed:**
- Cloud sync means their creations are safe and portable
- New parts released monthly (FOMO)
- Teacher Mode is sticky for educators (school budgets pay annually)
- Advanced parts enable way cooler contraptions (social status in community)

**Price reasoning:**
$4.99 is impulse-buy territory for parents ("cheaper than a Happy Meal"). Annual discount incentivizes commitment. Teacher Mode at same price (no separate tier) keeps it simple and accessible for schools.

## File structure

```
mechalab/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Sandbox screen
│   │   ├── gallery.tsx            # Community gallery
│   │   └── tutorials.tsx          # Guided challenges
│   ├── _layout.tsx
│   └── contraption/[id].tsx       # View/edit saved contraption
├── components/
│   ├── Canvas.tsx                 # Matter.js physics canvas
│   ├── PartPalette.tsx            # Draggable parts menu
│   ├── PlaybackControls.tsx       # Play/pause/reset/record
│   ├── ContraptionCard.tsx        # Gallery item
│   └── TutorialOverlay.tsx        # Step-by-step hints
├── lib/
│   ├── physics.ts                 # Matter.js setup and helpers
│   ├── parts.ts                   # Part definitions (mass, friction, etc.)
│   ├── storage.ts                 # SQLite CRUD for contraptions
│   ├── video.ts                   # Video recording/export
│   └── store.ts                   # Zustand state management
├── __tests__/
│   ├── physics.test.ts
│   ├── parts.test.ts
│   ├── storage.test.ts
│   └── video.test.ts
├── assets/
│   ├── parts/                     # SVG icons for each part
│   └── tutorials/                 # Tutorial images/videos
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**lib/__tests__/physics.test.ts**
```typescript
import { createEngine, addPart, runSimulation } from '../physics';
import { PARTS } from '../parts';

describe('Physics Engine', () => {
  it('creates a Matter.js engine', () => {
    const engine = createEngine();
    expect(engine).toBeDefined();
    expect(engine.world).toBeDefined();
  });

  it('adds a ramp to the world', () => {
    const engine = createEngine();
    const ramp = addPart(engine, PARTS.RAMP, { x: 100, y: 100 });
    expect(ramp).toBeDefined();
    expect(engine.world.bodies).toContain(ramp);
  });

  it('simulates gravity on a ball', () => {
    const engine = createEngine();
    const ball = addPart(engine, PARTS.BALL, { x: 100, y: 0 });
    const initialY = ball.position.y;
    runSimulation(engine, 1000); // 1 second
    expect(ball.position.y).toBeGreaterThan(initialY);
  });
});
```

**lib/__tests__/parts.test.ts**
```typescript
import { PARTS, isPremiumPart } from '../parts';

describe('Parts Library', () => {
  it('defines all basic parts', () => {
    expect(PARTS.RAMP).toBeDefined();
    expect(PARTS.BALL).toBeDefined();
    expect(PARTS.WHEEL).toBeDefined();
  });

  it('identifies premium parts', () => {
    expect(isPremiumPart('MOTOR')).toBe(true);
    expect(isPremiumPart('RAMP')).toBe(false);
  });

  it('has correct physics properties for ball', () => {
    expect(PARTS.BALL.restitution).toBeGreaterThan(0.5); // Bouncy
    expect(PARTS.BALL.friction).toBeLessThan(0.1); // Low friction
  });
});
```

**lib/__tests__/storage.test.ts**
```typescript
import { saveContraption, loadContraption, deleteContraption } from '../storage';

describe('SQLite Storage', () => {
  it('saves and loads a contraption', async () => {
    const contraption = {
      name: 'Test Machine',
      parts: [{ type: 'RAMP', x: 100, y: 100 }],
    };
    const id = await saveContraption(contraption);
    const loaded = await loadContraption(id);
    expect(loaded.name).toBe('Test Machine');
    expect(loaded.parts).toHaveLength(1);
  });

  it('deletes a contraption', async () => {
    const id = await saveContraption({ name: 'Temp', parts: [] });
    await deleteContraption(id);
    const loaded = await loadContraption(id);
    expect(loaded).toBeNull();
  });
});
```

**lib/__tests__/video.test.ts**
```typescript
import { startRecording, stopRecording } from '../video';

describe('Video Export', () => {
  it('starts recording', async () => {
    const recording = await startRecording();
    expect(recording).toBeDefined();
    expect(recording.isRecording).toBe(true);
  });

  it('stops recording and returns URI', async () => {
    const recording = await startRecording();
    const uri = await stopRecording(recording);
    expect(uri).toMatch(/\.mp4$/);
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest mechalab --template tabs
cd mechalab
npm install matter-js zustand expo-sqlite react-native-paper expo-av expo-media-library
npm install -D @types/matter-js jest @testing-library/react-native
```

### 2. Configure app.json
Add permissions for camera roll and configure splash screen:
```json
{
  "expo": {
    "name": "MechaLab",
    "slug": "mechalab",
    "plugins": [
      [
        "expo-media-library",
        {
          "photosPermission": "Allow MechaLab to save your contraption videos."
        }
      ]
    ]
  }
}
```

### 3. Build physics engine (lib/physics.ts)
- Initialize Matter.js engine with gravity
- Create `addPart(engine, partType, position)` function
- Create `removePart(engine, body)` function
- Create `runSimulation(engine, deltaTime)` wrapper
- Export `createEngine()` factory

### 4. Define parts library (lib/parts.ts)
- Create `PARTS` object with 10 basic parts (RAMP, BALL, WHEEL, ROPE, WEIGHT, SPRING, LEVER, PULLEY, GEAR, PLATFORM)
- Each part has: `type`, `mass`, `friction`, `restitution`, `shape` (rectangle/circle/polygon), `color`, `isPremium`
- Export `isPremiumPart(type)` helper
- Add 15 premium parts (MOTOR, MAGNET, HINGE, CHAIN, HYDRAULIC, etc.) with `isPremium: true`

### 5. Build SQLite storage (lib/storage.ts)
- Create `contraptions` table: `id`, `name`, `parts` (JSON), `thumbnail` (base64), `createdAt`
- Implement `saveContraption(data)` → returns id
- Implement `loadContraption(id)` → returns contraption object
- Implement `listContraptions()` → returns array
- Implement `deleteContraption(id)`

### 6. Build Zustand store (lib/store.ts)
- State: `parts` (array of placed parts), `isPlaying` (bool), `selectedPart` (id or null), `isPremium` (bool)
- Actions: `addPart`, `removePart`, `updatePart`, `clearCanvas`, `togglePlay`, `setPremium`

### 7. Build Canvas component (components/Canvas.tsx)
- Use `react-native-svg` to render Matter.js bodies
- Map each body to SVG shape (Rect, Circle, Polygon)
- Update on `Matter.Events.afterUpdate`
- Handle pan/zoom gestures with `react-native-gesture-handler`
- Render grid background for reference

### 8. Build PartPalette component (components/PartPalette.tsx)
- Horizontal scrollable list of part icons
- Tap to select, drag onto canvas to place
- Show lock icon on premium parts if not subscribed
- Filter by category (Structure, Motion, Force)

### 9. Build PlaybackControls component (components/PlaybackControls.tsx)
- Play/Pause button (toggles physics simulation)
- Reset button (resets all parts to initial positions)
- Record button (starts video capture)
- Stop recording button (saves video to camera roll)
- Show recording indicator (red dot)

### 10. Build sandbox screen (app/(tabs)/index.tsx)
- Render Canvas, PartPalette, PlaybackControls
- Load contraption from route params if editing existing
- Auto-save every 30 seconds to SQLite
- Show "Save" button in header

### 11. Build video recording (lib/video.ts)
- Use `expo-av` to capture canvas as video
- Implement `startRecording(canvasRef)` → returns recording object
- Implement `stopRecording(recording)` → saves to camera roll, returns URI
- Add watermark overlay for free users (use `expo-gl` for compositing)

### 12. Build gallery screen (app/(tabs)/gallery.tsx)
- Grid of ContraptionCard components
- Load from SQLite (local saves) + mock API (community, hardcoded for MVP)
- Tap card to open in sandbox
- Show "Premium" badge on contraptions using premium parts

### 13. Build tutorials screen (app/(tabs)/tutorials.tsx)
- List of 5 challenges with thumbnail, title, difficulty
- Tap to open TutorialOverlay in sandbox
- TutorialOverlay shows step-by-step hints (text + highlight target area)
- Mark tutorial as complete when contraption passes validation (e.g., ball reaches target)

### 14. Build contraption detail screen (app/contraption/[id].tsx)
- Load contraption by id from SQLite
- Show metadata (name, created date)
- "Edit" button → opens in sandbox
- "Delete" button → confirms and removes
- "Share" button → exports video and opens share sheet

### 15. Add premium paywall
- Create `PremiumModal` component with feature list and "Subscribe" button
- Show modal when user taps locked premium part
- Mock subscription for MVP (toggle `isPremium` in store)
- Add "Restore Purchases" button

### 16. Polish UI
- Add haptic feedback on part placement/deletion
- Add sound effects (optional, use `expo-av`)
- Add dark mode support (react-native-paper theming)
- Add onboarding tooltip on first launch

### 17. Write tests
- Run `npm test` to verify all tests pass
- Add integration test for full contraption save/load cycle

## How to verify it works

### On device (Expo Go)
1. Install Expo Go on iOS or Android
2. Run `npx expo start`
3. Scan QR code with Expo Go
4. Test core flow:
   - Drag a ramp and ball onto canvas
   - Tap Play — ball should roll down ramp
   - Tap Record — red dot appears
   - Tap Stop — video saves to camera roll (check Photos app)
   - Tap Save — contraption appears in Gallery tab
   - Open Gallery → tap saved contraption → should load in sandbox
5. Test premium paywall:
   - Tap a locked part (motor) → modal appears
   - Toggle `isPremium` in store → locked parts become available

### On simulator
1. Run `npx expo start` and press `i` (iOS) or `a` (Android)
2. Same tests as device above
3. Video export may not work on simulator (use device for full test)

### Tests
```bash
npm test
```
All tests in `__tests__/` must pass. Verify:
- Physics engine creates bodies and simulates gravity
- Parts library correctly identifies premium parts
- SQLite saves and loads contraptions
- Video recording returns valid URI

### Performance check
- Canvas should render at 60fps with 20+ parts
- App should launch in <3 seconds on mid-range device
- Video export should complete in <10 seconds for 15-second clip