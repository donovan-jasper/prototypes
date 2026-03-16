# FlowDeck

## One-line pitch
Your phone, organized by what you're doing — not just where apps live.

## Expanded vision

**Core audience expansion:**
This isn't just for power users. It's for anyone who feels overwhelmed by their phone.

- **Parents juggling work/life:** One swipe to "Work Mode" (Slack, email, calendar), another to "Family Mode" (photos, messaging, school apps)
- **Students:** "Study Mode" surfaces notes, research apps, timers; "Break Mode" shows social and entertainment
- **Gig workers/freelancers:** Context-switch between client projects with dedicated app collections per client
- **Anyone with ADHD or focus issues:** Reduce cognitive load by hiding distractions based on time/location/activity
- **Travelers:** Auto-switch to "Travel Mode" when at airport (boarding passes, maps, translation apps)

**Adjacent use cases:**
- **Digital wellbeing:** Hide social media during work hours, surface meditation apps in evening
- **Accessibility:** Larger icons, voice-activated mode switching for users with motor impairments
- **Family sharing:** Parents create curated "Kids Mode" with approved apps only
- **Routine automation:** Morning routine surfaces news/weather/fitness; bedtime routine hides work apps

**Non-technical appeal:**
You don't need to understand "workflows" — you just tell FlowDeck "I'm working" or "I'm relaxing" and it shows you the right stuff. It's like having multiple phones in one, without the clutter.

## Tech stack

- **Framework:** React Native (Expo) — cross-platform iOS/Android
- **Local storage:** SQLite (expo-sqlite) for app configurations, modes, and user preferences
- **State management:** Zustand (lightweight, minimal boilerplate)
- **UI:** React Native Paper (Material Design components)
- **Navigation:** React Navigation
- **Permissions:** expo-application, expo-device for app listing (Android only — iOS doesn't allow custom launchers, so pivot to widget-based quick launcher)
- **Cloud sync (premium):** Supabase (auth + storage)
- **Analytics:** Expo Analytics (privacy-focused)

**Platform note:** Since iOS doesn't support custom launchers, FlowDeck on iOS becomes a widget-based quick launcher + Shortcuts integration. Android gets the full launcher experience.

## Core features (MVP)

1. **Context Modes** — Create unlimited modes (Work, Focus, Gym, Travel, etc.). Each mode shows only relevant apps. Switch with one tap or auto-trigger by time/location.

2. **Smart App Grouping** — AI-suggested app collections based on usage patterns (e.g., "You always open Spotify after Strava — create a Workout mode?")

3. **Gesture Shortcuts** — Swipe patterns to launch app combinations (swipe up = open email + calendar side-by-side on Android)

4. **Focus Timer Integration** — Built-in Pomodoro timer that auto-enables Focus mode and hides distracting apps

5. **Widget Dashboard (iOS) / Home Screen Replacement (Android)** — iOS gets a Today widget with mode switcher + favorite apps; Android gets full launcher replacement

## Monetization strategy

**Free tier:**
- 3 custom modes
- Basic app grouping
- Manual mode switching
- No ads

**Premium ($3.99/month or $24.99/year):**
- Unlimited modes
- Auto-switching (time/location/calendar-based)
- Cloud sync across devices
- Advanced gestures
- Custom themes
- Focus timer with analytics
- Priority support

**Pricing reasoning:**
- Lower than Nova Launcher Prime ($4.99 one-time) to encourage subscription
- Cheaper than productivity apps (Notion $10/mo, Todoist $5/mo) because it's a utility, not a content platform
- Annual discount (48% off) drives long-term retention

**Retention hooks:**
- Cloud sync makes switching devices seamless (lock-in)
- Usage analytics show time saved ("You've saved 2 hours this month by staying focused")
- Habit formation — after 2 weeks of using modes, going back to default launcher feels chaotic

## Market position

**NOT SKIP — here's why:**

Competitors (Nova, Microsoft Launcher) focus on *aesthetics* (icon packs, animations). FlowDeck focuses on *behavior change* (context-switching, focus).

**Gap:** No launcher treats modes as first-class citizens. They're all about customization for its own sake, not productivity outcomes.

**Advantage:** We're not competing with launchers — we're competing with the chaos of modern phone usage. Our competitor is the default experience, not Nova.

## File structure

```
flowdeck/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home (current mode view)
│   │   ├── modes.tsx              # Mode management
│   │   └── settings.tsx           # Settings & premium
│   ├── _layout.tsx
│   └── modal.tsx                  # Mode editor modal
├── components/
│   ├── AppIcon.tsx                # App icon with gesture handlers
│   ├── ModeCard.tsx               # Mode selector card
│   ├── FocusTimer.tsx             # Pomodoro timer
│   └── GestureCanvas.tsx          # Gesture recognition overlay
├── lib/
│   ├── database.ts                # SQLite setup & queries
│   ├── appManager.ts              # Get installed apps (Android)
│   ├── modeEngine.ts              # Mode switching logic
│   ├── gestureRecognizer.ts       # Gesture pattern matching
│   └── syncService.ts             # Cloud sync (premium)
├── hooks/
│   ├── useApps.ts                 # Fetch & filter apps
│   ├── useModes.ts                # Mode CRUD operations
│   └── useFocusTimer.ts           # Timer state management
├── store/
│   └── appStore.ts                # Zustand global state
├── types/
│   └── index.ts                   # TypeScript interfaces
├── __tests__/
│   ├── modeEngine.test.ts
│   ├── gestureRecognizer.test.ts
│   └── database.test.ts
├── app.json
├── package.json
└── tsconfig.json
```

## Tests

**__tests__/modeEngine.test.ts**
```typescript
import { switchMode, getActiveMode, shouldAutoSwitch } from '../lib/modeEngine';

describe('Mode Engine', () => {
  test('switches to specified mode', () => {
    const mode = { id: '1', name: 'Work', appIds: ['com.slack'] };
    switchMode(mode);
    expect(getActiveMode()).toEqual(mode);
  });

  test('auto-switches based on time trigger', () => {
    const workMode = { 
      id: '1', 
      name: 'Work', 
      triggers: { time: { start: '09:00', end: '17:00' } } 
    };
    const now = new Date('2026-03-16T10:00:00');
    expect(shouldAutoSwitch(workMode, now)).toBe(true);
  });
});
```

**__tests__/gestureRecognizer.test.ts**
```typescript
import { recognizeGesture } from '../lib/gestureRecognizer';

describe('Gesture Recognizer', () => {
  test('recognizes swipe up pattern', () => {
    const points = [
      { x: 100, y: 500 },
      { x: 100, y: 100 }
    ];
    expect(recognizeGesture(points)).toBe('swipe_up');
  });

  test('recognizes L-shape pattern', () => {
    const points = [
      { x: 100, y: 100 },
      { x: 100, y: 300 },
      { x: 300, y: 300 }
    ];
    expect(recognizeGesture(points)).toBe('l_shape');
  });
});
```

**__tests__/database.test.ts**
```typescript
import { initDatabase, saveMode, getModes } from '../lib/database';

describe('Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('saves and retrieves modes', async () => {
    const mode = { name: 'Focus', appIds: ['com.app1'], color: '#FF0000' };
    await saveMode(mode);
    const modes = await getModes();
    expect(modes).toContainEqual(expect.objectContaining(mode));
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app flowdeck --template tabs
cd flowdeck
npm install expo-sqlite zustand react-native-paper react-native-gesture-handler
npm install -D jest @testing-library/react-native
```

### 2. Database layer (`lib/database.ts`)
- Initialize SQLite with tables: `modes`, `apps`, `gestures`, `settings`
- Schema:
  - `modes`: id, name, color, icon, appIds (JSON), triggers (JSON), createdAt
  - `apps`: packageName, label, icon (base64), lastUsed
  - `gestures`: id, pattern (JSON), action (modeId or appId)
- Export functions: `initDatabase()`, `saveMode()`, `getModes()`, `deleteMode()`, `saveGesture()`

### 3. App manager (`lib/appManager.ts`)
- Android: Use `expo-application` + native module to list installed apps
- iOS: Return empty array (explain limitation in UI)
- Export `getInstalledApps()` returning `{ packageName, label, icon }[]`
- Cache results in SQLite `apps` table

### 4. Mode engine (`lib/modeEngine.ts`)
- `switchMode(mode)`: Update global state, filter apps, save to DB
- `getActiveMode()`: Return current mode from state
- `shouldAutoSwitch(mode, currentTime, currentLocation)`: Check triggers
- `autoSwitchDaemon()`: Background task (every 5 min) to check triggers
- Export all functions

### 5. Gesture recognizer (`lib/gestureRecognizer.ts`)
- `recognizeGesture(points: {x, y}[])`: Analyze point sequence
- Patterns: `swipe_up`, `swipe_down`, `l_shape`, `circle`
- Use simple vector math (angle, distance) — no ML needed for MVP
- Return pattern name or `null`

### 6. Zustand store (`store/appStore.ts`)
```typescript
interface AppState {
  activeMode: Mode | null;
  modes: Mode[];
  apps: App[];
  isPremium: boolean;
  setActiveMode: (mode: Mode) => void;
  addMode: (mode: Mode) => void;
  // ... other actions
}
```

### 7. Home screen (`app/(tabs)/index.tsx`)
- Display apps from `activeMode.appIds`
- Grid layout with `AppIcon` components
- Floating action button to switch modes
- Show mode name at top
- If no mode active, show "Create your first mode" onboarding

### 8. Mode management (`app/(tabs)/modes.tsx`)
- List all modes as cards (`ModeCard` component)
- Tap to activate, long-press to edit
- "+" button opens modal to create new mode
- Show app count and last used time per mode

### 9. Mode editor modal (`app/modal.tsx`)
- Form: name, color picker, icon selector
- App selector (searchable list with checkboxes)
- Trigger settings (time range, location — premium only)
- Save button writes to DB and updates store

### 10. App icon component (`components/AppIcon.tsx`)
- Display app icon + label
- `onPress`: Launch app (use `Linking.openURL()` with package scheme)
- `onLongPress`: Show context menu (remove from mode, app info)
- Wrap in `GestureDetector` for custom gestures

### 11. Focus timer (`components/FocusTimer.tsx`)
- 25/5 min Pomodoro intervals
- Start button enables Focus mode (if exists) and hides distracting apps
- Show notification when timer ends
- Premium: Track focus sessions, show weekly stats

### 12. Settings screen (`app/(tabs)/settings.tsx`)
- Premium upsell card at top
- Toggle: Auto-switch modes, Show timer, Dark mode
- Export/import modes (JSON file)
- About section with version, privacy policy link

### 13. Cloud sync (`lib/syncService.ts` — premium only)
- Supabase setup: `modes` table with userId foreign key
- `syncUp()`: Upload local modes to cloud
- `syncDown()`: Download and merge cloud modes
- Conflict resolution: Last-write-wins
- Call on app launch and mode save

### 14. Premium paywall
- Use Expo's in-app purchases (expo-in-app-purchases)
- Show paywall when user tries to:
  - Create 4th mode (free = 3 max)
  - Enable auto-switching
  - Access cloud sync
- Modal with benefits list + "Start Free Trial" button (7 days)

### 15. Android launcher integration
- Create `android/app/src/main/AndroidManifest.xml` intent filters:
```xml
<intent-filter>
  <action android:name="android.intent.action.MAIN" />
  <category android:name="android.intent.category.HOME" />
  <category android:name="android.intent.category.DEFAULT" />
</intent-filter>
```
- On first launch, prompt user to set as default launcher

### 16. iOS widget (iOS only)
- Create Today widget with mode switcher
- Show 4 favorite apps per mode
- Tap app icon to launch (use URL schemes)
- Tap mode name to open FlowDeck app

### 17. Onboarding flow
- 3 screens:
  1. "Your phone, organized by context" (illustration)
  2. "Create modes for work, focus, travel..." (examples)
  3. "Let's create your first mode" (guided setup)
- Skip button (save progress to DB)

### 18. Polish
- Add haptic feedback on mode switch
- Smooth animations (Reanimated) for mode transitions
- Empty states with helpful CTAs
- Error handling (app not found, permission denied)

### 19. Testing
- Write tests for `modeEngine`, `gestureRecognizer`, `database`
- Run `npm test` — all must pass
- Manual testing:
  - Create 3 modes with different apps
  - Switch between modes (apps update correctly)
  - Test gestures (if implemented)
  - Test timer (starts/stops, enables Focus mode)
  - Test premium paywall (blocks 4th mode)

### 20. Build & deploy
- Android: `eas build --platform android --profile preview`
- iOS: `eas build --platform ios --profile preview`
- Test on physical devices (Expo Go for dev, standalone for launcher features)
- Submit to Play Store (Android) and App Store (iOS widget version)

## How to verify it works

### Development testing
1. **Start dev server:**
   ```bash
   npx expo start
   ```

2. **Test on Android (full launcher):**
   - Open Expo Go on Android device
   - Scan QR code
   - Grant app list permission when prompted
   - Create a mode with 3-5 apps
   - Verify apps appear in grid
   - Tap app icon → should launch app
   - Switch to another mode → apps update

3. **Test on iOS (widget version):**
   - Open Expo Go on iPhone
   - Scan QR code
   - Explain that iOS doesn't support custom launchers
   - Show widget mockup in app
   - Test mode switching within app

4. **Test mode creation:**
   - Tap "+" on Modes tab
   - Enter name, pick color
   - Select 5 apps from list
   - Save → mode appears in list
   - Activate mode → home screen updates

5. **Test focus timer:**
   - Start 25-min timer
   - Verify Focus mode activates (if exists)
   - Background app → notification should persist
   - Timer ends → notification fires

6. **Test premium paywall:**
   - Create 3 modes (should work)
   - Try to create 4th → paywall appears
   - Try to enable auto-switch → paywall appears

### Automated testing
```bash
npm test
```
All tests in `__tests__/` must pass:
- Mode switching logic
- Gesture recognition
- Database CRUD operations

### Production verification (post-build)
1. Install APK on Android device
2. Set FlowDeck as default launcher (Home button → FlowDeck)
3. Press Home → FlowDeck appears (not stock launcher)
4. Create mode, add apps, verify launch behavior
5. Test auto-switch (set time trigger, wait for trigger time)
6. Purchase premium → verify cloud sync works (create mode on device A, appears on device B)

**Success criteria:**
- App launches without crashes
- Mode switching updates UI within 500ms
- Apps launch correctly from FlowDeck
- Premium features locked behind paywall
- All Jest tests pass
- No console errors in Expo dev tools