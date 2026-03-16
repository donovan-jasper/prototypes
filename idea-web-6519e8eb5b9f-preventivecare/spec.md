# LifeThread

## One-line pitch
Your daily health companion that connects the dots between sleep, stress, nutrition, and energy—so you can feel better before you need a doctor.

## Expanded vision

**Who is this REALLY for?**

This is for the 80% of people who know they should "be healthier" but don't have a chronic condition forcing them to act. The real audience is:

- **Parents juggling family health** — tracking kids' vaccines, their own sleep debt, and household wellness routines in one place
- **Desk workers feeling burnt out** — people who sit 10 hours a day, skip lunch, and wonder why they're exhausted by 3pm
- **Fitness beginners** — not athletes, but people who want to walk more, drink water, and actually remember to take vitamins
- **Aging adults (50+)** — managing multiple medications, preventive screenings, and wanting to stay independent longer
- **Anyone who's ever Googled "why am I always tired"** — the massive market of people with vague symptoms who need pattern recognition, not diagnosis

**What adjacent use cases does this enable?**

- **Family health hub** — one parent manages the whole household's health data (pediatrician visits, allergy info, medication schedules)
- **Workplace wellness** — companies could offer this as a benefit, with anonymized team insights on stress/sleep trends
- **Chronic condition management** — diabetics, hypertension patients, or those with autoimmune diseases get a unified view of how lifestyle affects symptoms
- **Mental health tracking** — mood, anxiety, and therapy session notes tied to sleep/exercise data to spot triggers
- **Longevity optimization** — biohackers and health enthusiasts tracking biomarkers, supplements, and lab results over time

**Why would a non-technical person want this?**

Because it answers the question: "What should I actually DO to feel better?" Most health apps are data graveyards—they collect info but don't tell you what it means. LifeThread connects the dots: "You slept 5 hours, skipped breakfast, and had 3 coffees—that's why you're anxious." It's the health coach you can't afford, in your pocket.

## Tech stack

- **React Native (Expo)** — cross-platform iOS + Android
- **SQLite** (expo-sqlite) — local-first storage for health data privacy
- **Expo Notifications** — smart reminders and nudges
- **Expo Sensors** — step counting (pedometer)
- **React Native Chart Kit** — simple data visualization
- **date-fns** — date manipulation for streaks and trends
- **Zustand** — lightweight state management
- **Jest + React Native Testing Library** — unit and integration tests

No cloud backend for MVP—everything local. Optional cloud sync in v2.

## Core features (MVP)

1. **Habit Tracker with Smart Insights** — Log sleep, water, meals, exercise, mood. AI-like pattern detection (e.g., "You sleep worse on days you skip exercise") using simple correlation logic.

2. **Health Timeline** — A unified feed showing all health events (doctor visits, symptoms, medications, lab results) with photos/notes. Searchable and exportable.

3. **Preventive Care Reminders** — Age/gender-based recommendations for screenings (mammogram, colonoscopy, dental checkup) with local notifications. Customizable for family members.

4. **Wearable Integration** — Pull step count, heart rate, and sleep data from Apple Health (iOS) or Google Fit (Android) for passive tracking.

5. **Weekly Health Score** — A simple 0-100 score based on habit completion, with a breakdown of what's helping/hurting. Gamified streaks for motivation.

## Monetization strategy

**Free tier:**
- Track up to 5 habits
- Basic health timeline (last 30 days)
- Manual data entry only
- Weekly health score

**Premium ($7.99/month or $59.99/year):**
- Unlimited habits and family member profiles
- Full health timeline history with export (PDF for doctor visits)
- Wearable sync (Apple Health, Google Fit)
- Advanced insights (correlations, trend predictions)
- Custom reminder schedules
- Priority support

**Why $7.99?**
- Below the $9.99 psychological barrier
- Cheaper than one copay or gym class
- Annual plan = 37% discount (strong incentive)

**What makes people STAY subscribed?**
- **Data lock-in** — after 3 months, your health history is too valuable to lose
- **Habit streaks** — gamification creates emotional investment
- **Family management** — parents won't cancel if they're tracking kids' health
- **Preventive care ROI** — catching a health issue early saves thousands in medical bills

**Future revenue streams:**
- Partnerships with telehealth providers (in-app booking, revenue share)
- Health insurance integrations (discounts for users who hit wellness goals)
- Anonymized data insights sold to researchers (opt-in, GDPR-compliant)

## File structure

```
lifethread/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Today view (habits, quick log)
│   │   ├── timeline.tsx           # Health timeline feed
│   │   ├── insights.tsx           # Weekly score + correlations
│   │   └── profile.tsx            # Settings, family, premium
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── HabitCard.tsx
│   ├── TimelineEvent.tsx
│   ├── HealthScore.tsx
│   ├── InsightCard.tsx
│   └── PremiumGate.tsx
├── lib/
│   ├── database.ts                # SQLite setup and migrations
│   ├── habits.ts                  # Habit CRUD operations
│   ├── timeline.ts                # Timeline event management
│   ├── insights.ts                # Correlation and scoring logic
│   ├── notifications.ts           # Reminder scheduling
│   └── wearables.ts               # Apple Health / Google Fit integration
├── hooks/
│   ├── useHabits.ts
│   ├── useTimeline.ts
│   └── useHealthScore.ts
├── store/
│   └── appStore.ts                # Zustand global state
├── constants/
│   └── PreventiveCare.ts          # Age/gender-based screening recommendations
├── __tests__/
│   ├── habits.test.ts
│   ├── insights.test.ts
│   ├── timeline.test.ts
│   └── database.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

**__tests__/habits.test.ts**
```typescript
import { addHabit, getHabits, logHabitCompletion } from '../lib/habits';
import { initDatabase } from '../lib/database';

describe('Habit Management', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('should create and retrieve habits', async () => {
    const habit = await addHabit('Drink 8 glasses of water', 'water');
    expect(habit.name).toBe('Drink 8 glasses of water');
    
    const habits = await getHabits();
    expect(habits.length).toBeGreaterThan(0);
  });

  test('should log habit completion', async () => {
    const habit = await addHabit('Exercise 30 min', 'exercise');
    const log = await logHabitCompletion(habit.id, new Date());
    expect(log.completed).toBe(true);
  });
});
```

**__tests__/insights.test.ts**
```typescript
import { calculateHealthScore, findCorrelations } from '../lib/insights';

describe('Health Insights', () => {
  test('should calculate health score from habit data', () => {
    const habitLogs = [
      { habitId: 1, completed: true, date: '2026-03-15' },
      { habitId: 2, completed: false, date: '2026-03-15' },
      { habitId: 3, completed: true, date: '2026-03-15' },
    ];
    const score = calculateHealthScore(habitLogs, 3);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('should detect correlations between habits', () => {
    const sleepData = [7, 5, 8, 6, 5];
    const exerciseData = [1, 0, 1, 1, 0];
    const correlation = findCorrelations(sleepData, exerciseData);
    expect(correlation).toHaveProperty('strength');
    expect(correlation).toHaveProperty('insight');
  });
});
```

**__tests__/timeline.test.ts**
```typescript
import { addTimelineEvent, getTimelineEvents } from '../lib/timeline';

describe('Health Timeline', () => {
  test('should add and retrieve timeline events', async () => {
    const event = await addTimelineEvent({
      type: 'doctor_visit',
      title: 'Annual checkup',
      date: new Date(),
      notes: 'Blood pressure normal',
    });
    expect(event.title).toBe('Annual checkup');

    const events = await getTimelineEvents();
    expect(events.length).toBeGreaterThan(0);
  });
});
```

**__tests__/database.test.ts**
```typescript
import { initDatabase, resetDatabase } from '../lib/database';

describe('Database', () => {
  test('should initialize database without errors', async () => {
    await expect(initDatabase()).resolves.not.toThrow();
  });

  test('should reset database', async () => {
    await initDatabase();
    await expect(resetDatabase()).resolves.not.toThrow();
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app lifethread --template tabs
cd lifethread
npm install expo-sqlite zustand date-fns react-native-chart-kit
npm install -D jest @testing-library/react-native @types/jest
```

### 2. Database layer (`lib/database.ts`)
- Create SQLite database with tables: `habits`, `habit_logs`, `timeline_events`, `users`, `settings`
- Write migration logic for schema versioning
- Export `initDatabase()` and `getDatabase()` helpers

### 3. Habit management (`lib/habits.ts`)
- `addHabit(name, icon, frequency)` — insert into habits table
- `getHabits(userId?)` — fetch all habits, optionally filtered by user
- `logHabitCompletion(habitId, date, value?)` — insert into habit_logs
- `getHabitLogs(habitId, startDate, endDate)` — fetch logs for date range
- `calculateStreak(habitId)` — count consecutive days of completion

### 4. Timeline management (`lib/timeline.ts`)
- `addTimelineEvent(type, title, date, notes, attachments?)` — insert event
- `getTimelineEvents(startDate?, endDate?)` — fetch events, sorted by date
- `updateTimelineEvent(id, updates)` — edit existing event
- `deleteTimelineEvent(id)` — soft delete (mark as deleted)
- Support event types: doctor_visit, symptom, medication, lab_result, vaccine

### 5. Insights engine (`lib/insights.ts`)
- `calculateHealthScore(habitLogs, totalHabits)` — percentage of habits completed in last 7 days
- `findCorrelations(habitA, habitB)` — simple Pearson correlation between two habit arrays
- `generateInsights(habitLogs)` — return array of insight objects like "You sleep better on days you exercise"
- Use basic statistical thresholds (correlation > 0.5 = strong, > 0.3 = moderate)

### 6. Notifications (`lib/notifications.ts`)
- Request notification permissions on first launch
- `scheduleHabitReminder(habitId, time)` — daily notification for habit
- `schedulePreventiveCareReminder(type, date)` — one-time notification for screening
- `cancelReminder(id)` — remove scheduled notification

### 7. Wearable integration (`lib/wearables.ts`)
- iOS: Use `expo-apple-health` (community package) to read HealthKit data
- Android: Use `react-native-google-fit` for Google Fit
- `syncSteps(date)` — pull step count for given day
- `syncSleep(date)` — pull sleep duration
- `syncHeartRate(date)` — pull average heart rate
- Store synced data in habit_logs table with `source: 'wearable'`

### 8. UI Components
- **HabitCard.tsx** — displays habit name, icon, completion status, streak count
- **TimelineEvent.tsx** — card showing event type icon, title, date, notes preview
- **HealthScore.tsx** — circular progress indicator (0-100) with color gradient
- **InsightCard.tsx** — displays correlation insight with emoji and description
- **PremiumGate.tsx** — modal prompting upgrade for locked features

### 9. Screens
- **index.tsx (Today)** — list of habits with checkboxes, quick log button, today's health score
- **timeline.tsx** — scrollable feed of timeline events, FAB to add new event
- **insights.tsx** — weekly health score chart, list of correlation insights, habit trends
- **profile.tsx** — user settings, family member management, premium upgrade CTA, export data

### 10. State management (`store/appStore.ts`)
- Zustand store with slices: `habits`, `timeline`, `user`, `premium`
- Actions: `loadHabits()`, `addHabit()`, `toggleHabitCompletion()`, `loadTimeline()`, `setPremium()`
- Persist premium status and user settings to AsyncStorage

### 11. Preventive care data (`constants/PreventiveCare.ts`)
- Export object mapping age ranges and gender to recommended screenings
- Example: `{ age: '40-49', gender: 'female', screenings: ['mammogram', 'blood_pressure', 'cholesterol'] }`
- Include frequency (annual, every 2 years, etc.)

### 12. Premium features
- Wrap wearable sync, advanced insights, and family profiles in `PremiumGate`
- Use Expo's in-app purchases (expo-in-app-purchases) for subscription management
- Store premium status in SQLite and Zustand

### 13. Onboarding flow
- First launch: request notification permissions, explain core features
- Prompt to add 3 starter habits (sleep, water, exercise)
- Optional: connect wearable for passive tracking

### 14. Testing
- Write unit tests for all `lib/` functions
- Test database migrations and CRUD operations
- Test insight calculations with mock data
- Run `npm test` to verify all tests pass

### 15. Polish
- Add haptic feedback on habit completion
- Implement pull-to-refresh on timeline
- Add empty states with helpful CTAs
- Ensure accessibility (labels, contrast, font scaling)

## How to verify it works

### On device/simulator:
1. Run `npx expo start` and scan QR code with Expo Go (iOS/Android)
2. Complete onboarding and add 3 habits
3. Log habit completions for today — verify checkmarks appear
4. Navigate to Timeline tab, add a doctor visit event with notes
5. Navigate to Insights tab — verify health score displays (should be ~33% if 1/3 habits completed)
6. Go to Profile, tap "Upgrade to Premium" — verify paywall modal appears
7. Test notifications: set a habit reminder for 1 minute from now, verify notification fires
8. (iOS only) Connect Apple Health in settings, verify step count syncs to Today view

### Automated tests:
```bash
npm test
```
All tests in `__tests__/` must pass. Expected output:
```
PASS  __tests__/habits.test.ts
PASS  __tests__/insights.test.ts
PASS  __tests__/timeline.test.ts
PASS  __tests__/database.test.ts

Test Suites: 4 passed, 4 total
Tests:       8 passed, 8 total
```

### Manual verification checklist:
- [ ] Habits persist after app restart
- [ ] Timeline events display in chronological order
- [ ] Health score updates when habits are logged
- [ ] Notifications appear at scheduled times
- [ ] Premium features are locked behind paywall
- [ ] Wearable data syncs (if connected)
- [ ] App works offline (no network errors)