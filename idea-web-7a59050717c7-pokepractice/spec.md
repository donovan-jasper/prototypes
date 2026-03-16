# StrikeZone

## One-line pitch
Master any skill with precision training that turns your phone into a personal performance coach with real-time feedback and AR challenges.

## Expanded vision

**Core audience:** Anyone trying to improve at something that requires timing, accuracy, or muscle memory.

**Broadest reach:**
- **Students & test-takers** — reaction time drills for standardized tests, typing speed challenges
- **Musicians** — rhythm training, tempo consistency, finger dexterity exercises
- **Medical professionals** — surgical precision simulators, steady-hand training for procedures
- **Esports athletes** — aim training, reaction time optimization, hand-eye coordination
- **Traditional athletes** — free throw timing, swing mechanics, footwork drills
- **Rehab patients** — physical therapy exercises with progress tracking
- **Parents training kids** — hand-eye coordination games for development milestones
- **Job seekers** — interview timing practice, presentation pacing, public speaking rhythm

**Adjacent use cases:**
- Daily "brain gym" sessions for cognitive sharpness (like Wordle but for reflexes)
- Social challenges — compete with friends on precision leaderboards
- Habit formation — streak tracking for daily practice routines
- Performance anxiety reduction — exposure therapy through timed challenges

**Non-technical appeal:** It's a game that makes you better at real life. No jargon, just "play this 5 minutes a day and watch your [skill] improve."

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Database:** SQLite (expo-sqlite) for local performance history
- **Sensors:** expo-sensors (accelerometer, gyroscope) for motion tracking
- **AR:** expo-gl + expo-three for basic AR overlays (iOS/Android)
- **Charts:** react-native-chart-kit for analytics visualization
- **State:** Zustand (lightweight, no Redux overhead)
- **Testing:** Jest + React Native Testing Library

## Core features

1. **Quick Challenges** — 30-second precision drills (tap timing, motion tracking, pattern matching) with instant scoring. The hook that gets people addicted.

2. **AR Target Practice** — Point camera at any surface, virtual targets appear, track accuracy and speed. Uses device motion sensors for immersive training.

3. **Performance Dashboard** — Visual progress tracking with streak counters, personal bests, and improvement curves. Shows tangible proof of skill gains.

4. **Custom Routines** — Build training sequences for specific skills (e.g., "basketball free throw timing" or "typing speed burst"). Saves as reusable templates.

5. **Challenge Mode** — Daily/weekly competitive challenges with global leaderboards. Social proof drives retention.

## Monetization strategy

**Free tier:**
- 3 challenge types (tap timing, reaction speed, basic motion tracking)
- 5 attempts per day
- Basic stats (last 7 days)
- No AR features

**Premium ($6.99/month or $49.99/year):**
- Unlimited challenges across 15+ types
- Full AR training scenarios
- Advanced analytics (trends, heatmaps, skill breakdowns)
- Custom routine builder with unlimited saves
- Ad-free experience
- Export performance data

**Why this price:** Higher than typical mobile games ($4.99) because it's a training tool, not entertainment. Comparable to fitness apps (Strava, Headspace). Annual discount incentivizes commitment.

**Retention drivers:**
- Streak mechanics (lose progress if you skip days)
- Weekly improvement reports ("You're 23% faster than last month")
- Social leaderboards reset monthly (always a chance to rank)
- New challenge types added quarterly

**One-time purchases:**
- Pro training packs ($9.99 each) — sport-specific routines (basketball, archery, esports)
- Removes friction for users who don't want subscriptions

## Market position

**Not saturated.** Competitors are fragmented:
- Aim Lab (PC only, gaming-focused)
- Sports apps (single-sport, no cross-training)
- Fitness apps (cardio/strength, not precision)

**Gap:** No mobile-first app combines AR, motion sensors, and cross-domain precision training with analytics. This is the "Duolingo for physical skills."

## File structure

```
strike-zone/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home - Quick Challenges
│   │   ├── ar-training.tsx        # AR Target Practice
│   │   ├── dashboard.tsx          # Performance Dashboard
│   │   ├── routines.tsx           # Custom Routines
│   │   └── leaderboard.tsx        # Challenge Mode
│   ├── _layout.tsx
│   └── challenge/[id].tsx         # Individual challenge screen
├── components/
│   ├── ChallengeCard.tsx
│   ├── PerformanceChart.tsx
│   ├── ARTargetOverlay.tsx
│   ├── TimerDisplay.tsx
│   └── StreakCounter.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── challenges.ts              # Challenge logic
│   ├── scoring.ts                 # Score calculation
│   ├── sensors.ts                 # Motion sensor utilities
│   └── ar-engine.ts               # AR rendering logic
├── store/
│   └── useStore.ts                # Zustand state
├── constants/
│   └── Challenges.ts              # Challenge definitions
├── __tests__/
│   ├── scoring.test.ts
│   ├── challenges.test.ts
│   └── database.test.ts
├── app.json
├── package.json
└── tsconfig.json
```

## Tests

**lib/__tests__/scoring.test.ts**
```typescript
import { calculateScore, getAccuracyRating } from '../scoring';

describe('Scoring System', () => {
  test('calculates score based on accuracy and speed', () => {
    const result = calculateScore({ hits: 8, total: 10, timeMs: 5000 });
    expect(result.score).toBeGreaterThan(0);
    expect(result.accuracy).toBe(80);
  });

  test('returns accuracy rating', () => {
    expect(getAccuracyRating(95)).toBe('Expert');
    expect(getAccuracyRating(75)).toBe('Good');
    expect(getAccuracyRating(50)).toBe('Fair');
  });
});
```

**lib/__tests__/challenges.test.ts**
```typescript
import { generateTargets, validateHit } from '../challenges';

describe('Challenge Logic', () => {
  test('generates random targets within bounds', () => {
    const targets = generateTargets(5, { width: 100, height: 100 });
    expect(targets).toHaveLength(5);
    targets.forEach(t => {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThanOrEqual(100);
    });
  });

  test('validates hit detection', () => {
    const target = { x: 50, y: 50, radius: 10 };
    expect(validateHit({ x: 52, y: 52 }, target)).toBe(true);
    expect(validateHit({ x: 70, y: 70 }, target)).toBe(false);
  });
});
```

**lib/__tests__/database.test.ts**
```typescript
import { savePerformance, getRecentScores } from '../database';

describe('Database Operations', () => {
  test('saves performance record', async () => {
    const record = {
      challengeId: 'tap-timing',
      score: 850,
      accuracy: 85,
      timestamp: Date.now()
    };
    await expect(savePerformance(record)).resolves.not.toThrow();
  });

  test('retrieves recent scores', async () => {
    const scores = await getRecentScores('tap-timing', 7);
    expect(Array.isArray(scores)).toBe(true);
  });
});
```

## Implementation steps

### Phase 1: Project Setup
1. Initialize Expo project: `npx create-expo-app@latest strike-zone --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-sensors expo-gl expo-three
   npm install zustand react-native-chart-kit
   npm install -D jest @testing-library/react-native
   ```
3. Configure `app.json`:
   - Set `ios.infoPlist.NSCameraUsageDescription` for AR
   - Set `android.permissions` for camera and sensors
4. Set up TypeScript strict mode in `tsconfig.json`

### Phase 2: Database Layer
1. Create `lib/database.ts`:
   - Initialize SQLite with tables: `performances`, `routines`, `user_stats`
   - Schema: `performances(id, challenge_id, score, accuracy, time_ms, timestamp)`
   - Export functions: `savePerformance`, `getRecentScores`, `getStreakCount`
2. Write tests in `__tests__/database.test.ts`
3. Run migrations on app startup in `app/_layout.tsx`

### Phase 3: Core Challenge System
1. Create `constants/Challenges.ts`:
   - Define challenge types: `TAP_TIMING`, `REACTION_SPEED`, `MOTION_TRACKING`
   - Each challenge has: id, name, description, duration, difficulty
2. Implement `lib/challenges.ts`:
   - `generateTargets(count, bounds)` — random positions
   - `validateHit(tap, target)` — collision detection
   - `startChallenge(type)` — initialize challenge state
3. Implement `lib/scoring.ts`:
   - `calculateScore({ hits, total, timeMs })` — weighted formula
   - `getAccuracyRating(percentage)` — text labels
4. Write tests for both modules

### Phase 4: State Management
1. Create `store/useStore.ts` with Zustand:
   - `currentChallenge` — active challenge state
   - `userStats` — streak, total challenges, best scores
   - `isPremium` — subscription status
   - Actions: `startChallenge`, `endChallenge`, `updateStats`

### Phase 5: Home Screen (Quick Challenges)
1. Build `app/(tabs)/index.tsx`:
   - Display 3 challenge cards (free tier)
   - Show daily attempt counter
   - Tap card → navigate to `challenge/[id]`
2. Create `components/ChallengeCard.tsx`:
   - Show challenge icon, name, best score
   - Lock icon for premium challenges
3. Create `components/StreakCounter.tsx`:
   - Display current streak with fire emoji
   - Animate on increment

### Phase 6: Challenge Screen
1. Build `app/challenge/[id].tsx`:
   - Countdown timer (3-2-1-GO)
   - Render targets based on challenge type
   - Track taps/hits in real-time
   - Show score on completion
   - Save to database
2. Create `components/TimerDisplay.tsx`:
   - Circular progress indicator
   - Time remaining in center
3. Handle touch events with `onTouchStart` for tap challenges

### Phase 7: Motion Sensor Integration
1. Implement `lib/sensors.ts`:
   - Subscribe to accelerometer/gyroscope
   - Detect motion patterns (shake, tilt, rotation)
   - Calculate motion speed and accuracy
2. Add motion-based challenge in `challenge/[id].tsx`:
   - Show device orientation guide
   - Track motion against target pattern
   - Provide haptic feedback on correct motion

### Phase 8: AR Target Practice
1. Implement `lib/ar-engine.ts`:
   - Initialize GL context with expo-gl
   - Render 3D targets using expo-three
   - Position targets in camera space
2. Build `app/(tabs)/ar-training.tsx`:
   - Request camera permissions
   - Show camera preview with GL overlay
   - Spawn targets at random positions
   - Detect taps on AR targets
   - Premium paywall for non-subscribers

### Phase 9: Performance Dashboard
1. Build `app/(tabs)/dashboard.tsx`:
   - Fetch last 30 days of performance data
   - Show streak counter prominently
   - Display personal bests by challenge type
2. Create `components/PerformanceChart.tsx`:
   - Line chart showing score trends
   - Bar chart for accuracy by challenge
   - Use react-native-chart-kit

### Phase 10: Custom Routines
1. Build `app/(tabs)/routines.tsx`:
   - List saved routines
   - "Create New" button (premium only)
   - Tap routine → start sequence
2. Add routine builder modal:
   - Select challenges to include
   - Set order and rest intervals
   - Save to database
3. Implement routine execution:
   - Auto-advance through challenges
   - Show progress (2/5 complete)
   - Aggregate final score

### Phase 11: Leaderboard
1. Build `app/(tabs)/leaderboard.tsx`:
   - Weekly challenge with fixed seed
   - Fetch top 100 scores (mock API for MVP)
   - Show user's rank
   - Countdown to next reset
2. Add social sharing:
   - "Share Score" button
   - Generate image with score and rank

### Phase 12: Monetization
1. Add premium paywall:
   - Show modal on locked features
   - "Upgrade to Premium" CTA
   - List benefits
2. Integrate in-app purchases (mock for MVP):
   - Use expo-store-review for prompts
   - Track subscription status in store
3. Add "Restore Purchases" option

### Phase 13: Polish
1. Add haptic feedback on hits/misses
2. Implement sound effects (optional toggle)
3. Add onboarding tutorial (first launch)
4. Create app icon and splash screen
5. Add error boundaries for crash handling

### Phase 14: Testing
1. Run `npm test` — all tests must pass
2. Test on iOS simulator (Expo Go)
3. Test on Android emulator (Expo Go)
4. Test on physical device for sensors/AR
5. Verify database persistence across app restarts
6. Test premium paywall flows

## How to verify it works

### Development
```bash
npm install
npm test                    # All tests pass
npx expo start
```

### Testing checklist
- [ ] Press 'i' for iOS simulator or 'a' for Android
- [ ] Tap a challenge card → challenge starts with countdown
- [ ] Complete challenge → score appears and saves
- [ ] Navigate to Dashboard → see saved score in chart
- [ ] Check streak counter increments
- [ ] Try AR Training → camera opens with targets (premium paywall on free tier)
- [ ] Create custom routine (premium feature)
- [ ] View leaderboard with mock data
- [ ] All `npm test` suites pass

### Device testing (required for full experience)
- Install Expo Go on physical device
- Scan QR code from `npx expo start`
- Test motion sensor challenges (shake, tilt)
- Test AR with real camera
- Verify haptic feedback works