# SleepyBook → DriftGuard

## One-line pitch
The app that knows when you're falling asleep and saves your work before you do.

## Expanded vision

**Who is this REALLY for?**

This isn't just a sleep tracker—it's a safety net for anyone who works or learns in non-traditional hours:

- **Night shift workers** (nurses, security guards, truck drivers on breaks) who need to stay alert but risk microsleep
- **Students** pulling all-nighters who lose hours of work to accidental sleep
- **New parents** working from home who doze off during feeds or nap time
- **Chronic illness patients** (narcolepsy, sleep apnea) who experience sudden sleep episodes
- **Remote workers across time zones** fighting circadian misalignment
- **Elderly users** who want fall detection + sleep monitoring in one app

**Adjacent use cases:**
- **Medication reminder system** that pauses when you're asleep (no waking you up)
- **Smart alarm** that only rings if you're NOT in deep sleep (using motion patterns)
- **Focus session timer** that auto-pauses when you drift off during study/work
- **Safety monitor** for solo workers (sends alert if no movement detected for X minutes)

**Why non-technical people want this:**
"I fell asleep with my laptop open and lost 3 hours of work" is universal. This app is insurance against that moment. The sensor tech is invisible—users just see "auto-save kicked in" notifications.

## Tech stack

- **React Native (Expo SDK 52+)** — cross-platform iOS/Android
- **expo-sensors** — accelerometer, gyroscope for motion detection
- **expo-av** — audio recording for ambient sound analysis
- **expo-brightness** — ambient light sensor access
- **expo-sqlite** — local storage for sleep patterns, work sessions
- **expo-background-fetch** — periodic sensor checks when app is backgrounded
- **expo-notifications** — alerts when sleep detected
- **react-native-reanimated** — smooth UI transitions for real-time feedback
- **zustand** — lightweight state management
- **date-fns** — time calculations

## Core features (MVP)

1. **Sleep Onset Detection Engine**
   - Combines motion (stillness >2min), sound (ambient noise <30dB), light (screen dimming)
   - Machine learning model (simple threshold-based initially) improves with user feedback
   - Calibration wizard on first launch (asks user to simulate sleep for 60 seconds)

2. **Auto-Save Guardian**
   - Monitors active text input fields (notes, tasks, messages)
   - Triggers save + notification when sleep detected: "Saved your work—rest easy"
   - Integrates with clipboard to backup last 5 minutes of typing

3. **Focus Session Mode**
   - User sets work timer (25/50/90 min Pomodoro-style)
   - App pauses timer if sleep detected, resumes when movement returns
   - Shows "You dozed for 8 minutes" summary

4. **Sleep Pattern Dashboard**
   - Visual timeline of sleep episodes during work hours
   - Insights: "You tend to drift off around 2pm—schedule breaks then"
   - Export data as CSV for doctors (useful for narcolepsy patients)

5. **Emergency Contact Alert** (Premium)
   - If no movement detected for >10 minutes, sends SMS to chosen contact
   - Useful for elderly, solo workers, medical conditions

## Monetization strategy

**Free tier:**
- Sleep detection (up to 3 sessions/day)
- Basic auto-save (clipboard only)
- 7-day history

**Premium ($4.99/month or $39.99/year):**
- Unlimited detection sessions
- Cloud backup of work (encrypted)
- Emergency contact alerts
- Integrations (Notion, Trello, Google Docs auto-save)
- Advanced analytics (sleep debt calculator, productivity correlation)
- Custom sensitivity settings (adjust thresholds for motion/sound)

**Why this price?**
- Higher than typical sleep trackers ($2.99) because this prevents data loss (higher value prop)
- Lower than productivity tools ($9.99) to stay accessible to students/shift workers
- Annual discount (33% off) encourages long-term commitment

**Retention hooks:**
- Personalized sleep pattern insights improve over time (sunk cost)
- Emergency alert feature creates peace of mind dependency
- Integration with work tools makes it part of daily workflow

## File structure

```
driftguard/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home/Dashboard
│   │   ├── monitor.tsx               # Live monitoring screen
│   │   ├── history.tsx               # Sleep pattern history
│   │   └── settings.tsx              # Settings & calibration
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── SleepDetector.tsx             # Core detection logic
│   ├── AutoSaveManager.tsx           # Save orchestration
│   ├── CalibrationWizard.tsx         # First-run setup
│   ├── SessionTimer.tsx              # Focus mode timer
│   ├── PatternChart.tsx              # Sleep timeline viz
│   └── EmergencyAlert.tsx            # Contact notification
├── lib/
│   ├── sensors/
│   │   ├── motionDetector.ts         # Accelerometer logic
│   │   ├── soundAnalyzer.ts          # Audio level detection
│   │   └── lightSensor.ts            # Ambient light tracking
│   ├── ml/
│   │   └── sleepClassifier.ts        # Threshold-based model
│   ├── storage/
│   │   ├── database.ts               # SQLite setup
│   │   └── migrations.ts             # Schema versions
│   ├── notifications/
│   │   └── alertManager.ts           # Push notifications
│   └── utils/
│       ├── clipboard.ts              # Text backup
│       └── analytics.ts              # Event tracking
├── store/
│   └── useAppStore.ts                # Zustand state
├── constants/
│   └── thresholds.ts                 # Detection sensitivity
├── __tests__/
│   ├── motionDetector.test.ts
│   ├── sleepClassifier.test.ts
│   ├── autoSave.test.ts
│   └── database.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/motionDetector.test.ts
import { detectStillness } from '@/lib/sensors/motionDetector';

describe('Motion Detection', () => {
  it('detects stillness after 2 minutes of low movement', () => {
    const movements = [0.01, 0.02, 0.01, 0.015]; // Low acceleration values
    expect(detectStillness(movements, 120)).toBe(true);
  });

  it('rejects stillness if movement exceeds threshold', () => {
    const movements = [0.5, 0.6, 0.4]; // High movement
    expect(detectStillness(movements, 120)).toBe(false);
  });
});

// __tests__/sleepClassifier.test.ts
import { classifySleepState } from '@/lib/ml/sleepClassifier';

describe('Sleep Classification', () => {
  it('classifies as asleep when all signals align', () => {
    const state = classifySleepState({
      motion: 0.01,
      sound: 25, // dB
      light: 10, // lux
    });
    expect(state).toBe('asleep');
  });

  it('classifies as awake if any signal is active', () => {
    const state = classifySleepState({
      motion: 0.5,
      sound: 25,
      light: 10,
    });
    expect(state).toBe('awake');
  });
});

// __tests__/autoSave.test.ts
import { triggerAutoSave } from '@/lib/storage/autoSave';

describe('Auto-Save', () => {
  it('saves clipboard content when sleep detected', async () => {
    const content = 'Important work notes';
    const result = await triggerAutoSave(content);
    expect(result.saved).toBe(true);
    expect(result.timestamp).toBeDefined();
  });
});

// __tests__/database.test.ts
import { saveSleepSession, getSleepHistory } from '@/lib/storage/database';

describe('Database', () => {
  it('stores sleep session with correct schema', async () => {
    const session = {
      startTime: new Date(),
      duration: 480, // seconds
      confidence: 0.85,
    };
    await saveSleepSession(session);
    const history = await getSleepHistory(7);
    expect(history.length).toBeGreaterThan(0);
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo app: `npx create-expo-app driftguard --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sensors expo-av expo-brightness expo-sqlite expo-background-fetch expo-notifications react-native-reanimated zustand date-fns
   npm install --save-dev jest @testing-library/react-native
   ```
3. Configure `app.json`:
   - Add permissions: `RECORD_AUDIO`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED`
   - Enable background modes: `audio`, `fetch`
4. Set up SQLite schema in `lib/storage/database.ts`:
   ```sql
   CREATE TABLE sleep_sessions (
     id INTEGER PRIMARY KEY,
     start_time TEXT,
     end_time TEXT,
     duration INTEGER,
     confidence REAL,
     notes TEXT
   );
   CREATE TABLE calibration_data (
     user_id TEXT,
     motion_threshold REAL,
     sound_threshold REAL,
     light_threshold REAL
   );
   ```

### Phase 2: Sensor integration
5. Implement `lib/sensors/motionDetector.ts`:
   - Subscribe to accelerometer updates (100ms interval)
   - Calculate rolling average of magnitude: `sqrt(x² + y² + z²)`
   - Detect stillness: avg < 0.05 for 120 seconds
6. Implement `lib/sensors/soundAnalyzer.ts`:
   - Use `expo-av` to record 1-second audio samples every 10 seconds
   - Calculate RMS amplitude, convert to dB
   - Threshold: < 30dB indicates quiet environment
7. Implement `lib/sensors/lightSensor.ts`:
   - Poll `expo-brightness` every 5 seconds
   - Threshold: < 50 lux indicates dim lighting

### Phase 3: Sleep classification
8. Create `lib/ml/sleepClassifier.ts`:
   - Weighted scoring system:
     - Motion: 50% weight (stillness = +50 points)
     - Sound: 30% weight (quiet = +30 points)
     - Light: 20% weight (dim = +20 points)
   - Score > 70 = "asleep", 40-70 = "drowsy", < 40 = "awake"
   - Store confidence level with each classification
9. Add user feedback loop:
   - Show notification: "Did we get it right?" with Yes/No buttons
   - Adjust thresholds in `calibration_data` table based on responses

### Phase 4: Auto-save system
10. Implement `lib/storage/autoSave.ts`:
    - Monitor clipboard using `expo-clipboard`
    - On sleep detection, save last 5 clipboard entries to SQLite
    - Show notification: "💾 Saved your work—rest easy"
11. Add `components/AutoSaveManager.tsx`:
    - Background service that runs every 30 seconds
    - Checks sleep state, triggers save if needed
    - Logs save events to database

### Phase 5: UI components
12. Build `components/CalibrationWizard.tsx`:
    - 3-step flow: "Sit still for 60s" → "Make noise" → "Adjust brightness"
    - Collect baseline sensor readings
    - Save to `calibration_data` table
13. Create `app/(tabs)/monitor.tsx`:
    - Real-time sensor readings (motion, sound, light)
    - Visual indicator: green (awake) → yellow (drowsy) → red (asleep)
    - "Start Focus Session" button
14. Build `components/SessionTimer.tsx`:
    - Pomodoro-style countdown (25/50/90 min presets)
    - Auto-pause when sleep detected
    - Resume notification when movement returns
15. Create `app/(tabs)/history.tsx`:
    - Timeline chart showing sleep episodes (use `react-native-svg`)
    - Stats: total sleep time, average episode duration
    - Export CSV button

### Phase 6: Premium features
16. Implement `components/EmergencyAlert.tsx`:
    - Check for movement every 2 minutes
    - If stillness > 10 minutes, send SMS via Twilio API
    - Settings: add emergency contact, enable/disable
17. Add cloud backup (Premium):
    - Use Expo SecureStore for encryption keys
    - Upload sleep sessions to Firebase/Supabase
    - Sync across devices

### Phase 7: Background execution
18. Configure `expo-background-fetch`:
    - Register task to run every 15 minutes
    - Check sensor state, update database
    - Show notification if sleep detected while backgrounded
19. Add `expo-task-manager` for long-running detection:
    - Define background task in `app/_layout.tsx`
    - Ensure sensors continue polling when app is minimized

### Phase 8: Testing & polish
20. Write all test files in `__tests__/`
21. Add error handling:
    - Sensor permission denied → show setup guide
    - Low battery → reduce polling frequency
    - No movement for 24h → prompt user to recalibrate
22. Implement analytics:
    - Track: sessions started, sleep episodes detected, auto-saves triggered
    - Use Expo Analytics or PostHog
23. Design app icon (sleeping moon + shield metaphor)
24. Write App Store description emphasizing "never lose work again"

### Phase 9: Monetization setup
25. Integrate RevenueCat for subscriptions:
    - Configure products: monthly ($4.99), annual ($39.99)
    - Add paywall screen after 3 free sessions
26. Implement feature flags:
    - Check subscription status before enabling premium features
    - Show upgrade prompts in settings

## How to verify it works

### Local testing
1. **Install on device:**
   ```bash
   npx expo start
   # Scan QR code with Expo Go app
   ```

2. **Test sensor detection:**
   - Open Monitor tab
   - Place phone on desk, stay still for 2 minutes
   - Verify status changes to "Asleep" (red indicator)
   - Pick up phone, verify status returns to "Awake"

3. **Test auto-save:**
   - Copy text to clipboard: "Test work content"
   - Trigger sleep detection (stay still)
   - Check notification appears: "Saved your work"
   - Open History tab, verify session logged

4. **Test focus session:**
   - Start 25-minute timer
   - Simulate sleep (place phone down, stay still)
   - Verify timer pauses
   - Move phone, verify timer resumes

5. **Run tests:**
   ```bash
   npm test
   # All tests must pass
   ```

6. **Test calibration:**
   - Delete app data, reinstall
   - Complete calibration wizard
   - Verify custom thresholds saved to database

### Device-specific checks
- **iOS:** Test background fetch (wait 15 min, check if detection continues)
- **Android:** Test battery optimization exemption (Settings → Apps → DriftGuard → Battery)
- **Low battery:** Verify polling frequency reduces when battery < 20%

### Edge cases
- Airplane mode: App should work offline (no cloud features)
- No microphone permission: Fall back to motion + light only
- Phone in pocket: High motion should prevent false "asleep" detection