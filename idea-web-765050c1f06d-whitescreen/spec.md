# FocusBlank

## One-line pitch
Transform your phone into a distraction-free workspace with a customizable blank canvas that replaces your chaotic home screen.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** Anyone who picks up their phone with intention but gets derailed by notifications, app icons, and visual clutter. This spans:

- **Students** (high school through grad school) who need focused study sessions without social media temptation
- **Remote workers and freelancers** who struggle with work-life boundaries on a single device
- **Parents** who want to model healthy phone habits for their kids
- **People with ADHD or anxiety** who find standard home screens overwhelming
- **Digital minimalists** who've tried app blockers but want something more elegant
- **Anyone doing a "dopamine detox"** or trying to break phone addiction

**Broadest audience:** The 2+ billion smartphone users who've ever thought "I spend too much time on my phone" but don't want to go full digital detox. This isn't just for productivity nerds — it's for anyone who wants their phone to be a tool, not a trap.

### Adjacent use cases

- **Bedtime mode:** A calming blank screen with sleep timer and white noise, replacing the temptation to scroll before bed
- **Meeting mode:** Quick-access widgets for note-taking, voice recording, and timer without leaving the launcher
- **Meditation/mindfulness:** Breathing exercises and ambient sounds accessible from the home screen
- **Parental controls:** Parents can set up a simplified, distraction-free launcher for their kids' devices
- **Digital wellbeing coaching:** Track screen time reduction and celebrate milestones

### Why non-technical people want this

No setup complexity. Install, set as default launcher, pick a vibe (minimal, warm, dark), and immediately feel calmer. It's like Marie Kondo for your phone — the app that helps you keep only what sparks productivity.

## Tech stack

- **React Native (Expo)** — cross-platform iOS/Android
- **expo-sqlite** — local storage for user preferences, widgets, focus sessions
- **expo-notifications** — gentle reminders and focus session alerts
- **react-native-reanimated** — smooth transitions between modes
- **zustand** — lightweight state management
- **date-fns** — time/date utilities for timers and analytics

Keep dependencies minimal. No heavy UI libraries — custom components for performance.

## Core features (MVP)

1. **Blank Canvas Launcher**
   - Replaces home screen with customizable solid color or subtle gradient
   - Swipe up to access app drawer (alphabetical, no icons visible on main screen)
   - Long-press to add widgets

2. **Focus Modes**
   - Pre-built modes: Work, Study, Relax, Sleep
   - Each mode has custom color scheme, allowed apps, and widgets
   - One-tap mode switching from blank screen

3. **Quick Widgets**
   - Minimal timer (Pomodoro-style)
   - Scratchpad (quick notes that auto-save)
   - Habit tracker (3 daily habits max)
   - All accessible without leaving the launcher

4. **Gentle Nudges**
   - Configurable reminders to return to focus mode
   - Screen time summary (daily/weekly) shown on blank screen
   - Celebration animations when hitting focus goals

5. **Theme Customization**
   - 5 free color palettes (monochrome, warm, cool, nature, night)
   - Premium: 20+ themes, custom colors, background textures

## Monetization strategy

**Free tier:**
- Blank launcher with 2 focus modes (Work, Relax)
- Basic widgets (timer, scratchpad)
- 5 color themes
- Daily screen time summary

**Premium ($3.99/month or $29.99/year):**
- Unlimited custom focus modes
- All 20+ premium themes + custom color picker
- Advanced widgets (habit tracker, breathing exercises, ambient sounds)
- Weekly analytics and insights
- Cloud sync across devices
- Priority support

**Why this price point:**
- Lower than meditation apps ($7-12/month) but higher than basic utilities ($0.99)
- Positions as a lifestyle tool, not just a launcher
- Annual plan offers 37% savings, encouraging long-term commitment

**Retention hooks:**
- Habit data and streaks (loss aversion)
- Personalized focus mode setups take time to perfect
- Weekly progress reports create emotional investment
- Cloud sync makes switching devices painful without premium

**Alternative revenue:**
- One-time theme packs ($1.99 each) for users who don't want subscriptions
- Lifetime unlock ($49.99) for early adopters

## File structure

```
focusblank/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Blank canvas home screen
│   │   ├── modes.tsx              # Focus mode selector
│   │   ├── widgets.tsx            # Widget configuration
│   │   └── settings.tsx           # App settings
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── BlankCanvas.tsx            # Main blank screen component
│   ├── FocusMode.tsx              # Focus mode card
│   ├── Widget.tsx                 # Base widget component
│   ├── Timer.tsx                  # Pomodoro timer widget
│   ├── Scratchpad.tsx             # Quick notes widget
│   ├── HabitTracker.tsx           # Habit tracking widget
│   └── ThemePicker.tsx            # Theme selection UI
├── store/
│   ├── useAppStore.ts             # Zustand store
│   └── types.ts                   # TypeScript types
├── utils/
│   ├── database.ts                # SQLite setup and queries
│   ├── notifications.ts           # Notification helpers
│   └── analytics.ts               # Screen time tracking
├── constants/
│   ├── themes.ts                  # Color palettes
│   └── focusModes.ts              # Default focus mode configs
├── __tests__/
│   ├── database.test.ts
│   ├── focusMode.test.ts
│   ├── timer.test.ts
│   └── analytics.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/database.test.ts`
```typescript
import { openDatabase, saveFocusMode, getFocusModes } from '../utils/database';

describe('Database operations', () => {
  it('should save and retrieve focus modes', async () => {
    const db = await openDatabase();
    const mode = {
      id: '1',
      name: 'Work',
      color: '#2C3E50',
      allowedApps: ['mail', 'calendar'],
    };
    
    await saveFocusMode(db, mode);
    const modes = await getFocusModes(db);
    
    expect(modes).toHaveLength(1);
    expect(modes[0].name).toBe('Work');
  });
});
```

### `__tests__/focusMode.test.ts`
```typescript
import { activateFocusMode, getCurrentMode } from '../store/useAppStore';

describe('Focus Mode', () => {
  it('should activate a focus mode', () => {
    const mode = { id: '1', name: 'Study', color: '#3498DB' };
    activateFocusMode(mode);
    
    const current = getCurrentMode();
    expect(current?.name).toBe('Study');
  });
});
```

### `__tests__/timer.test.ts`
```typescript
import { startTimer, getTimeRemaining } from '../components/Timer';

describe('Pomodoro Timer', () => {
  it('should start a 25-minute timer', () => {
    startTimer(25);
    const remaining = getTimeRemaining();
    
    expect(remaining).toBe(25 * 60);
  });
});
```

### `__tests__/analytics.test.ts`
```typescript
import { trackScreenTime, getDailyUsage } from '../utils/analytics';

describe('Screen Time Analytics', () => {
  it('should track daily screen time', async () => {
    await trackScreenTime('2026-03-16', 120); // 2 hours
    const usage = await getDailyUsage('2026-03-16');
    
    expect(usage).toBe(120);
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest focusblank --template blank-typescript
cd focusblank
npx expo install expo-sqlite expo-notifications react-native-reanimated zustand date-fns
npm install --save-dev jest @testing-library/react-native @types/jest
```

### 2. Configure app.json
- Set `"orientation": "portrait"`
- Add notification permissions
- Configure splash screen with blank theme
- Set up deep linking for focus mode shortcuts

### 3. Database setup (`utils/database.ts`)
- Create SQLite schema for focus modes, widgets, screen time logs
- Tables: `focus_modes`, `widgets`, `screen_time`, `habits`, `settings`
- Write CRUD functions for each table
- Add migration logic for future schema updates

### 4. State management (`store/useAppStore.ts`)
- Create Zustand store with slices:
  - `focusModeSlice`: active mode, mode list
  - `widgetSlice`: active widgets, widget data
  - `themeSlice`: current theme, custom colors
  - `analyticsSlice`: screen time data, streaks
- Persist state to SQLite on changes

### 5. Blank Canvas component (`components/BlankCanvas.tsx`)
- Full-screen view with animated gradient background
- Gesture handlers: swipe up for app drawer, long-press for widget menu
- Display current time and active focus mode name (subtle, top corner)
- Render active widgets in grid layout

### 6. Focus Mode system
- Create `FocusMode.tsx` component (card with color, name, description)
- Build mode selector screen (`app/(tabs)/modes.tsx`)
- Implement mode activation logic (update store, trigger notifications)
- Add default modes in `constants/focusModes.ts`

### 7. Widget system
- Base `Widget.tsx` component with drag-to-reorder
- Implement Timer widget with Pomodoro presets (25/5/15 min)
- Implement Scratchpad with auto-save to SQLite
- Implement HabitTracker with checkboxes and streak counter
- Widget configuration screen (`app/(tabs)/widgets.tsx`)

### 8. Theme system
- Define color palettes in `constants/themes.ts`
- Create `ThemePicker.tsx` with preview cards
- Implement custom color picker (premium feature)
- Apply theme to all components via context

### 9. Notifications (`utils/notifications.ts`)
- Request permissions on first launch
- Schedule gentle reminders based on focus mode
- Send daily summary notification with screen time stats
- Celebration notifications for hitting goals

### 10. Analytics (`utils/analytics.ts`)
- Track app opens and focus mode activations
- Calculate daily/weekly screen time reduction
- Store habit completion data
- Generate weekly insights (e.g., "You focused 30% more this week")

### 11. Settings screen (`app/(tabs)/settings.tsx`)
- Toggle notifications
- Manage premium subscription (mock for MVP)
- Export/import focus modes
- Reset app data

### 12. Onboarding flow
- 3-screen intro: problem → solution → setup
- Guide user to set as default launcher (Android) or widget (iOS)
- Let user pick first focus mode and theme
- Show quick tutorial on gestures

### 13. Premium paywall
- Create paywall modal triggered from theme picker and advanced widgets
- Mock subscription flow (integrate RevenueCat or similar later)
- Show feature comparison table

### 14. Polish
- Add haptic feedback to all interactions
- Smooth transitions between modes using `react-native-reanimated`
- Optimize performance (lazy load widgets, memoize components)
- Add loading states and error handling

### 15. Testing
- Write unit tests for database operations
- Test focus mode activation and switching
- Test timer logic and notifications
- Test analytics calculations
- Run `npm test` to verify all tests pass

## How to verify it works

### On device/simulator:
1. Run `npx expo start`
2. Scan QR code with Expo Go (iOS) or run on Android emulator
3. Complete onboarding flow
4. Verify blank canvas displays with current theme
5. Swipe up to see app drawer
6. Long-press to add a widget (timer or scratchpad)
7. Navigate to Modes tab and activate a focus mode
8. Verify theme changes and widgets update
9. Test timer widget: start 5-minute timer, verify countdown
10. Test scratchpad: type note, close app, reopen, verify note persists
11. Check Settings tab: toggle notifications, change theme
12. Verify screen time tracking in analytics (mock data for MVP)

### Automated tests:
```bash
npm test
```

All tests in `__tests__/` must pass:
- Database CRUD operations
- Focus mode activation
- Timer logic
- Analytics calculations

### Key success metrics:
- App launches without crashes
- Blank canvas renders in <1 second
- Widgets respond to interactions instantly
- Focus mode switching is smooth (no flicker)
- Data persists across app restarts
- All gestures work (swipe, long-press, drag)