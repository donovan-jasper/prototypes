# VoiceVault

## One-line pitch
Your personal voice coach that whispers the right words at the right moment to keep you moving forward.

## Expanded vision

**Core audience:** Anyone who's ever felt stuck, overwhelmed, or unmotivated — which is nearly everyone.

**Broadest reach:**
- **Fitness enthusiasts** who need that extra push during workouts or to get to the gym
- **People in recovery** (addiction, mental health) who need positive reinforcement throughout the day
- **Remote workers** battling isolation and needing a "presence" to stay accountable
- **People with ADHD/executive function challenges** who respond better to voice than text
- **Language learners** who want motivational prompts in their target language
- **Caregivers and parents** who need reminders to take care of themselves
- **Anyone going through life transitions** (new job, breakup, relocation) needing daily encouragement

**Adjacent use cases:**
- Morning/evening routines with voice guidance
- Meditation and mindfulness prompts
- Affirmations for confidence building
- Accountability partner simulation
- Celebration of small wins (voice congratulations when you check off tasks)

**Why non-technical people want this:**
It's like having a supportive friend in your pocket who knows exactly when you need encouragement. No complex setup, no task management overhead — just timely voice messages that feel personal and human.

**The gap competitors miss:**
Most productivity apps are silent, text-based, and transactional. VoiceVault uses the most powerful medium — the human voice — to create emotional connection and motivation. It's the difference between reading "You can do this" and hearing it spoken with warmth and conviction.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Audio:** expo-av for playback, expo-speech for TTS fallback
- **Storage:** expo-sqlite for local data (goals, schedules, preferences)
- **Notifications:** expo-notifications for scheduled voice prompts
- **Background tasks:** expo-task-manager for notification scheduling
- **State:** React Context API (no Redux needed for MVP)
- **Payments:** expo-in-app-purchases (RevenueCat for production)
- **Voice content:** Pre-recorded MP3s (50-100 motivational clips), TTS for personalized names/goals

## Core features

1. **Smart Voice Prompts** — Scheduled motivational voice messages delivered via notifications with inline audio playback. Users set their "motivation schedule" (morning boost, midday check-in, evening wind-down).

2. **Goal Anchoring** — Users create 1-3 daily goals. Voice prompts reference these goals by name ("Time to tackle that presentation, Sarah"). Creates personal connection.

3. **Mood-Based Selection** — Quick mood check-in (struggling/neutral/crushing it) adjusts voice tone and message intensity. Struggling gets gentle encouragement, crushing it gets celebration.

4. **Voice Library** — 50+ pre-recorded motivational clips across categories (focus, energy, calm, confidence). Premium unlocks all; free gets 10 rotating clips.

5. **Streak Tracker** — Visual streak counter for consecutive days of engagement. Voice prompts celebrate milestones ("That's 7 days strong!"). Gamification without complexity.

## Monetization strategy

**Free tier:**
- 3 voice prompts per day
- Access to 10 rotating voice clips
- Basic goal tracking (1 goal)
- Standard notification scheduling

**Premium ($7.99/month or $59.99/year):**
- Unlimited voice prompts
- Full library of 50+ voice clips (growing monthly)
- Up to 5 simultaneous goals
- Advanced scheduling (location-based triggers in future)
- Personalized TTS messages with your name
- Priority access to new voice content

**Price reasoning:**
$7.99 hits the sweet spot between coffee-money impulse ($4.99 feels cheap/low-value) and commitment-required ($14.99). Annual discount (37% off) incentivizes long-term retention.

**Retention hooks:**
- **Streak anxiety** — People don't want to break their streak
- **Voice familiarity** — Users bond with specific voice clips, become attached
- **Sunk cost** — After 2 weeks of goal tracking, switching apps means losing history
- **Monthly content drops** — New voice clips each month keep library fresh
- **Personalization** — TTS with your name creates unique value no competitor offers

**Conversion strategy:**
Free users hit prompt limit by day 3. Paywall appears with: "You're on a roll! Unlock unlimited motivation to keep this momentum going." 7-day free trial for annual plan.

## File structure

```
voicevault/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Today view
│   │   ├── goals.tsx              # Goal management
│   │   ├── library.tsx            # Voice clip browser
│   │   └── settings.tsx           # Settings & subscription
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── VoicePlayer.tsx            # Audio playback UI
│   ├── GoalCard.tsx               # Goal display/edit
│   ├── StreakBadge.tsx            # Streak counter
│   ├── MoodSelector.tsx           # Mood check-in
│   └── PromptScheduler.tsx        # Schedule configuration
├── services/
│   ├── database.ts                # SQLite setup & queries
│   ├── notifications.ts           # Notification scheduling
│   ├── audio.ts                   # Audio playback logic
│   ├── voiceLibrary.ts            # Voice clip metadata
│   └── subscription.ts            # IAP logic
├── hooks/
│   ├── useGoals.ts
│   ├── useStreak.ts
│   ├── useVoicePrompts.ts
│   └── useSubscription.ts
├── types/
│   └── index.ts
├── assets/
│   ├── voices/
│   │   ├── morning-boost-01.mp3
│   │   ├── focus-deep-01.mp3
│   │   ├── celebrate-win-01.mp3
│   │   └── ... (50+ clips)
│   └── images/
├── __tests__/
│   ├── database.test.ts
│   ├── notifications.test.ts
│   ├── voiceLibrary.test.ts
│   ├── useGoals.test.ts
│   └── useStreak.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**`__tests__/database.test.ts`**
```typescript
import { openDatabase, createGoal, getGoals, updateGoalStatus } from '../services/database';

describe('Database Service', () => {
  beforeEach(async () => {
    await openDatabase();
  });

  test('creates and retrieves goals', async () => {
    const goal = await createGoal('Finish presentation');
    expect(goal.id).toBeDefined();
    
    const goals = await getGoals();
    expect(goals).toContainEqual(expect.objectContaining({ title: 'Finish presentation' }));
  });

  test('updates goal completion status', async () => {
    const goal = await createGoal('Test goal');
    await updateGoalStatus(goal.id, true);
    
    const goals = await getGoals();
    const updated = goals.find(g => g.id === goal.id);
    expect(updated?.completed).toBe(true);
  });
});
```

**`__tests__/voiceLibrary.test.ts`**
```typescript
import { getVoiceClipsByCategory, getRandomClip, filterByMood } from '../services/voiceLibrary';

describe('Voice Library', () => {
  test('returns clips for valid category', () => {
    const clips = getVoiceClipsByCategory('focus');
    expect(clips.length).toBeGreaterThan(0);
    expect(clips[0]).toHaveProperty('title');
    expect(clips[0]).toHaveProperty('audioFile');
  });

  test('filters clips by mood', () => {
    const struggling = filterByMood('struggling');
    const crushing = filterByMood('crushing');
    
    expect(struggling[0].intensity).toBe('gentle');
    expect(crushing[0].intensity).toBe('energetic');
  });

  test('returns random clip without repetition', () => {
    const clip1 = getRandomClip('morning', []);
    const clip2 = getRandomClip('morning', [clip1.id]);
    
    expect(clip1.id).not.toBe(clip2.id);
  });
});
```

**`__tests__/useStreak.test.ts`**
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useStreak } from '../hooks/useStreak';

describe('useStreak Hook', () => {
  test('initializes with zero streak', () => {
    const { result } = renderHook(() => useStreak());
    expect(result.current.currentStreak).toBe(0);
  });

  test('increments streak on daily check-in', async () => {
    const { result } = renderHook(() => useStreak());
    
    await act(async () => {
      await result.current.recordCheckIn();
    });
    
    expect(result.current.currentStreak).toBe(1);
  });

  test('resets streak if day is missed', async () => {
    const { result } = renderHook(() => useStreak());
    
    await act(async () => {
      await result.current.recordCheckIn();
      // Simulate 2 days passing
      await result.current.checkStreakStatus(2);
    });
    
    expect(result.current.currentStreak).toBe(0);
  });
});
```

**`__tests__/notifications.test.ts`**
```typescript
import { scheduleVoicePrompt, cancelAllPrompts, getScheduledPrompts } from '../services/notifications';

describe('Notification Service', () => {
  test('schedules voice prompt notification', async () => {
    const promptId = await scheduleVoicePrompt({
      title: 'Morning Boost',
      body: 'Time to start your day strong!',
      audioFile: 'morning-boost-01.mp3',
      trigger: { hour: 8, minute: 0 }
    });
    
    expect(promptId).toBeDefined();
  });

  test('retrieves all scheduled prompts', async () => {
    await scheduleVoicePrompt({
      title: 'Test',
      body: 'Test body',
      audioFile: 'test.mp3',
      trigger: { hour: 10, minute: 0 }
    });
    
    const prompts = await getScheduledPrompts();
    expect(prompts.length).toBeGreaterThan(0);
  });

  test('cancels all scheduled prompts', async () => {
    await scheduleVoicePrompt({
      title: 'Test',
      body: 'Test body',
      audioFile: 'test.mp3',
      trigger: { hour: 10, minute: 0 }
    });
    
    await cancelAllPrompts();
    const prompts = await getScheduledPrompts();
    expect(prompts.length).toBe(0);
  });
});
```

## Implementation steps

### 1. Project initialization
```bash
npx create-expo-app@latest voicevault --template blank-typescript
cd voicevault
npx expo install expo-av expo-sqlite expo-notifications expo-task-manager expo-speech
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npm install --save-dev jest @testing-library/react-native @testing-library/react-hooks
```

### 2. Configure app.json
Add notification permissions, background modes, and audio configuration:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["./assets/voices/notification.wav"]
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio", "fetch"]
      }
    },
    "android": {
      "permissions": ["SCHEDULE_EXACT_ALARM"]
    }
  }
}
```

### 3. Create type definitions (`types/index.ts`)
```typescript
export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface VoiceClip {
  id: string;
  title: string;
  category: 'morning' | 'focus' | 'energy' | 'calm' | 'celebrate';
  audioFile: string;
  duration: number;
  intensity: 'gentle' | 'moderate' | 'energetic';
  isPremium: boolean;
}

export interface PromptSchedule {
  id: string;
  time: { hour: number; minute: number };
  enabled: boolean;
  clipId?: string;
}

export type Mood = 'struggling' | 'neutral' | 'crushing';
```

### 4. Implement database service (`services/database.ts`)
- Create SQLite tables for goals, prompts, streak data
- Export CRUD functions: `createGoal`, `getGoals`, `updateGoalStatus`, `deleteGoal`
- Add `getStreak`, `updateStreak`, `getLastCheckIn` functions
- Include migration logic for schema updates

### 5. Build voice library service (`services/voiceLibrary.ts`)
- Create metadata array of 50+ voice clips with categories, intensity, premium flags
- Implement `getVoiceClipsByCategory`, `getRandomClip`, `filterByMood`
- Add `getClipById`, `getFreeClips`, `getPremiumClips`
- Include logic to avoid repeating same clip within 24 hours

### 6. Create notification service (`services/notifications.ts`)
- Request notification permissions on app launch
- Implement `scheduleVoicePrompt` with audio attachment
- Add `cancelAllPrompts`, `getScheduledPrompts`, `updatePromptSchedule`
- Handle notification tap to open app and play audio inline
- Set up background task to refresh daily prompts

### 7. Build audio service (`services/audio.ts`)
- Initialize expo-av Audio with proper audio mode (playback, duck others)
- Create `playVoiceClip` function with loading state
- Implement `pauseAudio`, `stopAudio`, `getPlaybackStatus`
- Add error handling for missing audio files
- Include TTS fallback using expo-speech for personalized messages

### 8. Implement subscription service (`services/subscription.ts`)
- Set up expo-in-app-purchases with product IDs
- Create `checkSubscriptionStatus`, `purchaseSubscription`, `restorePurchases`
- Add `isFeatureUnlocked` helper for premium checks
- Mock IAP for development/testing

### 9. Create custom hooks
- **`useGoals.ts`**: Manage goal CRUD, sync with database
- **`useStreak.ts`**: Track daily check-ins, calculate streak, handle resets
- **`useVoicePrompts.ts`**: Schedule management, prompt history
- **`useSubscription.ts`**: Subscription state, purchase flow, feature gates

### 10. Build VoicePlayer component (`components/VoicePlayer.tsx`)
- Audio playback UI with play/pause button, progress bar, duration
- Show clip title and category
- Handle loading and error states
- Add "favorite" button for premium users

### 11. Create GoalCard component (`components/GoalCard.tsx`)
- Display goal title with checkbox for completion
- Swipe-to-delete gesture
- Edit mode with inline text input
- Show creation date and completion status

### 12. Build MoodSelector component (`components/MoodSelector.tsx`)
- Three-button selector: struggling / neutral / crushing it
- Visual feedback with icons and colors
- Save mood selection to local state
- Trigger voice clip filter update

### 13. Implement StreakBadge component (`components/StreakBadge.tsx`)
- Circular badge with flame icon and streak number
- Animate on streak increment
- Show milestone celebrations (7, 30, 100 days)
- Display last check-in time

### 14. Create PromptScheduler component (`components/PromptScheduler.tsx`)
- List of scheduled prompts with time pickers
- Toggle switches to enable/disable prompts
- Add/remove prompt slots
- Preview selected voice clip

### 15. Build Home screen (`app/(tabs)/index.tsx`)
- Display today's goals with completion checkboxes
- Show current streak badge
- Mood selector at top
- "Play Now" button for instant motivation
- List of today's scheduled prompts
- Quick stats: prompts heard today, goals completed this week

### 16. Create Goals screen (`app/(tabs)/goals.tsx`)
- List all active goals with GoalCard components
- "Add Goal" button (limit to 1 for free, 5 for premium)
- Show completed goals in separate section
- Archive/delete completed goals

### 17. Build Library screen (`app/(tabs)/library.tsx`)
- Categorized voice clip browser
- Play preview for each clip
- Premium badge on locked clips
- Search/filter by category and mood
- "Unlock Premium" CTA for free users

### 18. Implement Settings screen (`app/(tabs)/settings.tsx`)
- Subscription status and upgrade button
- Notification preferences
- Prompt schedule management
- Account settings (name for TTS personalization)
- Restore purchases button
- About/support links

### 19. Set up tab navigation (`app/(tabs)/_layout.tsx`)
- Bottom tabs: Home, Goals, Library, Settings
- Custom tab bar icons
- Badge on Home tab for pending prompts

### 20. Configure notification handling (`app/_layout.tsx`)
- Register notification listeners
- Handle notification tap to navigate to Home
- Play audio inline when notification is tapped
- Request permissions on first launch

### 21. Add voice content assets
- Record or source 50+ motivational voice clips (30-60 seconds each)
- Organize by category folders in `assets/voices/`
- Ensure consistent audio quality and volume levels
- Include metadata JSON with clip details

### 22. Implement subscription paywall
- Create modal/screen for premium upgrade
- Show feature comparison (free vs premium)
- Integrate purchase flow with loading states
- Handle purchase success/failure
- Add 7-day free trial for annual plan

### 23. Add onboarding flow
- Welcome screen explaining app concept
- Goal creation wizard (set first goal)
- Schedule setup (pick first prompt time)
- Notification permission request
- Optional: Name input for TTS personalization

### 24. Write all tests
- Run `npm test` to verify all test files pass
- Ensure >80% code coverage for services and hooks
- Add integration tests for critical user flows

### 25. Test on device
- Run `npx expo start` and scan QR with Expo Go
- Test notification delivery and audio playback
- Verify goal creation and streak tracking
- Test subscription flow (use sandbox environment)
- Check background audio and notification scheduling

### 26. Polish and optimize
- Add loading skeletons for async operations
- Implement error boundaries
- Add haptic feedback for interactions
- Optimize audio file sizes
- Test on low-end Android devices for performance

## How to verify it works

### Development testing
```bash
npm install
npm test                    # All Jest tests must pass
npx expo start              # Start dev server
```

### Device testing (Expo Go)
1. Install Expo Go on iOS/Android device
2. Scan QR code from terminal
3. Grant notification permissions when prompted
4. Create a test goal on Goals screen
5. Schedule a voice prompt for 1 minute from now on Home screen
6. Lock device and wait for notification
7. Tap notification — audio should play inline
8. Check streak badge increments after daily check-in
9. Try to add 2nd goal as free user — should hit paywall
10. Navigate to Library — premium clips should show lock icon

### Automated checks
- `npm test` — All tests pass with no errors
- No console warnings in Expo dev tools
- Audio plays without crackling or delay
- Notifications deliver within 5 seconds of scheduled time
- Database queries complete in <100ms
- App launches in <3 seconds on mid-range device

### Production readiness
- Test IAP in sandbox mode (iOS TestFlight, Android internal testing)
- Verify subscription status persists across app restarts
- Confirm streak doesn't break across midnight boundary
- Test with 50+ voice clips loaded
- Verify background audio works when app is backgrounded
- Check notification delivery with app fully closed