# BehaviorMatch

## One-line pitch
Stop guessing who you'll click with — let AI match you based on how you actually act, not what you claim to be.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** Anyone exhausted by the performative nature of modern dating and networking apps. This includes:
- Dating app veterans (25-45) tired of mismatched expectations and catfishing
- Introverts who struggle with self-promotion but shine in actual interactions
- Professionals seeking genuine networking connections beyond LinkedIn posturing
- People re-entering the dating market after relationships who don't know how to "sell themselves"
- Gen Z users (18-24) who value authenticity and are privacy-conscious

**Broadest audience:** Anyone who wants to be valued for who they are, not who they present themselves to be. This is the anti-profile app.

### Adjacent use cases:
- **Friendship matching** for people relocating to new cities
- **Roommate compatibility** assessment before signing leases
- **Team building** for remote companies to match compatible coworkers
- **Mentorship pairing** based on communication styles and interaction patterns
- **Study group formation** for students with compatible learning behaviors
- **Hobby group matching** (running clubs, book clubs) based on actual engagement patterns

### Why non-technical people want this:
- **No more profile anxiety** — no need to craft the perfect bio or choose the right photos
- **Authentic connections** — matches reflect real compatibility, not marketing skills
- **Time savings** — fewer bad first dates/meetings because behavioral patterns already align
- **Privacy-first** — no public profile means no judgment from friends/coworkers stumbling upon your dating profile
- **Confidence boost** — being matched for who you are, not how photogenic you are

The killer insight: Most people are terrible at describing themselves but excellent at being themselves. This app removes the middleman.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **State management:** Zustand (lightweight, minimal boilerplate)
- **AI/ML:** TensorFlow.js Lite for on-device behavior analysis
- **Backend:** Supabase (auth, real-time matching, encrypted behavior vectors)
- **Analytics:** Expo Analytics (privacy-compliant)
- **Testing:** Jest + React Native Testing Library
- **Navigation:** Expo Router (file-based routing)

## Core features (MVP)

1. **Passive Behavior Tracking**
   - Analyzes in-app interaction patterns: response times, message length, emoji usage, conversation depth
   - Tracks engagement patterns: time of day active, session duration, swipe behavior
   - Builds a behavioral fingerprint without explicit user input
   - All processing happens on-device; only anonymized vectors sent to server

2. **Ghost Mode Matching**
   - No profile creation required — just start using the app
   - Optional minimal info: age range preference, location radius, what you're looking for (dating/friends/networking)
   - AI matches based on behavioral compatibility scores
   - Reveals matches gradually as confidence increases

3. **Conversation Starter Engine**
   - AI generates personalized icebreakers based on behavioral compatibility
   - Suggests topics both users are likely to engage with
   - Adapts based on conversation flow and response patterns

4. **Compatibility Insights** (Premium)
   - Shows why you matched: "You both prefer deep conversations over small talk"
   - Behavioral compatibility breakdown: communication style, energy levels, interaction preferences
   - Predictive compatibility score that improves over time

5. **Privacy Dashboard**
   - Full transparency into what's being tracked
   - Granular controls to disable specific tracking categories
   - One-tap data deletion
   - Encrypted behavior vectors that can't be reverse-engineered to identify you

## Monetization strategy

### Free tier (the hook):
- Up to 5 active matches at a time
- Basic behavior tracking and matching
- Standard conversation starters
- Ads (non-intrusive, between match reveals)

### Premium tier — $12.99/month or $99/year (the paywall):
**Why this price?** Positioned between dating apps ($9.99) and professional networking tools ($14.99). The annual option offers 36% savings to encourage long-term commitment.

**Premium features:**
- Unlimited active matches
- Compatibility Insights dashboard
- Priority matching (your profile shown first to compatible users)
- Advanced filters (communication style, activity patterns, energy levels)
- Ad-free experience
- "Second Look" — rematch with people you previously passed on
- Incognito mode — browse without appearing in others' feeds

**What makes people STAY subscribed:**
- **Network effects** — the more you use it, the better your matches get
- **Sunk cost** — your behavioral profile becomes more valuable over time
- **Success stories** — if you find one great connection, you'll want to find more
- **FOMO** — seeing compatibility insights creates curiosity about other potential matches
- **Habit formation** — daily check-ins become part of routine, especially with push notifications about high-compatibility matches

### Additional revenue:
- **Virtual events** ($5-15/event) — curated meetups for behaviorally compatible groups
- **Enterprise tier** ($499/month) — for companies doing team building or hiring compatibility assessments

## File structure

```
behaviormatch/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Matches feed
│   │   ├── conversations.tsx      # Active chats
│   │   ├── insights.tsx           # Compatibility dashboard (premium)
│   │   └── settings.tsx           # Privacy controls & account
│   ├── match/
│   │   └── [id].tsx               # Individual match detail
│   ├── onboarding/
│   │   ├── welcome.tsx
│   │   ├── preferences.tsx
│   │   └── permissions.tsx
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── MatchCard.tsx
│   ├── BehaviorInsight.tsx
│   ├── ConversationStarter.tsx
│   ├── PrivacyToggle.tsx
│   └── CompatibilityScore.tsx
├── lib/
│   ├── database/
│   │   ├── schema.ts
│   │   ├── migrations.ts
│   │   └── queries.ts
│   ├── ai/
│   │   ├── behaviorAnalyzer.ts
│   │   ├── matchingEngine.ts
│   │   └── conversationGenerator.ts
│   ├── tracking/
│   │   ├── interactionTracker.ts
│   │   └── privacyManager.ts
│   ├── supabase.ts
│   └── store.ts                   # Zustand store
├── constants/
│   ├── Colors.ts
│   └── BehaviorMetrics.ts
├── hooks/
│   ├── useMatches.ts
│   ├── useBehaviorTracking.ts
│   └── useSubscription.ts
├── __tests__/
│   ├── behaviorAnalyzer.test.ts
│   ├── matchingEngine.test.ts
│   ├── interactionTracker.test.ts
│   ├── privacyManager.test.ts
│   └── components/
│       ├── MatchCard.test.tsx
│       └── CompatibilityScore.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### Core logic tests (Jest)

**lib/ai/behaviorAnalyzer.test.ts**
- Test behavior vector generation from interaction data
- Test anonymization of behavioral data
- Test edge cases (minimal data, extreme patterns)

**lib/ai/matchingEngine.test.ts**
- Test compatibility scoring algorithm
- Test match ranking and filtering
- Test that matches meet minimum compatibility threshold

**lib/tracking/interactionTracker.test.ts**
- Test interaction event capture
- Test data aggregation and pattern detection
- Test privacy filters are applied correctly

**lib/tracking/privacyManager.test.ts**
- Test data deletion functionality
- Test granular tracking controls
- Test encryption of behavior vectors

**components/MatchCard.test.tsx**
- Test rendering with different match states
- Test interaction handlers (accept/pass)
- Test accessibility labels

**components/CompatibilityScore.test.tsx**
- Test score visualization
- Test breakdown display
- Test premium feature gating

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app@latest behaviormatch --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-router zustand @supabase/supabase-js
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure TypeScript strict mode in `tsconfig.json`
4. Set up Jest config with React Native preset
5. Create Supabase project and configure environment variables

### Phase 2: Database schema
1. Create SQLite schema in `lib/database/schema.ts`:
   - `users` table (id, created_at, preferences_json)
   - `interactions` table (id, user_id, type, timestamp, metadata_json)
   - `behavior_vectors` table (id, user_id, vector_data, updated_at)
   - `matches` table (id, user_id, matched_user_id, compatibility_score, status)
   - `conversations` table (id, match_id, messages_json)
2. Write migration functions in `lib/database/migrations.ts`
3. Create query helpers in `lib/database/queries.ts`
4. Write tests for database operations

### Phase 3: Behavior tracking system
1. Implement `interactionTracker.ts`:
   - Track message send events (timestamp, length, response_time)
   - Track app usage patterns (session_duration, time_of_day)
   - Track engagement metrics (swipe_speed, conversation_depth)
2. Implement `privacyManager.ts`:
   - Granular tracking toggles
   - Data anonymization functions
   - Encryption for behavior vectors
3. Create `useBehaviorTracking` hook to integrate tracking into components
4. Write comprehensive tests for tracking and privacy

### Phase 4: AI matching engine
1. Implement `behaviorAnalyzer.ts`:
   - Convert raw interactions into behavior vectors
   - Use TensorFlow.js Lite for on-device pattern recognition
   - Generate anonymized behavioral fingerprints
2. Implement `matchingEngine.ts`:
   - Cosine similarity for vector comparison
   - Compatibility scoring algorithm (0-100 scale)
   - Match ranking and filtering logic
3. Implement `conversationGenerator.ts`:
   - Generate contextual icebreakers based on compatibility insights
   - Adapt suggestions based on conversation flow
4. Write tests for all AI components

### Phase 5: Supabase backend integration
1. Set up Supabase tables:
   - `profiles` (minimal: user_id, age_range, location, looking_for)
   - `behavior_vectors` (encrypted, for matching)
   - `matches` (with real-time subscriptions)
   - `messages` (encrypted end-to-end)
2. Configure Row Level Security policies
3. Implement real-time match notifications
4. Create `lib/supabase.ts` with auth and data helpers

### Phase 6: Core UI components
1. Build `MatchCard.tsx`:
   - Display compatibility score
   - Show behavioral insights preview
   - Accept/pass actions with animations
2. Build `CompatibilityScore.tsx`:
   - Visual score representation (circular progress)
   - Breakdown of compatibility factors
   - Premium feature gate for detailed insights
3. Build `ConversationStarter.tsx`:
   - Display AI-generated icebreakers
   - Refresh button for new suggestions
   - Copy-to-clipboard functionality
4. Build `BehaviorInsight.tsx`:
   - Display individual compatibility factors
   - Visual indicators (icons, progress bars)
5. Build `PrivacyToggle.tsx`:
   - Granular tracking controls
   - Clear explanations of what each toggle affects
6. Write component tests

### Phase 7: Screen implementation
1. Implement onboarding flow:
   - `welcome.tsx`: Value proposition and privacy promise
   - `preferences.tsx`: Minimal setup (age range, location, intent)
   - `permissions.tsx`: Explain tracking with opt-in controls
2. Implement main tabs:
   - `index.tsx`: Matches feed with swipeable cards
   - `conversations.tsx`: Active chat list
   - `insights.tsx`: Compatibility dashboard (premium gate)
   - `settings.tsx`: Privacy controls, account management, subscription
3. Implement `match/[id].tsx`: Detailed match view with full compatibility breakdown
4. Add navigation and tab bar icons

### Phase 8: State management
1. Create Zustand store in `lib/store.ts`:
   - User preferences slice
   - Matches slice (with optimistic updates)
   - Conversations slice
   - Subscription status slice
   - Privacy settings slice
2. Create custom hooks:
   - `useMatches`: Fetch and manage matches
   - `useSubscription`: Check premium status and handle upgrades
3. Implement optimistic UI updates for better UX

### Phase 9: Monetization integration
1. Set up Expo In-App Purchases (RevenueCat recommended)
2. Implement subscription flow in settings
3. Add premium feature gates throughout app
4. Create paywall screen with clear value proposition
5. Implement restore purchases functionality

### Phase 10: Polish and testing
1. Add loading states and error handling
2. Implement pull-to-refresh on matches feed
3. Add haptic feedback for interactions
4. Optimize performance (lazy loading, memoization)
5. Run full test suite and fix any failures
6. Test on both iOS and Android devices
7. Conduct privacy audit to ensure compliance

### Phase 11: Pre-launch
1. Create app icons and splash screen
2. Write App Store and Google Play descriptions
3. Prepare privacy policy and terms of service
4. Set up analytics (privacy-compliant)
5. Configure push notifications for new matches
6. Create demo video for app stores
7. Submit for review

## How to verify it works

### Local development:
1. Clone repository and install dependencies: `npm install`
2. Start Expo dev server: `npx expo start`
3. Run on iOS simulator: Press `i` in terminal
4. Run on Android emulator: Press `a` in terminal
5. Run on physical device: Scan QR code with Expo Go app

### Testing:
1. Run test suite: `npm test`
2. Run tests in watch mode: `npm test -- --watch`
3. Check test coverage: `npm test -- --coverage`
4. All tests must pass before deployment

### Manual verification checklist:
- [ ] Complete onboarding flow without errors
- [ ] Behavior tracking captures interactions (check SQLite database)
- [ ] Matches appear in feed with compatibility scores
- [ ] Can accept/pass on matches with smooth animations
- [ ] Conversation starters generate and refresh
- [ ] Privacy toggles disable tracking as expected
- [ ] Premium features are gated correctly
- [ ] Subscription flow works (use test mode)
- [ ] Data deletion removes all user data
- [ ] App works offline (local data persists)
- [ ] Push notifications arrive for new matches
- [ ] Real-time chat updates work
- [ ] App performs well with 50+ matches

### Performance benchmarks:
- App launch: < 2 seconds
- Match feed scroll: 60 FPS
- Behavior analysis: < 100ms per interaction
- Match calculation: < 500ms for 1000 candidates
- Database queries: < 50ms average

### Privacy verification:
- [ ] No PII stored in behavior vectors
- [ ] Encryption enabled for sensitive data
- [ ] User can export all their data
- [ ] User can delete account and all data
- [ ] Tracking respects user preferences
- [ ] No data shared with third parties without consent