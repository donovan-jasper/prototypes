# MotiMorph

## One-line pitch
Your pocket coach that learns when you need a boost and delivers the right words at the right moment.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** Anyone navigating life transitions or daily struggles with motivation — not just productivity enthusiasts, but people dealing with:
- Career changes (job seekers, new managers, career pivoters)
- Life transitions (new parents, empty nesters, retirees)
- Health journeys (fitness beginners, recovery, chronic illness management)
- Students (exam stress, imposter syndrome, academic pressure)
- Caregivers (burnout prevention, emotional support)
- Anyone building self-confidence after setbacks

**Broadest audience:** The 70% of people who've tried and failed at habit formation or self-improvement apps. They don't want another to-do list — they want emotional support that feels personal.

**Adjacent use cases:**
- **Relationship maintenance:** Daily prompts to text a friend, call parents, or express gratitude to partners
- **Creative unblocking:** Writers, artists, and makers who need permission to start or keep going
- **Grief and loss support:** Gentle daily reminders that healing isn't linear
- **Language learners:** Motivational phrases in target languages
- **Sobriety tracking:** Daily affirmations for recovery milestones

**Why non-technical people want this:** It's not about "optimizing productivity" — it's about feeling seen. The app notices when you're consistent, celebrates small wins, and adjusts when you're struggling. It's the friend who checks in at the right time.

**The unfair advantage:** Unlike generic affirmation apps, MotiMorph learns your patterns. Missed three days? It softens the tone. Hit a 30-day streak? It challenges you to level up. It's not just notifications — it's adaptive emotional intelligence.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **Notifications:** expo-notifications
- **State management:** Zustand (lightweight, no Redux overhead)
- **Date handling:** date-fns
- **Testing:** Jest + React Native Testing Library
- **AI integration (premium):** OpenAI API (GPT-4o-mini for cost efficiency)
- **Analytics:** Expo Analytics (privacy-first, no third-party trackers)

## Core features (MVP)

1. **Smart timing engine**
   - User sets 1-3 daily notification windows (morning routine, lunch break, evening wind-down)
   - App learns optimal times based on when user actually opens notifications
   - Adapts frequency if user dismisses repeatedly (backs off) or engages consistently (adds bonus check-ins)

2. **Contextual affirmation library**
   - 200+ pre-written affirmations categorized by: energy level (low/medium/high), time of day, streak status, and emotional tone
   - Free tier: rotates through curated library
   - Premium: AI generates personalized affirmations based on user's goals and recent engagement patterns

3. **Streak visualization with forgiveness**
   - Visual calendar showing daily check-ins
   - "Grace days" system: missing 1 day doesn't break streak (encourages self-compassion)
   - Milestone celebrations at 7, 30, 100, 365 days with shareable graphics

4. **Mood check-in (optional)**
   - Simple emoji tap after reading affirmation (😔 😐 😊 🔥)
   - Informs future affirmation selection (if user rates 😔, next message is gentler)
   - Premium: mood trends over time

5. **Goal anchoring**
   - User sets 1-3 personal goals (e.g., "exercise 3x/week", "finish novel", "be kinder to myself")
   - Affirmations subtly reference these goals without being preachy
   - Premium: progress tracking tied to goals

## Monetization strategy

### Free tier (the hook)
- 1 daily affirmation at a fixed time
- Basic streak tracking (no grace days)
- 50 curated affirmations (rotates weekly)
- Ads (non-intrusive banner after viewing affirmation)

### Premium tier: $4.99/month or $39.99/year (17% discount)
**Why this price?** Lower than therapy apps ($20+/mo), higher than generic habit trackers ($2-3/mo). Positioned as "daily emotional support" not just "productivity tool."

**Premium unlocks:**
- **AI-personalized affirmations** (the killer feature — feels like it's written for YOU)
- **3 daily check-ins** (morning, midday, evening)
- **Grace days** (2 per week — life happens)
- **Mood analytics** (see patterns, export data)
- **Goal progress tracking** with weekly insights
- **Ad-free experience**
- **Custom notification sounds** (calming tones, not jarring alerts)
- **Shareable milestone graphics** (Instagram-ready)

### What makes people STAY subscribed?
- **Sunk cost of streak:** After 30 days, losing AI personalization feels like losing a friend
- **Behavioral lock-in:** The app knows your patterns — switching means starting over
- **Emotional ROI:** $5/mo is less than one coffee, and users attribute mood improvements to the app
- **Annual discount:** 40% of premium users convert to annual within 3 months (industry standard for habit apps)

### Revenue projections (conservative)
- 10K downloads in first 6 months (organic + Show HN launch)
- 5% conversion to premium (500 users × $5 = $2,500/mo)
- 30% annual upgrade rate (150 users × $40 = $6,000 one-time)
- Break-even at ~300 premium users (covers OpenAI API costs + hosting)

## File structure

```
motimorph/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home (today's affirmation)
│   │   ├── streak.tsx             # Streak calendar
│   │   ├── goals.tsx              # Goal management
│   │   └── settings.tsx           # Settings & premium upsell
│   ├── _layout.tsx                # Root layout with navigation
│   └── +not-found.tsx
├── components/
│   ├── AffirmationCard.tsx        # Main affirmation display
│   ├── StreakCalendar.tsx         # Visual streak tracker
│   ├── MoodSelector.tsx           # Emoji mood picker
│   ├── GoalItem.tsx               # Individual goal component
│   ├── PremiumBanner.tsx          # Upsell component
│   └── NotificationPermission.tsx # Permission prompt
├── lib/
│   ├── database.ts                # SQLite setup & queries
│   ├── notifications.ts           # Notification scheduling logic
│   ├── affirmations.ts            # Affirmation selection engine
│   ├── ai.ts                      # OpenAI API integration (premium)
│   ├── analytics.ts               # Usage tracking
│   └── constants.ts               # App constants
├── store/
│   └── useStore.ts                # Zustand global state
├── types/
│   └── index.ts                   # TypeScript types
├── __tests__/
│   ├── affirmations.test.ts       # Affirmation logic tests
│   ├── notifications.test.ts      # Notification scheduling tests
│   ├── database.test.ts           # Database operations tests
│   └── components/
│       ├── AffirmationCard.test.tsx
│       └── StreakCalendar.test.tsx
├── assets/
│   ├── affirmations.json          # Pre-written affirmation library
│   └── sounds/                    # Custom notification sounds
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### Core logic tests

**`__tests__/affirmations.test.ts`**
- Test affirmation selection based on time of day
- Test mood-based filtering
- Test streak milestone detection
- Test grace day calculation

**`__tests__/notifications.test.ts`**
- Test notification scheduling at user-defined times
- Test adaptive timing based on engagement
- Test notification permission handling

**`__tests__/database.test.ts`**
- Test CRUD operations for affirmations, streaks, goals
- Test mood history storage
- Test data migration

**`__tests__/components/AffirmationCard.test.tsx`**
- Test rendering with different affirmation types
- Test mood selection interaction
- Test share functionality

**`__tests__/components/StreakCalendar.test.tsx`**
- Test calendar rendering with streak data
- Test grace day visualization
- Test milestone highlighting

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app motimorph --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-notifications expo-device zustand date-fns
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json` with notification permissions and app metadata
4. Set up TypeScript types in `types/index.ts`

### Phase 2: Database layer
1. Create `lib/database.ts` with SQLite initialization
2. Define tables:
   - `affirmations` (id, text, category, time_of_day, energy_level)
   - `user_sessions` (id, timestamp, affirmation_id, mood_rating)
   - `goals` (id, title, created_at, is_active)
   - `streaks` (id, date, is_grace_day)
3. Write seed data loader for `assets/affirmations.json`
4. Implement CRUD functions with error handling
5. Write tests in `__tests__/database.test.ts`

### Phase 3: Affirmation engine
1. Create `lib/affirmations.ts` with selection logic:
   - `getAffirmationForContext(timeOfDay, mood, streakCount)` - returns best-fit affirmation
   - `calculateStreak(sessions)` - computes current streak with grace days
   - `shouldShowMilestone(streakCount)` - checks for celebration triggers
2. Load affirmations from JSON into SQLite on first launch
3. Implement mood-based filtering (if user rated 😔 yesterday, avoid high-energy affirmations)
4. Write tests in `__tests__/affirmations.test.ts`

### Phase 4: Notification system
1. Create `lib/notifications.ts`:
   - `requestPermissions()` - handles iOS/Android permission flow
   - `scheduleDaily(times)` - sets up recurring notifications
   - `cancelAll()` - clears scheduled notifications
   - `trackEngagement(opened)` - logs when user opens notification
2. Implement adaptive timing: if user consistently opens at 8:15am (not 8:00am), shift schedule
3. Add notification content with affirmation preview
4. Write tests in `__tests__/notifications.test.ts`

### Phase 5: Core UI components
1. **AffirmationCard.tsx**:
   - Display today's affirmation with smooth fade-in animation
   - Show streak count at top
   - Mood selector at bottom (optional tap)
   - Share button (generates image with affirmation text)
   - Write test in `__tests__/components/AffirmationCard.test.tsx`

2. **StreakCalendar.tsx**:
   - Month view with dots for completed days
   - Highlight grace days in different color
   - Show milestone badges (7, 30, 100 days)
   - Write test in `__tests__/components/StreakCalendar.test.tsx`

3. **MoodSelector.tsx**:
   - Four emoji buttons (😔 😐 😊 🔥)
   - Haptic feedback on tap
   - Saves to database immediately

4. **GoalItem.tsx**:
   - Editable text field for goal title
   - Toggle for active/inactive
   - Delete button with confirmation

5. **PremiumBanner.tsx**:
   - Shows after 7 days of free usage
   - Highlights AI personalization feature
   - Links to in-app purchase flow (stub for MVP)

### Phase 6: State management
1. Create `store/useStore.ts` with Zustand:
   - `currentAffirmation` - today's displayed affirmation
   - `streakCount` - current streak number
   - `goals` - array of user goals
   - `isPremium` - subscription status (hardcoded false for MVP)
   - `lastMoodRating` - most recent mood
2. Add actions: `setAffirmation`, `updateStreak`, `addGoal`, `logMood`

### Phase 7: Screen implementation
1. **app/(tabs)/index.tsx** (Home):
   - Fetch today's affirmation on mount
   - Display AffirmationCard
   - Show NotificationPermission prompt if not granted
   - Log session to database when viewed

2. **app/(tabs)/streak.tsx**:
   - Render StreakCalendar with data from database
   - Show stats: current streak, longest streak, total check-ins
   - Display next milestone progress

3. **app/(tabs)/goals.tsx**:
   - List of GoalItem components
   - Add new goal button
   - Empty state with suggestion to add first goal

4. **app/(tabs)/settings.tsx**:
   - Notification time pickers (morning, midday, evening)
   - Premium upsell section with feature list
   - Export data button (JSON download)
   - About/credits section

### Phase 8: AI integration (premium stub)
1. Create `lib/ai.ts`:
   - `generatePersonalizedAffirmation(goals, moodHistory)` - calls OpenAI API
   - For MVP, return mock response: "This feature unlocks with Premium"
   - Add error handling for API failures
2. Gate behind `isPremium` check in affirmation engine

### Phase 9: Polish
1. Add loading states for all async operations
2. Implement error boundaries for crash recovery
3. Add haptic feedback for key interactions (mood selection, milestone celebrations)
4. Create app icon and splash screen
5. Add onboarding flow (3 screens: welcome, set goals, enable notifications)

### Phase 10: Testing
1. Run all Jest tests: `npm test`
2. Test notification delivery on physical device (Expo Go doesn't support background notifications)
3. Test streak calculation edge cases (timezone changes, grace days)
4. Test offline functionality (all features work without internet except AI)
5. Test on both iOS and Android

## How to verify it works

### Local development
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Grant notification permissions when prompted
4. Set notification time to 1 minute from now in Settings
5. Background the app and wait for notification
6. Tap notification → should open to today's affirmation
7. Select a mood → should save and update streak
8. Navigate to Streak tab → should show calendar with today marked
9. Add a goal in Goals tab → should persist after app restart

### Automated tests
```bash
npm test
```
All tests must pass:
- Affirmation selection logic (10+ test cases)
- Notification scheduling (5+ test cases)
- Database operations (8+ test cases)
- Component rendering (5+ test cases)

### Production readiness checklist
- [ ] Notifications work on physical device (not just simulator)
- [ ] Streak persists across app restarts
- [ ] Grace days calculate correctly
- [ ] Mood ratings save to database
- [ ] Goals can be added/edited/deleted
- [ ] Premium banner shows after 7 days
- [ ] App doesn't crash when offline
- [ ] All Jest tests pass
- [ ] App icon and splash screen display correctly
- [ ] Onboarding flow completes successfully

### Key metrics to track post-launch
- Daily active users (DAU)
- Notification open rate (target: >40%)
- 7-day retention (target: >30%)
- Premium conversion rate (target: >5%)
- Average streak length (target: >14 days)