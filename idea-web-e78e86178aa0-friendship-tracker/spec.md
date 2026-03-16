# Friendship Tracker App Spec

## 1. App Name

**BondBuddy**

## 2. One-Line Pitch

Turn friendships into a game you actually win — stay connected with the people who matter through fun challenges and smart reminders.

## 3. Expanded Vision

### Who is this REALLY for?

**Primary Audience:**
- Young professionals (25-35) drowning in work who genuinely miss their friends but lack the mental bandwidth to initiate hangouts
- Remote workers who lost their "water cooler" social structure and feel isolated
- People who moved to new cities and want to maintain old friendships while building new ones
- Empty nesters rediscovering social life after kids leave home

**Broadest Audience:**
- Anyone with a phone contact list they feel guilty about neglecting
- People in long-distance friendships (college friends scattered across cities, military families, expats)
- Introverts who want to be social but need structure and prompts
- People recovering from burnout who want to rebuild their social support system

**Adjacent Use Cases:**
- **Family connection tracker** — parents staying close with adult children, siblings maintaining bonds
- **Professional networking maintenance** — keeping warm connections with former colleagues, mentors, industry contacts
- **Support group accountability** — AA sponsors, therapy buddies, accountability partners
- **Couple's social life manager** — partners coordinating their shared social calendar
- **Event planning assistant** — birthday reminders with suggested celebration ideas

**Why non-technical people want this:**
- Removes the mental load of "who haven't I talked to lately?"
- Provides conversation starters and activity ideas (no more "we should hang out sometime" that never happens)
- Makes you feel like a good friend without the anxiety
- Turns guilt into achievement — dopamine hits for social maintenance
- Creates a safety net so important relationships don't slip through the cracks

## 4. Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **Local Database:** expo-sqlite for offline-first friend data, interaction history, streaks
- **Notifications:** expo-notifications for reminder system
- **Contacts Integration:** expo-contacts (iOS/Android permissions)
- **Calendar Integration:** expo-calendar for event suggestions
- **State Management:** React Context + AsyncStorage for user preferences
- **UI Components:** React Native Paper (Material Design)
- **Testing:** Jest + React Native Testing Library
- **Analytics:** Expo Analytics (built-in, privacy-focused)

**Minimal dependencies approach:**
- No Firebase/Supabase (local-first, no backend needed for MVP)
- No complex animation libraries (use React Native Animated)
- No heavy chart libraries (custom SVG for streak visualizations)

## 5. Core Features (MVP)

### Feature 1: Smart Friend Roster
- Import contacts and tag your "inner circle" (5-20 people you want to stay close with)
- Each friend gets a "connection score" based on last interaction date
- Visual dashboard showing who you're neglecting (red), maintaining (yellow), or thriving with (green)
- Quick actions: call, text, schedule hangout

### Feature 2: Streak System & Challenges
- Maintain "connection streaks" by interacting with friends within customizable timeframes (weekly, biweekly, monthly)
- Daily/weekly challenges: "Text 3 friends today", "Schedule a coffee date this week", "Send a voice memo to someone you miss"
- Earn points and unlock badges (Bronze Buddy, Silver Socialite, Gold Guardian)
- Streak freeze power-ups (1 free pass per month to save a dying streak)

### Feature 3: Interaction Logger
- One-tap logging: "Just hung out", "Had a call", "Texted", "Sent a gift"
- Auto-suggestions based on calendar events and message history (if permissions granted)
- Add notes: "Talked about their new job", "They mentioned wanting to try that restaurant"
- Photo attachments for memories

### Feature 4: Smart Nudges
- Location-based reminders: "You're near Sarah's neighborhood — want to grab coffee?"
- Time-based prompts: "It's been 2 weeks since you talked to Mike"
- Event reminders: "Emma's birthday is in 3 days — plan something?"
- Suggested conversation starters based on past notes

### Feature 5: Friendship Insights (Premium Hook)
- Weekly/monthly reports: "You connected with 8 friends this month (+3 from last month)"
- Relationship health trends: graphs showing connection frequency over time
- "At-risk friendships" alerts before they fade completely
- Personalized suggestions: "You haven't seen college friends in 6 months — plan a reunion?"

## 6. Monetization Strategy

### Free Tier (The Hook)
- Track up to 10 friends
- Basic streak tracking (weekly check-ins)
- 3 active challenges at a time
- Manual interaction logging
- Basic notifications

**Why people stay free:** Enough to feel the value, but limited roster creates FOMO for larger social circles.

### Premium: BondBuddy Plus ($4.99/month or $39.99/year)

**What unlocks:**
- Unlimited friends in roster
- Advanced streak customization (set custom timeframes per friend)
- Unlimited active challenges
- Friendship Insights dashboard with trends and analytics
- Location-based smart nudges
- Calendar integration for auto-suggestions
- Priority support

**Price reasoning:**
- $4.99/month is impulse-buy territory (less than a coffee)
- Annual discount (33% off) encourages commitment
- Comparable to meditation apps ($5-10/month) targeting similar "self-improvement through habits" psychology

### One-Time Purchase: Friendship Audit ($9.99)
- Deep-dive report analyzing your entire contact list
- Identifies dormant relationships worth reviving
- Suggests optimal check-in frequencies per person
- Exportable PDF report

**What makes people STAY subscribed:**
- Sunk cost fallacy: streaks you've built up (lose them if you cancel)
- Habit formation: becomes part of weekly routine
- Guilt avoidance: fear of letting friendships slip again
- Social proof: sharing achievements ("I've maintained 15 friendships for 6 months!")
- Continuous value: the longer you use it, the more valuable your interaction history becomes

## 7. Market Viability

**NOT SATURATED** — Proceed with build.

**Why this isn't a skip:**
- No well-funded direct competitors in "friendship maintenance gamification"
- Habitica is for personal habits, not social relationships
- Meetup is for strangers/events, not existing friendships
- Social media platforms are passive consumption, not active maintenance
- CRM tools (like Clay) are for professional networking, not personal relationships

**Clear gap:** People want to be better friends but lack structure. This provides the scaffolding without feeling corporate or transactional.

## 8. File Structure

```
bondbuddy/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx                 # Tab navigator
│   │   ├── index.tsx                   # Dashboard (home)
│   │   ├── friends.tsx                 # Friend roster
│   │   ├── challenges.tsx              # Active challenges
│   │   └── insights.tsx                # Analytics (premium)
│   ├── friend/
│   │   └── [id].tsx                    # Friend detail page
│   ├── _layout.tsx                     # Root layout
│   └── +not-found.tsx
├── components/
│   ├── FriendCard.tsx
│   ├── StreakBadge.tsx
│   ├── ChallengeItem.tsx
│   ├── InteractionLogger.tsx
│   ├── ConnectionScore.tsx
│   └── PremiumGate.tsx
├── lib/
│   ├── database.ts                     # SQLite setup & queries
│   ├── notifications.ts                # Notification scheduling
│   ├── scoring.ts                      # Connection score algorithm
│   ├── challenges.ts                   # Challenge generation logic
│   └── contacts.ts                     # Contact import utilities
├── hooks/
│   ├── useFriends.ts
│   ├── useStreaks.ts
│   ├── useChallenges.ts
│   └── usePremium.ts
├── constants/
│   ├── Colors.ts
│   └── Challenges.ts
├── types/
│   └── index.ts
├── __tests__/
│   ├── scoring.test.ts
│   ├── challenges.test.ts
│   ├── database.test.ts
│   └── components/
│       ├── FriendCard.test.tsx
│       └── StreakBadge.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## 9. Tests

### Core Logic Tests

**`__tests__/scoring.test.ts`**
- Test connection score calculation based on last interaction date
- Test score degradation over time
- Test score boost from different interaction types
- Test edge cases (never contacted, contacted today)

**`__tests__/challenges.test.ts`**
- Test challenge generation based on user's friend roster
- Test challenge completion validation
- Test streak calculation and freeze mechanics
- Test badge unlock conditions

**`__tests__/database.test.ts`**
- Test friend CRUD operations
- Test interaction logging
- Test streak persistence
- Test data migration scenarios

### Component Tests

**`__tests__/components/FriendCard.test.tsx`**
- Test rendering with different connection scores
- Test interaction button callbacks
- Test premium feature gating

**`__tests__/components/StreakBadge.test.tsx`**
- Test streak display for active/broken/frozen states
- Test visual indicators for at-risk streaks

**Test Coverage Goal:** 80%+ for business logic, 60%+ for components

## 10. Implementation Steps

### Phase 1: Project Setup & Database
1. Initialize Expo project: `npx create-expo-app bondbuddy --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-notifications expo-contacts expo-calendar react-native-paper
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Set up TypeScript types in `types/index.ts`:
   - `Friend` interface (id, name, phone, email, lastContact, connectionScore, streakDays)
   - `Interaction` interface (id, friendId, type, date, notes, photoUri)
   - `Challenge` interface (id, title, description, type, targetCount, progress, completed)
   - `Streak` interface (friendId, currentDays, longestDays, lastInteraction, freezeUsed)

4. Create database schema in `lib/database.ts`:
   - `friends` table
   - `interactions` table
   - `challenges` table
   - `streaks` table
   - `user_settings` table (premium status, notification preferences)
   - Write init function, CRUD helpers, and migration logic

5. Write database tests in `__tests__/database.test.ts`

### Phase 2: Core Scoring & Challenge Logic
6. Implement connection scoring algorithm in `lib/scoring.ts`:
   - Calculate days since last interaction
   - Apply decay curve (exponential or linear based on user's preferred frequency)
   - Return score 0-100 and status (thriving/maintaining/neglecting)
   - Write tests in `__tests__/scoring.test.ts`

7. Implement challenge system in `lib/challenges.ts`:
   - Define challenge templates (daily/weekly/monthly)
   - Generate personalized challenges based on friend roster and interaction history
   - Track progress and completion
   - Award points and badges
   - Write tests in `__tests__/challenges.test.ts`

8. Implement streak logic in `lib/scoring.ts`:
   - Calculate current streak based on interaction frequency
   - Handle streak breaks and freeze power-ups
   - Test edge cases

### Phase 3: UI Components
9. Create `FriendCard.tsx`:
   - Display friend name, last contact date, connection score
   - Color-coded visual indicator (red/yellow/green)
   - Quick action buttons (call, text, log interaction)
   - Test in `__tests__/components/FriendCard.test.tsx`

10. Create `StreakBadge.tsx`:
    - Show current streak days with fire emoji
    - Animate when streak is at risk
    - Display freeze status if used
    - Test rendering states

11. Create `InteractionLogger.tsx`:
    - Modal with interaction type buttons
    - Optional notes field
    - Photo attachment option
    - Date picker (defaults to today)

12. Create `ChallengeItem.tsx`:
    - Display challenge title, description, progress bar
    - Mark complete button
    - Show points earned

13. Create `ConnectionScore.tsx`:
    - Circular progress indicator
    - Color-coded based on score
    - Tap to see breakdown

14. Create `PremiumGate.tsx`:
    - Reusable component to lock features
    - Show upgrade prompt with benefits
    - Handle in-app purchase flow (mock for MVP)

### Phase 4: Main Screens
15. Build Dashboard (`app/(tabs)/index.tsx`):
    - Summary stats: total friends, active streaks, points this week
    - Today's challenges section
    - "Friends to check in with" list (sorted by connection score)
    - Quick log interaction button

16. Build Friend Roster (`app/(tabs)/friends.tsx`):
    - Searchable/filterable list of all friends
    - Sort by: connection score, last contact, name
    - Add friend button (import from contacts or manual entry)
    - Pull-to-refresh

17. Build Friend Detail (`app/friend/[id].tsx`):
    - Friend profile header
    - Connection score and streak display
    - Interaction history timeline
    - Quick actions (call, text, schedule)
    - Edit/delete friend

18. Build Challenges Screen (`app/(tabs)/challenges.tsx`):
    - Active challenges list
    - Completed challenges archive
    - Points and badges showcase
    - "Generate new challenge" button (premium)

19. Build Insights Screen (`app/(tabs)/insights.tsx`):
    - Premium gate for free users
    - Weekly/monthly summary stats
    - Trend graphs (interactions over time)
    - At-risk friendships alert
    - Friendship Audit upsell

### Phase 5: Notifications & Permissions
20. Implement notification system in `lib/notifications.ts`:
    - Request permissions on first launch
    - Schedule daily challenge reminders
    - Schedule friend check-in reminders based on connection score
    - Location-based reminders (if permission granted)

21. Implement contact import in `lib/contacts.ts`:
    - Request contacts permission
    - Fetch and display contact list
    - Allow user to select friends to track
    - Map contact data to Friend schema

22. Implement calendar integration:
    - Request calendar permission
    - Scan for events with friend names
    - Suggest logging interactions after events

### Phase 6: Premium Features & Monetization
23. Set up premium state management in `hooks/usePremium.ts`:
    - Check premium status from database
    - Mock in-app purchase flow (use Expo's revenue cat or mock for MVP)
    - Handle subscription state

24. Implement feature gating:
    - Limit free tier to 10 friends
    - Lock advanced insights
    - Lock location-based reminders
    - Lock custom streak frequencies

25. Create upgrade flow:
    - Premium benefits screen
    - Pricing display
    - Mock purchase button (log to console for MVP)

### Phase 7: Polish & Testing
26. Add onboarding flow:
    - Welcome screen explaining app concept
    - Permission requests (contacts, notifications, location)
    - Import first 5-10 friends
    - Set up first challenge

27. Implement data persistence:
    - Save user preferences to AsyncStorage
    - Handle app backgrounding/foregrounding
    - Sync streak calculations on app open

28. Add error handling:
    - Graceful permission denials
    - Database error recovery
    - Network-independent operation (fully offline)

29. Run all tests: `npm test`
30. Manual testing on iOS simulator and Android emulator
31. Test on physical device via Expo Go

### Phase 8: Deployment Prep
32. Configure app.json:
    - Set app name, slug, version
    - Configure permissions (contacts, notifications, location)
    - Set up app icons and splash screen
    - Configure build settings

33. Create App Store assets:
    - Screenshots (5.5" and 6.5" iPhone, iPad)
    - App icon (1024x1024)
    - Privacy policy (required for contacts access)
    - App description and keywords

34. Build standalone apps:
    - `eas build --platform ios`
    - `eas build --platform android`

## 11. How to Verify It Works

### Development Testing
1. **Start Expo dev server:**
   ```bash
   npx expo start
   ```

2. **Test on iOS Simulator:**
   - Press `i` in terminal to open iOS simulator
   - Grant permissions when prompted
   - Import test contacts (use simulator's built-in contacts)
   - Add 3-5 friends to roster
   - Log interactions and verify connection scores update
   - Complete a challenge and verify points awarded
   - Check streak calculation after logging interaction

3. **Test on Android Emulator:**
   - Press `a` in terminal to open Android emulator
   - Repeat iOS verification steps
   - Test notification scheduling (use short intervals for testing)

4. **Test on Physical Device (Expo Go):**
   - Scan QR code with Expo Go app
   - Test with real contacts (use test account, not personal)
   - Verify location-based reminders (walk around with phone)
   - Test notifications in background

### Automated Testing
5. **Run Jest tests:**
   ```bash
   npm test
   ```
   - All tests must pass
   - Coverage report should show 80%+ for lib/ files

6. **Test specific modules:**
   ```bash
   npm test -- scoring.test.ts
   npm test -- challenges.test.ts
   npm test -- database.test.ts
   ```

### Feature Verification Checklist
- [ ] Can import contacts and add friends
- [ ] Connection scores calculate correctly based on last interaction
- [ ] Can log interactions (call, text, hangout)
- [ ] Streaks increment when interaction logged within timeframe
- [ ] Streaks break when timeframe exceeded
- [ ] Challenges generate and track progress
- [ ] Points and badges award correctly
- [ ] Notifications fire at scheduled times
- [ ] Premium features are gated for free users
- [ ] Dashboard shows accurate summary stats
- [ ] Friend detail page displays interaction history
- [ ] App works fully offline (no network required)
- [ ] Data persists across app restarts

### Edge Cases to Test
- [ ] Add friend with no phone/email
- [ ] Log interaction for friend never contacted before
- [ ] Use streak freeze power-up
- [ ] Delete friend with active streak
- [ ] Deny permissions and verify graceful fallback
- [ ] Background app for 24 hours and verify streak calculations on reopen
- [ ] Upgrade to premium and verify features unlock

### Performance Checks
- [ ] App launches in under 3 seconds
- [ ] Friend list scrolls smoothly with 50+ friends
- [ ] Database queries return in under 100ms
- [ ] No memory leaks after 10 minutes of use