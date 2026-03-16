# RestPulse

## One-line pitch
Wake up energized, not groggy — intelligent rest sessions that keep you in the sweet spot between alert and asleep.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** Anyone who experiences the afternoon slump or needs mental recovery during their day. This is the 70% of knowledge workers who report mid-day fatigue, the 40% of adults who are chronically sleep-deprived, and the growing wellness-conscious demographic seeking non-pharmaceutical energy solutions.

**Beyond the original niche:**

- **Parents with young children** — Grab restorative rest during nap time without falling into deep sleep and waking up more exhausted
- **Shift workers** — Nurses, doctors, emergency responders who need strategic rest between shifts
- **Athletes and fitness enthusiasts** — Recovery optimization between training sessions
- **Anxiety/stress sufferers** — A structured, time-bound rest practice that doesn't trigger "I overslept" panic
- **Travelers** — Combat jet lag with strategic rest timing, or rest on planes/trains without missing connections
- **ADHD community** — Structured rest breaks that support executive function recovery
- **Meditation skeptics** — People who find traditional meditation "too woo" but want tangible rest benefits

**Adjacent use cases:**

- **Focus session bookends** — Use before deep work to clear mental clutter, after to consolidate learning
- **Pre-performance prep** — Musicians, public speakers, athletes using strategic rest before high-stakes moments
- **Migraine management** — Early intervention rest at first signs of headache
- **Caffeine replacement** — Reduce dependency on stimulants through strategic rest
- **Social battery recharge** — Introverts recovering between social obligations

**Why non-technical people want this:**

This isn't about "biohacking" or optimization culture — it's about feeling human again. It's the difference between dragging through your afternoon versus having energy for your kids after work. It's about not needing a third coffee. It's about trusting you can close your eyes for 20 minutes and actually wake up, not 3 hours later in a panic. The app removes the risk from resting.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **Audio:** expo-av
- **Haptics:** expo-haptics
- **Background tasks:** expo-task-manager + expo-background-fetch
- **Notifications:** expo-notifications
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Testing:** Jest + React Native Testing Library
- **Analytics:** Expo Analytics (privacy-first)

## Core features (MVP)

1. **Adaptive Rest Sessions** — 10, 15, 20, or 25-minute sessions with intelligent audio/haptic cues that gently prevent deep sleep. Algorithm increases cue frequency as session progresses, using subtle nature sounds and gentle vibrations.

2. **Smart Wake System** — Multi-stage wake sequence (soft audio → gradual volume increase → haptic pulses → alarm) that prevents the jarring wake-up. Users can't accidentally dismiss — requires interaction pattern (shake phone or solve simple puzzle).

3. **Rest Analytics** — Track session completion rate, time of day patterns, and subjective energy ratings post-rest. Simple visualizations show optimal rest timing for each user.

4. **Soundscape Library** — Curated audio environments (rain, ocean, forest, white noise, binaural beats) designed specifically for light rest, not deep sleep. Free tier gets 3 soundscapes, premium unlocks 20+.

5. **Quick Start Widget** — iOS/Android home screen widget for one-tap session start. Reduces friction from "I should rest" to actually resting.

## Monetization strategy

**Free tier (the hook):**
- Unlimited 15-minute sessions with basic soundscape (rain)
- Basic haptic patterns
- Standard alarm wake-up
- 7-day analytics history

**Premium ($6.99/month or $49.99/year — 40% savings):**
- All session lengths (10/15/20/25 min)
- Full soundscape library (20+ environments)
- Advanced haptic patterns (customizable intensity)
- Smart wake system with puzzle options
- Unlimited analytics history + insights
- Home screen widgets
- Smart home integration (Philips Hue, LIFX)
- Offline mode (download soundscapes)
- Priority support

**Price reasoning:**
- Below meditation apps ($12-15/month) but above simple utility apps ($2-3)
- Positioned as wellness tool, not entertainment
- Annual plan drives commitment (rest is a habit, not a one-time fix)

**Retention drivers:**
- **Habit formation** — After 2 weeks of daily use, rest becomes part of routine
- **Personalization** — Analytics show YOUR optimal patterns, making the app feel custom-built
- **Sunk cost** — Analytics history creates investment in the platform
- **Tangible results** — Energy improvements are immediately felt, unlike abstract meditation benefits
- **Social proof** — Share "rest streak" achievements (optional, privacy-respecting)

**Why people stay subscribed:**
The app becomes their energy management system. Missing a subscription month means losing their personalized insights and returning to unstructured, risky naps. The cost is less than two coffees per month, but the energy benefit replaces daily caffeine dependency.

## File structure

```
restpulse/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home/Quick Start
│   │   ├── sessions.tsx              # Session history
│   │   ├── analytics.tsx             # Rest insights
│   │   └── settings.tsx              # Settings & premium
│   ├── session/
│   │   └── [id].tsx                  # Active session screen
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── SessionTimer.tsx              # Countdown display
│   ├── SoundscapeSelector.tsx        # Audio picker
│   ├── WakeSequence.tsx              # Smart wake UI
│   ├── AnalyticsChart.tsx            # Data visualization
│   └── PremiumGate.tsx               # Paywall component
├── lib/
│   ├── database/
│   │   ├── schema.ts                 # SQLite schema
│   │   └── queries.ts                # DB operations
│   ├── audio/
│   │   ├── soundscapeManager.ts      # Audio playback
│   │   └── cueEngine.ts              # Intelligent cue timing
│   ├── haptics/
│   │   └── patternEngine.ts          # Haptic feedback
│   ├── session/
│   │   ├── sessionManager.ts         # Session lifecycle
│   │   └── adaptiveAlgorithm.ts      # Cue frequency logic
│   ├── analytics/
│   │   └── insightsEngine.ts         # Pattern detection
│   └── store/
│       └── useStore.ts               # Zustand store
├── constants/
│   ├── Soundscapes.ts                # Audio metadata
│   └── SessionPresets.ts             # Duration configs
├── assets/
│   ├── sounds/
│   │   ├── rain.mp3
│   │   ├── ocean.mp3
│   │   └── forest.mp3
│   └── images/
├── __tests__/
│   ├── adaptiveAlgorithm.test.ts
│   ├── sessionManager.test.ts
│   ├── insightsEngine.test.ts
│   └── cueEngine.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/adaptiveAlgorithm.test.ts
import { calculateNextCueTime, getCueIntensity } from '../lib/session/adaptiveAlgorithm';

describe('Adaptive Algorithm', () => {
  test('increases cue frequency as session progresses', () => {
    const earlyTime = calculateNextCueTime(2, 20); // 2 min into 20 min session
    const lateTime = calculateNextCueTime(18, 20); // 18 min into 20 min session
    expect(lateTime).toBeLessThan(earlyTime);
  });

  test('cue intensity increases near end of session', () => {
    const earlyIntensity = getCueIntensity(3, 20);
    const lateIntensity = getCueIntensity(17, 20);
    expect(lateIntensity).toBeGreaterThan(earlyIntensity);
  });
});

// __tests__/sessionManager.test.ts
import { SessionManager } from '../lib/session/sessionManager';

describe('Session Manager', () => {
  test('creates session with correct duration', () => {
    const manager = new SessionManager();
    const session = manager.createSession(15);
    expect(session.durationMinutes).toBe(15);
    expect(session.status).toBe('pending');
  });

  test('tracks session completion', async () => {
    const manager = new SessionManager();
    const session = manager.createSession(15);
    await manager.completeSession(session.id, 4); // energy rating 4/5
    const completed = await manager.getSession(session.id);
    expect(completed.status).toBe('completed');
    expect(completed.energyRating).toBe(4);
  });
});

// __tests__/insightsEngine.test.ts
import { InsightsEngine } from '../lib/analytics/insightsEngine';

describe('Insights Engine', () => {
  test('identifies optimal rest time from session data', () => {
    const sessions = [
      { hour: 14, energyRating: 5 },
      { hour: 14, energyRating: 5 },
      { hour: 16, energyRating: 3 },
      { hour: 10, energyRating: 4 },
    ];
    const engine = new InsightsEngine();
    const optimal = engine.findOptimalRestTime(sessions);
    expect(optimal.hour).toBe(14);
  });

  test('calculates completion rate', () => {
    const sessions = [
      { status: 'completed' },
      { status: 'completed' },
      { status: 'interrupted' },
      { status: 'completed' },
    ];
    const engine = new InsightsEngine();
    const rate = engine.calculateCompletionRate(sessions);
    expect(rate).toBe(0.75);
  });
});

// __tests__/cueEngine.test.ts
import { CueEngine } from '../lib/audio/cueEngine';

describe('Cue Engine', () => {
  test('generates cue schedule for session', () => {
    const engine = new CueEngine();
    const schedule = engine.generateSchedule(20); // 20 min session
    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule[0].timeMinutes).toBeLessThan(schedule[schedule.length - 1].timeMinutes);
  });

  test('cue types vary throughout session', () => {
    const engine = new CueEngine();
    const schedule = engine.generateSchedule(20);
    const types = new Set(schedule.map(cue => cue.type));
    expect(types.size).toBeGreaterThan(1); // Should have audio, haptic, or both
  });
});
```

## Implementation steps

### Phase 1: Project setup and database

1. Initialize Expo project:
```bash
npx create-expo-app restpulse --template tabs
cd restpulse
```

2. Install dependencies:
```bash
npx expo install expo-sqlite expo-av expo-haptics expo-notifications expo-task-manager expo-background-fetch
npm install zustand
npm install -D jest @testing-library/react-native @testing-library/jest-native
```

3. Create SQLite schema in `lib/database/schema.ts`:
   - `sessions` table: id, duration_minutes, start_time, end_time, status, energy_rating, soundscape_id
   - `cue_events` table: id, session_id, timestamp, cue_type, intensity
   - `user_preferences` table: id, default_duration, default_soundscape, haptic_enabled, premium_status

4. Implement database queries in `lib/database/queries.ts`:
   - `createSession()`, `updateSession()`, `getSessionHistory()`
   - `logCueEvent()`, `getUserPreferences()`, `updatePreferences()`

### Phase 2: Core session logic

5. Build adaptive algorithm in `lib/session/adaptiveAlgorithm.ts`:
   - `calculateNextCueTime(elapsedMinutes, totalMinutes)`: Returns seconds until next cue
   - Use exponential decay: early session = 3-5 min between cues, late session = 30-60 sec
   - `getCueIntensity(elapsedMinutes, totalMinutes)`: Returns 0.0-1.0 intensity scale
   - Linear increase from 0.3 (early) to 1.0 (final 2 minutes)

6. Create cue engine in `lib/audio/cueEngine.ts`:
   - `generateSchedule(durationMinutes)`: Returns array of `{timeMinutes, type, intensity}`
   - Types: 'audio' (subtle sound), 'haptic' (vibration), 'both'
   - Ensure cues don't cluster (minimum 20 sec spacing)

7. Implement session manager in `lib/session/sessionManager.ts`:
   - `createSession(duration)`: Initialize session in DB, return session object
   - `startSession(sessionId)`: Begin countdown, schedule cues, start background task
   - `pauseSession(sessionId)`: Pause timer, cancel scheduled cues
   - `completeSession(sessionId, energyRating)`: Mark complete, save rating
   - `interruptSession(sessionId)`: Handle early termination

### Phase 3: Audio and haptics

8. Build soundscape manager in `lib/audio/soundscapeManager.ts`:
   - `loadSoundscape(soundscapeId)`: Load audio file using expo-av
   - `playCue(intensity)`: Play subtle audio cue at specified volume
   - `playAmbient()`: Loop background soundscape
   - `stopAll()`: Clean up audio resources

9. Create haptic pattern engine in `lib/haptics/patternEngine.ts`:
   - `playPattern(intensity)`: Trigger haptic feedback using expo-haptics
   - Light intensity: single short pulse
   - Medium: double pulse with 100ms gap
   - High: triple pulse pattern

10. Add soundscape metadata in `constants/Soundscapes.ts`:
    - Define free soundscapes (rain, white noise, silence)
    - Define premium soundscapes (ocean, forest, binaural beats, etc.)
    - Include file paths, duration, premium flag

### Phase 4: UI components

11. Build SessionTimer component in `components/SessionTimer.tsx`:
    - Display circular progress indicator
    - Show remaining time in MM:SS format
    - Pause/resume button
    - Stop button (with confirmation)

12. Create SoundscapeSelector in `components/SoundscapeSelector.tsx`:
    - Horizontal scrollable list of soundscape cards
    - Show premium badge on locked items
    - Preview button (play 5-second sample)

13. Implement WakeSequence in `components/WakeSequence.tsx`:
    - Multi-stage wake animation (fade in, pulse)
    - Dismissal mechanism (shake detection or simple puzzle)
    - Energy rating prompt (1-5 stars)

14. Build AnalyticsChart in `components/AnalyticsChart.tsx`:
    - Weekly completion rate bar chart
    - Optimal rest time heatmap (hour of day)
    - Average energy rating trend line

15. Create PremiumGate in `components/PremiumGate.tsx`:
    - Paywall overlay for premium features
    - Feature comparison list
    - Subscription purchase flow (mock for MVP)

### Phase 5: Screens

16. Implement home screen in `app/(tabs)/index.tsx`:
    - Quick start buttons (10/15/20/25 min)
    - Soundscape selector
    - "Start Rest" primary CTA
    - Current streak display

17. Build active session screen in `app/session/[id].tsx`:
    - Full-screen SessionTimer
    - Ambient soundscape playing
    - Minimal UI (just pause/stop)
    - Handle background state (continue session when app backgrounded)

18. Create sessions history in `app/(tabs)/sessions.tsx`:
    - List of past sessions (date, duration, energy rating)
    - Filter by date range
    - Tap to view session details

19. Build analytics screen in `app/(tabs)/analytics.tsx`:
    - AnalyticsChart component
    - Insights cards ("Your best rest time is 2 PM")
    - Premium upsell if free tier

20. Implement settings screen in `app/(tabs)/settings.tsx`:
    - Default duration picker
    - Haptic toggle
    - Notification preferences
    - Premium subscription status
    - About/support links

### Phase 6: State management and background tasks

21. Create Zustand store in `lib/store/useStore.ts`:
    - Session state (current session, timer, status)
    - User preferences
    - Premium status
    - Actions: startSession, pauseSession, updatePreferences

22. Implement background task in `lib/session/backgroundTask.ts`:
    - Register task with expo-task-manager
    - Continue cue scheduling when app backgrounded
    - Trigger notification when session completes

23. Set up notifications:
    - Request permissions on first launch
    - Schedule completion notification
    - Handle notification tap (open app to wake sequence)

### Phase 7: Analytics engine

24. Build insights engine in `lib/analytics/insightsEngine.ts`:
    - `findOptimalRestTime(sessions)`: Analyze energy ratings by hour
    - `calculateCompletionRate(sessions)`: Percentage of completed vs interrupted
    - `detectPatterns(sessions)`: Identify weekly trends
    - `generateInsights()`: Return human-readable insight strings

### Phase 8: Testing and polish

25. Write all test files in `__tests__/`:
    - Run `npm test` to verify all tests pass
    - Aim for >80% coverage on core logic

26. Add error handling:
    - Audio loading failures (fallback to silence)
    - Database errors (show user-friendly message)
    - Permission denials (graceful degradation)

27. Implement analytics tracking:
    - Session starts, completions, interruptions
    - Feature usage (soundscape selection, premium views)
    - Privacy-first (no PII, aggregate only)

28. Polish UI:
    - Add loading states
    - Smooth transitions between screens
    - Haptic feedback on button presses
    - Dark mode support

### Phase 9: Premium features (post-MVP)

29. Integrate in-app purchases:
    - Use expo-in-app-purchases or RevenueCat
    - Implement subscription validation
    - Restore purchases flow

30. Add smart home integration:
    - Philips Hue API