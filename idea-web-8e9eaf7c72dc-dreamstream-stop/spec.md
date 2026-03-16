# DreamStream Stop Spec

## 1. App Name

**SleepCue**

## 2. One-Line Pitch

Never lose your place or drain your battery — SleepCue automatically pauses your audio when you fall asleep.

## 3. Expanded Vision

### Who This Is Really For

**Primary Audience:**
- **Bedtime listeners** (largest segment): 60%+ of podcast/audiobook listeners fall asleep to content. They wake up hours ahead in their story, confused about what they missed, or with dead phone batteries.
- **Commuters with unpredictable schedules**: People who nap on trains/buses and want audio to stop when they doze off.
- **Parents**: Those who listen during baby naps and need audio to pause automatically when they fall asleep from exhaustion.
- **Meditation/wellness users**: People using guided sleep meditations who want playback to stop after they've drifted off.

**Adjacent Use Cases:**
- **Battery anxiety relief**: Anyone who's ever woken up to a dead phone because audio played all night.
- **Content retention**: Users who want to actually remember what they listened to, not skip hours of content.
- **Sleep hygiene**: People trying to build better sleep habits by tracking when they actually fall asleep.
- **Shared device users**: Couples where one person falls asleep first and the audio disturbs the other.

**Why Non-Technical People Want This:**
This isn't about "sleep tracking" or "ML algorithms" — it's about solving the universal frustration of waking up confused, with a dead battery, having missed half your audiobook. It's a simple promise: your audio knows when to stop, so you don't have to worry about it.

## 4. Tech Stack

- **Framework**: React Native (Expo SDK 52+)
- **Database**: SQLite (expo-sqlite)
- **Audio**: expo-av
- **Sensors**: expo-sensors (accelerometer), expo-audio (ambient noise detection)
- **Background tasks**: expo-task-manager, expo-background-fetch
- **State management**: React Context API (keep it simple)
- **Testing**: Jest + React Native Testing Library
- **Analytics**: expo-analytics (optional, privacy-first)

**Key Dependencies:**
```json
{
  "expo": "~52.0.0",
  "expo-av": "~15.0.0",
  "expo-sqlite": "~15.0.0",
  "expo-sensors": "~14.0.0",
  "expo-task-manager": "~12.0.0",
  "expo-background-fetch": "~13.0.0",
  "react-native-background-timer": "^2.4.1"
}
```

## 5. Core Features (MVP)

### 1. Smart Sleep Detection
- Uses motion sensors (accelerometer) to detect stillness over 3-5 minutes
- Monitors ambient noise patterns (breathing, silence) via microphone
- Simple algorithm: if no significant movement + consistent low-frequency audio pattern = likely asleep
- Pauses playback automatically with gentle fade-out

### 2. Sleep Timer with Intelligence
- Traditional sleep timer (15/30/45/60 min) as fallback
- "Smart Timer" mode that extends if it detects you're still awake (movement/interaction)
- Visual countdown with ability to add time with a tap

### 3. Playback Rewind on Wake
- Automatically rewinds 2-5 minutes when you resume (configurable)
- "Where was I?" feature shows last conscious listening point
- Quick resume from lock screen notification

### 4. Battery Saver Mode
- Tracks estimated battery saved by auto-pausing
- Shows stats: "Saved 4 hours of battery this week"
- Gamification: badges for battery saved milestones

### 5. Universal Audio Integration
- Works with any audio app (Spotify, Audible, Apple Podcasts, YouTube)
- System-level playback control via media session API
- No need to import/manage content within SleepCue

## 6. Monetization Strategy

### Free Tier (The Hook)
- Basic sleep timer (fixed intervals: 15/30/45/60 min)
- Manual pause/resume
- Works with any audio app
- Limited to 5 sleep sessions per month

**Goal**: Let users experience the core value (not waking up to dead battery/lost place) enough to want more.

### Premium Tier: $3.99/month or $29.99/year
**Why this price?** Lower than typical app subscriptions ($4.99-9.99) because it's a utility, not content. Comparable to a single audiobook or two months of a podcast app. Annual pricing offers 37% savings to encourage commitment.

**Premium Features:**
- **Unlimited smart sleep detection** (motion + audio analysis)
- **Custom rewind amounts** (0-10 minutes)
- **Sleep insights dashboard**: Track sleep patterns, average time to fall asleep, most-listened content before bed
- **Multiple profiles**: Different settings for bed vs. commute vs. meditation
- **Advanced battery stats**: Detailed breakdown of savings
- **Priority support**

**What Makes People Stay Subscribed?**
- **Habit formation**: After 2-3 weeks, users rely on it nightly. Canceling means going back to dead batteries and lost content.
- **Data lock-in**: Sleep insights and listening history become valuable over time.
- **Continuous improvement**: Regular updates with better detection algorithms, new integrations.
- **Peace of mind**: The subscription is insurance against the frustration they remember from before.

### Alternative Revenue (Future)
- One-time "Lifetime" unlock at $49.99 for users who hate subscriptions
- Affiliate partnerships with audiobook/podcast platforms (ethical, disclosed)

## 7. Market Viability

**NOT SKIP** — Here's why:

**Competitors Analysis:**
- **Pocket Casts, Overcast, Castro**: Focus on podcast management, not sleep detection. Sleep timers are basic (fixed intervals only).
- **Audible**: Has sleep timer but no smart detection, no cross-app support.
- **Spotify**: Sleep timer is buried in settings, no intelligence, podcast-only.
- **Apple Podcasts**: Basic timer, no customization.
- **Dedicated sleep apps (Calm, Headspace)**: Focus on their own content, don't work with external audio.

**The Gap:**
No app offers **universal, intelligent sleep detection** that works across all audio sources. Existing solutions are either:
1. App-specific (only work with their content)
2. Dumb timers (fixed intervals, no adaptation)
3. Require manual setup every time

**Why We Can Win:**
- **Single-purpose focus**: We do one thing exceptionally well
- **Universal compatibility**: Works with users' existing audio apps
- **Lower price point**: $3.99 vs. $9.99+ for full podcast/audiobook apps
- **Underserved pain point**: Battery anxiety + lost content is universal but unsolved
- **Network effects**: Users recommend to friends who also fall asleep to audio

## 8. File Structure

```
sleepcue/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home/Dashboard
│   │   ├── timer.tsx                 # Sleep Timer Screen
│   │   ├── insights.tsx              # Sleep Insights (Premium)
│   │   └── settings.tsx              # Settings
│   ├── _layout.tsx                   # Root layout
│   └── +not-found.tsx
├── components/
│   ├── SleepDetector.tsx             # Core sleep detection logic
│   ├── TimerControl.tsx              # Timer UI component
│   ├── AudioController.tsx           # Playback control interface
│   ├── BatteryStats.tsx              # Battery savings display
│   └── PaywallModal.tsx              # Premium upsell
├── services/
│   ├── sleepDetection.ts             # Motion + audio analysis
│   ├── audioControl.ts               # System audio playback control
│   ├── database.ts                   # SQLite setup and queries
│   └── backgroundTask.ts             # Background monitoring
├── hooks/
│   ├── useSleepDetection.ts          # Sleep detection hook
│   ├── useAudioPlayback.ts           # Audio state management
│   └── usePremium.ts                 # Premium status check
├── utils/
│   ├── motionAnalysis.ts             # Accelerometer data processing
│   ├── audioAnalysis.ts              # Ambient sound processing
│   └── constants.ts                  # App constants
├── __tests__/
│   ├── sleepDetection.test.ts
│   ├── motionAnalysis.test.ts
│   ├── audioControl.test.ts
│   └── database.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## 9. Tests

### Core Test Files

**`__tests__/sleepDetection.test.ts`**
- Test motion stillness detection over time windows
- Test audio pattern recognition for sleep indicators
- Test false positive prevention (phone on table vs. user asleep)
- Test sleep state transitions (awake → drowsy → asleep)

**`__tests__/motionAnalysis.test.ts`**
- Test accelerometer data smoothing
- Test movement threshold calculations
- Test stillness duration tracking
- Test motion spike detection (rolling over)

**`__tests__/audioControl.test.ts`**
- Test playback pause/resume commands
- Test rewind functionality
- Test fade-out audio transitions
- Test integration with system media controls

**`__tests__/database.test.ts`**
- Test sleep session logging
- Test battery savings calculations
- Test insights data aggregation
- Test data migration and schema updates

**`__tests__/timer.test.ts`**
- Test countdown timer accuracy
- Test smart timer extension logic
- Test timer cancellation and reset
- Test background timer persistence

## 10. Implementation Steps

### Phase 1: Project Setup
1. Initialize Expo project with TypeScript template
   ```bash
   npx create-expo-app sleepcue --template expo-template-blank-typescript
   cd sleepcue
   ```

2. Install core dependencies
   ```bash
   npx expo install expo-av expo-sqlite expo-sensors expo-task-manager expo-background-fetch
   npm install react-native-background-timer
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```

3. Configure app.json with required permissions
   ```json
   {
     "expo": {
       "plugins": [
         [
           "expo-av",
           {
             "microphonePermission": "Allow SleepCue to detect when you fall asleep using ambient audio."
           }
         ]
       ],
       "ios": {
         "infoPlist": {
           "UIBackgroundModes": ["audio", "processing"],
           "NSMotionUsageDescription": "SleepCue uses motion detection to know when you've fallen asleep."
         }
       },
       "android": {
         "permissions": [
           "RECORD_AUDIO",
           "FOREGROUND_SERVICE",
           "WAKE_LOCK"
         ]
       }
     }
   }
   ```

### Phase 2: Database Layer
4. Create SQLite database schema in `services/database.ts`
   - Tables: `sleep_sessions`, `user_settings`, `battery_stats`
   - Migrations system for schema updates
   - CRUD operations for all tables

5. Write database tests in `__tests__/database.test.ts`
   - Test table creation
   - Test insert/update/delete operations
   - Test query performance with mock data

### Phase 3: Motion Detection
6. Implement motion analysis in `utils/motionAnalysis.ts`
   - Subscribe to accelerometer updates (10Hz sampling)
   - Calculate rolling average of movement magnitude
   - Detect stillness periods (< 0.05 m/s² for 3+ minutes)
   - Implement smoothing algorithm to filter noise

7. Write motion tests in `__tests__/motionAnalysis.test.ts`
   - Mock accelerometer data for various scenarios
   - Test stillness detection accuracy
   - Test movement spike handling

### Phase 4: Audio Analysis (Basic)
8. Implement ambient audio monitoring in `utils/audioAnalysis.ts`
   - Request microphone permission
   - Record 1-second audio samples every 30 seconds
   - Analyze frequency spectrum for sleep indicators (low-frequency breathing patterns)
   - Calculate ambient noise floor

9. Create audio control service in `services/audioControl.ts`
   - Interface with system media session
   - Implement pause/resume with fade effects
   - Implement rewind functionality
   - Handle playback state changes

10. Write audio tests in `__tests__/audioControl.test.ts`
    - Mock audio playback state
    - Test pause/resume commands
    - Test rewind calculations

### Phase 5: Sleep Detection Logic
11. Build core sleep detector in `services/sleepDetection.ts`
    - Combine motion + audio signals
    - Implement state machine: awake → drowsy → asleep
    - Require 3 minutes of stillness + consistent audio pattern
    - Add confidence scoring (0-100%)

12. Create React hook in `hooks/useSleepDetection.ts`
    - Expose sleep state to components
    - Handle permission requests
    - Manage detector lifecycle (start/stop)

13. Write sleep detection tests in `__tests__/sleepDetection.test.ts`
    - Test state transitions with mock sensor data
    - Test false positive scenarios (phone on table)
    - Test detection timing accuracy

### Phase 6: Background Task
14. Implement background monitoring in `services/backgroundTask.ts`
    - Register background task with expo-task-manager
    - Continue sleep detection when app is backgrounded
    - Trigger playback pause when sleep detected
    - Handle task lifecycle and errors

15. Test background task behavior
    - Verify task runs when app backgrounded
    - Test battery impact (should be minimal)
    - Test task cleanup on app termination

### Phase 7: UI Components
16. Build TimerControl component in `components/TimerControl.tsx`
    - Circular countdown display
    - Quick time adjustment buttons (+5, +10, +15 min)
    - Start/pause/cancel controls
    - Visual feedback for smart timer extensions

17. Build SleepDetector component in `components/SleepDetector.tsx`
    - Real-time motion/audio indicators
    - Sleep confidence meter
    - Manual override controls
    - Permission request UI

18. Build BatteryStats component in `components/BatteryStats.tsx`
    - Display estimated battery saved
    - Weekly/monthly aggregates
    - Visual charts (simple bar graphs)
    - Milestone badges

19. Build PaywallModal component in `components/PaywallModal.tsx`
    - Feature comparison table (free vs. premium)
    - Pricing display with annual savings highlight
    - Purchase flow integration (expo-in-app-purchases)
    - Restore purchases option

### Phase 8: Main Screens
20. Implement Home screen in `app/(tabs)/index.tsx`
    - Quick start button for sleep detection
    - Current audio playback info (if available)
    - Battery savings summary
    - Recent sleep sessions list

21. Implement Timer screen in `app/(tabs)/timer.tsx`
    - TimerControl component integration
    - Smart vs. manual timer toggle
    - Preset time buttons
    - Background playback indicator

22. Implement Insights screen in `app/(tabs)/insights.tsx` (Premium)
    - Sleep pattern charts (time to fall asleep, session duration)
    - Most-listened content before bed
    - Battery savings trends
    - Paywall for free users

23. Implement Settings screen in `app/(tabs)/settings.tsx`
    - Rewind amount slider (0-10 min)
    - Detection sensitivity adjustment
    - Audio fade duration
    - Premium status and subscription management
    - Permissions status and re-request buttons

### Phase 9: Premium Integration
24. Set up in-app purchases
    - Configure App Store Connect / Google Play Console products
    - Install expo-in-app-purchases
    - Implement purchase flow in `hooks/usePremium.ts`
    - Store premium status in SQLite
    - Implement subscription validation

25. Add premium gates throughout app
    - Limit free tier to 5 sessions/month
    - Lock insights screen for free users
    - Disable custom rewind for free users
    - Show upgrade prompts at natural moments

### Phase 10: Polish & Testing
26. Add onboarding flow
    - Welcome screen explaining core value
    - Permission request explanations
    - Quick tutorial on first use
    - Optional: sample sleep session walkthrough

27. Implement error handling
    - Graceful permission denial handling
    - Network error recovery (for purchase validation)
    - Sensor unavailability fallbacks
    - User-friendly error messages

28. Add analytics (privacy-first)
    - Track feature usage (no PII)
    - Monitor sleep detection accuracy
    - Track conversion funnel (free → premium)
    - Crash reporting (Sentry or similar)

29. Write integration tests
    - Test full sleep detection → pause flow
    - Test timer → pause flow
    - Test purchase flow (with mocks)
    - Test background task behavior

30. Performance optimization
    - Minimize battery drain (target < 2% per hour)
    - Optimize sensor sampling rates
    - Reduce database writes
    - Profile with React DevTools

### Phase 11: Deployment Prep
31. Configure app icons and splash screen
    - Design simple, recognizable icon (moon + pause symbol)
    - Create adaptive icons for Android
    - Configure splash screen with branding

32. Write App Store / Play Store listings
    - Screenshots showing key features
    - App preview video (30 seconds)
    - Keyword optimization for ASO
    - Privacy policy and terms of service

33. Set up CI/CD
    - EAS Build configuration
    - Automated testing on push
    - Staged rollout strategy

34. Beta testing
    - TestFlight (iOS) and Internal Testing (Android)
    - Recruit 20-50 beta testers
    - Collect feedback on detection accuracy
    - Iterate on UX pain points

## 11. How to Verify It Works

### Local Development Testing

1. **Install and run**
   ```bash
   npm install
   npx expo start
   ```

2. **Run on physical device** (required for accurate sensor testing)
   - Scan QR code with Expo Go app
   - Grant microphone and motion permissions when prompted

3. **Test sleep detection**
   - Start sleep detection from home screen
   - Place phone on flat surface, face down
   - Play audio from Spotify/Apple Music in background
   - Wait 3-5 minutes without touching phone
   - Verify audio pauses automatically
   - Pick up phone and verify audio resumes with rewind

4. **Test timer functionality**
   - Navigate to Timer tab
   - Set 1-minute timer (for quick testing)
   - Start timer and verify countdown
   - Verify audio pauses when timer reaches zero
   - Test "add time" button during countdown

5. **Test background behavior**
   - Start sleep detection
   - Background the app (home button)
   - Lock device
   - Wait for detection to trigger
   - Verify notification appears when audio pauses
   - Verify resume works from lock screen

6. **Run automated tests**
   ```bash
   npm test
   ```
   - All tests in `__tests__/` must pass
   - Coverage should be > 70% for core logic
   - No console errors or warnings

7. **Test premium flow**
   - Trigger paywall (attempt to access insights as free user)
   - Verify purchase modal displays correctly
   - Test with sandbox account (iOS) or test purchase (Android)
   - Verify premium features unlock after purchase

8. **Battery impact test**
   - Charge device to 100%
   - Run sleep detection for 1 hour
   - Check battery usage in device settings
   - Should be < 2% drain per hour

### Acceptance Criteria

- ✅ Sleep detection triggers within 5 minutes of stillness
- ✅ Audio pauses smoothly with 3-second fade-out
- ✅ Rewind works correctly on resume (default 2 minutes)
- ✅ Timer countdown is accurate (< 1 second drift)
- ✅ Background task continues when app backgrounded
- ✅ All unit tests pass with `npm test`
- ✅ No crashes during 30-minute continuous use
- ✅ Battery drain < 2% per hour during active detection
- ✅ Works with Spotify, Apple Music, and Audible
- ✅ Premium purchase flow completes successfully
- ✅ App launches in < 2 seconds on mid-range device

### Known Limitations (MVP)

- Sleep detection accuracy ~85% (will improve with ML in v2)
- Requires physical device (sensors don't work in simulator)
- Background audio monitoring limited on iOS (privacy restrictions)
- No Apple Watch integration (future feature)
- No social features or content recommendations (out of scope)