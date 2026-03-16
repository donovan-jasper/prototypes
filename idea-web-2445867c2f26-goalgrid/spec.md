# GoalGrid Spec

## 1. App Name

**StreakStack**

## 2. One-line pitch

Build unstoppable habits with friends — track streaks, compete on leaderboards, and get AI coaching that actually keeps you motivated.

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:** Anyone who's tried to build a habit and failed because they felt alone in it.

**Broadest reach:**
- **Fitness beginners** who need accountability partners (not just tracking)
- **Remote workers** struggling with work-life boundaries and routine
- **Students** preparing for exams or building study habits
- **Parents** trying to model consistency for their kids
- **Career changers** learning new skills (coding, languages, design)
- **Mental health seekers** building meditation, journaling, or therapy homework habits
- **Financial discipline seekers** (saving, budgeting, debt payoff)
- **Sobriety communities** (AA, recovery programs)
- **Couples** building shared habits (date nights, communication rituals)

### Adjacent use cases:
- **Team productivity** — small teams tracking shared goals (standup attendance, code reviews, learning sprints)
- **Classroom engagement** — teachers gamifying homework completion
- **Health coaching** — therapists/nutritionists assigning trackable habits to clients
- **Community challenges** — fitness studios, book clubs, or online communities running group challenges

### Why non-technical people want this:
- **Social proof is addictive** — seeing friends' streaks creates FOMO and motivation
- **Gamification feels like play, not work** — points, badges, and leaderboards tap into competitive instincts
- **AI coaching feels personal** — unlike generic reminders, AI adapts tone and timing to what actually works for you
- **Visual progress is satisfying** — heat maps and streak counters provide instant dopamine hits

**The gap:** Habitica is too game-y (RPG mechanics alienate serious users). Streaks is too solitary. Notion is too manual. Beeminder is too punitive. **StreakStack is the first app that makes habit-building feel like a team sport with a personal coach.**

## 4. Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **State:** Zustand (lightweight, no boilerplate)
- **Local storage:** Expo SQLite
- **Push notifications:** Expo Notifications
- **AI integration:** OpenAI API (GPT-4o-mini for cost efficiency)
- **Social features:** Expo Contacts (friend invites), AsyncStorage (user sessions)
- **Charts/visualization:** react-native-svg + custom heat map component
- **Testing:** Jest + React Native Testing Library

**No backend initially** — all data local, social features via invite codes and shared group IDs stored in SQLite.

## 5. Core features (MVP)

### 1. Streak Tracker with Heat Map
- Add habits (e.g., "Run 3x/week", "No sugar", "Read 30min")
- Check off daily completions
- Visual heat map (GitHub-style) showing consistency over time
- Streak counter with fire emoji animations

### 2. Social Accountability Groups
- Create or join groups via invite codes
- See friends' streaks and check-ins in a feed
- Like/comment on friends' progress
- Group leaderboard (weekly/monthly)

### 3. AI Motivation Coach
- Daily personalized check-in messages based on streak status
- Adaptive tone (encouraging when struggling, celebratory when crushing it)
- Smart reminder timing (learns when you're most likely to complete habits)
- "Why did you miss?" prompts to identify patterns

### 4. Gamification Layer
- Points for streak milestones (7-day, 30-day, 100-day)
- Badges (e.g., "Early Bird" for morning habits, "Comeback Kid" for recovering from breaks)
- Weekly challenges (e.g., "Complete all habits 5 days this week")

### 5. Progress Insights
- Weekly summary (completion rate, longest streak, most consistent habit)
- Trend analysis (e.g., "You're 40% more consistent on weekdays")
- Habit correlation detection (e.g., "You skip workouts when you sleep <6 hours")

## 6. Monetization strategy

### Free tier (the hook):
- Track up to 3 habits
- Join 1 accountability group
- Basic streak tracking and heat map
- Generic daily reminders

### Paid tier — **StreakStack Pro ($7.99/month or $59.99/year)**

**What unlocks:**
- Unlimited habits
- Unlimited groups
- AI coaching (personalized messages, smart reminder timing)
- Advanced insights (trend analysis, habit correlations)
- Custom badges and themes
- Export data (CSV, PDF reports)

**Why this price?**
- Lower than Headspace ($12.99) but higher than basic habit trackers ($4.99)
- Positioned as "personal coach + social network" hybrid
- Annual plan = 37% discount (strong conversion incentive)

**What makes people STAY subscribed?**
- **Sunk cost of streaks** — canceling means losing AI coach that "knows" your patterns
- **Social lock-in** — your group depends on you showing up
- **Data insights** — the longer you use it, the more valuable the trend analysis becomes
- **Habit stacking** — once you've built 3 habits, you want to add more (requires Pro)

**Additional revenue stream:**
- **Group challenges ($2.99 one-time)** — premium templates (e.g., "30-Day Fitness Challenge" with structured milestones)

## 7. Market viability

**NOT SKIP** — Clear gap exists:

- **Habitica** ($4.99/mo) — 10M+ downloads but RPG mechanics alienate professionals
- **Streaks** ($4.99 one-time) — 1M+ downloads but zero social features
- **Beeminder** (free + $4/goal) — 100K users but punitive model (pay if you fail)
- **Way of Life** ($4.99/mo) — 500K downloads but outdated UI, no AI

**Our advantage:**
1. **Social-first** — groups are core, not an add-on
2. **AI that adapts** — not just generic reminders
3. **Modern UX** — heat maps, animations, dopamine-driven design
4. **Freemium done right** — free tier is useful, paid tier is irresistible

**Market size:** Habit tracking apps = $1.2B market (2025), growing 15% YoY. Top apps (Fabulous, Habitica) have 10M+ downloads but <5% paid conversion. **If we hit 100K downloads with 10% conversion at $7.99/mo, that's $80K MRR.**

## 8. File structure

```
streakstack/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx             # Home (Streak Tracker)
│   │   ├── social.tsx            # Social Feed
│   │   ├── insights.tsx          # Progress Insights
│   │   └── profile.tsx           # User Profile
│   ├── habit/
│   │   ├── [id].tsx              # Habit Detail
│   │   └── create.tsx            # Create Habit
│   ├── group/
│   │   ├── [id].tsx              # Group Detail
│   │   └── create.tsx            # Create Group
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx
├── components/
│   ├── HabitCard.tsx
│   ├── HeatMap.tsx
│   ├── StreakCounter.tsx
│   ├── SocialFeedItem.tsx
│   ├── AICoachMessage.tsx
│   ├── LeaderboardRow.tsx
│   └── BadgeIcon.tsx
├── lib/
│   ├── database.ts               # SQLite setup
│   ├── habits.ts                 # Habit CRUD
│   ├── groups.ts                 # Group CRUD
│   ├── streaks.ts                # Streak calculation logic
│   ├── ai-coach.ts               # AI message generation
│   ├── notifications.ts          # Push notification scheduling
│   └── analytics.ts              # Insight calculations
├── store/
│   └── useStore.ts               # Zustand store
├── constants/
│   ├── Colors.ts
│   └── Badges.ts
├── __tests__/
│   ├── streaks.test.ts
│   ├── habits.test.ts
│   ├── ai-coach.test.ts
│   └── analytics.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## 9. Tests

### `__tests__/streaks.test.ts`
```typescript
import { calculateStreak, getStreakStatus } from '../lib/streaks';

describe('Streak Calculation', () => {
  test('calculates current streak correctly', () => {
    const completions = [
      { date: '2026-03-16', completed: true },
      { date: '2026-03-15', completed: true },
      { date: '2026-03-14', completed: false },
      { date: '2026-03-13', completed: true },
    ];
    expect(calculateStreak(completions)).toBe(2);
  });

  test('returns 0 for broken streak', () => {
    const completions = [
      { date: '2026-03-14', completed: true },
      { date: '2026-03-13', completed: false },
    ];
    expect(calculateStreak(completions)).toBe(0);
  });

  test('identifies at-risk streaks', () => {
    const lastCompletion = '2026-03-15';
    const status = getStreakStatus(lastCompletion, new Date('2026-03-16T23:00:00'));
    expect(status).toBe('at-risk');
  });
});
```

### `__tests__/habits.test.ts`
```typescript
import { createHabit, getHabitsByUser, updateHabitCompletion } from '../lib/habits';

describe('Habit Management', () => {
  test('creates habit with valid data', async () => {
    const habit = await createHabit({
      userId: 'user1',
      name: 'Morning Run',
      frequency: 'daily',
      reminderTime: '07:00',
    });
    expect(habit.id).toBeDefined();
    expect(habit.name).toBe('Morning Run');
  });

  test('retrieves habits for user', async () => {
    const habits = await getHabitsByUser('user1');
    expect(Array.isArray(habits)).toBe(true);
  });

  test('updates habit completion status', async () => {
    const result = await updateHabitCompletion('habit1', '2026-03-16', true);
    expect(result.completed).toBe(true);
  });
});
```

### `__tests__/ai-coach.test.ts`
```typescript
import { generateCoachMessage } from '../lib/ai-coach';

describe('AI Coach', () => {
  test('generates encouraging message for struggling user', async () => {
    const message = await generateCoachMessage({
      streakLength: 2,
      missedDays: 3,
      habitName: 'Meditation',
      userTone: 'supportive',
    });
    expect(message).toContain('keep going');
    expect(message.length).toBeGreaterThan(20);
  });

  test('generates celebratory message for milestone', async () => {
    const message = await generateCoachMessage({
      streakLength: 30,
      missedDays: 0,
      habitName: 'Reading',
      userTone: 'enthusiastic',
    });
    expect(message).toContain('30');
  });
});
```

### `__tests__/analytics.test.ts`
```typescript
import { calculateCompletionRate, findHabitCorrelations } from '../lib/analytics';

describe('Analytics', () => {
  test('calculates weekly completion rate', () => {
    const completions = [
      { date: '2026-03-16', completed: true },
      { date: '2026-03-15', completed: true },
      { date: '2026-03-14', completed: false },
      { date: '2026-03-13', completed: true },
      { date: '2026-03-12', completed: true },
      { date: '2026-03-11', completed: false },
      { date: '2026-03-10', completed: true },
    ];
    expect(calculateCompletionRate(completions)).toBe(71.43);
  });

  test('identifies habit correlations', () => {
    const habits = [
      { id: 'h1', name: 'Exercise', completions: [true, true, false, false] },
      { id: 'h2', name: 'Sleep 8h', completions: [true, true, false, false] },
    ];
    const correlations = findHabitCorrelations(habits);
    expect(correlations[0].correlation).toBeGreaterThan(0.8);
  });
});
```

## 10. Implementation steps

### Phase 1: Project Setup
1. Initialize Expo project: `npx create-expo-app streakstack --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-notifications expo-contacts zustand
   npm install --save-dev jest @testing-library/react-native @types/jest
   ```
3. Configure `app.json`:
   - Set app name, slug, icon
   - Add notification permissions
   - Configure splash screen
4. Set up SQLite database schema in `lib/database.ts`:
   - `users` table (id, name, email, createdAt)
   - `habits` table (id, userId, name, frequency, reminderTime, createdAt)
   - `completions` table (id, habitId, date, completed, note)
   - `groups` table (id, name, inviteCode, createdAt)
   - `group_members` table (groupId, userId, joinedAt)
   - `social_feed` table (id, userId, habitId, action, timestamp)

### Phase 2: Core Habit Tracking
5. Build `lib/habits.ts`:
   - `createHabit(data)` — insert into habits table
   - `getHabitsByUser(userId)` — query with JOIN on completions
   - `updateHabitCompletion(habitId, date, completed)` — upsert completion
   - `deleteHabit(habitId)` — cascade delete completions
6. Build `lib/streaks.ts`:
   - `calculateStreak(completions)` — iterate backwards from today, count consecutive days
   - `getStreakStatus(lastCompletion, now)` — return 'active', 'at-risk', or 'broken'
   - `getLongestStreak(completions)` — find max consecutive days
7. Create `components/HabitCard.tsx`:
   - Display habit name, frequency, current streak
   - Checkbox for today's completion
   - Tap to navigate to habit detail
8. Create `components/StreakCounter.tsx`:
   - Animated fire emoji that grows with streak length
   - Display current streak number
9. Build `app/(tabs)/index.tsx`:
   - Fetch habits from database on mount
   - Render list of HabitCards
   - FAB button to create new habit
   - Pull-to-refresh

### Phase 3: Heat Map Visualization
10. Create `components/HeatMap.tsx`:
    - Use `react-native-svg` to draw grid of squares
    - Color intensity based on completion count (0-4+ per day)
    - Show last 90 days
    - Tap square to see date details
11. Build `app/habit/[id].tsx`:
    - Display habit details (name, frequency, reminder time)
    - Show HeatMap component
    - Show streak stats (current, longest, completion rate)
    - Edit/delete buttons

### Phase 4: Social Features
12. Build `lib/groups.ts`:
    - `createGroup(name, userId)` — generate unique 6-char invite code
    - `joinGroup(inviteCode, userId)` — add to group_members
    - `getGroupMembers(groupId)` — query with user details
    - `getGroupLeaderboard(groupId)` — aggregate streaks by user
13. Create `components/SocialFeedItem.tsx`:
    - Display user avatar, name, action (e.g., "completed 7-day streak")
    - Like button (store in social_feed table)
    - Timestamp
14. Build `app/(tabs)/social.tsx`:
    - Fetch social feed (JOIN groups, users, habits)
    - Render list of SocialFeedItems
    - Filter by group (dropdown)
15. Build `app/group/[id].tsx`:
    - Display group name, member count
    - Show leaderboard (sorted by total streak days this week)
    - Invite button (share invite code via Expo Sharing)

### Phase 5: AI Coach
16. Build `lib/ai-coach.ts`:
    - `generateCoachMessage(context)` — call OpenAI API with prompt:
      ```
      You are a supportive habit coach. User has a {streakLength}-day streak 
      for {habitName} but missed {missedDays} days recently. Write a {userTone} 
      message (max 50 words) to motivate them.
      ```
    - Cache messages in SQLite to avoid redundant API calls
    - `getCoachTone(userId)` — query user preferences
17. Create `components/AICoachMessage.tsx`:
    - Display message in chat bubble UI
    - Avatar icon for coach
    - Typing animation on load
18. Build notification scheduling in `lib/notifications.ts`:
    - `scheduleHabitReminder(habitId, time)` — use Expo Notifications
    - `scheduleCoachCheckIn(userId)` — daily at user's preferred time
    - `cancelNotifications(habitId)` — cleanup on habit delete

### Phase 6: Gamification
19. Define badges in `constants/Badges.ts`:
    - 7-day, 30-day, 100-day streak badges
    - "Early Bird" (complete before 8am 5x)
    - "Comeback Kid" (recover from 3+ day break)
20. Build badge logic in `lib/analytics.ts`:
    - `checkBadgeEligibility(userId)` — query completions, return earned badges
    - Store earned badges in `user_badges` table
21. Create `components/BadgeIcon.tsx`:
    - SVG icons for each badge type
    - Animated unlock effect
22. Build `app/(tabs)/profile.tsx`:
    - Display user stats (total habits, total streak days, completion rate)
    - Grid of earned badges
    - Settings (notification preferences, AI coach tone)

### Phase 7: Insights
23. Build analytics functions in `lib/analytics.ts`:
    - `calculateCompletionRate(completions)` — percentage over time period
    - `findBestDay(completions)` — day of week with highest completion
    - `findHabitCorrelations(habits)` — Pearson correlation between habit pairs
24. Build `app/(tabs)/insights.tsx`:
    - Weekly summary card (completion rate, longest streak)
    - Chart showing completion trend (line graph)
    - "Insights" section (e.g., "You're 40% more consistent on weekdays")
    - Habit correlation matrix

### Phase 8: Monetization
25. Implement paywall logic:
    - Check habit count on create (max 3 for free users)
    - Check group count on join (max 1 for free users)
    - Gate AI coach messages (show "Upgrade to Pro" button)
26. Build subscription flow:
    - Use Expo In-App Purchases (RevenueCat recommended)
    - Monthly ($7.99) and annual ($59.99) SKUs
    - Restore purchases button in profile
27. Add upgrade prompts:
    - Modal on 4th habit creation attempt
    - Banner in AI coach section
    - "Pro" badge on locked features

### Phase 9: Polish
28. Add animations:
    - Streak counter fire emoji grows/shrinks
    - Confetti on milestone badges
    - Smooth list transitions
29. Implement dark mode:
    - Use Expo's `useColorScheme` hook
    - Define color palette in `constants/Colors.ts`
30. Add onboarding:
    - 3-screen carousel explaining core features
    - "Create your first habit" prompt
    - "Invite a friend" prompt after first completion
31. Error handling:
    - Offline mode (queue completions, sync when online)
    - API failure fallbacks (show cached coach messages)
    - Database migration strategy

### Phase 10: Testing & Launch
32. Write tests for all core logic (see section 9)
33. Run `npm test` — ensure 100% pass rate
34. Test on physical device via Expo Go:
    - Create habits, complete them, verify streak calculation
    - Join group via invite code, verify leaderboard
    - Trigger AI coach message, verify personalization
    - Test notifications (background, foreground, killed state)
35. Build production app:
    - `eas build --platform ios`
    - `eas build --platform android`
36. Submit to App Store and Google Play:
    - Screenshots showing heat map, social feed, AI coach
    - App Store description emphasizing "habit-building with friends"
    - Keywords: habit tracker, streak, accountability, AI coach

## 11. How to verify it works

### Local development:
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Verify core flows:
   - Create a habit → see it in home screen
   - Check off today → see streak counter increment
   - View habit detail → see heat map populate
   - Create a group → copy invite code
   - Join group from second device → see member in leaderboard
   - Wait for notification → verify reminder fires at scheduled time
   - Trigger AI coach (miss 2 days) → verify personalized message appears

### Automated tests:
```bash
npm test
```
All tests in `__tests__/` must pass.

### Production verification:
1. Install TestFlight (iOS) or internal testing (Android) build
2. Complete 7-day streak → verify badge unlock
3. Invite real friend → verify social feed updates
4. Upgrade to Pro → verify AI coach unlocks
5. Force-quit app → verify notifications still fire
6. Toggle dark mode → verify UI adapts

### Success metrics:
- Streak calculation accuracy: 100% (verified via tests)
- Notification delivery rate: >95% (check Expo dashboard)
- AI coach response time: <2s (monitor API latency)
- Crash-free rate: >99.5% (use Sentry or similar)