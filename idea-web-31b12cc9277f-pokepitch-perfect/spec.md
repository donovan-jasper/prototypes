# SkillForge

## One-line pitch
Master any mobile game's mechanics through AI-powered practice drills that adapt to your skill level and track your improvement over time.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** Mobile gamers (ages 13-40) who feel stuck at their current skill level and want structured improvement without grinding in-game. This includes:
- Competitive players preparing for tournaments or ranked seasons
- Casual players who want to "get good" without embarrassment
- Parents who want their kids to practice gaming skills productively
- Content creators who need consistent performance for streams/videos

**Broadest audience:** Anyone who plays mobile games and wants measurable improvement. The app becomes a "gym for gaming" — just as people use fitness apps to improve physical skills, SkillForge improves digital dexterity.

**Adjacent use cases:**
- **Accessibility training:** Players with motor challenges can practice at their own pace
- **Onboarding tool:** New players can learn game mechanics before jumping into competitive matches
- **Cognitive training:** Reaction time, pattern recognition, and decision-making exercises that happen to use game mechanics
- **Social proof:** Share improvement stats on social media ("I improved my aim by 34% in 2 weeks")

**Why non-technical people want this:**
- No need to understand game theory or meta — the app just tells you what to practice
- Visual progress tracking makes improvement tangible (like seeing weight loss on a scale)
- Removes the frustration of "I don't know why I'm losing" by isolating specific skills
- Gamifies the meta-game: earning badges for practice streaks, competing on improvement leaderboards

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Animations:** React Native Reanimated 3
- **Sensors:** expo-sensors (accelerometer, gyroscope)
- **Charts:** react-native-chart-kit
- **Testing:** Jest + React Native Testing Library

## Core features (MVP)

1. **Drill Library**
   - Pre-built practice drills for 3 popular game types: aim training (shooter mechanics), timing challenges (rhythm/sports games), and swipe patterns (match-3/puzzle games)
   - Each drill has difficulty levels (beginner → expert)
   - 30-60 second sessions for quick practice

2. **Adaptive Difficulty**
   - AI adjusts drill speed/complexity based on performance
   - If you score 80%+ three times in a row, difficulty increases automatically
   - Keeps practice in the "flow zone" — not too easy, not impossible

3. **Progress Analytics**
   - Track accuracy, reaction time, and consistency over time
   - Weekly improvement reports with specific recommendations
   - Heatmaps showing which drill types need more work

4. **Custom Drill Builder** (Premium)
   - Users can create drills mimicking their favorite game's mechanics
   - Save and share custom drills with friends
   - Community-voted drill library

5. **Practice Streaks & Achievements**
   - Daily practice reminders
   - Unlock badges for milestones (100 drills completed, 7-day streak, etc.)
   - Leaderboards for improvement rate (not just raw scores — rewards growth)

## Monetization strategy

**Free tier:**
- Access to 5 basic drills (one per game type)
- Limited analytics (last 7 days only)
- 3 custom drills max
- Ads between drill sessions

**Premium ($4.99/month or $39.99/year):**
- Unlock all 50+ drills across 10+ game types
- Full analytics history with exportable reports
- Unlimited custom drills
- Ad-free experience
- Early access to new drill types
- Priority support

**Hook:** Free users get enough to see measurable improvement in one week (the "aha moment"). Once they're hooked on progress tracking, they hit limits and upgrade.

**Retention drivers:**
- Sunk cost fallacy: "I've tracked 30 days of progress, I can't lose that data"
- Continuous content: New drills added monthly based on trending games
- Social proof: Share improvement stats, challenge friends to beat your scores
- Habit formation: Daily practice streaks create routine dependency

**Price reasoning:** $4.99/month is impulse-buy territory (less than a coffee), while $39.99/year (33% discount) encourages annual commitment. Competitive with game battle passes ($10-15) but offers year-round value.

## File structure

```
skillforge/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Drill Library
│   │   ├── practice.tsx           # Active drill session
│   │   ├── analytics.tsx          # Progress tracking
│   │   └── profile.tsx            # Settings/Premium
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── DrillCard.tsx
│   ├── DrillSession.tsx
│   ├── ProgressChart.tsx
│   ├── AchievementBadge.tsx
│   └── PremiumGate.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── drills.ts                  # Drill definitions & logic
│   ├── analytics.ts               # Score calculation & tracking
│   ├── adaptive.ts                # Difficulty adjustment algorithm
│   └── types.ts                   # TypeScript interfaces
├── store/
│   └── useStore.ts                # Zustand state management
├── constants/
│   └── Drills.ts                  # Pre-built drill configurations
├── __tests__/
│   ├── drills.test.ts
│   ├── analytics.test.ts
│   ├── adaptive.test.ts
│   └── database.test.ts
├── assets/
│   ├── images/
│   └── sounds/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/drills.test.ts
import { calculateScore, validateDrillCompletion } from '../lib/drills';

// __tests__/analytics.test.ts
import { calculateImprovement, generateWeeklyReport } from '../lib/analytics';

// __tests__/adaptive.test.ts
import { adjustDifficulty, shouldLevelUp } from '../lib/adaptive';

// __tests__/database.test.ts
import { saveDrillResult, getUserStats } from '../lib/database';
```

Each test file covers:
- Core logic functions (score calculation, difficulty adjustment)
- Database operations (CRUD for drill results)
- Edge cases (invalid inputs, empty data sets)
- Performance tracking accuracy

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app skillforge --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite zustand react-native-reanimated react-native-chart-kit expo-sensors
   npm install --save-dev jest @testing-library/react-native @types/jest
   ```
3. Configure TypeScript strict mode in `tsconfig.json`
4. Set up Jest config for React Native

### Phase 2: Database layer
1. Create `lib/database.ts`:
   - Initialize SQLite database with tables: `drills`, `drill_results`, `user_stats`, `achievements`
   - Write CRUD functions: `saveDrillResult()`, `getUserStats()`, `getRecentResults()`
2. Create `lib/types.ts`:
   - Define interfaces: `Drill`, `DrillResult`, `UserStats`, `Achievement`
3. Write `__tests__/database.test.ts`:
   - Test database initialization
   - Test saving/retrieving drill results
   - Test stats aggregation

### Phase 3: Drill engine
1. Create `lib/drills.ts`:
   - `generateDrillSequence()`: Creates random target sequences based on drill type
   - `validateInput()`: Checks if user input matches target
   - `calculateScore()`: Computes accuracy, reaction time, consistency
2. Create `constants/Drills.ts`:
   - Define 5 starter drills (aim, timing, swipe, pattern, reflex)
   - Each drill has: name, description, difficulty levels, scoring rules
3. Write `__tests__/drills.test.ts`:
   - Test score calculation with various inputs
   - Test drill sequence generation
   - Test input validation

### Phase 4: Adaptive difficulty
1. Create `lib/adaptive.ts`:
   - `shouldLevelUp()`: Checks if user scored 80%+ on last 3 attempts
   - `adjustDifficulty()`: Increases speed/complexity by 15%
   - `getRecommendedDrill()`: Suggests next drill based on weak areas
2. Write `__tests__/adaptive.test.ts`:
   - Test level-up logic with mock data
   - Test difficulty adjustment calculations
   - Test drill recommendations

### Phase 5: Analytics engine
1. Create `lib/analytics.ts`:
   - `calculateImprovement()`: Compares current vs. previous week's average
   - `generateWeeklyReport()`: Creates summary with top improvements/weaknesses
   - `getProgressData()`: Formats data for charts
2. Write `__tests__/analytics.test.ts`:
   - Test improvement calculations
   - Test report generation
   - Test data formatting for charts

### Phase 6: State management
1. Create `store/useStore.ts`:
   - Zustand store with slices: `drills`, `currentSession`, `userStats`, `settings`
   - Actions: `startDrill()`, `submitResult()`, `updateStats()`, `togglePremium()`
2. Integrate store with database layer

### Phase 7: UI components
1. Create `components/DrillCard.tsx`:
   - Display drill name, difficulty, best score
   - "Start" button triggers drill session
2. Create `components/DrillSession.tsx`:
   - Renders active drill interface (targets, timer, score)
   - Handles touch/gesture input
   - Uses Reanimated for smooth animations
3. Create `components/ProgressChart.tsx`:
   - Line chart showing score trends over time
   - Uses react-native-chart-kit
4. Create `components/AchievementBadge.tsx`:
   - Displays unlocked achievements with icons
5. Create `components/PremiumGate.tsx`:
   - Modal prompting upgrade for locked features

### Phase 8: Screens
1. Update `app/(tabs)/index.tsx`:
   - Grid of DrillCard components
   - Filter by game type
   - Search bar
2. Create `app/(tabs)/practice.tsx`:
   - Full-screen DrillSession component
   - Post-drill results screen with score breakdown
3. Create `app/(tabs)/analytics.tsx`:
   - ProgressChart for each tracked metric
   - Weekly report card
   - Improvement percentage badges
4. Create `app/(tabs)/profile.tsx`:
   - Achievement showcase
   - Practice streak counter
   - Premium upgrade CTA
   - Settings (notifications, difficulty preferences)

### Phase 9: Drill implementations
1. Implement aim training drill:
   - Random targets appear on screen
   - User taps as fast as possible
   - Score based on accuracy + speed
2. Implement timing drill:
   - Moving indicator, user taps at precise moment
   - Score based on timing precision
3. Implement swipe pattern drill:
   - Show pattern, user replicates swipe sequence
   - Score based on accuracy + speed
4. Implement pattern recognition drill:
   - Flash sequence of colors/shapes
   - User recalls sequence
5. Implement reflex drill:
   - React to visual/audio cues
   - Score based on reaction time

### Phase 10: Polish & testing
1. Add haptic feedback for correct/incorrect inputs
2. Add sound effects (optional, with mute toggle)
3. Implement daily practice reminders (expo-notifications)
4. Add onboarding flow for first-time users
5. Run full test suite: `npm test`
6. Test on iOS simulator and Android emulator
7. Test on physical devices via Expo Go

### Phase 11: Premium features
1. Implement custom drill builder:
   - UI for configuring drill parameters
   - Save custom drills to database
   - Share drill codes with friends
2. Add advanced analytics:
   - Heatmaps showing performance by time of day
   - Comparison with global averages
   - Exportable CSV reports
3. Implement ad removal for premium users

## How to verify it works

### Local testing
1. Start Expo dev server: `npx expo start`
2. Open in Expo Go on iOS/Android device or simulator
3. Run test suite: `npm test` (all tests must pass)

### Functional verification
1. **Drill Library:** Tap a drill card → drill session starts
2. **Drill Session:** Complete a drill → see score screen with breakdown
3. **Adaptive Difficulty:** Complete same drill 3 times with 80%+ score → difficulty increases on 4th attempt
4. **Analytics:** Complete 5+ drills → analytics tab shows progress chart
5. **Achievements:** Complete 10 drills → unlock "Getting Started" badge
6. **Premium Gate:** Tap locked drill → premium upgrade modal appears
7. **Custom Drill:** (Premium) Create custom drill → save → appears in library

### Performance checks
- Drill animations run at 60fps (no jank)
- Touch input latency < 50ms
- Database queries complete < 100ms
- App launches in < 3 seconds

### Edge cases
- Complete drill with 0% accuracy → still saves result
- Close app mid-drill → session discarded, no corrupt data
- Enable airplane mode → app still works (local-first)
- Rapid-fire taps → no duplicate score submissions