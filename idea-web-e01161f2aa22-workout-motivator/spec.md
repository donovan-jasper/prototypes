# MotiveMate

## One-line pitch
Your personal hype coach that turns any task into a game you actually want to win.

## Expanded vision

**Who is this REALLY for?**

This is for the 80% of people who know what they need to do but can't get themselves to start or finish. The core audience spans:

- **ADHD/neurodivergent users** who need external accountability and dopamine hits to complete tasks
- **Remote workers** drowning in Zoom fatigue who need ambient motivation during deep work
- **Parents** trying to make chores fun for kids (or themselves)
- **Language learners** who need encouragement during practice sessions
- **People in recovery** (addiction, mental health) who benefit from positive reinforcement loops
- **Gig workers** (delivery drivers, freelancers) who lack the structure of traditional employment

**Adjacent use cases:**
- Meditation/breathwork coaching (compete with Calm/Headspace on motivation angle)
- Household task gamification (laundry, dishes, cleaning)
- Commute optimization (turn traffic into a challenge)
- Social accountability (share progress, challenge friends)
- Accessibility tool for executive function disorders

**Why non-technical people want this:**
It's a friend in your pocket who actually cares if you finish that thing you've been avoiding. No complex setup, no tracking spreadsheets—just hit start and get hyped.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Audio:** expo-av for voice playback, expo-speech for TTS
- **Storage:** expo-sqlite for local task history and user preferences
- **State:** Zustand (lightweight, no Redux overhead)
- **Notifications:** expo-notifications for reminders and streaks
- **Analytics:** expo-tracking-transparency + basic event logging (no third-party initially)
- **Payments:** expo-in-app-purchases (RevenueCat later if scaling)

## Core features

1. **Voice Coach Library** — 5 free coach personalities (Drill Sergeant, Zen Master, Best Friend, Comedian, Stoic Philosopher). Premium unlocks 20+ voices including celebrity soundalikes and user-uploaded custom coaches.

2. **Any-Task Timer** — Start a session for any activity (workout, study, chores, commute). App delivers timed motivational prompts (every 2-5 min) with intensity that adapts to your energy level (detected via pause/resume patterns).

3. **Streak Gamification** — Visual streak calendar + XP system. Miss a day? "Streak Freeze" tokens (earn 1/week free, buy more premium). Unlock badges for milestones (7-day, 30-day, 100-task streaks).

4. **Ambient Mode** — Background audio that plays subtle encouragement even when phone is locked. Works during other apps (Spotify, podcasts) by ducking audio briefly for prompts.

5. **Quick Start Widget** — iOS/Android home screen widget with one-tap task start. No app opening required.

## Monetization strategy

**Free tier:**
- 5 basic coach voices
- Unlimited tasks up to 30 min/session
- 1 streak freeze token/week
- Ads between sessions (skippable after 5 sec)

**Premium ($6.99/month or $49.99/year):**
- All 20+ coach voices + monthly new releases
- Unlimited session length
- 5 streak freeze tokens/week
- Ad-free
- Custom prompt scheduling (choose exact intervals)
- Export progress data

**Why people stay subscribed:**
- Sunk cost fallacy on streaks (lose premium voices if you cancel mid-streak)
- Monthly new coach drops create FOMO
- Habit formation makes the app part of daily routine
- Social features (coming post-MVP) create network effects

**Price reasoning:** Lower than Headspace ($12.99) but higher than Duolingo ($6.99) because this is active coaching, not passive content. Annual discount (40% off) drives commitment.

## File structure

```
motivate-mate/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home/Quick Start
│   │   ├── coaches.tsx            # Coach library
│   │   ├── history.tsx            # Task history & stats
│   │   └── profile.tsx            # Settings & subscription
│   ├── session/
│   │   └── [id].tsx               # Active session screen
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── CoachCard.tsx
│   ├── SessionTimer.tsx
│   ├── StreakCalendar.tsx
│   └── TaskQuickStart.tsx
├── lib/
│   ├── database.ts                # SQLite setup & queries
│   ├── audio.ts                   # Voice playback logic
│   ├── notifications.ts           # Push notification handlers
│   ├── prompts.ts                 # Motivational prompt generator
│   └── store.ts                   # Zustand state management
├── constants/
│   ├── Coaches.ts                 # Coach personality data
│   └── Prompts.ts                 # Prompt templates
├── __tests__/
│   ├── prompts.test.ts
│   ├── database.test.ts
│   ├── audio.test.ts
│   └── store.test.ts
├── assets/
│   ├── audio/
│   │   └── coaches/               # Pre-recorded voice clips
│   └── images/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**`__tests__/prompts.test.ts`**
```typescript
import { generatePrompt, selectPromptByIntensity } from '../lib/prompts';

describe('Prompt Generator', () => {
  test('generates unique prompts for same coach', () => {
    const prompt1 = generatePrompt('drill-sergeant', 'workout');
    const prompt2 = generatePrompt('drill-sergeant', 'workout');
    expect(prompt1).not.toBe(prompt2);
  });

  test('selects high intensity prompts after long pauses', () => {
    const prompt = selectPromptByIntensity('zen-master', 300); // 5 min pause
    expect(prompt).toContain('back');
  });
});
```

**`__tests__/database.test.ts`**
```typescript
import { openDatabase, saveSession, getStreak } from '../lib/database';

describe('Database Operations', () => {
  test('saves session and retrieves streak', async () => {
    const db = await openDatabase();
    await saveSession(db, { taskType: 'workout', duration: 1800, coachId: 'drill-sergeant' });
    const streak = await getStreak(db);
    expect(streak).toBeGreaterThanOrEqual(1);
  });
});
```

**`__tests__/audio.test.ts`**
```typescript
import { playPrompt, stopAudio } from '../lib/audio';

describe('Audio Playback', () => {
  test('plays audio file without error', async () => {
    await expect(playPrompt('drill-sergeant', 'lets-go')).resolves.not.toThrow();
  });

  test('stops audio cleanly', async () => {
    await playPrompt('zen-master', 'breathe');
    await expect(stopAudio()).resolves.not.toThrow();
  });
});
```

**`__tests__/store.test.ts`**
```typescript
import { useSessionStore } from '../lib/store';

describe('Session Store', () => {
  test('starts session with correct initial state', () => {
    const { startSession, isActive } = useSessionStore.getState();
    startSession('workout', 'drill-sergeant');
    expect(isActive).toBe(true);
  });

  test('increments elapsed time', () => {
    const { tick, elapsedSeconds } = useSessionStore.getState();
    tick();
    expect(elapsedSeconds).toBe(1);
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest motivate-mate --template blank-typescript
cd motivate-mate
npx expo install expo-av expo-speech expo-sqlite expo-notifications zustand
npm install --save-dev jest @testing-library/react-native @types/jest
```

### 2. Database schema (`lib/database.ts`)
```