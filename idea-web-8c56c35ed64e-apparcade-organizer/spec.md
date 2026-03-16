# AppArcade Organizer Spec

## 1. App Name

**FlowHome**

## 2. One-line pitch

Your phone learns how you work and play — apps appear exactly when you need them, organized by context, not folders.

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:** Anyone with 30+ apps who wastes time hunting through screens. This is 70%+ of smartphone users globally.

**Beyond power users:**
- **Parents juggling life:** Work apps during office hours, family/school apps after 3pm, entertainment at night
- **Students:** Study apps during weekdays, social/entertainment on weekends, fitness apps in the morning
- **Gig workers:** Driver apps when near vehicle, delivery apps during shifts, personal apps otherwise
- **Travelers:** Travel apps auto-surface when at airports, translation apps when abroad, maps when exploring
- **Anyone with ADHD/executive function challenges:** Reduces decision fatigue by surfacing the right tool at the right time

### Adjacent use cases:
- **Digital wellbeing:** Automatically hide distracting apps during focus hours
- **Routine building:** Morning routine screen (meditation, news, weather), evening routine (journal, sleep tracker)
- **Context switching:** Work mode vs personal mode with one tap
- **App discovery:** Surface forgotten apps that are relevant to current context

### Why non-technical people want this:
- No manual organization required — it learns and adapts
- Reduces phone overwhelm and "where did I put that app?" frustration
- Makes the phone feel smarter and more personal
- Saves time every single day (30+ app launches daily × 2-3 seconds saved = 90+ seconds/day)

## 4. Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite) for app usage history and ML features
- **ML/AI:** TensorFlow.js Lite for on-device pattern recognition
- **Background tasks:** expo-task-manager for usage tracking
- **Permissions:** expo-application, expo-device for context detection
- **UI:** React Native Reanimated 3 for smooth transitions
- **State:** Zustand (lightweight, no Redux overhead)
- **Testing:** Jest + React Native Testing Library

**Note:** iOS limitations mean this will be Android-focused initially (iOS doesn't allow custom launchers). iOS version will be a "smart app drawer" widget.

## 5. Core features (MVP)

1. **Smart Collections (Auto-organizing)**
   - AI groups apps by usage patterns: "Morning Routine," "Work," "Evening Wind-down," "Weekend"
   - Updates daily based on actual behavior
   - One-tap access to contextual app groups

2. **Context Triggers**
   - Time-based: Work apps 9-5, social apps evenings
   - Location-based: Gym apps at gym, shopping apps at stores (coarse location only)
   - Usage-based: Frequently used together (e.g., Spotify + Maps for commute)

3. **Quick Launch Bar**
   - Bottom bar shows 4-6 predicted apps based on current context
   - Swipe up for full smart-organized drawer
   - 90%+ accuracy after 1 week of learning

4. **Focus Modes**
   - Pre-built modes: Deep Work, Family Time, Sleep
   - Hides distracting apps, surfaces relevant ones
   - Integrates with Do Not Disturb

5. **Beautiful Themes**
   - 3 free themes (Light, Dark, Minimal)
   - Premium themes (Neon, Nature, Gradient packs)
   - Custom icon packs support

## 6. Monetization strategy

### Free tier (the hook):
- Smart Collections with basic AI (updates once daily)
- 2 Focus Modes (Work, Personal)
- 1 free theme
- Quick Launch Bar (4 apps max)

### Paid tier — $3.99/month or $24.99/year (the paywall):
- **Real-time AI predictions** (updates throughout the day)
- **Unlimited Focus Modes** with custom rules
- **Premium themes** (20+ themes, monthly new releases)
- **Advanced context triggers** (location, Bluetooth, calendar integration)
- **Quick Launch Bar** (up to 8 apps)
- **Usage analytics** (screen time by context, productivity insights)
- **Cloud backup** of settings and layouts

### Why people STAY subscribed:
- **Daily habit formation:** After 1 week, muscle memory kicks in — reverting to default launcher feels clunky
- **Personalization lock-in:** The AI gets smarter over time; switching means starting over
- **Productivity gains:** Users save 5-10 minutes daily; $4/month is cheaper than a coffee
- **Theme updates:** New themes monthly keep it fresh
- **Sunk cost:** "I've customized this perfectly for me"

### Price reasoning:
- Lower than Nova Launcher Prime ($4.99 one-time) but recurring for ongoing AI improvements
- Cheaper than productivity apps (Notion $10/mo, Todoist $4/mo) but used 50+ times daily
- Annual discount (48% off) drives long-term commitment

## 7. Market viability

**NOT SKIP** — Clear gap exists:

- **Nova Launcher:** No AI, manual organization only, no context awareness
- **Microsoft Launcher:** Basic feed, no predictive app surfacing
- **Smart Launcher:** Category-based, not behavior-based
- **Niagara Launcher:** Minimalist but no AI learning

**Gap:** No launcher uses on-device ML to predict app needs based on time, location, and usage patterns. Existing "smart" features are rule-based, not adaptive.

**Advantage:** Privacy-first (all ML on-device), works offline, learns individual patterns vs generic rules.

## 8. File structure

```
flowhome/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home screen with Quick Launch
│   │   ├── drawer.tsx             # Full app drawer with Smart Collections
│   │   ├── focus.tsx              # Focus Modes management
│   │   └── settings.tsx           # Settings and premium upsell
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── AppIcon.tsx                # Themed app icon component
│   ├── SmartCollection.tsx        # AI-grouped app collection
│   ├── QuickLaunchBar.tsx         # Bottom prediction bar
│   ├── FocusModeCard.tsx          # Focus mode selector
│   └── ThemePicker.tsx            # Theme selection UI
├── lib/
│   ├── database.ts                # SQLite setup and queries
│   ├── ml/
│   │   ├── predictor.ts           # TensorFlow.js prediction engine
│   │   ├── patterns.ts            # Usage pattern detection
│   │   └── training.ts            # Model training logic
│   ├── apps/
│   │   ├── scanner.ts             # Installed apps detection
│   │   ├── launcher.ts            # App launch logic
│   │   └── usage-tracker.ts       # Background usage logging
│   ├── context/
│   │   ├── time.ts                # Time-based context
│   │   ├── location.ts            # Coarse location context
│   │   └── detector.ts            # Context aggregator
│   ├── themes.ts                  # Theme definitions
│   └── subscription.ts            # Premium feature gating
├── store/
│   ├── apps.ts                    # Zustand store for apps
│   ├── predictions.ts             # Zustand store for ML predictions
│   └── settings.ts                # Zustand store for user settings
├── constants/
│   ├── Colors.ts
│   └── Features.ts                # Free vs premium feature flags
├── __tests__/
│   ├── predictor.test.ts
│   ├── patterns.test.ts
│   ├── context-detector.test.ts
│   ├── usage-tracker.test.ts
│   └── database.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## 9. Tests

### Core test files:

**`__tests__/predictor.test.ts`**
- Test ML model predicts top 4 apps based on time context
- Test prediction accuracy improves with more training data
- Test fallback to most-used apps when insufficient data

**`__tests__/patterns.test.ts`**
- Test usage pattern detection (morning, work, evening clusters)
- Test Smart Collection generation from usage history
- Test pattern updates when behavior changes

**`__tests__/context-detector.test.ts`**
- Test time-based context detection (morning, work hours, evening)
- Test location context (home, work, gym) with coarse location
- Test context priority when multiple contexts match

**`__tests__/usage-tracker.test.ts`**
- Test app launch event logging to SQLite
- Test usage statistics aggregation (daily, weekly)
- Test data pruning (keep last 90 days only)

**`__tests__/database.test.ts`**
- Test SQLite schema creation
- Test CRUD operations for app usage logs
- Test query performance with 10k+ records

## 10. Implementation steps

### Phase 1: Foundation (Days 1-3)

1. **Initialize Expo project**
   ```bash
   npx create-expo-app flowhome --template tabs
   cd flowhome
   npx expo install expo-sqlite expo-application expo-device expo-task-manager
   npx expo install @tensorflow/tfjs @tensorflow/tfjs-react-native
   npm install zustand
   ```

2. **Set up SQLite database**
   - Create `lib/database.ts` with schema:
     - `app_usage` table: id, package_name, app_name, timestamp, duration, context_time, context_location
     - `smart_collections` table: id, name, app_packages (JSON), last_updated
     - `focus_modes` table: id, name, allowed_apps (JSON), blocked_apps (JSON), is_active
   - Write migration logic to create tables on first launch
   - Add indexes on timestamp and package_name for query performance

3. **Build app scanner**
   - Create `lib/apps/scanner.ts` to detect installed apps
   - Android: Use `expo-application` to list installed packages
   - iOS: Explain limitation (can only track apps opened via widget)
   - Store app list in Zustand store with icons, names, package IDs

4. **Implement usage tracker**
   - Create `lib/apps/usage-tracker.ts` with background task
   - Log every app launch with timestamp and context
   - Use `expo-task-manager` to run tracking in background
   - Batch writes to SQLite every 5 minutes to save battery

### Phase 2: ML Engine (Days 4-6)

5. **Build context detector**
   - Create `lib/context/time.ts`: Detect morning (6-9am), work (9am-5pm), evening (5-10pm), night (10pm-6am)
   - Create `lib/context/location.ts`: Use coarse location to detect home, work, other (require user to label first 2 weeks)
   - Create `lib/context/detector.ts`: Aggregate all context signals into single context object

6. **Implement pattern detection**
   - Create `lib/ml/patterns.ts`:
     - Query last 30 days of usage data
     - Group apps by time-of-day clusters using k-means
     - Identify frequently co-used apps (within 5 minutes)
     - Generate Smart Collections: "Morning Routine," "Work," "Evening," "Weekend"
   - Run pattern detection daily at 3am using background task

7. **Build prediction engine**
   - Create `lib/ml/predictor.ts`:
     - Train simple TensorFlow.js model: input = [hour, day_of_week, location_id], output = app probabilities
     - Use last 14 days of usage as training data
     - Predict top 8 apps for current context
     - Cache predictions in Zustand store, refresh every 30 minutes
   - Create `lib/ml/training.ts`: Retrain model weekly with new data

### Phase 3: UI Components (Days 7-9)

8. **Build Quick Launch Bar**
   - Create `components/QuickLaunchBar.tsx`:
     - Show top 4 predicted apps (6 for premium)
     - Animated icons with React Native Reanimated
     - Tap to launch app via `Linking.openURL()`
     - Long-press to pin app to bar (override prediction)

9. **Build Smart Collections view**
   - Create `components/SmartCollection.tsx`:
     - Horizontal scrollable list of app icons
     - Collection title with icon (🌅 Morning, 💼 Work, 🌙 Evening)
     - Tap collection to expand full-screen
   - Create `app/(tabs)/drawer.tsx`:
     - Vertical list of Smart Collections
     - Search bar at top (filter by app name)
     - Alphabetical "All Apps" section at bottom

10. **Build Focus Modes**
    - Create `components/FocusModeCard.tsx`:
      - Toggle switch to activate mode
      - Show allowed/blocked app counts
      - Edit button (premium only for custom modes)
    - Create `app/(tabs)/focus.tsx`:
      - List of pre-built modes (Work, Personal, Sleep)
      - "Create Custom Mode" button (premium paywall)
      - Active mode indicator in tab bar

### Phase 4: Themes & Premium (Days 10-11)

11. **Implement theme system**
    - Create `lib/themes.ts`:
      - Define 3 free themes: Light, Dark, Minimal
      - Define 5 premium themes: Neon, Nature, Gradient, Retro, Ocean
      - Each theme: background colors, icon styles, accent colors
    - Create `components/ThemePicker.tsx`:
      - Grid of theme previews
      - Lock icon on premium themes
      - Apply theme to entire app via Zustand store

12. **Add premium paywall**
    - Create `lib/subscription.ts`:
      - Feature flags: `isPremium`, `canUseAdvancedContext`, `canCreateFocusModes`
      - Mock subscription check (replace with RevenueCat later)
    - Add paywall modals:
      - Show when tapping premium theme
      - Show when creating 3rd Focus Mode
      - Show when accessing usage analytics
    - Create `app/(tabs)/settings.tsx`:
      - "Upgrade to Premium" card with benefits list
      - Pricing: $3.99/month or $24.99/year
      - Mock purchase flow (log to console)

### Phase 5: Polish & Testing (Days 12-14)

13. **Write tests**
    - Implement all 5 test files from section 9
    - Mock SQLite with in-memory database
    - Mock TensorFlow.js predictions
    - Achieve 80%+ code coverage on core logic

14. **Add onboarding**
    - Create 3-screen intro:
      - Screen 1: "Your phone, smarter" (show Quick Launch demo)
      - Screen 2: "Apps that adapt to you" (show Smart Collections)
      - Screen 3: "Grant permissions" (request app usage access on Android)
    - Show once on first launch, skip on subsequent opens

15. **Performance optimization**
    - Lazy load app icons (only render visible icons in drawer)
    - Debounce search input (wait 300ms before filtering)
    - Memoize prediction calculations
    - Profile with React DevTools, ensure 60fps scrolling

16. **Android launcher setup**
    - Update `app.json`:
      - Add `android.intentFilters` for `android.intent.action.MAIN` with `android.intent.category.HOME`
      - Request permissions: `android.permission.QUERY_ALL_PACKAGES`, `android.permission.ACCESS_COARSE_LOCATION`
    - Test setting FlowHome as default launcher on Android device

## 11. How to verify it works

### On Android device/emulator:

1. **Install and set as launcher:**
   ```bash
   npx expo run:android
   ```
   - Press home button
   - Select "FlowHome" and tap "Always"
   - Verify home screen shows Quick Launch Bar

2. **Test Smart Collections:**
   - Open 5-10 different apps over 2 minutes
   - Wait 5 minutes for usage tracking to batch-write
   - Return to FlowHome home screen
   - Swipe up to open drawer
   - Verify apps appear in "Recently Used" collection

3. **Test predictions:**
   - Use phone normally for 2 days (open apps at different times)
   - On day 3, check Quick Launch Bar at 9am (should show work apps)
   - Check again at 7pm (should show entertainment/social apps)
   - Verify predictions change based on time of day

4. **Test Focus Mode:**
   - Go to Focus tab
   - Enable "Work" mode
   - Verify social media apps are hidden from drawer
   - Disable mode, verify apps reappear

5. **Test themes:**
   - Go to Settings tab
   - Tap "Themes"
   - Switch between Light, Dark, Minimal
   - Verify colors update across all screens
   - Tap premium theme, verify paywall appears

### Run tests:

```bash
npm test
```

- All 5 test suites must pass
- Coverage report should show 80%+ for `lib/` directory

### iOS widget testing (limited):

```bash
npx expo run:ios
```

- FlowHome appears as app, not launcher (iOS limitation)
- Add home screen widget showing Quick Launch predictions
- Tap widget icons to open apps
- Verify predictions update throughout day

### Performance check:

- Open drawer with 100+ apps installed
- Scroll through collections — must maintain 60fps
- Search for app — results appear within 300ms
- Launch app from Quick Launch — opens within 500ms