# ZenBlock

## One-line pitch
Block distractions, build focus habits, and stay accountable with friends—all in one beautifully simple app.

## Expanded vision

### Who is this REALLY for?
**Primary audience:** Anyone with a smartphone who feels their attention is being stolen (ages 16-50).

**Broadest reach:**
- **Students** cramming for exams or doing homework
- **Parents** wanting to model healthy phone habits for kids
- **Couples** doing "phone-free dinners" or quality time together
- **Fitness enthusiasts** blocking distractions during workouts
- **Creatives** (writers, designers, musicians) needing deep work sessions
- **People in recovery** from phone/social media addiction
- **Teams** (small businesses, study groups) wanting shared focus time

### Adjacent use cases:
- **Digital wellbeing coaching** — not just blocking, but understanding patterns
- **Relationship tool** — "focus together" mode for dates, family time
- **Productivity ritual builder** — morning routines, evening wind-downs
- **Accountability partner matching** — find strangers with similar goals
- **Gamified challenges** — leaderboards, streaks, badges for focus time

### Why non-technical people want this:
- "I want to stop scrolling Instagram before bed"
- "I need to be present with my kids after work"
- "My partner and I want phone-free date nights"
- "I'm tired of feeling addicted to my phone"

**The hook:** It's not a productivity tool—it's a *relationship* tool. With yourself, your goals, and the people you care about.

## Tech stack
- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **Background tasks:** expo-task-manager + expo-notifications
- **App blocking:** Deep linking + usage tracking (expo-device, react-native-app-usage for Android)
- **State management:** Zustand (lightweight, simple)
- **UI:** React Native Paper (Material Design)
- **Charts:** react-native-chart-kit
- **Testing:** Jest + React Native Testing Library
- **Calendar integration:** expo-calendar (optional, for auto-scheduling)

## Core features (MVP)

1. **Quick Focus Sessions**
   - Tap to start 25/50/90-minute focus blocks
   - Choose apps to block (social media, games, news)
   - Gentle notifications when you try to open blocked apps
   - Visual timer with progress ring

2. **Focus Together Mode**
   - Create or join a focus room with a code
   - See who's focusing in real-time (anonymous or friends)
   - Shared timer—if anyone quits early, everyone gets notified
   - Post-session stats: "You and 3 others stayed focused for 50 minutes"

3. **Habit Streaks & Insights**
   - Track daily focus time and longest streak
   - Simple charts: focus time by day/week, most blocked apps
   - Celebrate milestones (7-day streak, 10 hours total, etc.)
   - Weekly recap notification: "You focused 6.5 hours this week—23% more than last week!"

4. **Smart Scheduling**
   - Set recurring focus blocks (e.g., "weekdays 9-11am")
   - Auto-enable based on calendar events (optional)
   - "Do Not Disturb" mode syncs with phone settings

5. **Flexible Blocking**
   - "Strict mode" (can't disable mid-session) vs "Gentle mode" (can override with a 10-second delay)
   - Whitelist important apps (calls, messages, maps)
   - Emergency override button (requires typing "I need a break")

## Monetization strategy

### Free tier (the hook):
- Unlimited solo focus sessions
- Basic app blocking (up to 5 apps)
- 7-day streak tracking
- Join public focus rooms (but can't create private ones)

### Premium ($4.99/month or $39.99/year):
- **Unlimited app blocking** (block entire categories)
- **Private focus rooms** (invite friends, family, coworkers)
- **Advanced analytics** (heatmaps, productivity scores, app usage trends)
- **Smart scheduling** (calendar integration, auto-focus modes)
- **Custom focus modes** (work, study, family time, workout)
- **Ad-free experience**
- **Priority support**

### Why people stay subscribed:
- **Social lock-in:** Once you have a focus group with friends, you don't want to lose access
- **Data continuity:** Premium users see long-term trends (6+ months of insights)
- **Habit formation:** After 30 days of streaks, canceling feels like losing progress
- **Team use cases:** Small teams ($9.99/month for 5 users) for shared work sprints

### Price reasoning:
- Lower than competitors (Freedom is $6.99/month, Forest is $1.99 one-time but limited features)
- Annual discount (33% off) encourages commitment
- Team pricing opens B2B opportunity (study groups, small agencies)

## File structure

```
zenblock/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home (start focus session)
│   │   ├── together.tsx           # Focus Together rooms
│   │   ├── insights.tsx           # Streaks & analytics
│   │   └── settings.tsx           # Preferences, premium
│   ├── focus-session.tsx          # Active focus screen
│   ├── room/[code].tsx            # Join focus room by code
│   └── _layout.tsx
├── components/
│   ├── FocusTimer.tsx
│   ├── AppBlockList.tsx
│   ├── StreakCalendar.tsx
│   ├── RoomCard.tsx
│   └── PremiumPaywall.tsx
├── lib/
│   ├── db.ts                      # SQLite setup
│   ├── focus-engine.ts            # Core focus logic
│   ├── app-blocker.ts             # Block/unblock apps
│   ├── room-manager.ts            # Focus Together logic
│   └── analytics.ts               # Usage tracking
├── store/
│   └── useStore.ts                # Zustand state
├── constants/
│   └── presets.ts                 # Default focus durations, app lists
├── __tests__/
│   ├── focus-engine.test.ts
│   ├── room-manager.test.ts
│   └── analytics.test.ts
├── app.json
├── package.json
└── tsconfig.json
```

## Tests

### `__tests__/focus-engine.test.ts`
```typescript
import { startFocusSession, endFocusSession, canOverride } from '../lib/focus-engine';

describe('Focus Engine', () => {
  test('starts a focus session with correct duration', () => {
    const session = startFocusSession(25, ['instagram', 'twitter'], 'strict');
    expect(session.duration).toBe(25);
    expect(session.blockedApps).toHaveLength(2);
    expect(session.mode).toBe('strict');
  });

  test('prevents override in strict mode', () => {
    const session = startFocusSession(25, ['instagram'], 'strict');
    expect(canOverride(session)).toBe(false);
  });

  test('allows override in gentle mode after delay', () => {
    const session = startFocusSession(25, ['instagram'], 'gentle');
    expect(canOverride(session)).toBe(true);
  });
});
```

### `__tests__/room-manager.test.ts`
```typescript
import { createRoom, joinRoom, leaveRoom } from '../lib/room-manager';

describe('Room Manager', () => {
  test('creates a room with unique code', () => {
    const room = createRoom('Alice', 50);
    expect(room.code).toHaveLength(6);
    expect(room.duration).toBe(50);
    expect(room.participants).toContain('Alice');
  });

  test('allows joining an existing room', () => {
    const room = createRoom('Alice', 50);
    const updated = joinRoom(room.code, 'Bob');
    expect(updated.participants).toHaveLength(2);
  });

  test('removes participant when leaving', () => {
    const room = createRoom('Alice', 50);
    joinRoom(room.code, 'Bob');
    const updated = leaveRoom(room.code, 'Bob');
    expect(updated.participants).toHaveLength(1);
  });
});
```

### `__tests__/analytics.test.ts`
```typescript
import { calculateStreak, getTotalFocusTime } from '../lib/analytics';

describe('Analytics', () => {
  test('calculates streak correctly', () => {
    const sessions = [
      { date: '2026-03-16', duration: 25 },
      { date: '2026-03-15', duration: 50 },
      { date: '2026-03-14', duration: 25 },
    ];
    expect(calculateStreak(sessions)).toBe(3);
  });

  test('returns total focus time in minutes', () => {
    const sessions = [
      { duration: 25 },
      { duration: 50 },
      { duration: 25 },
    ];
    expect(getTotalFocusTime(sessions)).toBe(100);
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest zenblock --template tabs
cd zenblock
npm install expo-sqlite zustand react-native-paper react-native-chart-kit expo-notifications expo-task-manager expo-device
npm install -D jest @testing-library/react-native @types/jest
```

### 2. Database schema (`lib/db.ts`)
- Create SQLite tables:
  - `focus_sessions` (id, start_time, end_time, duration, mode, completed)
  - `blocked_apps` (id, session_id, app_name)
  - `rooms` (id, code, creator, duration, created_at)
  - `room_participants` (id, room_id, username, joined_at)
- Export functions: `initDB()`, `saveFocusSession()`, `getFocusSessions()`, `saveRoom()`, `getRooms()`

### 3. Focus engine (`lib/focus-engine.ts`)
- `startFocusSession(duration, blockedApps, mode)` → returns session object
- `endFocusSession(sessionId, completed)` → saves to DB
- `canOverride(session)` → checks mode and returns boolean
- `getActiveSession()` → retrieves current session from state
- Integrate with expo-notifications for reminders

### 4. App blocker (`lib/app-blocker.ts`)
- `blockApps(appList)` → uses deep linking to intercept app opens (iOS limited, Android via accessibility service)
- `unblockApps()` → clears block list
- `showBlockedAppAlert(appName)` → displays gentle nudge notification
- Note: Full blocking requires native modules; MVP uses notifications + honor system

### 5. Room manager (`lib/room-manager.ts`)
- `createRoom(username, duration)` → generates 6-char code, saves to DB
- `joinRoom(code, username)` → adds participant
- `leaveRoom(code, username)` → removes participant
- `getRoomStatus(code)` → returns active participants and time remaining
- Use polling (every 5s) to sync room state (future: WebSocket for real-time)

### 6. Analytics (`lib/analytics.ts`)
- `calculateStreak(sessions)` → counts consecutive days with focus sessions
- `getTotalFocusTime(sessions)` → sums durations
- `getWeeklyStats(sessions)` → groups by day, returns chart data
- `getMostBlockedApps(sessions)` → frequency analysis

### 7. Zustand store (`store/useStore.ts`)
- State: `activeSession`, `rooms`, `userStats`, `isPremium`
- Actions: `startSession()`, `endSession()`, `joinRoom()`, `leaveRoom()`, `loadStats()`

### 8. Home screen (`app/(tabs)/index.tsx`)
- Quick start buttons: 25min, 50min, 90min
- App selection modal (checkboxes for Instagram, Twitter, TikTok, etc.)
- Mode toggle: Strict vs Gentle
- "Start Focus" button → navigates to `focus-session.tsx`

### 9. Focus session screen (`app/focus-session.tsx`)
- Circular progress timer (react-native-chart-kit or custom SVG)
- Blocked apps list
- "End Early" button (shows confirmation if strict mode)
- Background task to track time even if app is closed

### 10. Focus Together screen (`app/(tabs)/together.tsx`)
- "Create Room" button → generates code, shows shareable link
- "Join Room" input → enter 6-char code
- Active rooms list (RoomCard components)
- Real-time participant count

### 11. Room detail screen (`app/room/[code].tsx`)
- Shared timer (synced across all participants)
- Participant avatars (initials or icons)
- "Leave Room" button
- Notification if someone quits early

### 12. Insights screen (`app/(tabs)/insights.tsx`)
- Streak calendar (StreakCalendar component)
- Total focus time (big number)
- Weekly chart (bar graph)
- Milestones section (badges for 7-day streak, 10 hours, etc.)

### 13. Settings screen (`app/(tabs)/settings.tsx`)
- Premium upgrade button (PremiumPaywall component)
- Notification preferences
- Default focus duration
- Blocked apps management
- Account/logout (future: auth)

### 14. Premium paywall (`components/PremiumPaywall.tsx`)
- Feature comparison table (Free vs Premium)
- "Upgrade Now" button → in-app purchase flow (expo-in-app-purchases)
- Annual discount badge

### 15. Background tasks
- Use expo-task-manager to run timer in background
- Send notification when focus session ends
- Update streak at midnight (daily check)

### 16. Notifications
- "Focus session complete!" with stats
- "You're on a 5-day streak!" (daily)
- "Someone left your focus room" (if in Together mode)
- Weekly recap (Sunday evening)

### 17. Polish
- Add haptic feedback (expo-haptics) for button presses
- Smooth animations (react-native-reanimated) for timer
- Dark mode support (React Native Paper theming)
- Onboarding flow (first-time user tutorial)

### 18. Testing
- Write unit tests for all `lib/` functions
- Run `npm test` to verify logic
- Manual testing on iOS simulator and Android device via Expo Go

## How to verify it works

### 1. Run tests
```bash
npm test
```
All tests in `__tests__/` must pass.

### 2. Start Expo dev server
```bash
npx expo start
```

### 3. Test on device/simulator
- **iOS Simulator:** Press `i` in terminal
- **Android Emulator:** Press `a` in terminal
- **Physical device:** Scan QR code with Expo Go app

### 4. Manual verification checklist
- [ ] Start a 25-minute focus session → timer counts down
- [ ] Select apps to block → see them in blocked list
- [ ] Try to override in strict mode → confirmation required
- [ ] Create a focus room → get shareable code
- [ ] Join room from another device → see participant count update
- [ ] Complete a session → see streak increment on Insights tab
- [ ] Check weekly chart → shows focus time by day
- [ ] Trigger premium paywall → see feature comparison
- [ ] Receive notification when session ends
- [ ] Background timer continues when app is minimized

### 5. Edge cases to test
- Start session, force quit app, reopen → session should resume
- Join room with invalid code → show error
- Complete 7 consecutive days → see "7-day streak" badge
- Try to start second session while one is active → prevent or warn
- Leave room mid-session → other participants notified

### 6. Performance check
- App should launch in <2 seconds
- Timer updates smoothly (60fps)
- Room sync happens within 5 seconds
- Database queries return in <100ms