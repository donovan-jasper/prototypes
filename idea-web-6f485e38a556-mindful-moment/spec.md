# Mindful Moment App Specification

## 1. App Name

**FlowBreak**

## 2. One-Line Pitch

Your pocket wellness coach that knows when you need a moment—delivering personalized mindfulness breaks that fit your life, not interrupt it.

## 3. Expanded Vision

### Who This Is Really For

**Primary Audience:**
- Knowledge workers experiencing digital burnout (developers, designers, writers, analysts)
- Parents juggling work-from-home and childcare who can't commit to 20-minute meditation sessions
- Students facing exam stress and academic pressure
- Healthcare workers, teachers, and service professionals with unpredictable schedules
- Anyone who's tried meditation apps but couldn't maintain the habit

**Broadest Audience:**
This serves anyone who experiences stress but lives in the real world where you can't just "take 10 minutes to meditate." It's for people who:
- Check their phone 100+ times per day anyway
- Feel guilty about not meditating but can't find the time
- Need wellness support that adapts to chaos, not requires calm
- Want mental health tools that feel modern, not clinical

**Adjacent Use Cases:**
- **Focus recovery**: Quick resets between deep work sessions for productivity
- **Emotional regulation**: In-the-moment support during difficult conversations or situations
- **Sleep preparation**: Wind-down sequences triggered by evening routines
- **Physical wellness**: Posture checks, eye strain relief, hydration reminders with mindful framing
- **Relationship support**: Calm-down prompts before responding to stressful messages
- **Habit stacking**: Attach mindfulness to existing behaviors (coffee breaks, commutes, lunch)

**Why Non-Technical People Want This:**
- No learning curve—just allow notifications and it works
- Feels like having a caring friend who checks in at the right time
- Visible stress reduction without lifestyle overhaul
- Social proof through shareable "streak" achievements
- Addresses universal pain: "I know I should take care of myself but I'm too busy"

**The Real Innovation:**
Existing apps are **destinations**—you go to them. FlowBreak is **ambient**—it comes to you. It's the difference between going to the gym vs having a personal trainer follow you around. The app learns your stress patterns (morning meetings, afternoon slumps, Sunday scaries) and intervenes proactively.

## 4. Tech Stack

- **Framework**: React Native (Expo SDK 52+)
- **Local Storage**: SQLite (expo-sqlite)
- **Background Tasks**: expo-task-manager, expo-background-fetch
- **Notifications**: expo-notifications
- **Sensors**: expo-sensors (for activity detection)
- **Audio**: expo-av
- **State Management**: React Context + AsyncStorage
- **Testing**: Jest + React Native Testing Library
- **Analytics**: expo-analytics (privacy-focused, local-first)

**Key Dependencies:**
```json
{
  "expo": "~52.0.0",
  "react-native": "0.76.0",
  "expo-sqlite": "~15.0.0",
  "expo-notifications": "~0.29.0",
  "expo-task-manager": "~12.0.0",
  "expo-background-fetch": "~13.0.0",
  "expo-sensors": "~14.0.0",
  "expo-av": "~15.0.0",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/bottom-tabs": "^6.5.11"
}
```

## 5. Core Features (MVP)

### 1. Smart Timing Engine
- Learns user's daily patterns through passive observation (app usage, movement, time of day)
- Delivers 3-5 micro-interventions per day at optimal moments
- Adapts timing based on user engagement (if ignored at 2pm, try 3pm tomorrow)
- **Why it's core**: This IS the product—the intelligence that makes it non-intrusive

### 2. Micro-Moment Library
- 30-90 second guided experiences (breathing, body scan, gratitude prompt, perspective shift)
- Text + optional audio (voice-guided)
- Categories: Calm, Focus, Energy, Perspective, Gratitude
- Offline-first—all content stored locally
- **Why it's core**: The actual intervention that provides value

### 3. Context-Aware Triggers
- Detects prolonged sitting (sedentary alert)
- Recognizes repeated app switching (distraction pattern)
- Identifies evening hours (wind-down mode)
- Calendar integration (pre-meeting calm, post-meeting debrief)
- **Why it's core**: Makes interventions feel magical, not random

### 4. Progress & Insights
- Streak tracking (consecutive days with at least one moment)
- Weekly stress pattern visualization
- "Moments taken" counter with time saved vs traditional meditation
- Mood check-ins (optional, quick emoji rating after each moment)
- **Why it's core**: Retention mechanism—people stay for the data

### 5. Customization Controls
- Quiet hours (no notifications during meetings, sleep, etc.)
- Preferred moment types (some people hate breathing exercises)
- Notification style (gentle vs direct)
- Voice selection (3 options: calm female, warm male, neutral)
- **Why it's core**: Prevents uninstalls from notification fatigue

## 6. Monetization Strategy

### Free Tier (The Hook)
- 3 moments per day, system-selected timing
- Basic moment library (15 experiences)
- 1 voice option
- 7-day streak tracking
- Basic stats (moments taken, current streak)

**Goal**: Let users experience the core value—perfectly timed interventions that actually help. Free tier is generous enough to build habit but limited enough to create upgrade desire.

### Premium Tier: $7.99/month or $59.99/year (25% savings)

**Why This Price Point:**
- Below Headspace ($12.99) and Calm ($14.99) because we're positioning as complementary, not replacement
- Above "impulse buy" threshold ($2.99) to signal quality and filter serious users
- Annual option creates committed user base and predictable revenue

**Premium Features:**
- **Unlimited moments** (up to 10/day based on need)
- **Advanced timing AI** (calendar integration, location-based triggers, app usage patterns)
- **Full moment library** (100+ experiences, new ones monthly)
- **All voice options** (5 total, including celebrity/expert voices as partnerships)
- **Deep analytics** (stress heatmaps, pattern insights, weekly reports)
- **Custom moments** (record your own voice, create personal prompts)
- **Emergency calm button** (on-demand access when you need it NOW)
- **Integrations** (Apple Health, Google Fit, calendar apps)

### What Makes People STAY Subscribed

**Month 1-3**: The AI gets smarter—timing becomes eerily perfect
**Month 3-6**: Streak becomes too valuable to lose (gamification)
**Month 6+**: Data shows measurable stress reduction, becomes part of identity ("I'm someone who takes care of myself")

**Retention Tactics:**
- Annual subscribers get exclusive "Founder" badge and early access to new features
- Streak insurance (1 free "save" per month if you miss a day)
- Social features (share favorite moments, compare anonymous stats with friends)
- Seasonal content drops (holiday stress, back-to-school, new year intentions)

**Conversion Funnel:**
- Day 3: "You've taken 5 moments—see your stress pattern?" (tease analytics)
- Day 7: "Congrats on your first week! Unlock advanced timing?" (50% off first month)
- Day 14: "Users who upgrade take 3x more moments" (social proof)
- Day 30: "Your free trial of premium features ends tomorrow" (if we do trial)

## 7. Market Position

**NOT SKIP—Clear Gap Exists**

While Headspace and Calm are well-funded, they're **active meditation apps** requiring 10-20 minute sessions. FlowBreak is **passive wellness infrastructure**—it's complementary, not competitive.

**Key Differentiators:**
1. **Zero time commitment**: 60 seconds vs 10 minutes
2. **Proactive vs reactive**: App comes to you, not vice versa
3. **Context-aware**: Knows when you need it, not scheduled
4. **Micro-habits**: Builds wellness into existing routines
5. **Modern UX**: Feels like a smart assistant, not a meditation teacher

**Market Gaps We Fill:**
- 73% of meditation app downloads are abandoned within 30 days (too much commitment)
- Remote workers need wellness tools that fit Slack/Zoom/email chaos
- Younger users (Gen Z/Millennial) want bite-sized, tech-forward solutions
- Existing apps don't leverage phone's contextual awareness capabilities

**Competitive Moat:**
- Timing algorithm improves with usage (network effects at individual level)
- Local-first data = privacy advantage over cloud-dependent competitors
- Lower price point makes it an "and" purchase, not "or"

## 8. File Structure

```
flowbreak/
├── app.json
├── package.json
├── babel.config.js
├── App.tsx
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Home/Today screen
│   │   ├── insights.tsx       # Progress & analytics
│   │   └── settings.tsx       # Customization
│   ├── moment/[id].tsx        # Individual moment experience
│   └── onboarding.tsx         # First-time setup
├── src/
│   ├── components/
│   │   ├── MomentCard.tsx
│   │   ├── StreakDisplay.tsx
│   │   ├── NotificationPrompt.tsx
│   │   └── ProgressChart.tsx
│   ├── services/
│   │   ├── database.ts        # SQLite setup & queries
│   │   ├── notifications.ts   # Notification scheduling
│   │   ├── timing-engine.ts   # Smart timing algorithm
│   │   ├── moments.ts         # Moment content management
│   │   └── analytics.ts       # Local analytics tracking
│   ├── hooks/
│   │   ├── useDatabase.ts
│   │   ├── useMoments.ts
│   │   ├── useStreak.ts
│   │   └── useSettings.ts
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── SubscriptionContext.tsx
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   ├── moments.ts         # Moment content library
│   │   └── colors.ts
│   └── utils/
│       ├── time.ts
│       └── storage.ts
├── assets/
│   ├── audio/
│   │   ├── calm-voice-1/
│   │   └── calm-voice-2/
│   ├── images/
│   └── fonts/
└── __tests__/
    ├── services/
    │   ├── timing-engine.test.ts
    │   ├── notifications.test.ts
    │   └── database.test.ts
    ├── hooks/
    │   ├── useMoments.test.ts
    │   └── useStreak.test.ts
    └── utils/
        └── time.test.ts
```

## 9. Tests

### Core Test Files

**`__tests__/services/timing-engine.test.ts`**
- Test optimal timing calculation based on user patterns
- Test adaptation when notifications are ignored
- Test quiet hours enforcement
- Test daily moment limit (3 for free, 10 for premium)

**`__tests__/services/notifications.test.ts`**
- Test notification scheduling
- Test notification cancellation
- Test notification content generation
- Test background task registration

**`__tests__/services/database.test.ts`**
- Test moment logging
- Test streak calculation
- Test user settings persistence
- Test analytics data aggregation

**`__tests__/hooks/useMoments.test.ts`**
- Test moment fetching by category
- Test moment completion tracking
- Test random moment selection

**`__tests__/hooks/useStreak.test.ts`**
- Test streak increment on moment completion
- Test streak reset on missed day
- Test streak calculation across timezone changes

**`__tests__/utils/time.test.ts`**
- Test time-of-day categorization (morning, afternoon, evening)
- Test quiet hours checking
- Test optimal timing window calculation

### Test Coverage Requirements
- Minimum 80% coverage for services layer
- 100% coverage for timing algorithm (core IP)
- Integration tests for notification → moment completion flow

## 10. Implementation Steps

### Phase 1: Project Setup & Database (Day 1)

1. **Initialize Expo project**
   ```bash
   npx create-expo-app flowbreak --template tabs
   cd flowbreak
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-sqlite expo-notifications expo-task-manager expo-background-fetch expo-sensors expo-av
   npx expo install @react-navigation/native @react-navigation/bottom-tabs
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```

3. **Create database schema** (`src/services/database.ts`)
   - Users table (id, created_at, premium_status, onboarding_completed)
   - Moments table (id, category, title, description, duration, audio_path, voice_type)
   - CompletedMoments table (id, moment_id, completed_at, mood_rating, context)
   - Settings table (id, quiet_hours_start, quiet_hours_end, preferred_categories, notification_style)
   - Analytics table (id, date, moments_taken, notifications_sent, notifications_ignored)

4. **Seed moment content** (`src/constants/moments.ts`)
   - Create 15 free moments (3 per category: Calm, Focus, Energy, Perspective, Gratitude)
   - Write scripts (30-90 seconds each)
   - Structure: { id, category, title, script, duration, isPremium }

5. **Setup test environment**
   - Configure Jest in package.json
   - Create test setup file
   - Add test scripts

### Phase 2: Core Services (Day 2-3)

6. **Build timing engine** (`src/services/timing-engine.ts`)
   - Implement pattern learning algorithm:
     - Track when user typically engages with app
     - Track when notifications are ignored
     - Calculate optimal windows (avoid ignored times, prefer engaged times)
   - Implement daily scheduling logic:
     - Select 3 moments for free users, up to 10 for premium
     - Space moments at least 2 hours apart
     - Respect quiet hours
     - Vary categories to prevent repetition
   - Write tests for all timing logic

7. **Build notification service** (`src/services/notifications.ts`)
   - Request notification permissions
   - Schedule notifications based on timing engine output
   - Handle notification tap → open specific moment
   - Track notification delivery and engagement
   - Implement background task for daily rescheduling
   - Write tests for scheduling logic

8. **Build moments service** (`src/services/moments.ts`)
   - Fetch moments by category
   - Mark moment as completed
   - Track completion time and context
   - Calculate streak
   - Write tests for moment management

9. **Build analytics service** (`src/services/analytics.ts`)
   - Log moment completions
   - Log notification interactions
   - Aggregate daily/weekly stats
   - Calculate stress patterns (time-of-day heatmap)
   - Write tests for analytics calculations

### Phase 3: UI Components (Day 4-5)

10. **Create shared components**
    - `MomentCard.tsx`: Display moment preview (category, title, duration)
    - `StreakDisplay.tsx`: Show current streak with visual flair
    - `ProgressChart.tsx`: Weekly moment completion chart
    - `NotificationPrompt.tsx`: Request notification permissions with context

11. **Build Home screen** (`app/(tabs)/index.tsx`)
    - Display today's scheduled moments
    - Show current streak prominently
    - Quick access to "Take a moment now" button
    - Show next scheduled moment time
    - Handle notification permission state

12. **Build Moment experience** (`app/moment/[id].tsx`)
    - Full-screen immersive UI
    - Display moment script with auto-scroll
    - Optional audio playback
    - Breathing animation for breathing exercises
    - Completion celebration
    - Optional mood check-in (emoji selector)

13. **Build Insights screen** (`app/(tabs)/insights.tsx`)
    - Streak display with calendar view
    - Weekly completion chart
    - Time-of-day heatmap (when you take moments)
    - Total moments taken counter
    - Premium upsell for advanced analytics

14. **Build Settings screen** (`app/(tabs)/settings.tsx`)
    - Quiet hours configuration
    - Preferred moment categories (multi-select)
    - Notification style (gentle/direct)
    - Voice selection (free: 1 option, premium: 5 options)
    - Premium subscription management
    - About/Help/Privacy Policy links

### Phase 4: Onboarding & Polish (Day 6)

15. **Build onboarding flow** (`app/onboarding.tsx`)
    - Welcome screen (explain core concept)
    - Notification permission request (with clear value prop)
    - Category preference selection
    - Quiet hours setup
    - First moment experience (guided)
    - Set initial timing preferences

16. **Implement app context** (`src/context/AppContext.tsx`)
    - Global state for user settings
    - Premium status
    - Current streak
    - Today's moments

17. **Add subscription logic** (`src/context/SubscriptionContext.tsx`)
    - Mock premium status for MVP (toggle in settings)
    - Feature gating (check premium status before advanced features)
    - Upgrade prompts at strategic points

### Phase 5: Background Tasks & Notifications (Day 7)

18. **Setup background fetch** 
    - Register background task for daily moment scheduling
    - Run timing engine to calculate next day's moments
    - Schedule notifications for calculated times
    - Update analytics

19. **Implement notification handlers**
    - Handle notification tap → navigate to moment
    - Handle notification dismissal → log as ignored
    - Update timing engine with engagement data

20. **Test notification flow end-to-end**
    - Schedule test notification
    - Verify it appears at correct time
    - Verify tap opens correct moment
    - Verify completion updates streak

### Phase 6: Content & Audio (Day 8)

21. **Record or source audio files**
    - For MVP: Use text-to-speech or royalty-free voice recordings
    - Create 15 audio files matching moment scripts
    - Optimize for mobile (compressed, small file size)
    - Store in assets/audio/

22. **Implement audio playback**
    - Load audio file for moment
    - Play/pause controls
    - Auto-advance to completion screen when audio ends
    - Handle interruptions (phone calls, etc.)

### Phase 7: Testing & Refinement (Day 9-10)

23. **Run all tests**
    ```bash
    npm test
    ```
    - Fix any failing tests
    - Ensure 80%+ coverage

24. **Manual testing checklist**
    - Complete onboarding flow
    - Receive scheduled notification
    - Complete a moment from notification
    - Complete a moment from app
    - Verify streak increments
    - Test quiet hours (schedule notification during quiet hours, verify it doesn't send)
    - Test free tier limits (verify 4th moment is blocked with upgrade prompt)
    - Test settings changes (quiet hours, categories, voice)
    - Test insights screen (verify charts render)
    - Test offline functionality (airplane mode)

25. **Polish UI/UX**
    - Add loading states
    - Add error handling
    - Add empty states (no moments yet, no streak yet)
    - Add haptic feedback on moment completion
    - Add animations (streak celebration, moment transitions)
    - Ensure accessibility (screen reader support, sufficient contrast)

26. **Performance optimization**
    - Lazy load audio files
    - Optimize database queries
    - Minimize re-renders
    - Test on low-end Android device

### Phase 8: Deployment Prep (Day 11)

27. **Configure app.json**
    - Set app name, slug, version
    - Configure notification settings
    - Set background modes
    - Add privacy descriptions (notifications, sensors)
    - Configure splash screen and icon

28. **Create app assets**
    - App icon (1024x1024)
    - Splash screen
    - App Store screenshots (prepare mockups)

29. **Build for testing**
    ```bash
    npx expo prebuild
    npx expo run:ios
    npx expo run:android
    ```

30. **Final QA on physical devices**
    - Test on iOS device
    - Test on Android device
    - Verify notifications work in background
    - Verify app doesn't drain battery excessively

## 11. How to Verify It Works

### Development Testing (Expo Go)

1. **Start development server**
   ```bash
   npx expo start
   ```

2. **Test on iOS Simulator**
   ```bash
   npx expo start --ios
   ```

3. **Test on Android Emulator**
   ```bash
   npx expo start --android
   ```

4. **Test on physical device**
   - Scan QR code with Expo Go app
   - Note: Background notifications may not work in Expo Go, need development build

### Automated Testing

```bash
npm test
```

**All tests must pass:**
- Timing engine correctly schedules moments
- Notifications are scheduled at calculated times
- Streak calculation is accurate
- Database operations succeed
- Moment completion updates analytics

### Manual Verification Checklist

**Onboarding (First Launch)**
- [ ] Welcome screen displays
- [ ] Notification permission requested with clear explanation
- [ ] Category selection works
- [ ] Quiet hours can be set
- [ ] First moment completes successfully
- [ ] User is navigated to home screen

**Home Screen**
- [ ] Today's moments display (3 for free user)
- [ ] Current streak shows (0 on first day)
- [ ] "Take a moment now" button works
- [ ] Next scheduled moment time displays

**Moment Experience**
- [ ] Moment loads from notification tap
- [ ] Moment loads from in-app selection
- [ ] Script displays and is readable
- [ ] Audio plays (if available)
- [ ] Completion screen shows
- [ ] Mood check-in works (optional)
- [ ] Streak increments after first moment of day

**Notifications**
- [ ] Notification appears at scheduled time (may need to wait or manually trigger)
- [ ] Notification content is relevant
- [ ] Tapping notification opens correct moment
- [ ] Dismissing notification logs as ignored
- [ ] No notifications during quiet hours

**Insights Screen**
- [ ] Streak calendar displays
- [ ] Weekly chart shows completed moments
- [ ] Stats are accurate (moments taken, current streak)
- [ ] Premium features are locked with upgrade prompt

**Settings Screen**
- [ ] Quiet hours can be modified
- [ ] Category preferences can be changed
- [ ] Notification style can be toggled
- [ ] Voice selection shows (1 option for free, locked premium options)
- [ ] Changes persist after app restart

**Premium Features (Mock Toggle)**
- [ ] Toggle premium status in settings
- [ ] Verify 10 moments/day available
- [ ] Verify advanced analytics unlock
- [ ] Verify all voices available
- [ ] Toggle back to free, verify limits re-apply

**Offline Functionality**
- [ ] Enable airplane mode
- [ ] App still opens
- [ ] Moments can be completed
- [ ] Data syncs when back online (for future cloud features)

**Performance**
- [ ] App launches in < 3 seconds
- [ ] Moment