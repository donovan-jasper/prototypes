# Sleepy Reader Spec

## 1. App Name

**DriftWave**

## 2. One-Line Pitch

Fall asleep faster and wake up refreshed with AI-powered stories and soundscapes that adapt to your sleep cycle in real-time.

## 3. Expanded Vision

### Who This Is Really For

**Primary Audience:**
- **Insomniacs and poor sleepers** (60M+ Americans) who've tried everything but still struggle
- **Shift workers and travelers** dealing with jet lag and irregular sleep schedules
- **Parents** who need help winding down after exhausting days
- **Anxiety sufferers** who can't quiet their racing thoughts at night
- **Students and professionals** optimizing sleep for performance

**Broader Appeal:**
- **Meditation skeptics** who find traditional apps too "woo-woo" — this is science-backed sleep optimization
- **Audiobook lovers** who want content designed for sleep, not engagement
- **Couples** where one partner needs audio to sleep but the other doesn't want disruption
- **Elderly users** with age-related sleep issues who prefer simple, voice-guided experiences

### Adjacent Use Cases

- **Power naps** — 20-minute optimized rest sessions for busy professionals
- **Focus sessions** — daytime soundscapes for deep work (expanding beyond sleep)
- **Kids' bedtime routine** — age-appropriate stories that help children develop healthy sleep habits
- **Sleep coaching** — personalized insights and recommendations based on patterns
- **White noise replacement** — intelligent audio that's more effective than static sounds

### Why Non-Technical People Want This

Sleep is universal. Everyone wants better rest but most solutions are either:
- Too passive (just white noise)
- Too active (requires engagement)
- One-size-fits-all (no personalization)

DriftWave is the first app that **works while you sleep** — no effort required after you press play. It's like having a sleep therapist who adjusts their approach based on how you're actually sleeping, not just a timer.

## 4. Tech Stack

```
- React Native (Expo SDK 52+)
- TypeScript
- SQLite (expo-sqlite) for local sleep history and preferences
- Expo Audio for playback
- Expo Sensors for motion detection (sleep stage estimation)
- Expo Background Fetch for sleep tracking
- Expo Notifications for smart alarms
- React Navigation for routing
- Zustand for state management (lightweight)
- Jest + React Native Testing Library for tests
```

**Key Dependencies:**
```json
{
  "expo": "~52.0.0",
  "expo-audio": "~14.0.0",
  "expo-sqlite": "~15.0.0",
  "expo-sensors": "~14.0.0",
  "expo-background-fetch": "~13.0.0",
  "expo-notifications": "~0.29.0",
  "react-navigation": "^6.0.0",
  "zustand": "^4.5.0"
}
```

## 5. Core Features (MVP)

### 1. Adaptive Sleep Stories
- 5 professionally narrated stories that dynamically adjust pacing, volume, and complexity based on detected sleep stage
- Stories fade to ambient soundscapes as user enters deep sleep
- Resume from last position if user wakes up

### 2. Smart Sleep Detection
- Uses device motion sensors to estimate sleep stages (awake → light → deep)
- No wearables required — just place phone on nightstand or mattress edge
- Learns user's typical sleep patterns over time

### 3. Personalized Soundscapes
- Binaural beats, nature sounds, ASMR-style audio
- Automatically transitions between content types as sleep deepens
- Volume gradually decreases as user falls asleep

### 4. Sleep Insights Dashboard
- Track sleep onset time, estimated sleep quality, wake-ups
- Weekly trends and personalized tips
- Export data to Apple Health/Google Fit

### 5. Smart Alarm
- Wakes user during light sleep within 30-minute window
- Gentle, gradual wake-up sounds (no jarring alarms)
- Snooze intelligently adjusts based on sleep stage

## 6. Monetization Strategy

### Free Tier (Hook)
- 2 sleep stories (rotated weekly)
- 3 basic soundscapes (rain, ocean, white noise)
- Basic sleep tracking (7-day history)
- Smart alarm (limited to 1 alarm per night)

### Paid Tier: DriftWave Premium ($7.99/month or $59.99/year)
- **Unlimited content library** (50+ stories, 30+ soundscapes, new content monthly)
- **Advanced sleep insights** (unlimited history, trend analysis, personalized recommendations)
- **Multiple alarms** with custom wake-up sounds
- **Offline mode** (download content for travel)
- **Partner mode** (separate audio profiles for couples)
- **Priority access** to new features and beta content

### Price Reasoning
- $7.99/month positions between Calm ($14.99) and basic meditation apps ($4.99)
- Annual plan ($59.99 = $5/month) incentivizes commitment and reduces churn
- Lower than therapy or sleep aids, higher than generic white noise apps

### Retention Strategy
- **Habit formation:** Sleep is daily — high engagement potential
- **Personalization improves over time:** The longer you use it, the better it works
- **Content refresh:** New stories monthly keeps library fresh
- **Streak tracking:** Gamify consistent use without being annoying
- **Sleep score improvements:** Show measurable impact on sleep quality

## 7. Market Gap Analysis

**NOT SKIP** — Clear differentiation:

- **Sleep Cycle/AutoSleep:** Focus on tracking only, no adaptive content
- **Calm/Headspace:** Static content, no real-time adaptation to sleep stages
- **Spotify Sleep Timer:** Just a timer, no intelligence or personalization
- **Pzizz:** Algorithmic audio but no storytelling or human narration

**Gap:** No app combines real-time sleep stage detection with dynamically adaptive narrative content. Most are either passive trackers or static audio players.

**Advantage:** DriftWave is the first "smart sleep companion" that actively helps you fall asleep AND tracks how well it's working.

## 8. File Structure

```
driftwave/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Tonight screen
│   │   ├── library.tsx            # Content library
│   │   ├── insights.tsx           # Sleep insights
│   │   └── settings.tsx           # Settings & subscription
│   ├── _layout.tsx
│   ├── player.tsx                 # Full-screen player
│   └── onboarding.tsx             # First-time setup
├── components/
│   ├── ContentCard.tsx
│   ├── SleepChart.tsx
│   ├── PlayerControls.tsx
│   └── SubscriptionModal.tsx
├── services/
│   ├── audioService.ts            # Audio playback management
│   ├── sleepDetectionService.ts   # Motion sensor analysis
│   ├── databaseService.ts         # SQLite operations
│   └── contentService.ts          # Content loading/caching
├── store/
│   ├── usePlayerStore.ts
│   ├── useSleepStore.ts
│   └── useUserStore.ts
├── utils/
│   ├── sleepStageAlgorithm.ts     # Sleep stage estimation logic
│   ├── audioMixer.ts              # Dynamic audio transitions
│   └── constants.ts
├── assets/
│   ├── audio/
│   │   ├── stories/
│   │   └── soundscapes/
│   └── images/
├── __tests__/
│   ├── sleepStageAlgorithm.test.ts
│   ├── audioService.test.ts
│   ├── databaseService.test.ts
│   └── components/
│       └── ContentCard.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### Core Test Files

**`__tests__/sleepStageAlgorithm.test.ts`**
```typescript
import { estimateSleepStage, analyzeMotionData } from '../utils/sleepStageAlgorithm';

describe('Sleep Stage Algorithm', () => {
  test('detects awake state with high motion', () => {
    const motionData = [0.8, 0.9, 0.7, 0.85];
    expect(estimateSleepStage(motionData)).toBe('awake');
  });

  test('detects light sleep with moderate motion', () => {
    const motionData = [0.3, 0.2, 0.4, 0.25];
    expect(estimateSleepStage(motionData)).toBe('light');
  });

  test('detects deep sleep with minimal motion', () => {
    const motionData = [0.05, 0.02, 0.03, 0.01];
    expect(estimateSleepStage(motionData)).toBe('deep');
  });
});
```

**`__tests__/audioService.test.ts`**
```typescript
import { AudioService } from '../services/audioService';

describe('Audio Service', () => {
  let audioService: AudioService;

  beforeEach(() => {
    audioService = new AudioService();
  });

  test('adjusts volume based on sleep stage', async () => {
    await audioService.loadContent('story-1');
    audioService.adjustForSleepStage('deep');
    expect(audioService.getCurrentVolume()).toBeLessThan(0.3);
  });

  test('transitions between content types smoothly', async () => {
    await audioService.loadContent('story-1');
    const transitionTime = await audioService.transitionTo('soundscape-ocean');
    expect(transitionTime).toBeGreaterThan(0);
  });
});
```

**`__tests__/databaseService.test.ts`**
```typescript
import { DatabaseService } from '../services/databaseService';

describe('Database Service', () => {
  let db: DatabaseService;

  beforeEach(async () => {
    db = new DatabaseService();
    await db.initialize();
  });

  test('saves sleep session', async () => {
    const session = {
      date: '2026-03-16',
      duration: 480,
      quality: 85,
      sleepStages: { awake: 20, light: 200, deep: 260 }
    };
    await db.saveSleepSession(session);
    const retrieved = await db.getSleepSession('2026-03-16');
    expect(retrieved.quality).toBe(85);
  });

  test('retrieves sleep history', async () => {
    const history = await db.getSleepHistory(7);
    expect(Array.isArray(history)).toBe(true);
  });
});
```

**`__tests__/components/ContentCard.test.tsx`**
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ContentCard from '../../components/ContentCard';

describe('ContentCard', () => {
  test('renders content information', () => {
    const { getByText } = render(
      <ContentCard
        title="Ocean Waves"
        duration={30}
        isPremium={false}
        onPress={() => {}}
      />
    );
    expect(getByText('Ocean Waves')).toBeTruthy();
  });

  test('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ContentCard
        title="Test"
        duration={20}
        isPremium={false}
        onPress={onPress}
      />
    );
    fireEvent.press(getByTestId('content-card'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## 10. Implementation Steps

### Phase 1: Project Setup
1. Initialize Expo project with TypeScript template
   ```bash
   npx create-expo-app driftwave --template expo-template-blank-typescript
   cd driftwave
   ```

2. Install core dependencies
   ```bash
   npx expo install expo-audio expo-sqlite expo-sensors expo-background-fetch expo-notifications
   npm install @react-navigation/native @react-navigation/bottom-tabs zustand
   npm install --save-dev jest @testing-library/react-native @types/jest
   ```

3. Configure app.json with permissions
   ```json
   {
     "expo": {
       "plugins": [
         [
           "expo-sensors",
           {
             "motionPermission": "Allow DriftWave to detect when you fall asleep"
           }
         ]
       ],
       "ios": {
         "infoPlist": {
           "UIBackgroundModes": ["audio"],
           "NSMotionUsageDescription": "We use motion data to detect your sleep stages"
         }
       },
       "android": {
         "permissions": ["BODY_SENSORS", "FOREGROUND_SERVICE"]
       }
     }
   }
   ```

### Phase 2: Database Layer
4. Create database schema and service
   - Define tables: sleep_sessions, user_preferences, content_library
   - Implement CRUD operations for sleep data
   - Add migration system for schema updates

5. Write database tests
   - Test session saving/retrieval
   - Test data aggregation for insights
   - Test preference storage

### Phase 3: Sleep Detection Engine
6. Implement motion sensor integration
   - Set up accelerometer listener
   - Buffer motion data (30-second windows)
   - Calculate motion intensity metrics

7. Build sleep stage estimation algorithm
   - Implement moving average filter
   - Define thresholds for awake/light/deep states
   - Add state transition smoothing (prevent rapid switching)

8. Write sleep detection tests
   - Test stage classification accuracy
   - Test edge cases (phone movement, interruptions)

### Phase 4: Audio System
9. Create audio service architecture
   - Implement audio loading and caching
   - Build crossfade transition system
   - Add volume adjustment based on sleep stage

10. Implement adaptive playback logic
    - Story narration speed adjustment
    - Automatic transition to soundscapes
    - Resume functionality after interruptions

11. Write audio service tests
    - Test volume adjustments
    - Test content transitions
    - Test playback state management

### Phase 5: Content Management
12. Set up content structure
    - Create sample audio files (3 stories, 3 soundscapes)
    - Implement content metadata system
    - Build content loading service

13. Add offline caching
    - Download manager for premium content
    - Storage management (limit cache size)

### Phase 6: UI Components
14. Build core screens
    - Home/Tonight screen with "Start Sleep Session" button
    - Library screen with content grid
    - Insights screen with sleep charts
    - Settings screen with subscription management

15. Create player interface
    - Full-screen player with minimal controls
    - Sleep timer display
    - Current content information

16. Implement onboarding flow
    - Welcome screens explaining features
    - Permission requests (motion, notifications)
    - Initial preference setup

### Phase 7: State Management
17. Set up Zustand stores
    - Player store (current content, playback state)
    - Sleep store (session data, detection state)
    - User store (preferences, subscription status)

18. Connect stores to components
    - Implement reactive UI updates
    - Add persistence for critical state

### Phase 8: Background Processing
19. Implement background audio
    - Configure audio session for background playback
    - Handle interruptions (calls, alarms)
    - Maintain sensor monitoring in background

20. Set up smart alarm
    - Schedule notifications based on sleep stage
    - Implement gentle wake-up sequence
    - Add snooze logic

### Phase 9: Insights & Analytics
21. Build sleep insights calculator
    - Aggregate session data
    - Calculate trends (7-day, 30-day averages)
    - Generate personalized recommendations

22. Create visualization components
    - Sleep stage timeline chart
    - Quality score gauge
    - Trend graphs

### Phase 10: Monetization
23. Implement subscription system
    - Free tier content restrictions
    - Paywall UI components
    - Subscription status checking

24. Add in-app purchase flow (stub for MVP)
    - Subscription modal
    - Restore purchases functionality
    - Trial period handling

### Phase 11: Polish & Testing
25. Add error handling
    - Audio loading failures
    - Sensor unavailability
    - Database errors

26. Implement analytics events (stub)
    - Session start/end
    - Content plays
    - Subscription conversions

27. Run full test suite
    - Unit tests for all services
    - Component tests for UI
    - Integration tests for critical flows

28. Test on physical devices
    - iOS device (motion sensor accuracy)
    - Android device (background behavior)
    - Various screen sizes

### Phase 12: Content & Assets
29. Add placeholder audio content
    - Record or source 3 sleep stories (10-15 min each)
    - Create 3 soundscape loops (ocean, rain, forest)
    - Ensure proper audio format (AAC, 128kbps)

30. Design app icon and splash screen
    - Create icon following platform guidelines
    - Design loading screen

## 11. How to Verify It Works

### Development Testing

1. **Install and run on Expo Go:**
   ```bash
   npm install
   npx expo start
   ```
   - Scan QR code with Expo Go app
   - Test on both iOS and Android devices

2. **Run test suite:**
   ```bash
   npm test
   ```
   - All tests must pass
   - Coverage should be >70% for core services

3. **Manual verification checklist:**

   **Audio Playback:**
   - [ ] Story plays when selected from library
   - [ ] Volume adjusts smoothly during playback
   - [ ] Audio continues in background when app is minimized
   - [ ] Crossfade works between story and soundscape

   **Sleep Detection:**
   - [ ] Place phone on mattress, motion data updates every 30 seconds
   - [ ] Sleep stage indicator changes from "Awake" to "Light" when still
   - [ ] Audio adapts (volume decreases, pacing slows) as sleep deepens
   - [ ] Moving phone triggers return to "Awake" state

   **Data Persistence:**
   - [ ] Sleep session saves after stopping playback
   - [ ] Insights screen shows session in history
   - [ ] Preferences persist after app restart
   - [ ] Content library loads correctly on cold start

   **Smart Alarm:**
   - [ ] Set alarm for 5 minutes in future
   - [ ] Notification fires within expected window
   - [ ] Alarm sound plays at appropriate volume
   - [ ] Snooze functionality works

   **Subscription Flow:**
   - [ ] Free content is accessible without paywall
   - [ ] Premium content shows lock icon
   - [ ] Tapping premium content shows subscription modal
   - [ ] Modal displays pricing and features correctly

4. **Performance checks:**
   - App launches in <3 seconds
   - Audio starts playing within 1 second of selection
   - No memory leaks during 8-hour sleep session
   - Battery drain <15% overnight with active session

5. **Edge case testing:**
   - Phone call interrupts audio → resumes after call ends
   - Low battery warning → audio continues
   - Airplane mode → offline content still plays
   - Force quit app → session data saves correctly

### Production Readiness

Before launch:
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Tested on iOS 15+ and Android 10+
- [ ] Privacy policy and terms of service in place
- [ ] App Store screenshots and description ready
- [ ] Subscription pricing configured in App Store Connect / Google Play Console

---

**Success Metrics:**
- 60%+ of users complete first sleep session
- 40%+ return for second session within 48 hours
- 15%+ convert to paid within 7 days
- Average session length >4 hours (indicates actual sleep use)