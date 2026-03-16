# ZenSprint

## One-line pitch
Your AI focus coach that turns work sessions into rewarding sprints—with voice guidance, streak tracking, and friends who keep you accountable.

## Expanded vision

**Who is this REALLY for?**

This serves anyone who struggles with the gap between intention and execution:

- **Students** cramming for exams or writing papers who need external accountability
- **Remote workers** battling home distractions (kids, chores, Netflix)
- **Freelancers and gig workers** who lack structure and need self-imposed deadlines
- **ADHD/neurodivergent users** who benefit from external cues and gamification
- **Parents** trying to carve out focused time while managing household chaos
- **Career changers** learning new skills who need motivation to stay consistent
- **Anyone building a side project** who needs help protecting their "deep work" time

**Adjacent use cases:**

- **Fitness accountability** — voice coaching during home workouts
- **Meditation/mindfulness** — guided focus sessions that aren't just timers
- **Language learning** — focused study sprints with voice encouragement
- **Creative work** — writers, designers, musicians who need flow state triggers
- **Habit stacking** — pairing focus sessions with other routines (morning coffee + 25min sprint)

**Why non-technical people want this:**

It's not a "productivity tool" — it's a **personal coach in your pocket**. No complex setup, no spreadsheets, no guilt. Just press start, hear an encouraging voice, and get rewarded for showing up. The social layer makes it feel like a fitness class for your brain.

## Tech stack

- **React Native (Expo SDK 52+)** — cross-platform iOS/Android
- **Expo AV** — background audio playback for voice coaching
- **Expo Speech** — text-to-speech for dynamic voice generation
- **Expo Notifications** — push reminders and streak alerts
- **SQLite (expo-sqlite)** — local session history, streaks, rewards
- **Expo SecureStore** — user preferences and premium status
- **React Navigation** — tab + stack navigation
- **Zustand** — lightweight state management
- **date-fns** — date/time utilities for streaks and analytics

## Core features (MVP)

1. **Voice-guided focus sessions**
   - Start a sprint (5/15/25/45 min presets or custom)
   - AI coach speaks at start, midpoint, and end with encouragement
   - Background audio continues even when phone is locked
   - Pause/resume with voice feedback

2. **Streak & reward system**
   - Track daily/weekly streaks (visual calendar)
   - Earn points per completed session (longer = more points)
   - Unlock voice packs (motivational, chill, drill sergeant) and themes
   - Level up system (Bronze → Silver → Gold → Diamond)

3. **Accountability pods**
   - Create or join small groups (3-8 people)
   - See when pod members are in active sessions (live status)
   - Weekly leaderboard with friendly competition
   - Send quick "you got this" nudges to pod mates

4. **Smart reminders**
   - Set daily focus time goals
   - Adaptive notifications based on completion patterns
   - "You're on a 7-day streak — don't break it!" alerts

5. **Session analytics**
   - Total focus time (daily/weekly/monthly)
   - Most productive hours heatmap
   - Completion rate trends
   - Export data as CSV (premium)

## Monetization strategy

**Free tier (hook):**
- Unlimited 25-minute Pomodoro sessions
- 1 default voice pack (neutral/friendly)
- Basic streak tracking (7-day view)
- Join 1 accountability pod
- See weekly stats only

**Premium ($7.99/month or $59.99/year):**
- Custom session lengths (5-120 min)
- 8 premium voice packs (celebrity-style, ASMR, coach personas)
- Unlimited pods + create private pods
- Full analytics dashboard with exports
- Priority voice synthesis (faster, higher quality)
- Offline mode (pre-download voice clips)
- No ads (free tier shows occasional sponsor messages)

**Why people stay subscribed:**
- **Sunk cost of streaks** — losing a 90-day streak feels painful
- **Pod accountability** — letting down your group creates social pressure
- **Voice pack attachment** — users bond with their favorite coach persona
- **Data insights** — seeing productivity patterns is addictive
- **Annual discount** — 37% savings incentivizes yearly commitment

**Additional revenue:**
- **One-time voice pack purchases** ($2.99 each for non-subscribers)
- **Corporate team plans** ($49.99/mo for 10 users) with admin dashboard

## File structure

```
zensprint/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Start Session
│   │   ├── stats.tsx              # Analytics
│   │   ├── pods.tsx               # Accountability groups
│   │   └── profile.tsx            # Settings/Premium
│   ├── session/
│   │   └── active.tsx             # Active session screen
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── SessionTimer.tsx
│   ├── VoiceCoach.tsx
│   ├── StreakCalendar.tsx
│   ├── PodCard.tsx
│   ├── StatsChart.tsx
│   └── PremiumGate.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── voice.ts                   # TTS logic
│   ├── notifications.ts           # Push notification handlers
│   ├── audio.ts                   # Background audio manager
│   └── analytics.ts               # Session tracking logic
├── store/
│   └── useStore.ts                # Zustand state
├── constants/
│   ├── VoicePacks.ts
│   └── Rewards.ts
├── __tests__/
│   ├── database.test.ts
│   ├── voice.test.ts
│   ├── analytics.test.ts
│   └── SessionTimer.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

**`__tests__/database.test.ts`**
```typescript
import { openDatabase, createSession, getStreak } from '../lib/database';

describe('Database', () => {
  it('creates a session record', async () => {
    const db = await openDatabase();
    const sessionId = await createSession(db, 25, 'default');
    expect(sessionId).toBeGreaterThan(0);
  });

  it('calculates streak correctly', async () => {
    const db = await openDatabase();
    const streak = await getStreak(db);
    expect(streak).toBeGreaterThanOrEqual(0);
  });
});
```

**`__tests__/voice.test.ts`**
```typescript
import { generateCoachingMessage, getVoicePack } from '../lib/voice';

describe('Voice Coach', () => {
  it('generates start message', () => {
    const msg = generateCoachingMessage('start', 25, 'motivational');
    expect(msg).toContain('25');
    expect(msg.length).toBeGreaterThan(10);
  });

  it('returns valid voice pack', () => {
    const pack = getVoicePack('default');
    expect(pack).toHaveProperty('name');
    expect(pack).toHaveProperty('pitch');
  });
});
```

**`__tests__/analytics.test.ts`**
```typescript
import { calculateTotalFocusTime, getMostProductiveHour } from '../lib/analytics';

describe('Analytics', () => {
  it('calculates total focus time', () => {
    const sessions = [
      { duration: 25, completed: true },
      { duration: 45, completed: true },
      { duration: 15, completed: false },
    ];
    expect(calculateTotalFocusTime(sessions)).toBe(70);
  });

  it('identifies most productive hour', () => {
    const sessions = [
      { startTime: '2026-03-16T09:00:00Z', completed: true },
      { startTime: '2026-03-16T09:30:00Z', completed: true },
      { startTime: '2026-03-16T14:00:00Z', completed: true },
    ];
    expect(getMostProductiveHour(sessions)).toBe(9);
  });
});
```

**`__tests__/SessionTimer.test.tsx`**
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import SessionTimer from '../components/SessionTimer';

describe('SessionTimer', () => {
  it('renders with initial duration', () => {
    const { getByText } = render(<SessionTimer duration={25} />);
    expect(getByText('25:00')).toBeTruthy();
  });

  it('calls onComplete when timer finishes', () => {
    const onComplete = jest.fn();
    const { getByTestId } = render(
      <SessionTimer duration={0.01} onComplete={onComplete} />
    );
    setTimeout(() => {
      expect(onComplete).toHaveBeenCalled();
    }, 1000);
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest zensprint --template tabs
cd zensprint
npx expo install expo-av expo-speech expo-notifications expo-sqlite expo-secure-store
npm install zustand date-fns
npm install -D jest @testing-library/react-native @types/jest
```

### 2. Database schema (`lib/database.ts`)
- Create SQLite tables: `sessions`, `streaks`, `pods`, `rewards`
- `sessions`: id, duration, startTime, endTime, completed, voicePack
- `streaks`: date, sessionsCompleted
- `pods`: id, name, members (JSON), createdAt
- `rewards`: id, name, pointsRequired, unlocked
- Export functions: `createSession`, `completeSession`, `getStreak`, `getTotalPoints`

### 3. Voice coach logic (`lib/voice.ts`)
- Define voice packs with pitch/rate settings
- `generateCoachingMessage(phase, duration, packName)` returns contextual strings
- `speakMessage(text, voicePack)` uses Expo.Speech with pack settings
- Messages: start ("Let's crush this 25-minute sprint!"), midpoint ("Halfway there, stay strong"), end ("Amazing work! Session complete")

### 4. Background audio manager (`lib/audio.ts`)
- Use Expo AV to play ambient sounds (optional white noise)
- Configure audio session for background playback
- Handle interruptions (calls, other apps)

### 5. Notification system (`lib/notifications.ts`)
- Request permissions on first launch
- Schedule daily reminder at user's preferred time
- Send streak alert if user hasn't started a session today
- "Pod mate just started a session" notifications

### 6. State management (`store/useStore.ts`)
- Zustand store with: `currentSession`, `isPremium`, `selectedVoicePack`, `userStats`
- Actions: `startSession`, `pauseSession`, `completeSession`, `updateStats`

### 7. Home screen (`app/(tabs)/index.tsx`)
- Duration picker (5/15/25/45 min buttons + custom input)
- Voice pack selector (show locked packs with upgrade prompt)
- Big "Start Sprint" button
- Current streak display at top
- Quick stats: today's focus time, weekly total

### 8. Active session screen (`app/session/active.tsx`)
- Full-screen timer with circular progress
- Pause/Resume buttons
- Voice coach speaks at intervals
- Background audio continues when locked
- Completion animation with points earned

### 9. Stats screen (`app/(tabs)/stats.tsx`)
- Streak calendar (highlight completed days)
- Total focus time cards (today/week/month)
- Heatmap of most productive hours
- Completion rate chart
- Export button (premium only)

### 10. Pods screen (`app/(tabs)/pods.tsx`)
- List of joined pods with live status indicators
- Create pod button (premium: unlimited, free: 1 max)
- Pod detail view: member list, weekly leaderboard, send nudge
- Join pod by code

### 11. Profile screen (`app/(tabs)/profile.tsx`)
- User level and total points
- Unlocked rewards showcase
- Settings: notification time, default duration, voice pack
- Premium upgrade card with benefits list
- Subscription management

### 12. Premium gate component (`components/PremiumGate.tsx`)
- Reusable modal for locked features
- Show benefits and pricing
- Link to subscription flow (Expo In-App Purchases or RevenueCat)

### 13. Session timer component (`components/SessionTimer.tsx`)
- Countdown logic with pause/resume
- Circular progress indicator
- Format time as MM:SS
- Emit events: onComplete, onPause, onResume

### 14. Voice coach component (`components/VoiceCoach.tsx`)
- Trigger speech at session phases
- Show visual indicator when speaking
- Handle voice pack changes mid-session

### 15. Streak calendar component (`components/StreakCalendar.tsx`)
- Render month view with date-fns
- Highlight days with completed sessions
- Show current streak count

### 16. Analytics logic (`lib/analytics.ts`)
- `calculateTotalFocusTime(sessions)` sums completed durations
- `getMostProductiveHour(sessions)` finds hour with most completions
- `getCompletionRate(sessions)` returns percentage
- `exportToCSV(sessions)` generates CSV string

### 17. Constants (`constants/VoicePacks.ts`, `constants/Rewards.ts`)
- Define voice pack metadata (name, pitch, rate, premium flag)
- Define reward tiers (Bronze: 100pts, Silver: 500pts, etc.)

### 18. Write tests
- Run `npm test` to ensure all tests pass
- Add integration test for full session flow

### 19. Configure app.json
- Set app name, slug, icon, splash screen
- Enable background audio mode
- Configure notification permissions
- Set iOS/Android build numbers

### 20. Test on device
- Run `npx expo start` and scan QR with Expo Go
- Test session start/pause/complete flow
- Verify voice coach speaks at correct times
- Check notifications appear
- Test streak calculation after completing sessions

## How to verify it works

1. **Install and run:**
   ```bash
   npm install
   npx expo start
   ```

2. **On iOS/Android device with Expo Go:**
   - Scan QR code
   - Grant notification and audio permissions
   - Start a 5-minute session
   - Lock phone — voice coach should speak at midpoint
   - Complete session — verify points awarded and streak updated
   - Check stats screen shows session in history
   - Create a pod and verify it appears in pods list

3. **Run tests:**
   ```bash
   npm test
   ```
   All tests must pass (database, voice, analytics, component tests)

4. **Verify premium gate:**
   - Try to select a premium voice pack — should show upgrade prompt
   - Try to create a second pod on free tier — should block with paywall

5. **Check notifications:**
   - Set a reminder for 1 minute from now
   - Wait for notification to appear
   - Tap notification — should open app to home screen

6. **Test streak logic:**
   - Complete a session today
   - Change device date to tomorrow
   - Complete another session — streak should increment
   - Change date to 2 days later — streak should reset