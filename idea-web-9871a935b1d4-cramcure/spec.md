# PeaceFlow

## One-line pitch
Transform menstrual pain into manageable moments with personalized relief techniques, smart tracking, and a supportive community—all in your pocket.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** Anyone who menstruates and experiences discomfort—from teenagers navigating their first periods to adults managing chronic conditions like endometriosis or PCOS. This is 1.8 billion people globally.

**Broader audience beyond the original niche:**
- **Parents and caregivers** helping teens understand and manage their cycles
- **Partners and family members** seeking to understand and support loved ones
- **Healthcare providers** looking for patient self-reporting tools between appointments
- **Workplace wellness programs** addressing menstrual health as part of holistic employee care
- **Athletes and fitness enthusiasts** optimizing training around their cycle
- **People with irregular cycles** due to stress, PCOS, perimenopause, or other conditions

**Adjacent use cases:**
- **Cycle syncing for productivity** — tracking energy levels, mood, and cognitive performance across cycle phases
- **Fertility awareness** — understanding patterns for conception or natural family planning
- **Symptom documentation for medical visits** — exportable reports for doctors
- **Mental health tracking** — correlating anxiety, depression, or mood swings with hormonal changes
- **Sleep and nutrition optimization** — personalized recommendations based on cycle phase

**Why non-technical people want this:**
- Immediate pain relief when they need it most
- Validation that their pain is real and manageable
- A judgment-free space to discuss taboo topics
- Actionable insights without medical jargon
- Privacy—no need to explain symptoms to anyone else

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** Expo SQLite for offline-first data persistence
- **State management:** React Context API + hooks
- **Navigation:** Expo Router (file-based routing)
- **UI components:** React Native Paper (Material Design)
- **Charts/visualization:** react-native-chart-kit
- **Audio/video:** expo-av
- **Notifications:** expo-notifications
- **Authentication:** expo-auth-session (for future cloud sync)
- **Testing:** Jest + React Native Testing Library
- **Date handling:** date-fns (lightweight alternative to moment.js)

## Core features (MVP)

1. **Smart Symptom Tracker**
   - Log pain intensity, location, type (cramping, sharp, dull)
   - Track mood, energy, flow intensity, and related symptoms
   - Visual calendar view with color-coded severity
   - Predictive cycle forecasting based on historical data

2. **Guided Relief Library**
   - 15-20 curated exercises: yoga poses, breathing techniques, stretches, guided meditation
   - Audio-guided sessions (5-15 minutes each)
   - Filter by pain type, time available, and intensity level
   - Favorites and recently used quick access

3. **Personalized Insights Dashboard**
   - Pattern recognition: "Your pain is typically worse on day 2"
   - Trigger identification: correlations between diet, sleep, stress, and symptoms
   - Relief effectiveness tracking: "Breathing exercises reduced your pain by 40% last cycle"
   - Cycle phase education with actionable tips

4. **Quick Relief SOS Mode**
   - One-tap access to fastest relief techniques during acute pain
   - Breathing exercise timer with haptic feedback
   - Heat therapy timer with reminders
   - Emergency contact for severe symptoms

5. **Educational Content Hub**
   - Expert-written articles on menstrual health, conditions, and holistic management
   - Myth-busting content
   - Supplement and nutrition guides
   - When to see a doctor guidelines

## Monetization strategy

### Free tier (the hook):
- Basic period tracking and predictions
- Symptom logging (limited to 3 symptoms per day)
- 5 free guided relief exercises
- 10 educational articles
- Basic calendar view
- Ads (non-intrusive, health-related)

### Premium tier — $7.99/month or $59.99/year (25% savings):
- **Unlimited symptom tracking** with custom tags
- **Full relief library** (50+ exercises, growing monthly)
- **Advanced analytics** with exportable PDF reports for doctors
- **Personalized pain management plans** based on your patterns
- **Ad-free experience**
- **Community forum access** (moderated, safe space)
- **Cycle syncing recommendations** for work, fitness, nutrition
- **Priority customer support**
- **Data export and backup**

### Why this price point:
- Lower than therapy or medical co-pays ($20-50)
- Comparable to other wellness subscriptions (Calm: $14.99/mo, Headspace: $12.99/mo)
- Annual plan encourages long-term tracking (essential for pattern recognition)
- Accessible to teens and students while sustainable for development

### What makes people STAY subscribed:
- **Sunk cost of data** — months of tracked symptoms create irreplaceable insights
- **Proven relief** — if exercises reduce pain even 30%, it's worth $8/month
- **Community connection** — finding others with similar experiences is invaluable
- **Continuous improvement** — new exercises, articles, and features monthly
- **Medical utility** — exportable reports make doctor visits more productive

### Revenue projections:
- 10,000 users → 1,500 premium (15% conversion) → $11,985/month
- 50,000 users → 7,500 premium (15% conversion) → $59,925/month
- 100,000 users → 15,000 premium (15% conversion) → $119,850/month

## Market position

**NOT SKIP** — Clear gap exists:

- **Flo/Clue:** Focus on tracking and prediction, minimal active pain management
- **Calm/Headspace:** General wellness, not menstrual-specific
- **Phendo:** Research-focused, not consumer-friendly
- **Basic trackers:** No relief techniques or community

**Our differentiation:**
- Only app combining tracking + active relief + community in one place
- Holistic approach (physical, mental, nutritional)
- Privacy-first, offline-capable
- Designed for pain management, not just tracking

## File structure

```
peaceflow/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard/Home
│   │   ├── track.tsx              # Symptom tracking
│   │   ├── relief.tsx             # Guided exercises library
│   │   ├── insights.tsx           # Analytics and patterns
│   │   └── profile.tsx            # Settings and premium
│   ├── sos.tsx                    # Quick relief modal
│   ├── exercise/[id].tsx          # Individual exercise player
│   ├── article/[id].tsx           # Educational content
│   └── _layout.tsx                # Root layout
├── components/
│   ├── SymptomLogger.tsx
│   ├── CycleCalendar.tsx
│   ├── ExerciseCard.tsx
│   ├── AudioPlayer.tsx
│   ├── PainIntensitySlider.tsx
│   ├── InsightCard.tsx
│   ├── PaywallModal.tsx
│   └── SOSButton.tsx
├── services/
│   ├── database.ts                # SQLite setup and queries
│   ├── cyclePredictor.ts          # Prediction algorithm
│   ├── insightsEngine.ts          # Pattern recognition
│   ├── notificationService.ts     # Reminders and alerts
│   └── subscriptionService.ts     # Premium status management
├── types/
│   ├── symptom.ts
│   ├── cycle.ts
│   ├── exercise.ts
│   └── user.ts
├── constants/
│   ├── exercises.ts               # Exercise library data
│   ├── articles.ts                # Educational content
│   └── colors.ts                  # Theme
├── hooks/
│   ├── useDatabase.ts
│   ├── useCycleData.ts
│   ├── useSymptoms.ts
│   └── usePremiumStatus.ts
├── utils/
│   ├── dateHelpers.ts
│   ├── analytics.ts
│   └── validation.ts
├── __tests__/
│   ├── cyclePredictor.test.ts
│   ├── insightsEngine.test.ts
│   ├── database.test.ts
│   ├── dateHelpers.test.ts
│   └── components/
│       ├── SymptomLogger.test.tsx
│       └── CycleCalendar.test.tsx
├── assets/
│   ├── audio/                     # Guided exercise audio files
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Tests

### Core logic tests (Jest):

**`__tests__/cyclePredictor.test.ts`**
```typescript
import { predictNextPeriod, calculateCycleLength, identifyPatterns } from '../services/cyclePredictor';
import { addDays, subDays } from 'date-fns';

describe('Cycle Predictor', () => {
  test('predicts next period based on average cycle length', () => {
    const cycles = [
      { startDate: subDays(new Date(), 60), endDate: subDays(new Date(), 55) },
      { startDate: subDays(new Date(), 32), endDate: subDays(new Date(), 27) },
      { startDate: subDays(new Date(), 4), endDate: new Date() },
    ];
    
    const prediction = predictNextPeriod(cycles);
    expect(prediction).toBeDefined();
    expect(prediction.getTime()).toBeGreaterThan(new Date().getTime());
  });

  test('calculates average cycle length correctly', () => {
    const cycles = [
      { startDate: new Date('2024-01-01'), endDate: new Date('2024-01-05') },
      { startDate: new Date('2024-01-29'), endDate: new Date('2024-02-02') },
      { startDate: new Date('2024-02-26'), endDate: new Date('2024-03-01') },
    ];
    
    const avgLength = calculateCycleLength(cycles);
    expect(avgLength).toBe(28);
  });

  test('identifies irregular cycles', () => {
    const cycles = [
      { startDate: new Date('2024-01-01'), endDate: new Date('2024-01-05') },
      { startDate: new Date('2024-02-15'), endDate: new Date('2024-02-19') },
      { startDate: new Date('2024-03-01'), endDate: new Date('2024-03-05') },
    ];
    
    const patterns = identifyPatterns(cycles);
    expect(patterns.isIrregular).toBe(true);
  });
});
```

**`__tests__/insightsEngine.test.ts`**
```typescript
import { generateInsights, findCorrelations, calculateReliefEffectiveness } from '../services/insightsEngine';

describe('Insights Engine', () => {
  test('identifies pain patterns by cycle day', () => {
    const symptoms = [
      { date: new Date('2024-01-02'), cycleDay: 2, painLevel: 8 },
      { date: new Date('2024-02-02'), cycleDay: 2, painLevel: 9 },
      { date: new Date('2024-03-02'), cycleDay: 2, painLevel: 7 },
      { date: new Date('2024-01-05'), cycleDay: 5, painLevel: 3 },
    ];
    
    const insights = generateInsights(symptoms);
    expect(insights.peakPainDay).toBe(2);
    expect(insights.averagePainOnDay2).toBeGreaterThan(7);
  });

  test('calculates relief technique effectiveness', () => {
    const sessions = [
      { technique: 'breathing', beforePain: 8, afterPain: 5 },
      { technique: 'breathing', beforePain: 7, afterPain: 4 },
      { technique: 'yoga', beforePain: 6, afterPain: 5 },
    ];
    
    const effectiveness = calculateReliefEffectiveness(sessions);
    expect(effectiveness.breathing.reduction).toBeGreaterThan(30);
  });

  test('finds correlations between symptoms and triggers', () => {
    const data = [
      { date: new Date('2024-01-01'), painLevel: 8, stress: 9, sleep: 4 },
      { date: new Date('2024-01-02'), painLevel: 7, stress: 8, sleep: 5 },
      { date: new Date('2024-01-03'), painLevel: 3, stress: 3, sleep: 8 },
    ];
    
    const correlations = findCorrelations(data);
    expect(correlations.stress.correlation).toBeGreaterThan(0.7);
  });
});
```

**`__tests__/database.test.ts`**
```typescript
import { initDatabase, addSymptom, getSymptomsByDateRange, addCycle } from '../services/database';
import * as SQLite from 'expo-sqlite';

describe('Database Service', () => {
  let db: SQLite.SQLiteDatabase;

  beforeAll(async () => {
    db = await initDatabase(':memory:');
  });

  test('creates tables successfully', async () => {
    const result = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    expect(result.length).toBeGreaterThan(0);
  });

  test('adds and retrieves symptoms', async () => {
    const symptom = {
      date: new Date().toISOString(),
      painLevel: 7,
      location: 'lower abdomen',
      type: 'cramping',
    };
    
    await addSymptom(db, symptom);
    const symptoms = await getSymptomsByDateRange(
      db,
      new Date(Date.now() - 86400000),
      new Date()
    );
    
    expect(symptoms.length).toBeGreaterThan(0);
    expect(symptoms[0].painLevel).toBe(7);
  });

  test('tracks cycle data', async () => {
    const cycle = {
      startDate: new Date().toISOString(),
      predictedEndDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    };
    
    const id = await addCycle(db, cycle);
    expect(id).toBeGreaterThan(0);
  });
});
```

**`__tests__/components/SymptomLogger.test.tsx`**
```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SymptomLogger from '../../components/SymptomLogger';

describe('SymptomLogger Component', () => {
  test('renders pain intensity slider', () => {
    const { getByTestId } = render(<SymptomLogger onSave={jest.fn()} />);
    expect(getByTestId('pain-slider')).toBeTruthy();
  });

  test('calls onSave with correct data', async () => {
    const mockSave = jest.fn();
    const { getByTestId, getByText } = render(<SymptomLogger onSave={mockSave} />);
    
    fireEvent.changeText(getByTestId('pain-slider'), '7');
    fireEvent.press(getByText('Save'));
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({ painLevel: 7 })
      );
    });
  });

  test('validates required fields', () => {
    const { getByText, queryByText } = render(<SymptomLogger onSave={jest.fn()} />);
    
    fireEvent.press(getByText('Save'));
    
    expect(queryByText(/required/i)).toBeTruthy();
  });
});
```

## Implementation steps

### Phase 1: Project setup and database foundation

1. **Initialize Expo project**
   ```bash
   npx create-expo-app peaceflow --template tabs
   cd peaceflow
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-sqlite expo-av expo-notifications expo-router
   npm install react-native-paper react-native-chart-kit date-fns
   npm install -D @testing-library/react-native @testing-library/jest-native jest-expo
   ```

3. **Configure TypeScript**
   - Update `tsconfig.json` with strict mode
   - Create type definitions in `types/` directory

4. **Set up database schema** (`services/database.ts`)
   - Create tables: `cycles`, `symptoms`, `relief_sessions`, `user_preferences`
   - Write migration functions
   - Implement CRUD operations with proper error handling

5. **Create database initialization hook** (`hooks/useDatabase.ts`)
   - Initialize SQLite on app launch
   - Handle database versioning and migrations

### Phase 2: Core tracking functionality

6. **Build cycle tracking logic** (`services/cyclePredictor.ts`)
   - Implement average cycle length calculation
   - Create prediction algorithm using historical data
   - Add pattern recognition for irregular cycles

7. **Create symptom logging UI** (`components/SymptomLogger.tsx`)
   - Pain intensity slider (0-10 scale)
   - Location selector (visual body map or dropdown)
   - Symptom type checkboxes (cramping, headache, nausea, etc.)
   - Mood and energy level inputs
   - Save button with validation

8. **Build calendar view** (`components/CycleCalendar.tsx`)
   - Monthly calendar with color-coded days
   - Tap to view/edit symptoms for specific day
   - Visual indicators for predicted period, ovulation, high pain days
   - Use `react-native-chart-kit` for visualization

9. **Implement tracking screen** (`app/(tabs)/track.tsx`)
   - Quick log button for current day
   - Recent entries list
   - Calendar view toggle

### Phase 3: Relief library and audio player

10. **Create exercise data structure** (`constants/exercises.ts`)
    - Define 15-20 exercises with metadata (duration, difficulty, pain type)
    - Include audio file references (use placeholder URLs initially)
    - Add tags for filtering

11. **Build audio player component** (`components/AudioPlayer.tsx`)
    - Play/pause controls
    - Progress bar with seek functionality
    - Background audio support using `expo-av`
    - Timer display

12. **Create exercise card component** (`components/ExerciseCard.tsx`)
    - Thumbnail, title, duration, difficulty
    - Favorite toggle
    - Premium badge for locked content

13. **Implement relief library screen** (`app/(tabs)/relief.tsx`)
    - Grid/list view of exercises
    - Filter by pain type, duration, difficulty
    - Search functionality
    - Recently used section

14. **Build exercise player screen** (`app/exercise/[id].tsx`)
    - Full-screen audio player
    - Exercise instructions (text)
    - Before/after pain rating prompt
    - Track session in database for effectiveness analysis

### Phase 4: Insights and analytics

15. **Create insights engine** (`services/insightsEngine.ts`)
    - Analyze symptom patterns by cycle day
    - Calculate relief technique effectiveness
    - Identify trigger correlations (stress, sleep, diet)
    - Generate personalized recommendations

16. **Build insight card components** (`components/InsightCard.tsx`)
    - Visual charts for pain trends
    - Text-based insights with icons
    - Actionable recommendations

17. **Implement insights screen** (`app/(tabs)/insights.tsx`)
    - Dashboard with key metrics
    - Pain trend chart (last 3-6 cycles)
    - Most effective relief techniques
    - Trigger analysis
    - Exportable PDF report (premium feature)

### Phase 5: Quick relief and notifications

18. **Create SOS mode** (`app/sos.tsx`)
    - Modal overlay with immediate relief options
    - Breathing exercise timer with haptic feedback
    - Quick access to top 3 most effective exercises
    - Heat therapy timer

19. **Add SOS button** (`components/SOSButton.tsx`)
    - Floating action button on home screen
    - Accessible from all tabs

20. **Implement notification service** (`services/notificationService.ts`)
    - Period prediction reminders (3 days before)
    - Medication reminders (user-configurable)
    - Daily symptom logging prompts
    - Motivational messages during predicted high-pain days

### Phase 6: Premium features and monetization

21. **Create subscription service** (`services/subscriptionService.ts`)
    - Check premium status (local flag for MVP, later integrate with app stores)
    - Feature gating logic
    - Trial period handling

22. **Build paywall modal** (`components/PaywallModal.tsx`)
    - Feature comparison table (free vs premium)
    - Pricing options (monthly/annual)
    - Call-to-action buttons
    - Trigger on premium feature access

23. **Implement premium features**
    - Lock advanced exercises behind paywall
    - Limit free symptom logs to 3 per day
    - Gate PDF export and advanced analytics
    - Add "Upgrade" prompts throughout app

24. **Create profile/settings screen** (`app/(tabs)/profile.tsx`)
    - User preferences (notifications, units, theme)
    - Subscription status and management
    - Data export
    - About and support links

### Phase 7: Educational content

25. **Add article data** (`constants/articles.ts`)
    - 20-30 articles covering menstrual health topics
    - Markdown or HTML content
    - Categories and tags

26. **Build article viewer** (`app/article/[id].tsx`)
    - Formatted text rendering
    - Related articles section
    - Bookmark functionality

27. **Add content hub to home screen** (`app/(tabs)/index.tsx`)
    - Featured articles carousel
    - Quick stats (days until next period, current cycle day)
    - Recent symptoms summary
    - Quick action buttons (log symptom, start relief exercise, SOS)

### Phase 8: Polish and testing

28. **Write comprehensive tests**
    - Unit tests for all services (database, predictor, insights)
    - Component tests for key UI elements
    - Integration tests for critical user flows
    - Ensure `npm test` passes with >80% coverage

29. **Implement error handling**
    - Graceful database failures
    - Network error handling (for future API integration)
    - User-friendly error messages

30. **Add loading states and animations**
    - Skeleton screens for data loading
    - Smooth transitions between screens
    - Haptic feedback for interactions

31. **Accessibility improvements**
    - Screen reader labels for all interactive elements
    - Sufficient color contrast
    - Keyboard navigation support
    - Text scaling support

32. **Performance optimization**
    - Lazy load exercise audio files
    - Optimize database queries with indexes
    - Memoize expensive calculations
    - Reduce re-renders with React.memo

### Phase 9: Onboarding and first-run experience

33. **Create onboarding flow**
    - Welcome screen explaining app benefits
    - Quick setup: last period start date, average cycle length
    - Notification permissions request
    - Optional: pain profile questionnaire

34. **Add empty states**
    - No data yet messages with helpful prompts
    - Encourage first symptom log
    - Suggest trying first relief exercise

### Phase 10: Final touches

35. **App icon and splash screen**
    - Design calming, professional icon
    - Configure in `app.json`

36. **Privacy and legal**
    - Add privacy policy and terms of service (link to web pages)
    - Medical disclaimer on first launch
    - Data handling transparency

37. **README and documentation**
    - Installation instructions
    - Feature overview
    - Testing guide
    - Contribution guidelines

## How to verify it works

### Local development setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run tests**
   ```bash
   npm test
   ```
   All tests must pass with no errors.

3. **Start Expo development server**
   ```bash
   npx expo start
   ```

4. **Test on iOS Simulator**
   - Press `i` in terminal to open iOS Simulator
   - Verify app launches without crashes
   - Test core flows (see below)

5. **Test on Android Emulator**
   - Press `a` in terminal to open Android Emulator
   - Verify app launches without crashes
   - Test core flows (see below)

6. **Test on physical device with Expo Go**
   - Scan QR code with Expo Go app
   - Verify all features work on real device
   - Test notifications and audio playback

### Core user flows to verify

**Flow 1: First-time user onboarding**
- [ ] App launches to welcome screen
- [ ] User completes onboarding (enters last period date)
- [ ] Home screen displays with predicted next period
- [ ] No crashes or errors

**Flow 2: Log symptoms**
- [ ] Navigate to Track tab
- [ ] Tap "Log Symptoms" button
- [ ] Fill out pain level, location, type
- [ ] Save successfully
- [ ] Symptom appears in calendar view
- [ ] Data persists after app restart

**Flow 3: Use relief exercise**
- [ ] Navigate to Relief tab
- [ ] Browse exercise library
- [ ] Tap on an exercise
- [ ] Audio player loads and plays
- [ ] Can pause, seek, and control playback
- [ ] Before/after pain rating prompt appears
- [ ] Session saved to database

**Flow 4: View insights**
- [ ] Navigate to Insights tab (after logging multiple symptoms)
- [ ] Charts render correctly
- [ ] Insights display relevant patterns
- [ ] No performance issues with data visualization

**Flow 5: SOS mode**
- [ ] Tap SOS button from home screen
- [ ] Modal opens with quick relief options
- [ ] Breathing timer works with haptic feedback
- [ ] Can start exercise from SOS mode
- [ ] Modal dismisses correctly

**Flow 6: Premium paywall**
- [ ] Attempt to access premium feature (e.g., advanced analytics)
- [ ] Paywall modal appears
- [ ] Feature comparison displays correctly
- [ ] Can dismiss modal and return to free features

**Flow 7: Notifications**
- [ ] Grant notification permissions
- [ ] Schedule a test reminder
- [ ] Notification appears at correct time
- [ ] Tapping notification opens app to correct screen

### Performance benchmarks

- [ ] App launches in <3 seconds on mid-range device
- [ ] Symptom logging saves in <500ms
- [ ] Calendar view renders 3 months of data in <1 second
- [ ] Audio playback starts in <2 seconds
- [ ] Database queries return in <100ms for typical datasets

### Data integrity checks

- [ ] Symptom data persists across app restarts
- [ ] Cycle predictions update correctly when new data added
- [ ] Relief session effectiveness calculations are accurate
- [ ] No data loss when app is backgrounded or killed

### Accessibility verification

- [ ] All buttons have accessible labels
- [ ] Screen reader can navigate entire app
- [ ] Text scales correctly with system font size
- [ ] Color contrast meets WCAG AA standards (use contrast checker)

### Cross-platform consistency

- [ ] UI looks correct on both iOS and Android
- [ ] Navigation works identically on both platforms
- [ ] Audio playback functions on both platforms
- [ ] Notifications work on both platforms

---

**Success criteria:** All tests pass, all core flows complete without errors, app performs within benchmarks, and the experience feels polished and professional on both iOS and Android.