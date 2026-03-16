# BrainWave Mobile App Spec

## 1. App Name

**FlowGuard**

## 2. One-Line Pitch

Stay focused longer — your phone detects when you're drifting off and gently brings you back to what matters.

## 3. Expanded Vision

### Who is this REALLY for?

**Primary audience:** Anyone who sits still for extended periods and fights drowsiness — students cramming for exams, remote workers in post-lunch slumps, commuters on trains, audiobook listeners in bed, meditation practitioners, and people with ADHD who need external accountability.

**Broadest audience:** The 70% of knowledge workers who report afternoon energy crashes, the 156 million audiobook listeners who fall asleep mid-chapter, and the 2.8 billion smartphone users who multitask on their phones during "focus time."

### Adjacent use cases:

- **Driving safety:** Detect drowsiness during long drives (huge liability/safety angle)
- **Medication monitoring:** Alert users taking drowsiness-inducing medications
- **Elderly care:** Notify caregivers if someone falls asleep unexpectedly
- **Fitness recovery:** Track rest quality between workout sets
- **Language learning:** Pause lessons when attention drops
- **Meeting participation:** Vibrate alert during video calls if you're zoning out

### Why non-technical people want this:

It's invisible insurance against wasted time. You don't need to "do" anything — just keep your phone nearby and it watches your back. It's the difference between finishing a chapter and waking up 3 hours later wondering what happened.

## 4. Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Database:** expo-sqlite for local sleep event logs and user preferences
- **Sensors:** expo-sensors (Accelerometer, Gyroscope), expo-av (Audio)
- **Background tasks:** expo-task-manager + expo-background-fetch
- **Notifications:** expo-notifications
- **State management:** React Context API (no Redux for MVP)
- **Testing:** Jest + React Native Testing Library
- **Analytics:** expo-analytics (privacy-first, local-only for free tier)

## 5. Core Features (MVP)

1. **Real-time drowsiness detection**
   - Uses accelerometer + gyroscope to detect head nods, phone drops, and stillness patterns
   - Audio analysis (optional mic access) for breathing rate changes
   - Triggers gentle haptic + audio alert when sleep detected (escalating intensity)

2. **Activity profiles**
   - Pre-set modes: Study, Work, Audiobook, Meditation, Driving (high-alert)
   - Each profile has custom sensitivity and alert styles
   - One-tap start/stop with persistent notification

3. **Session history & insights**
   - Log every session: duration, drowsiness events, time of day
   - Weekly summary: "You stayed focused 23% longer this week"
   - Identify patterns: "You drift off most around 2-3 PM"

4. **Smart alerts**
   - Haptic patterns that escalate (gentle buzz → strong pulse → alarm)
   - Audio cues (chime, voice prompt, or user's own alarm sound)
   - "Snooze" option that increases sensitivity for 5 minutes

5. **Privacy-first design**
   - All data stored locally (SQLite)
   - No cloud sync in free tier
   - Explicit permissions with clear explanations

## 6. Monetization Strategy

### Free Tier (Hook):
- 3 activity profiles (Study, Work, Audiobook)
- Basic drowsiness detection (accelerometer only)
- 7-day session history
- Standard alert sounds
- Ads on insights screen (non-intrusive banner)

### Paid Tier — $4.99/month or $39.99/year (Hook → Paywall):
- **Unlimited custom profiles** with fine-tuned sensitivity
- **Advanced detection:** Mic-based breathing analysis, heart rate integration (Apple Watch/Wear OS)
- **Unlimited history** with exportable CSV reports
- **Driving mode** with emergency contact auto-alert
- **Cloud backup** and cross-device sync
- **Ad-free experience**
- **Weekly coaching insights:** "Try a 10-min walk at 2 PM to avoid your slump"

### Why people STAY subscribed:
- **Habit formation:** After 2 weeks, users rely on it for focus sessions
- **Data lock-in:** Historical insights become more valuable over time
- **Safety net:** Driving mode alone justifies the cost for commuters
- **Sunk cost:** "I've logged 50 hours of focus time, can't lose that data"

### Price reasoning:
- Lower than Headspace ($12.99) and Sleep Cycle ($29.99/year)
- Comparable to Spotify Premium ($5.99) — positions as "focus utility" not "wellness luxury"
- Annual discount (33% off) encourages long-term commitment

## 7. Market Gap Analysis

**NOT SKIPPING** — Clear gap exists:

- **Sleep Cycle:** Tracks sleep at night, no real-time intervention during waking hours
- **Headspace/Calm:** Meditation-focused, requires active participation, no passive monitoring
- **Spotify Focus Mode:** Just music playlists, no biometric feedback
- **Audiobook apps:** Basic sleep timers (time-based), no actual sleep detection

**FlowGuard's unique position:** Only app that passively monitors drowsiness during active tasks and intervenes in real-time. Competitors either track sleep retrospectively or require user initiation. We're the "anti-sleep" app for waking hours.

## 8. File Structure

```
flowguard/
├── app.json
├── package.json
├── babel.config.js
├── tsconfig.json
├── App.tsx
├── src/
│   ├── components/
│   │   ├── ActivityProfileCard.tsx
│   │   ├── AlertControls.tsx
│   │   ├── SessionTimer.tsx
│   │   └── InsightsChart.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── ProfilesScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── SensorService.ts
│   │   ├── DetectionEngine.ts
│   │   ├── AlertService.ts
│   │   └── DatabaseService.ts
│   ├── context/
│   │   └── AppContext.tsx
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
├── __tests__/
│   ├── DetectionEngine.test.ts
│   ├── DatabaseService.test.ts
│   ├── SensorService.test.ts
│   └── components/
│       └── SessionTimer.test.tsx
└── assets/
    ├── sounds/
    │   ├── gentle-chime.mp3
    │   └── alert-pulse.mp3
    └── images/
        └── icon.png
```

## 9. Tests

### `__tests__/DetectionEngine.test.ts`
```typescript
import { DetectionEngine } from '../src/services/DetectionEngine';

describe('DetectionEngine', () => {
  let engine: DetectionEngine;

  beforeEach(() => {
    engine = new DetectionEngine('study');
  });

  test('detects drowsiness from accelerometer stillness', () => {
    const stillData = Array(10).fill({ x: 0.01, y: 0.01, z: 9.81 });
    stillData.forEach(data => engine.processSensorData(data));
    expect(engine.isDrowsy()).toBe(true);
  });

  test('does not trigger on normal movement', () => {
    const normalData = [
      { x: 0.5, y: 0.3, z: 9.8 },
      { x: -0.2, y: 0.6, z: 9.7 },
    ];
    normalData.forEach(data => engine.processSensorData(data));
    expect(engine.isDrowsy()).toBe(false);
  });

  test('adjusts sensitivity by profile', () => {
    const drivingEngine = new DetectionEngine('driving');
    const stillData = { x: 0.05, y: 0.05, z: 9.81 };
    
    engine.processSensorData(stillData);
    drivingEngine.processSensorData(stillData);
    
    expect(drivingEngine.getSensitivity()).toBeGreaterThan(engine.getSensitivity());
  });
});
```

### `__tests__/DatabaseService.test.ts`
```typescript
import { DatabaseService } from '../src/services/DatabaseService';

describe('DatabaseService', () => {
  let db: DatabaseService;

  beforeEach(async () => {
    db = new DatabaseService();
    await db.initialize();
  });

  afterEach(async () => {
    await db.clearAllData();
  });

  test('saves and retrieves session', async () => {
    const session = {
      profileId: 'study',
      startTime: Date.now(),
      endTime: Date.now() + 3600000,
      drowsinessEvents: 2,
    };

    const id = await db.saveSession(session);
    const retrieved = await db.getSession(id);

    expect(retrieved).toMatchObject(session);
  });

  test('calculates weekly stats', async () => {
    await db.saveSession({
      profileId: 'work',
      startTime: Date.now() - 86400000,
      endTime: Date.now() - 82800000,
      drowsinessEvents: 1,
    });

    const stats = await db.getWeeklyStats();
    expect(stats.totalSessions).toBe(1);
    expect(stats.totalDuration).toBeGreaterThan(0);
  });
});
```

### `__tests__/SensorService.test.ts`
```typescript
import { SensorService } from '../src/services/SensorService';

describe('SensorService', () => {
  let service: SensorService;

  beforeEach(() => {
    service = new SensorService();
  });

  test('starts and stops sensor monitoring', async () => {
    await service.startMonitoring();
    expect(service.isMonitoring()).toBe(true);

    await service.stopMonitoring();
    expect(service.isMonitoring()).toBe(false);
  });

  test('emits sensor data events', async () => {
    const mockCallback = jest.fn();
    service.onDataReceived(mockCallback);

    await service.startMonitoring();
    
    // Simulate sensor data
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockCallback).toHaveBeenCalled();
  });
});
```

### `__tests__/components/SessionTimer.test.tsx`
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SessionTimer } from '../../src/components/SessionTimer';

describe('SessionTimer', () => {
  test('renders initial state', () => {
    const { getByText } = render(
      <SessionTimer isActive={false} onStart={jest.fn()} onStop={jest.fn()} />
    );
    expect(getByText('00:00:00')).toBeTruthy();
  });

  test('calls onStart when start button pressed', () => {
    const onStart = jest.fn();
    const { getByText } = render(
      <SessionTimer isActive={false} onStart={onStart} onStop={jest.fn()} />
    );
    
    fireEvent.press(getByText('Start'));
    expect(onStart).toHaveBeenCalled();
  });

  test('displays elapsed time when active', () => {
    const { getByText } = render(
      <SessionTimer 
        isActive={true} 
        elapsedSeconds={125} 
        onStart={jest.fn()} 
        onStop={jest.fn()} 
      />
    );
    expect(getByText('00:02:05')).toBeTruthy();
  });
});
```

## 10. Implementation Steps

### Phase 1: Project Setup
1. Initialize Expo project: `npx create-expo-app flowguard --template blank-typescript`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-sensors expo-av expo-notifications expo-task-manager expo-background-fetch
   npm install @react-navigation/native @react-navigation/bottom-tabs
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json`:
   - Add permissions: `ACTIVITY_RECOGNITION`, `RECORD_AUDIO` (optional), `VIBRATE`
   - Enable background modes for iOS
   - Set notification icon and sounds
4. Set up TypeScript types in `src/types/index.ts`:
   - `ActivityProfile`, `Session`, `SensorData`, `AlertConfig`

### Phase 2: Database Layer
1. Create `DatabaseService.ts`:
   - Initialize SQLite with tables: `sessions`, `profiles`, `settings`
   - Implement CRUD methods: `saveSession()`, `getSession()`, `getWeeklyStats()`
   - Add migration logic for schema updates
2. Write tests in `__tests__/DatabaseService.test.ts`
3. Verify: `npm test -- DatabaseService`

### Phase 3: Sensor Integration
1. Create `SensorService.ts`:
   - Subscribe to accelerometer with 100ms update interval
   - Implement data buffering (store last 30 readings)
   - Add permission checks and error handling
2. Create `DetectionEngine.ts`:
   - Implement stillness detection algorithm (variance threshold)
   - Add profile-based sensitivity scaling
   - Implement drowsiness state machine (normal → drowsy → alert)
3. Write tests for both services
4. Verify: `npm test -- SensorService DetectionEngine`

### Phase 4: Alert System
1. Create `AlertService.ts`:
   - Implement haptic patterns (Haptics.notificationAsync)
   - Load and play audio alerts (expo-av)
   - Implement escalation logic (3 levels over 15 seconds)
   - Add snooze functionality
2. Integrate with notifications for background alerts
3. Test on physical device (haptics don't work in simulator)

### Phase 5: Core UI Components
1. Create `SessionTimer.tsx`:
   - Display elapsed time in HH:MM:SS format
   - Start/Stop button with loading states
   - Drowsiness event counter
2. Create `ActivityProfileCard.tsx`:
   - Display profile name, icon, sensitivity level
   - Tap to select, long-press to edit
3. Create `InsightsChart.tsx`:
   - Bar chart for weekly session durations (use react-native-svg)
   - Drowsiness event timeline
4. Write component tests
5. Verify: `npm test -- components/`

### Phase 6: Screen Implementation
1. Create `HomeScreen.tsx`:
   - Profile selector (horizontal scroll)
   - SessionTimer component
   - Real-time drowsiness indicator (pulsing dot)
   - Quick stats: "3 alerts today"
2. Create `ProfilesScreen.tsx`:
   - List of activity profiles
   - Add/Edit/Delete functionality
   - Sensitivity slider (1-10 scale)
3. Create `HistoryScreen.tsx`:
   - Scrollable list of past sessions
   - Filter by profile and date range
   - Tap to view session details
4. Create `SettingsScreen.tsx`:
   - Alert preferences (haptic strength, sound volume)
   - Permissions status and request buttons
   - Subscription status and upgrade CTA

### Phase 7: State Management
1. Create `AppContext.tsx`:
   - Global state: `currentSession`, `activeProfile`, `isMonitoring`
   - Actions: `startSession()`, `stopSession()`, `recordDrowsinessEvent()`
   - Persist state to AsyncStorage on changes
2. Wrap App.tsx with context provider
3. Connect screens to context

### Phase 8: Background Task
1. Implement background task in `App.tsx`:
   - Register task with expo-task-manager
   - Continue sensor monitoring when app backgrounded
   - Trigger notifications if drowsiness detected
2. Test background behavior:
   - Start session, background app, wait 30s
   - Verify notification appears

### Phase 9: Navigation & Polish
1. Set up bottom tab navigator:
   - Tabs: Home, Profiles, History, Settings
   - Custom icons and active states
2. Add loading states and error boundaries
3. Implement haptic feedback on button presses
4. Add onboarding flow (first launch):
   - Explain permissions
   - Demo alert system
   - Create first profile

### Phase 10: Monetization Integration
1. Add subscription check logic:
   - Free tier: limit to 3 profiles, 7-day history
   - Paid tier: unlock all features
2. Create paywall screen (modal):
   - Feature comparison table
   - "Upgrade Now" button (link to external subscription page for MVP)
3. Add banner ad placeholder on HistoryScreen (free tier)

### Phase 11: Testing & Optimization
1. Run full test suite: `npm test`
2. Test on physical devices (iOS + Android):
   - Verify sensor accuracy in different positions
   - Test alert escalation timing
   - Check battery impact (should be <5% per hour)
3. Optimize sensor polling rate if battery drain is high
4. Add error logging (Sentry or similar)

### Phase 12: Deployment Prep
1. Generate app icons and splash screen
2. Update `app.json` with store metadata
3. Build APK/IPA: `eas build --platform all`
4. Submit to TestFlight and Google Play Internal Testing

## 11. How to Verify It Works

### Local Development (Expo Go)
1. Start dev server: `npx expo start`
2. Scan QR code with Expo Go app on physical device (required for sensors)
3. Grant all permissions when prompted
4. Test flow:
   - Select "Study" profile on HomeScreen
   - Tap "Start Session"
   - Place phone flat on table for 30 seconds (simulate stillness)
   - Verify haptic alert triggers
   - Check drowsiness event counter increments
   - Tap "Stop Session"
   - Navigate to History tab, verify session logged

### Automated Tests
1. Run test suite: `npm test`
2. Expected output:
   ```
   PASS  __tests__/DetectionEngine.test.ts
   PASS  __tests__/DatabaseService.test.ts
   PASS  __tests__/SensorService.test.ts
   PASS  __tests__/components/SessionTimer.test.tsx
   
   Test Suites: 4 passed, 4 total
   Tests:       12 passed, 12 total
   ```

### Device-Specific Verification
**iOS (Simulator + Device):**
- Simulator: UI and navigation only (sensors unavailable)
- Device: Full sensor testing, background task verification

**Android (Emulator + Device):**
- Emulator: Enable "Accelerometer" in extended controls
- Device: Test with screen off (background mode)

### Acceptance Criteria
- [ ] All tests pass (`npm test`)
- [ ] App launches without crashes on iOS 15+ and Android 10+
- [ ] Sensor data updates in real-time (check console logs)
- [ ] Alert triggers within 30s of stillness detection
- [ ] Session saves to database and appears in History
- [ ] Background task continues monitoring when app backgrounded
- [ ] Permissions are requested with clear explanations
- [ ] No memory leaks after 10-minute session (check dev tools)