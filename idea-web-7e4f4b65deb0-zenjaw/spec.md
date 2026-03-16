# JawZen

## One-line pitch
Stay relaxed all day with gentle audio reminders that help you release tension, reduce jaw clenching, and build lasting mindfulness habits.

## Expanded vision

**Core audience:** Anyone who carries physical tension in their body throughout the day — not just jaw clenchers, but neck grinders, shoulder hunchers, fist clenchers, and breath holders. This is 60%+ of working adults.

**Broadest reach:**
- Office workers who develop "tech neck" and forward head posture
- Parents juggling childcare stress who clench without realizing
- Athletes and gym-goers who need recovery reminders between sessions
- Chronic pain sufferers (TMJ, tension headaches, back pain) seeking non-pharmaceutical relief
- Anyone trying to break unconscious stress habits (nail biting, skin picking, hair pulling)

**Adjacent use cases:**
- Posture correction reminders for desk workers
- Breathing check-ins for anxiety management
- Hydration and movement prompts for general wellness
- Sleep hygiene reminders in evening hours
- Pre-meeting calm-down rituals for high-stress jobs

**Why non-technical people want this:**
Physical tension is universal and invisible. You don't know you're clenching until your jaw aches at night. This app makes the invisible visible through gentle awareness, then helps you fix it. It's like having a massage therapist whisper "relax your shoulders" throughout your day. The tracking shows measurable progress ("You've reduced tension episodes by 40% this month"), which creates motivation to continue.

Unlike meditation apps that require stopping what you're doing, JawZen works *while* you work, parent, commute, or cook. It's wellness that fits into life, not another task on the to-do list.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** expo-sqlite for habit tracking, reminder history, and user preferences
- **Audio:** expo-av for gentle reminder sounds and optional voice prompts
- **Notifications:** expo-notifications for background reminders
- **Background tasks:** expo-task-manager for scheduled check-ins
- **Haptics:** expo-haptics for gentle vibration patterns
- **Analytics:** expo-tracking-transparency + basic event logging (no third-party analytics in MVP)
- **State management:** React Context (no Redux needed for MVP)
- **Testing:** Jest + React Native Testing Library

## Core features

1. **Smart Tension Reminders**
   - Customizable audio cues (chime, voice, nature sounds) that prompt body scans
   - Adaptive scheduling based on user's typical stress patterns (learns when you need reminders most)
   - Quick "I'm relaxed" or "Still tense" tap response to build tension profile

2. **One-Tap Tension Release**
   - Guided 30-second micro-exercises (jaw release, shoulder rolls, breath work)
   - No meditation jargon — simple "Relax your jaw. Good. Now your shoulders. Nice."
   - Tracks completion and shows streak

3. **Tension Heatmap**
   - Visual calendar showing tension patterns by day/time
   - Identifies triggers (Monday mornings, 3pm slumps, pre-meeting anxiety)
   - Shows progress over weeks with "tension-free hours" metric

4. **Custom Body Zones** (Premium)
   - Target specific areas: jaw, neck, shoulders, hands, forehead
   - Personalized reminder scripts for each zone
   - Multi-zone tracking for full-body awareness

5. **Ambient Awareness Mode** (Premium)
   - Ultra-gentle background reminders that don't interrupt flow state
   - Location-aware (more reminders at desk, fewer during commute)
   - Integration with calendar for pre-meeting calm-downs

## Monetization strategy

**Free tier (the hook):**
- 3 reminders per day (morning, midday, evening)
- Basic tension tracking (yes/no responses)
- One body zone (jaw only)
- Generic chime sound
- 7-day tension history

**Premium ($7.99/month or $59.99/year):**
- Unlimited reminders with smart scheduling
- All body zones with custom tracking
- Voice-guided micro-exercises (male/female/non-binary voice options)
- Full tension heatmap with pattern analysis
- Ambient awareness mode
- Health app integration (export tension data)
- Custom reminder sounds (nature, ASMR, silence with haptics only)
- Priority support

**Why $7.99?** Lower than Headspace ($12.99) and Calm ($14.99) because sessions are shorter. Comparable to Streaks ($4.99) but offers more personalization. Annual discount (37% off) drives commitment.

**Retention drivers:**
- Streak mechanics (don't break your tension-free streak)
- Visible progress (tension episodes decrease over time)
- Personalization improves with use (AI learns your patterns)
- Sunk cost (invested time in building habits)
- Health outcomes (reduced headaches, better sleep, less jaw pain)

**Future revenue:**
- One-time IAP for premium voice packs ($2.99 each)
- Corporate wellness licenses ($4.99/user/month for teams)
- Integration with physical products (smart posture devices, bite guards)

## File structure

```
jawzen/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Dashboard
│   │   ├── reminders.tsx          # Reminder settings
│   │   ├── insights.tsx           # Tension heatmap
│   │   └── profile.tsx            # Settings & premium
│   ├── exercises/
│   │   └── [id].tsx               # Individual exercise screen
│   ├── onboarding/
│   │   └── index.tsx              # First-time setup
│   └── _layout.tsx
├── components/
│   ├── TensionButton.tsx          # Quick tension log button
│   ├── ReminderCard.tsx           # Reminder display
│   ├── HeatmapCalendar.tsx        # Visual tension calendar
│   ├── ExercisePlayer.tsx         # Audio exercise player
│   ├── StreakCounter.tsx          # Gamification element
│   └── PremiumGate.tsx            # Paywall component
├── services/
│   ├── database.ts                # SQLite setup & queries
│   ├── notifications.ts           # Notification scheduling
│   ├── audio.ts                   # Audio playback
│   ├── analytics.ts               # Event tracking
│   └── backgroundTasks.ts         # Background reminder logic
├── hooks/
│   ├── useTensionLog.ts           # Tension tracking logic
│   ├── useReminders.ts            # Reminder management
│   ├── useAudio.ts                # Audio state
│   └── usePremium.ts              # Premium status
├── constants/
│   ├── exercises.ts               # Exercise library
│   ├── sounds.ts                  # Audio file mappings
│   └── colors.ts                  # Theme
├── types/
│   └── index.ts                   # TypeScript types
├── __tests__/
│   ├── database.test.ts
│   ├── notifications.test.ts
│   ├── tensionLog.test.ts
│   ├── reminders.test.ts
│   └── components/
│       ├── TensionButton.test.tsx
│       └── HeatmapCalendar.test.tsx
├── assets/
│   ├── sounds/
│   │   ├── chime.mp3
│   │   ├── nature.mp3
│   │   └── voice-jaw-relax.mp3
│   └── images/
│       └── icon.png
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/database.test.ts
import { openDatabase, createTables, logTension, getTensionHistory } from '../services/database';

describe('Database Service', () => {
  it('should create tables without errors', async () => {
    const db = openDatabase();
    await expect(createTables(db)).resolves.not.toThrow();
  });

  it('should log tension entry', async () => {
    const db = openDatabase();
    const entry = await logTension(db, 'jaw', 'tense', new Date());
    expect(entry.id).toBeDefined();
    expect(entry.bodyZone).toBe('jaw');
  });

  it('should retrieve tension history', async () => {
    const db = openDatabase();
    const history = await getTensionHistory(db, 7);
    expect(Array.isArray(history)).toBe(true);
  });
});

// __tests__/notifications.test.ts
import { scheduleReminder, cancelReminder, getScheduledReminders } from '../services/notifications';

describe('Notification Service', () => {
  it('should schedule a reminder', async () => {
    const id = await scheduleReminder({
      title: 'Jaw Check',
      body: 'How is your jaw feeling?',
      trigger: { seconds: 60 }
    });
    expect(id).toBeDefined();
  });

  it('should cancel a reminder', async () => {
    const id = await scheduleReminder({ title: 'Test', body: 'Test', trigger: { seconds: 60 } });
    await expect(cancelReminder(id)).resolves.not.toThrow();
  });
});

// __tests__/tensionLog.test.ts
import { calculateTensionScore, identifyPatterns } from '../hooks/useTensionLog';

describe('Tension Log Logic', () => {
  it('should calculate tension score correctly', () => {
    const logs = [
      { status: 'tense', timestamp: new Date() },
      { status: 'relaxed', timestamp: new Date() },
      { status: 'tense', timestamp: new Date() }
    ];
    const score = calculateTensionScore(logs);
    expect(score).toBeCloseTo(0.67, 1);
  });

  it('should identify time-based patterns', () => {
    const logs = [
      { status: 'tense', timestamp: new Date('2026-03-16T14:00:00') },
      { status: 'tense', timestamp: new Date('2026-03-16T14:30:00') },
      { status: 'relaxed', timestamp: new Date('2026-03-16T09:00:00') }
    ];
    const patterns = identifyPatterns(logs);
    expect(patterns.peakHours).toContain(14);
  });
});

// __tests__/components/TensionButton.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TensionButton from '../../components/TensionButton';

describe('TensionButton', () => {
  it('should render with correct label', () => {
    const { getByText } = render(<TensionButton onPress={() => {}} status="tense" />);
    expect(getByText('Tense')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const mockPress = jest.fn();
    const { getByTestId } = render(<TensionButton onPress={mockPress} status="tense" />);
    fireEvent.press(getByTestId('tension-button'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app jawzen --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-av expo-notifications expo-task-manager expo-haptics
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json` with permissions:
   ```json
   {
     "expo": {
       "plugins": [
         [
           "expo-notifications",
           {
             "sounds": ["./assets/sounds/chime.mp3"]
           }
         ]
       ],
       "ios": {
         "infoPlist": {
           "UIBackgroundModes": ["audio", "fetch"]
         }
       },
       "android": {
         "permissions": ["SCHEDULE_EXACT_ALARM", "POST_NOTIFICATIONS"]
       }
     }
   }
   ```

### Phase 2: Database layer
4. Create `services/database.ts`:
   - Define schema: `tension_logs` (id, body_zone, status, timestamp), `reminders` (id, time, enabled, body_zone), `user_settings` (key, value)
   - Implement `openDatabase()`, `createTables()`, `logTension()`, `getTensionHistory()`, `saveReminder()`, `getReminders()`
   - Add migration logic for future schema changes

5. Write database tests in `__tests__/database.test.ts`

### Phase 3: Notification system
6. Create `services/notifications.ts`:
   - Request permissions on app launch
   - Implement `scheduleReminder(config)` with expo-notifications
   - Implement `cancelReminder(id)` and `cancelAllReminders()`
   - Handle notification responses (user taps notification)
   - Create `getScheduledReminders()` to show active reminders

7. Create `services/backgroundTasks.ts`:
   - Register background task for adaptive reminder scheduling
   - Analyze tension patterns and adjust reminder times
   - Ensure task runs even when app is closed (iOS limitations apply)

8. Write notification tests in `__tests__/notifications.test.ts`

### Phase 4: Audio system
9. Create `services/audio.ts`:
   - Load audio files from assets
   - Implement `playReminder(soundType)` with expo-av
   - Implement `playExercise(exerciseId)` with pause/resume
   - Handle audio interruptions (phone calls, other apps)
   - Add volume control and mute option

10. Create `constants/exercises.ts`:
    - Define exercise library with scripts and audio file paths
    - Include jaw release, shoulder rolls, deep breathing, neck stretches
    - Each exercise has: id, name, duration, script, audioFile, bodyZone

### Phase 5: Core hooks
11. Create `hooks/useTensionLog.ts`:
    - `logTension(bodyZone, status)` - saves to DB and triggers haptic feedback
    - `getTensionData(days)` - retrieves history
    - `calculateTensionScore(logs)` - computes percentage of tense vs relaxed
    - `identifyPatterns(logs)` - finds peak tension times and days

12. Create `hooks/useReminders.ts`:
    - `addReminder(time, bodyZone)` - schedules notification
    - `removeReminder(id)` - cancels notification
    - `toggleReminder(id, enabled)` - enable/disable without deleting
    - `getActiveReminders()` - lists all scheduled reminders

13. Create `hooks/usePremium.ts`:
    - `isPremium` - boolean state
    - `checkPremiumStatus()` - validates subscription (mock for MVP)
    - `purchasePremium()` - triggers purchase flow (mock for MVP)

14. Write hook tests in `__tests__/tensionLog.test.ts` and `__tests__/reminders.test.ts`

### Phase 6: UI components
15. Create `components/TensionButton.tsx`:
    - Large, tappable button with "Tense" or "Relaxed" state
    - Visual feedback on press (haptic + color change)
    - Shows last log time below button

16. Create `components/ReminderCard.tsx`:
    - Displays reminder time and body zone
    - Toggle switch to enable/disable
    - Delete button (swipe-to-delete on iOS)

17. Create `components/HeatmapCalendar.tsx`:
    - 7-day or 30-day grid view
    - Color-coded cells (green = relaxed, red = tense, gray = no data)
    - Tap cell to see details for that day

18. Create `components/ExercisePlayer.tsx`:
    - Play/pause button for audio exercise
    - Progress bar showing exercise duration
    - Skip button to end early
    - Completion checkmark when finished

19. Create `components/StreakCounter.tsx`:
    - Shows current streak (days with at least one "relaxed" log)
    - Animated flame icon or similar
    - Motivational message ("Keep it up!")

20. Create `components/PremiumGate.tsx`:
    - Modal or inline banner for premium features
    - "Upgrade to Premium" CTA button
    - Lists premium benefits

21. Write component tests in `__tests__/components/`

### Phase 7: Screens
22. Build `app/(tabs)/index.tsx` (Home/Dashboard):
    - TensionButton at top for quick logging
    - StreakCounter below
    - "Today's Tension" summary (X tense, Y relaxed)
    - Quick access to exercises
    - Next reminder time display

23. Build `app/(tabs)/reminders.tsx`:
    - List of ReminderCards
    - "Add Reminder" button (opens time picker)
    - Premium gate for more than 3 reminders
    - Body zone selector for each reminder (premium)

24. Build `app/(tabs)/insights.tsx`:
    - HeatmapCalendar component
    - Pattern insights ("You're most tense on Mondays at 2pm")
    - Tension score trend graph (simple line chart)
    - Premium gate for full history beyond 7 days

25. Build `app/(tabs)/profile.tsx`:
    - User settings (notification sound, haptic feedback)
    - Premium status and upgrade button
    - Body zone preferences
    - About/Help/Privacy links

26. Build `app/exercises/[id].tsx`:
    - ExercisePlayer component
    - Exercise instructions text
    - "Mark as Complete" button
    - Logs completion to DB for streak tracking

27. Build `app/onboarding/index.tsx`:
    - Welcome screen explaining app concept
    - Permission requests (notifications, audio)
    - Body zone selection (which areas do you carry tension?)
    - Set first reminder time
    - Navigate to main app after completion

### Phase 8: Integration & polish
28. Connect all screens to database and hooks
29. Implement navigation between screens (Expo Router handles most of this)
30. Add loading states and error handling
31. Test notification delivery on device (not simulator)
32. Test audio playback with headphones and speaker
33. Verify background task runs (check logs)
34. Add haptic feedback to key interactions
35. Implement basic analytics events (app_opened, tension_logged, exercise_completed)

### Phase 9: Premium features
36. Mock in-app purchase flow (use expo-store-review for MVP, replace with RevenueCat later)
37. Gate premium features behind `usePremium` hook
38. Add "Upgrade" prompts at natural points (after 3 reminders, after 7 days of use)
39. Implement premium voice options (record or source voice clips)
40. Add ambient awareness mode (ultra-gentle notifications)

### Phase 10: Testing & refinement
41. Run full test suite: `npm test`
42. Manual testing on iOS and Android devices
43. Test edge cases: app killed, phone restarted, notifications disabled
44. Verify streak logic doesn't break across days
45. Test with different time zones
46. Optimize database queries for performance
47. Reduce app size by compressing audio files
48. Add error logging for production debugging

## How to verify it works

### Local development
1. Start Expo: `npx expo start`
2. Scan QR code with Expo Go app on iOS/Android device
3. Grant notification and audio permissions when prompted
4. Complete onboarding flow
5. Set a reminder for 1 minute from now
6. Lock phone and wait for notification
7. Tap notification and verify app opens to tension logging screen
8. Log tension as "Tense" and verify it appears in Insights heatmap
9. Navigate to Exercises and play a jaw release exercise
10. Verify audio plays and completion is tracked
11. Check streak counter increments after logging "Relaxed"

### Automated tests
1. Run test suite: `npm test`
2. Verify all tests pass (database, notifications, hooks, components)
3. Check test coverage: `npm test -- --coverage` (aim for >70%)

### Device-specific checks
- **iOS**: Verify notifications appear on lock screen and in Notification Center
- **Android**: Verify notifications respect Do Not Disturb settings
- **Both**: Test with Bluetooth headphones connected
- **Both**: Test with phone in silent mode (haptics should still work)
- **Both**: Kill app and verify background reminders still fire

### Premium flow
1. Tap "Upgrade to Premium" button
2. Verify paywall modal appears with benefits list
3. Mock purchase (button should show "Subscribed")
4. Verify premium features unlock (unlimited reminders, all body zones)
5. Restart app and verify premium status persists

### Edge cases
- Set reminder for past time (should schedule for next day)
- Log tension 100 times in one day (should not crash)
- Delete all reminders (should show empty state)
- Revoke notification permissions (should show re-enable prompt)
- Change phone time zone (reminders should adjust)