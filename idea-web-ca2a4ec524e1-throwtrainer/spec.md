# SkillShot

## One-line pitch
Turn your backyard into a training ground—track throws, shots, and swings with AR precision and compete with friends to level up your real-world skills.

## Expanded vision

### Who is this REALLY for?

**Primary audiences:**
- **Parents of kids 8-16** who want their children off screens and developing athletic skills, but need the gamification hook to make practice fun
- **Weekend warriors (25-45)** who play recreational sports (softball, basketball, disc golf, cornhole) and want measurable improvement without hiring a coach
- **Fitness enthusiasts** looking for outdoor activity alternatives that feel like play, not work
- **Youth coaches and PE teachers** who need engagement tools to make drills competitive and trackable

**Adjacent use cases:**
- **Rehabilitation patients** recovering from shoulder/arm injuries who need motion tracking and progress metrics
- **Corporate team building** — companies buying group licenses for outdoor activity challenges
- **Party/tailgate entertainment** — turn any gathering into a competitive skills challenge with instant leaderboards
- **Content creators** who want shareable AR training clips for TikTok/Instagram (built-in viral loop)

**Why non-technical people want this:**
It solves the "I want to get better but don't know if I'm improving" problem. You don't need to understand AR or motion tracking—you just throw a ball, and the app tells you if you're getting more accurate, faster, or more consistent. It's the Strava of skill-based sports.

**Broadest positioning:**
This isn't just a training app—it's a **social fitness platform for skill-based activities**. Think Peloton leaderboards meets backyard sports. The AR is the hook, but the retention comes from progress tracking, challenges with friends, and the dopamine hit of seeing your accuracy percentage climb.

## Tech stack

- **React Native (Expo SDK 52+)** — cross-platform iOS/Android with managed workflow
- **Expo Camera + AR** — `expo-camera` for video feed, `expo-gl` + `expo-three` for AR overlays
- **Expo Sensors** — `expo-sensors` (accelerometer, gyroscope) for motion detection
- **SQLite** — `expo-sqlite` for local session storage, personal records, and offline-first data
- **Expo AV** — `expo-av` for sound effects and haptic feedback
- **AsyncStorage** — `@react-native-async-storage/async-storage` for user preferences
- **React Navigation** — `@react-navigation/native` for screen flow
- **Zustand** — lightweight state management (no Redux bloat)
- **Jest + React Native Testing Library** — unit and integration tests

## Core features (MVP)

1. **AR Target Zones**
   - Point camera at any surface (wall, net, ground), tap to place virtual targets
   - Real-time motion tracking detects throw/shot trajectory and shows hit/miss with visual feedback
   - Supports 5 activity types: basketball shots, baseball/softball throws, disc golf, cornhole, darts

2. **Session Tracking & Stats**
   - Auto-logs every attempt with accuracy %, distance, speed (derived from motion sensors)
   - Personal records dashboard: best streak, highest accuracy, total reps
   - Historical graphs show improvement over time (weekly/monthly views)

3. **Challenge Mode**
   - Pre-built challenges (e.g., "Hit 10 targets in 60 seconds", "5 bullseyes in a row")
   - Async multiplayer: send challenge to friend, they have 24hrs to beat your score
   - Local leaderboard (friends only, no global to avoid moderation costs at MVP)

4. **Freemium Paywall**
   - Free: 1 activity type (basketball), basic stats, 3 challenges/week
   - Premium ($4.99/month): all 5 activity types, unlimited challenges, AR replay clips (shareable video of your best shots with overlay graphics)

5. **Onboarding Flow**
   - 60-second interactive tutorial: place target, make 3 throws, see stats
   - Calibration step: user confirms their throw motion (overhand, underhand, sidearm) for accurate tracking

## Monetization strategy

**Free tier (the hook):**
- Basketball shooting only (most accessible—everyone has a hoop or can find one)
- 10 sessions before paywall prompt
- Basic stats (accuracy %, total shots)
- 1 challenge per week

**Premium tier ($4.99/month):**
- All 5 activity types unlocked
- Unlimited challenges + custom challenge builder
- AR replay clips (15-second shareable videos with stats overlay)
- Advanced analytics (release angle, arc consistency, speed trends)
- Ad-free experience

**Why $4.99?**
- Below the $5 psychological barrier
- Comparable to Strava ($5/month), Headspace ($5.83/month)—established precedent for fitness/wellness subscriptions
- High enough to signal quality, low enough for impulse purchase

**Retention drivers:**
- **Streak mechanics** — "You've trained 12 days in a row, don't break the chain"
- **Social proof** — "Your friend just beat your cornhole record"
- **Progress milestones** — "You've improved accuracy by 23% this month" (only visible in premium)
- **Seasonal challenges** — March Madness shooting challenge, summer disc golf tournament (premium exclusive)

**Future revenue streams (post-MVP):**
- Coach accounts ($19.99/month) — manage team rosters, assign drills, view aggregate stats
- One-time challenge packs ($1.99 each) — themed challenges (NBA Finals, Olympics)
- Branded partnerships (Wilson, Spalding) for equipment recommendations

## Market validation

**NOT saturated because:**
- Existing AR fitness apps (Supernatural, FitXR) focus on VR headsets or indoor cardio—not outdoor skill training
- Niche throwing trainers (Pocket Radar, Rapsodo) cost $200-400 and require hardware—we're software-only
- Pokémon GO proved AR + outdoor activity works, but doesn't train real skills
- Strava dominates endurance sports but ignores skill-based activities

**Clear gap:**
No app combines AR feedback + motion tracking + social challenges for backyard sports. Closest competitor is HomeCourt (basketball only, $8/month, no AR targets). We're broader (5 sports) and cheaper.

## File structure

```
skillshot/
├── app.json
├── package.json
├── babel.config.js
├── jest.config.js
├── App.tsx
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── ARTrainingScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   ├── ChallengesScreen.tsx
│   │   └── PaywallScreen.tsx
│   ├── components/
│   │   ├── ARTargetOverlay.tsx
│   │   ├── MotionDetector.tsx
│   │   ├── SessionTimer.tsx
│   │   ├── StatsCard.tsx
│   │   └── ChallengeCard.tsx
│   ├── store/
│   │   ├── useSessionStore.ts
│   │   ├── useUserStore.ts
│   │   └── useChallengeStore.ts
│   ├── services/
│   │   ├── database.ts
│   │   ├── motionAnalyzer.ts
│   │   ├── arService.ts
│   │   └── subscriptionService.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── calculations.ts
│   │   └── permissions.ts
│   └── types/
│       └── index.ts
└── __tests__/
    ├── motionAnalyzer.test.ts
    ├── calculations.test.ts
    ├── database.test.ts
    └── components/
        ├── StatsCard.test.tsx
        └── SessionTimer.test.tsx
```

## Tests

### Core logic tests (Jest)

**`__tests__/motionAnalyzer.test.ts`**
- Test motion data parsing from accelerometer/gyroscope
- Validate throw detection algorithm (speed, angle calculation)
- Edge cases: no motion, erratic motion, device shake vs actual throw

**`__tests__/calculations.test.ts`**
- Accuracy percentage calculation (hits/total attempts)
- Distance estimation from motion data
- Streak counting logic
- Personal record detection

**`__tests__/database.test.ts`**
- Session CRUD operations
- Stats aggregation queries
- Data migration scenarios
- Offline data sync

**`__tests__/components/StatsCard.test.tsx`**
- Renders correct stats from mock data
- Handles zero sessions gracefully
- Premium vs free tier display logic

**`__tests__/components/SessionTimer.test.tsx`**
- Timer starts/stops correctly
- Auto-save on session end
- Background timer behavior

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app skillshot --template blank-typescript`
2. Install dependencies:
   ```bash
   npx expo install expo-camera expo-gl expo-three expo-sensors expo-av expo-sqlite @react-native-async-storage/async-storage
   npm install @react-navigation/native @react-navigation/stack zustand
   npm install -D jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json`:
   - Set permissions: `CAMERA`, `MOTION`, `STORAGE`
   - Add splash screen and icon placeholders
4. Set up navigation structure in `App.tsx` with stack navigator

### Phase 2: Database layer
1. Create `src/services/database.ts`:
   - Initialize SQLite database with tables: `sessions`, `attempts`, `challenges`, `user_settings`
   - Write CRUD functions: `createSession()`, `logAttempt()`, `getStats()`, `getPersonalRecords()`
2. Write tests in `__tests__/database.test.ts`
3. Create TypeScript types in `src/types/index.ts` for Session, Attempt, Challenge, UserStats

### Phase 3: Motion detection
1. Create `src/services/motionAnalyzer.ts`:
   - Subscribe to accelerometer/gyroscope with `expo-sensors`
   - Implement throw detection algorithm:
     - Detect rapid acceleration spike (throw initiation)
     - Calculate peak velocity from acceleration integral
     - Estimate release angle from gyroscope data
   - Return `ThrowData` object: `{ speed: number, angle: number, timestamp: number }`
2. Write tests in `__tests__/motionAnalyzer.test.ts` with mock sensor data
3. Create `src/utils/calculations.ts`:
   - `calculateAccuracy(hits, total)` → percentage
   - `detectPersonalRecord(currentStats, newAttempt)` → boolean
   - `calculateStreak(sessions)` → number
4. Write tests in `__tests__/calculations.test.ts`

### Phase 4: AR camera screen
1. Create `src/screens/ARTrainingScreen.tsx`:
   - Use `expo-camera` to display live camera feed
   - Add "Place Target" button that overlays a virtual target using `expo-gl` + `expo-three`
   - Implement tap-to-place: user taps screen, target appears at that position
   - Store target coordinates in component state
2. Create `src/components/ARTargetOverlay.tsx`:
   - Render 3D target mesh (circle with concentric rings)
   - Animate hit/miss feedback (green flash for hit, red for miss)
3. Create `src/components/MotionDetector.tsx`:
   - Wraps `motionAnalyzer` service
   - Listens for throw events, calculates if trajectory intersects target zone
   - Emits `onThrowDetected` callback with result
4. Integrate: when throw detected, check if it "hit" the target (simple 2D distance check from target center), update session stats

### Phase 5: Session tracking
1. Create `src/store/useSessionStore.ts` (Zustand):
   - State: `currentSession`, `attempts`, `isActive`
   - Actions: `startSession()`, `endSession()`, `logAttempt()`
2. Create `src/components/SessionTimer.tsx`:
   - Display elapsed time, attempt count, current accuracy
   - "End Session" button saves to database
3. Update `ARTrainingScreen` to use session store
4. Write tests for `SessionTimer` component

### Phase 6: Stats dashboard
1. Create `src/screens/StatsScreen.tsx`:
   - Fetch stats from database: total sessions, overall accuracy, personal records
   - Display in cards: "Best Streak", "Highest Accuracy", "Total Shots"
2. Create `src/components/StatsCard.tsx`:
   - Reusable card component with icon, label, value
   - Test with mock data
3. Add simple line chart for accuracy over time (use `react-native-svg` + manual path drawing, avoid heavy chart libraries)

### Phase 7: Challenges
1. Create `src/store/useChallengeStore.ts`:
   - State: `availableChallenges`, `activeChallenges`, `completedChallenges`
   - Actions: `startChallenge()`, `completeChallenge()`, `sendChallenge(friendId)`
2. Create `src/screens/ChallengesScreen.tsx`:
   - List of pre-built challenges (hardcoded for MVP)
   - "Start Challenge" button launches AR screen with challenge rules overlay
3. Create `src/components/ChallengeCard.tsx`:
   - Display challenge name, description, reward (e.g., "Unlock new target skin")
   - Show completion status

### Phase 8: Onboarding
1. Create `src/screens/OnboardingScreen.tsx`:
   - 3-step flow: Welcome → Calibration → First Throw
   - Calibration: user selects throw type (overhand, underhand, sidearm)
   - First throw: guided tutorial with AR target, user makes 3 throws
2. Store onboarding completion in AsyncStorage
3. Show onboarding only on first launch

### Phase 9: Paywall
1. Create `src/services/subscriptionService.ts`:
   - Mock subscription check for MVP (returns `isPremium: boolean`)
   - Placeholder for future Expo In-App Purchases integration
2. Create `src/screens/PaywallScreen.tsx`:
   - Display premium features list
   - "Subscribe" button (mock for MVP, shows alert "Subscription successful")
3. Create `src/store/useUserStore.ts`:
   - State: `isPremium`, `activityType`, `sessionCount`
   - Actions: `upgradeToPremium()`, `setActivityType()`
4. Gate features in AR screen: if free tier and sessionCount > 10, show paywall

### Phase 10: Polish
1. Add sound effects with `expo-av`:
   - Hit sound (satisfying "ding")
   - Miss sound (subtle "whoosh")
   - Session complete sound
2. Add haptic feedback on throw detection
3. Create `src/screens/HomeScreen.tsx`:
   - "Start Training" button → AR screen
   - Quick stats summary
   - Navigation to Stats, Challenges screens
4. Style all screens with consistent theme (use Expo's default light/dark mode support)
5. Add loading states and error handling

### Phase 11: Testing
1. Run all Jest tests: `npm test`
2. Fix any failing tests
3. Manual testing checklist:
   - Camera permissions granted
   - AR target placement works
   - Throw detection triggers (shake device to simulate)
   - Stats update after session
   - Paywall appears after 10 sessions
   - Onboarding shows only once

## How to verify it works

### On device (iOS/Android via Expo Go)
1. Install Expo Go app on your phone
2. Run `npx expo start` in project directory
3. Scan QR code with Expo Go
4. Grant camera and motion permissions when prompted
5. Complete onboarding flow
6. Test AR training:
   - Point camera at wall or ground
   - Tap to place target
   - Make throwing motion with phone (or actual throw if safe)
   - Verify hit/miss detection and stats update
7. End session, check Stats screen for updated data
8. Start 11 sessions to trigger paywall
9. Verify challenges screen loads pre-built challenges

### Automated tests
1. Run `npm test` — all tests must pass
2. Check coverage: `npm test -- --coverage` (aim for >80% on core logic)

### Simulator testing (limited AR)
- AR features won't work in iOS Simulator (no camera)
- Test navigation, stats, database operations, and UI components
- Use mock data for motion detection in simulator