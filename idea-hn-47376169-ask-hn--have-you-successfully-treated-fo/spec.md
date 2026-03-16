# PosturePal

## One-line pitch
Turn your phone into a personal posture coach that fixes your neck pain in 5 minutes a day.

## Expanded vision

**Core audience:** Anyone who experiences neck pain, headaches, or fatigue from screen time — which is nearly everyone with a smartphone.

**Broadest reach:**
- **Office workers & remote professionals** (primary): The original target, but they're just the tip of the iceberg
- **Gamers** (ages 16-35): Spend 3-6 hours daily hunched over screens, often ignore health until pain becomes severe
- **Parents & caregivers** (ages 30-50): Want to model good habits for kids who are growing up with tablets and phones
- **Seniors** (55+): Experience chronic neck/back pain, need simple guided exercises without gym equipment
- **Students** (high school through college): Developing poor posture habits early, receptive to gamification
- **Physical therapy patients**: Need at-home exercise tracking between PT sessions

**Adjacent use cases:**
- **Workplace wellness programs**: HR departments pay for team licenses to reduce injury claims
- **Ergonomic product validation**: Partner with standing desk/chair companies to prove their products work
- **Telehealth integration**: Physical therapists can assign exercises and monitor patient compliance remotely
- **Preventive care**: Health insurance companies subsidize subscriptions to reduce long-term claims

**Why non-technical people want this:**
- Pain is universal and motivating — you don't need to understand "forward head posture" to want your neck to stop hurting
- No equipment needed — just your phone and 5 minutes
- Instant feedback feels like having a personal trainer in your pocket
- Gamification makes boring exercises actually engaging
- Visible progress (posture photos over time) creates social proof for sharing

**The real insight:** This isn't a "posture app" — it's a pain relief app that happens to use posture correction. Pain is a $100B market. Posture apps are a niche.

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Language**: TypeScript
- **Local storage**: SQLite (expo-sqlite)
- **Sensors**: expo-sensors (accelerometer, gyroscope)
- **Camera**: expo-camera
- **Notifications**: expo-notifications
- **State management**: Zustand (lightweight, no boilerplate)
- **Charts**: react-native-gifted-charts
- **Testing**: Jest + React Native Testing Library
- **Linting**: ESLint + Prettier

## Core features (MVP)

1. **5-Minute Daily Routine**
   - Pre-built sequence of 5 clinically-validated exercises (chin tucks, shoulder blade squeezes, neck stretches)
   - Phone accelerometer detects when you're holding position correctly
   - Audio cues guide you through holds and reps (no need to watch screen)
   - Streak tracking with push notifications

2. **Posture Check-In**
   - Take a side-profile photo weekly to track visual progress
   - Simple overlay guide shows ideal alignment (ear over shoulder)
   - Before/after comparison slider to see improvement over time
   - Privacy-first: photos stored locally, never uploaded

3. **Pain Tracker**
   - Quick daily log: "How's your neck today?" (1-5 scale + body map)
   - Correlates pain levels with exercise completion
   - Shows trend graph: "Your pain decreased 40% since starting"
   - Exports PDF report for doctor visits

4. **Smart Reminders**
   - Learns your screen time patterns (when you're most likely at desk)
   - Sends gentle nudges: "You've been sitting for 2 hours — 5 min stretch?"
   - Adapts timing based on when you actually complete exercises
   - Snooze intelligently (doesn't nag during meetings/commute)

5. **Exercise Library** (Premium)
   - 20+ additional exercises for specific issues (text neck, rounded shoulders, upper back tension)
   - Video demonstrations with form tips
   - Build custom routines
   - Difficulty progression as you improve

## Monetization strategy

**Free tier (the hook):**
- 5-Minute Daily Routine (forever free)
- Basic pain tracking
- Weekly posture photos (limit 4 stored)
- 3 smart reminders per day

**Premium ($7.99/month or $59.99/year):**
- Full exercise library (20+ exercises)
- Unlimited posture photo history with progress analytics
- Custom routine builder
- Unlimited smart reminders
- Export pain reports (PDF for doctors/PT)
- Priority support

**Why $7.99?**
- Below the $9.99 "premium app" threshold — feels like an impulse buy
- Comparable to one physical therapy copay
- Annual plan ($59.99) = 25% discount, encourages commitment
- Lower than competitors (PostureUp is $12.99/month)

**Retention drivers:**
- Streak psychology: "I've done 47 days straight, can't break it now"
- Visible progress: Before/after photos are shareable social proof
- Pain relief: If it works, people stay (and tell friends)
- Sunk cost: Annual subscribers stay for the full year
- Habit formation: After 30 days, the routine becomes automatic

**Future revenue streams:**
- B2B workplace wellness licenses ($5/employee/month for 50+ employees)
- Affiliate partnerships with ergonomic product companies
- Physical therapist referral program (they get dashboard to monitor patients)

## File structure

```
posture-pal/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Daily Routine
│   │   ├── progress.tsx           # Pain tracker + posture photos
│   │   ├── exercises.tsx          # Exercise library
│   │   └── settings.tsx           # Settings + premium upsell
│   ├── exercise/[id].tsx          # Individual exercise detail
│   ├── routine/active.tsx         # Active routine session
│   └── _layout.tsx
├── components/
│   ├── ExerciseCard.tsx
│   ├── PosturePhoto.tsx
│   ├── PainTracker.tsx
│   ├── StreakCounter.tsx
│   ├── MotionDetector.tsx
│   └── PremiumGate.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── exercises.ts               # Exercise data + logic
│   ├── motion.ts                  # Accelerometer/gyroscope utils
│   ├── notifications.ts           # Smart reminder logic
│   ├── storage.ts                 # Photo storage
│   └── analytics.ts               # Usage tracking
├── store/
│   └── useStore.ts                # Zustand store
├── constants/
│   └── Exercises.ts               # Exercise definitions
├── __tests__/
│   ├── exercises.test.ts
│   ├── motion.test.ts
│   ├── notifications.test.ts
│   └── database.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/exercises.test.ts
import { getExerciseById, calculateRoutineDuration, validateExerciseCompletion } from '../lib/exercises';

describe('Exercise Logic', () => {
  test('retrieves exercise by ID', () => {
    const exercise = getExerciseById('chin-tuck');
    expect(exercise).toBeDefined();
    expect(exercise?.name).toBe('Chin Tuck');
  });

  test('calculates routine duration correctly', () => {
    const duration = calculateRoutineDuration(['chin-tuck', 'shoulder-squeeze']);
    expect(duration).toBeGreaterThan(0);
  });

  test('validates exercise completion', () => {
    const isValid = validateExerciseCompletion('chin-tuck', 10, 3);
    expect(isValid).toBe(true);
  });
});

// __tests__/motion.test.ts
import { detectPosture, isHoldingCorrectly } from '../lib/motion';

describe('Motion Detection', () => {
  test('detects correct posture from accelerometer data', () => {
    const mockData = { x: 0, y: 9.8, z: 0 };
    const result = detectPosture(mockData);
    expect(result.isCorrect).toBe(true);
  });

  test('validates hold duration', () => {
    const isValid = isHoldingCorrectly(5000, 5000);
    expect(isValid).toBe(true);
  });
});

// __tests__/notifications.test.ts
import { calculateNextReminder, shouldSendReminder } from '../lib/notifications';

describe('Smart Reminders', () => {
  test('calculates next reminder based on usage pattern', () => {
    const lastCompleted = new Date('2026-03-16T09:00:00');
    const nextReminder = calculateNextReminder(lastCompleted);
    expect(nextReminder).toBeInstanceOf(Date);
  });

  test('respects user quiet hours', () => {
    const shouldSend = shouldSendReminder(new Date('2026-03-16T23:00:00'));
    expect(shouldSend).toBe(false);
  });
});

// __tests__/database.test.ts
import { initDatabase, logPainEntry, getStreakCount } from '../lib/database';

describe('Database Operations', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('logs pain entry successfully', async () => {
    const entry = await logPainEntry(3, ['neck', 'shoulders']);
    expect(entry).toBeDefined();
  });

  test('calculates streak correctly', async () => {
    const streak = await getStreakCount();
    expect(streak).toBeGreaterThanOrEqual(0);
  });
});
```

## Implementation steps

### Phase 1: Project Setup
1. Initialize Expo project with TypeScript template:
   ```bash
   npx create-expo-app@latest posture-pal --template tabs
   cd posture-pal
   ```

2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-sensors expo-camera expo-notifications zustand
   npm install react-native-gifted-charts
   npm install --save-dev jest @testing-library/react-native @types/jest
   ```

3. Configure `app.json`:
   - Set app name, slug, version
   - Add permissions: camera, notifications, motion sensors
   - Configure splash screen and icon placeholders

4. Set up TypeScript config and ESLint

### Phase 2: Database Layer
1. Create `lib/database.ts`:
   - Initialize SQLite database with tables: exercises, pain_logs, posture_photos, user_settings
   - Write CRUD functions for each table
   - Add migration logic for future schema changes

2. Create `lib/exercises.ts`:
   - Define Exercise type interface
   - Implement exercise data structure (name, duration, instructions, difficulty)
   - Add functions: getExerciseById, getRoutineExercises, calculateRoutineDuration

3. Write tests for database and exercise logic

### Phase 3: Motion Detection
1. Create `lib/motion.ts`:
   - Set up accelerometer/gyroscope listeners
   - Implement posture detection algorithm (threshold-based for MVP)
   - Add hold validation logic (detect when user maintains position)
   - Include calibration function for different phone positions

2. Create `components/MotionDetector.tsx`:
   - Visual feedback component (green checkmark when posture correct)
   - Real-time angle display for debugging
   - Audio cue integration

3. Write motion detection tests with mock sensor data

### Phase 4: Core Screens
1. Build `app/(tabs)/index.tsx` (Home/Daily Routine):
   - Display 5-Minute Routine card with "Start" button
   - Show current streak counter
   - Quick pain check-in button
   - Today's reminder status

2. Build `app/routine/active.tsx` (Active Session):
   - Exercise name and instructions
   - Timer display (countdown for holds, count for reps)
   - MotionDetector component integration
   - Progress bar (exercise 2 of 5)
   - Audio cues for transitions
   - Completion celebration screen

3. Build `app/(tabs)/progress.tsx`:
   - Pain tracker chart (last 30 days)
   - Posture photo gallery with before/after slider
   - Weekly summary stats
   - "Take Posture Photo" button

4. Build `app/(tabs)/exercises.tsx`:
   - Exercise library grid (with premium gate)
   - Search/filter by body area
   - Exercise cards with preview images

5. Build `app/exercise/[id].tsx`:
   - Exercise detail view
   - Video/animation demonstration
   - Form tips
   - "Add to Custom Routine" button (premium)

### Phase 5: Camera & Photos
1. Create `lib/storage.ts`:
   - Photo capture and local storage functions
   - Compression logic to save space
   - Retrieval and deletion functions

2. Create `components/PosturePhoto.tsx`:
   - Camera view with alignment overlay
   - Side-profile guide (ear-shoulder line)
   - Capture button
   - Before/after comparison slider

3. Implement photo gallery in progress screen

### Phase 6: Notifications
1. Create `lib/notifications.ts`:
   - Request notification permissions
   - Schedule smart reminders based on usage patterns
   - Implement adaptive timing (learn when user is most active)
   - Add quiet hours logic (no notifications 10pm-7am)

2. Integrate with exercise completion tracking
3. Add notification settings in settings screen

### Phase 7: State Management
1. Create `store/useStore.ts` with Zustand:
   - User settings (premium status, notification preferences)
   - Current streak
   - Active routine state
   - Pain log history
   - Exercise completion history

2. Connect store to all screens
3. Implement persistence with AsyncStorage

### Phase 8: Premium Features
1. Create `components/PremiumGate.tsx`:
   - Paywall modal with feature list
   - "Upgrade to Premium" CTA
   - Restore purchases button

2. Implement premium checks:
   - Exercise library access
   - Custom routine builder
   - Unlimited posture photos
   - Export pain reports

3. Add premium upsell touchpoints:
   - After completing 7-day streak
   - When trying to access locked exercises
   - In settings screen

### Phase 9: Polish
1. Add loading states and error handling
2. Implement haptic feedback for exercise completion
3. Add onboarding flow (3 screens explaining core features)
4. Create app icon and splash screen
5. Add accessibility labels for screen readers
6. Optimize performance (lazy load exercise videos)

### Phase 10: Testing
1. Run all Jest tests: `npm test`
2. Test on iOS simulator and Android emulator
3. Test on physical devices (different screen sizes)
4. Verify motion detection accuracy
5. Test notification delivery
6. Verify camera permissions and photo storage
7. Test premium gate logic
8. Check offline functionality

## How to verify it works

### Development Testing
1. **Start the app:**
   ```bash
   npx expo start
   ```
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go on physical device

2. **Run tests:**
   ```bash
   npm test
   ```
   - All tests must pass
   - Coverage should be >70% for core logic

3. **Manual verification checklist:**
   - [ ] Complete the 5-Minute Daily Routine
   - [ ] Verify motion detection responds to phone movement
   - [ ] Log pain entry and see it appear in progress chart
   - [ ] Take a posture photo and view in gallery
   - [ ] Trigger a notification reminder
   - [ ] Try to access premium feature and see paywall
   - [ ] Complete 3 days in a row and verify streak counter
   - [ ] Test on both iOS and Android
   - [ ] Verify app works offline (except premium features)

4. **Performance checks:**
   - App launches in <3 seconds
   - Motion detection has <100ms latency
   - No memory leaks during 10-minute session
   - Camera opens in <1 second
   - Database queries complete in <50ms

5. **Edge cases:**
   - Test with phone in different orientations
   - Test with camera/notification permissions denied
   - Test with no internet connection
   - Test with full photo storage (20+ photos)
   - Test streak counter across midnight boundary