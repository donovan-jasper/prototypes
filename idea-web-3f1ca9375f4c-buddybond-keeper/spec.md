# BuddyBond Keeper

## 1. App Name

**KinKeeper**

## 2. One-line pitch

Never let distance dim your closest friendships — smart reminders and thoughtful prompts keep you connected to the people who matter most.

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:** Adults 25-55 who've accumulated meaningful relationships but struggle with the mental load of maintaining them. This includes:

- **Busy professionals** who travel frequently or work long hours
- **Parents** juggling family responsibilities who've lost touch with pre-kid friends
- **Empty nesters** rediscovering social life after children leave
- **Relocated individuals** maintaining long-distance friendships across cities/countries
- **Neurodivergent users** (ADHD, autism) who struggle with social executive function
- **Introverts** who value deep connections but find social maintenance exhausting

**Broadest audience:** Anyone who's ever felt guilty about not reaching out, forgotten a friend's birthday, or realized months passed without contact. This is universal — friendship maintenance is a shared human struggle.

**Adjacent use cases:**
- **Family relationship management** — tracking calls with aging parents, sibling check-ins
- **Professional networking** — maintaining mentor relationships, alumni connections
- **Community building** — church groups, hobby clubs, volunteer organizations
- **Grief support** — honoring deceased loved ones with memorial reminders
- **Relationship repair** — structured reconnection after falling out of touch

**Why non-technical people want this:**
It solves an emotional problem, not a technical one. The pain is guilt, loneliness, and regret — not "I need a CRM." The app removes the mental burden of remembering and planning, making friendship feel effortless instead of like homework.

## 4. Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **Local database:** expo-sqlite for relationship data, interaction history
- **Notifications:** expo-notifications for reminders
- **Storage:** expo-secure-store for sensitive data, AsyncStorage for preferences
- **Date handling:** date-fns (lightweight, tree-shakeable)
- **UI:** React Native Paper (Material Design components)
- **State:** React Context + hooks (no Redux for MVP)
- **Testing:** Jest + React Native Testing Library
- **Type safety:** TypeScript

## 5. Core features (MVP)

1. **Friend Profiles with Smart Tracking**
   - Add friends with photo, birthday, relationship context (how you met, shared interests)
   - Automatic "last contacted" tracking via manual log or calendar integration
   - Visual timeline of interaction history (calls, texts, meetups)

2. **Intelligent Reminder System**
   - Customizable check-in frequency per friend (weekly, monthly, quarterly)
   - Context-aware notifications ("You haven't talked to Sarah in 6 weeks — her birthday is next month")
   - Snooze/reschedule with reason tracking (traveling, busy season)

3. **Gesture Suggestion Engine**
   - Personalized prompts based on friend's interests and upcoming events
   - Examples: "Send Alex a podcast recommendation," "Mail Jamie a postcard from your trip"
   - Quick-action buttons to log completion or dismiss

4. **Interaction Logger**
   - One-tap logging of calls, texts, video chats, in-person meetups
   - Optional notes field for memorable moments
   - Photo attachment for visual memory anchoring

5. **Friendship Health Dashboard**
   - Visual overview of relationship "temperature" (green/yellow/red based on contact frequency)
   - Streak tracking for consistent check-ins
   - Monthly recap of connections maintained

## 6. Monetization strategy

### Free tier (the hook):
- Up to 10 friends tracked
- Basic reminders (fixed intervals only)
- Manual interaction logging
- Standard gesture suggestions (generic prompts)

### Paid tier — **KinKeeper Plus** ($4.99/month or $39.99/year):
- **Unlimited friends** — track entire social circle
- **AI-powered gesture suggestions** — personalized based on friend's interests, recent conversations, and life events
- **Smart reminder optimization** — learns your patterns and suggests ideal check-in times
- **Calendar integration** — auto-detect interactions from phone/email
- **Relationship insights** — monthly reports on friendship trends, neglected connections
- **Priority support** — direct feedback channel

### Lifetime option: $79.99 one-time (appeals to privacy-conscious users who want data ownership)

### What makes people STAY subscribed:
- **Guilt avoidance** — the app becomes their external conscience
- **Visible results** — friends comment on improved consistency
- **Sunk cost** — interaction history becomes valuable personal archive
- **Habit formation** — after 3 months, checking the app becomes routine
- **Social proof** — "You've maintained 47 friendships this year" feels like an achievement

### Pricing reasoning:
$4.99/month is impulse-purchase territory (less than a coffee), while $39.99/year (17% discount) encourages commitment. Lifetime at $79.99 converts privacy advocates and creates immediate revenue for runway.

## 7. Market viability

**NOT SKIP** — This niche is genuinely underserved. Competitors:

- **Monica (monicahq.com):** Open-source personal CRM, but developer-focused and self-hosted
- **Dex:** Professional networking CRM, not friendship-focused
- **Clay:** Relationship management for networkers, $20/month (too expensive for casual use)
- **Fabriq:** Closest competitor, but focuses on family and lacks gesture suggestions

**Clear gap:** No mobile-first, consumer-friendly app specifically for friendship maintenance with intelligent prompting. Existing tools are either too technical, too expensive, or too broad.

## 8. File structure

```
kinkeeper/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard
│   │   ├── friends.tsx            # Friends list
│   │   ├── reminders.tsx          # Upcoming reminders
│   │   └── settings.tsx           # Settings & subscription
│   ├── friend/
│   │   └── [id].tsx               # Friend detail view
│   ├── add-friend.tsx             # Add new friend
│   ├── log-interaction.tsx        # Log interaction modal
│   └── _layout.tsx                # Root layout
├── components/
│   ├── FriendCard.tsx
│   ├── InteractionTimeline.tsx
│   ├── ReminderCard.tsx
│   ├── GestureSuggestion.tsx
│   ├── HealthIndicator.tsx
│   └── SubscriptionPrompt.tsx
├── lib/
│   ├── database.ts                # SQLite setup & migrations
│   ├── notifications.ts           # Notification scheduling
│   ├── gestures.ts                # Gesture suggestion logic
│   ├── analytics.ts               # Friendship health calculations
│   └── types.ts                   # TypeScript interfaces
├── hooks/
│   ├── useFriends.ts
│   ├── useInteractions.ts
│   ├── useReminders.ts
│   └── useSubscription.ts
├── context/
│   └── SubscriptionContext.tsx
├── constants/
│   └── Colors.ts
├── __tests__/
│   ├── database.test.ts
│   ├── gestures.test.ts
│   ├── analytics.test.ts
│   ├── notifications.test.ts
│   └── components/
│       ├── FriendCard.test.tsx
│       └── HealthIndicator.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### Core logic tests (Jest):

**`__tests__/database.test.ts`**
- Test friend CRUD operations
- Test interaction logging
- Test reminder creation/updates
- Test data migration scenarios

**`__tests__/gestures.test.ts`**
- Test gesture suggestion generation based on friend interests
- Test suggestion filtering by context (birthday, holiday, season)
- Test suggestion dismissal and rotation logic

**`__tests__/analytics.test.ts`**
- Test friendship health score calculation
- Test "last contacted" date accuracy
- Test streak counting logic
- Test dashboard statistics aggregation

**`__tests__/notifications.test.ts`**
- Test reminder scheduling based on frequency
- Test notification cancellation on interaction log
- Test snooze functionality
- Test notification permission handling

**`__tests__/components/FriendCard.test.tsx`**
- Test rendering with friend data
- Test health indicator color logic
- Test interaction with card actions

**`__tests__/components/HealthIndicator.test.tsx`**
- Test color coding (green/yellow/red) based on days since contact
- Test threshold calculations

### Coverage target: 80%+ for core business logic

## 10. Implementation steps

### Phase 1: Project setup & database foundation

1. **Initialize Expo project**
   ```bash
   npx create-expo-app kinkeeper --template tabs
   cd kinkeeper
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-sqlite expo-notifications expo-secure-store expo-router
   npm install react-native-paper date-fns
   npm install -D @testing-library/react-native @testing-library/jest-native jest-expo
   ```

3. **Configure TypeScript**
   - Update `tsconfig.json` with strict mode
   - Create `lib/types.ts` with core interfaces:
     - `Friend` (id, name, photo, birthday, interests, lastContacted, reminderFrequency)
     - `Interaction` (id, friendId, type, date, notes, photoUri)
     - `Reminder` (id, friendId, dueDate, dismissed, snoozedUntil)
     - `GestureSuggestion` (id, friendId, text, category, dismissed)

4. **Build database layer (`lib/database.ts`)**
   - Initialize SQLite with `expo-sqlite`
   - Create tables: `friends`, `interactions`, `reminders`, `gestures`
   - Write migration system for schema updates
   - Implement CRUD functions:
     - `addFriend()`, `updateFriend()`, `deleteFriend()`, `getAllFriends()`
     - `logInteraction()`, `getInteractionsByFriend()`
     - `createReminder()`, `updateReminder()`, `getUpcomingReminders()`
   - Add indexes on `friendId` and `date` columns for performance

5. **Write database tests (`__tests__/database.test.ts`)**
   - Test friend creation with all fields
   - Test interaction logging updates `lastContacted`
   - Test reminder retrieval filters by date
   - Test cascade deletion (deleting friend removes interactions)

### Phase 2: Core business logic

6. **Build gesture suggestion engine (`lib/gestures.ts`)**
   - Create suggestion templates categorized by:
     - Birthday/holiday
     - Shared interests (books, sports, hobbies)
     - Life events (new job, moving, illness)
     - Seasonal (summer vacation, holiday season)
   - Implement `generateSuggestions(friend: Friend): GestureSuggestion[]`
     - Match friend interests to templates
     - Check upcoming dates (birthday within 2 weeks)
     - Rotate suggestions to avoid repetition
   - Implement `dismissSuggestion(id: string)` to mark as seen

7. **Build analytics module (`lib/analytics.ts`)**
   - Implement `calculateHealthScore(friend: Friend): 'healthy' | 'warning' | 'neglected'`
     - Green: contacted within expected frequency
     - Yellow: 1.5x expected frequency passed
     - Red: 2x+ expected frequency passed
   - Implement `getDashboardStats()`:
     - Total friends tracked
     - Friends needing attention (yellow/red)
     - Interactions this month
     - Current streak (consecutive weeks with ≥1 interaction)
   - Implement `getMonthlyRecap()` for subscription feature

8. **Build notification system (`lib/notifications.ts`)**
   - Request notification permissions on app launch
   - Implement `scheduleReminder(friend: Friend, date: Date)`
   - Implement `cancelReminder(reminderId: string)`
   - Implement `snoozeReminder(reminderId: string, days: number)`
   - Schedule daily check at 9 AM for overdue reminders
   - Include friend name and context in notification body

9. **Write logic tests**
   - `__tests__/gestures.test.ts`: Test suggestion matching and rotation
   - `__tests__/analytics.test.ts`: Test health score edge cases
   - `__tests__/notifications.test.ts`: Test scheduling and cancellation

### Phase 3: UI components

10. **Build reusable components**
    - `FriendCard.tsx`: Display friend with photo, name, health indicator, last contacted
    - `HealthIndicator.tsx`: Colored dot/badge showing relationship status
    - `InteractionTimeline.tsx`: Chronological list of interactions with icons
    - `ReminderCard.tsx`: Upcoming reminder with snooze/dismiss actions
    - `GestureSuggestion.tsx`: Suggestion card with "Done" and "Dismiss" buttons
    - `SubscriptionPrompt.tsx`: Paywall modal for premium features

11. **Style with React Native Paper**
    - Use `Card`, `Button`, `FAB`, `Avatar` components
    - Define color scheme in `constants/Colors.ts`:
      - Healthy: #4CAF50
      - Warning: #FF9800
      - Neglected: #F44336
    - Ensure accessibility (contrast ratios, touch targets ≥44px)

12. **Write component tests**
    - Test `FriendCard` renders all data correctly
    - Test `HealthIndicator` shows correct color for each status
    - Test `GestureSuggestion` calls dismiss handler on button press

### Phase 4: Screens & navigation

13. **Build Dashboard (`app/(tabs)/index.tsx`)**
    - Display health overview stats
    - Show 3 friends needing attention (sorted by days since contact)
    - Show 2 upcoming reminders
    - Show 1 gesture suggestion
    - FAB to add new friend

14. **Build Friends List (`app/(tabs)/friends.tsx`)**
    - Scrollable list of all friends (FriendCard components)
    - Search bar to filter by name
    - Sort options: alphabetical, last contacted, health status
    - Pull-to-refresh to recalculate health scores

15. **Build Friend Detail (`app/friend/[id].tsx`)**
    - Display full profile (photo, birthday, interests, notes)
    - Show interaction timeline
    - Show active reminders
    - Show gesture suggestions for this friend
    - Actions: Edit profile, Log interaction, Delete friend

16. **Build Reminders Screen (`app/(tabs)/reminders.tsx`)**
    - List all upcoming reminders grouped by date
    - Overdue reminders highlighted in red
    - Swipe actions: Snooze (1 day, 3 days, 1 week), Dismiss, Log interaction

17. **Build Settings (`app/(tabs)/settings.tsx`)**
    - Notification preferences (time of day, frequency)
    - Subscription status and upgrade prompt
    - Data export (JSON backup of all friends/interactions)
    - About/privacy policy links

18. **Build Add Friend Modal (`app/add-friend.tsx`)**
    - Form fields: Name, photo (camera/gallery), birthday, interests (tags), reminder frequency
    - Validation: Name required, birthday optional
    - Save creates friend + schedules first reminder

19. **Build Log Interaction Modal (`app/log-interaction.tsx`)**
    - Select friend (if not pre-selected)
    - Interaction type: Call, Text, Video, In-person, Other
    - Date picker (defaults to today)
    - Optional notes and photo
    - Save updates `lastContacted`, reschedules reminder, dismisses related suggestions

### Phase 5: Subscription & monetization

20. **Implement subscription context (`context/SubscriptionContext.tsx`)**
    - Track subscription status (free, plus, lifetime)
    - Implement feature gates:
      - `canAddFriend()`: Free allows 10, paid unlimited
      - `canUseAIGestures()`: Paid only
      - `canIntegrateCalendar()`: Paid only
    - Mock subscription for MVP (hardcode status for testing)
    - Add TODO comments for future RevenueCat integration

21. **Add subscription prompts**
    - Show `SubscriptionPrompt` when hitting free tier limits
    - Add "Upgrade to Plus" banner in settings
    - Highlight premium features with lock icons

### Phase 6: Polish & testing

22. **Add loading states**
    - Skeleton screens for friends list
    - Spinners for database operations
    - Pull-to-refresh indicators

23. **Add empty states**
    - "No friends yet" with illustration and CTA
    - "No reminders" with encouraging message
    - "All caught up!" when no friends need attention

24. **Add error handling**
    - Try-catch around database operations
    - User-friendly error messages (avoid technical jargon)
    - Retry mechanisms for failed operations

25. **Accessibility audit**
    - Add `accessibilityLabel` to all interactive elements
    - Test with screen reader (TalkBack/VoiceOver)
    - Ensure color isn't the only indicator (use icons + text)
    - Test keyboard navigation

26. **Run full test suite**
    ```bash
    npm test -- --coverage
    ```
    - Ensure 80%+ coverage
    - Fix failing tests
    - Add missing test cases

27. **Manual testing checklist**
    - Add 5 friends with varying data
    - Log interactions and verify `lastContacted` updates
    - Verify reminders appear at correct times
    - Test snooze/dismiss functionality
    - Verify health indicators update correctly
    - Test gesture suggestions rotate
    - Test subscription gates work
    - Test data persistence across app restarts

### Phase 7: Deployment prep

28. **Configure app.json**
    - Set app name, slug, version
    - Configure notification permissions
    - Set iOS bundle ID and Android package name
    - Add app icon and splash screen

29. **Build for testing**
    ```bash
    npx expo prebuild
    npx expo run:ios
    npx expo run:android
    ```

30. **Create demo data script**
    - Seed database with sample friends for App Store screenshots
    - Include diverse names, photos, interaction patterns

## 11. How to verify it works

### Development testing (Expo Go):

1. **Start development server**
   ```bash
   npx expo start
   ```

2. **Test on physical device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Verify app loads without crashes

3. **Core functionality checklist**
   - [ ] Add a friend with photo and birthday
   - [ ] Log an interaction (call, text, meetup)
   - [ ] Verify "last contacted" updates on friend card
   - [ ] Check dashboard shows correct health status
   - [ ] Verify reminder appears in reminders tab
   - [ ] Snooze a reminder and verify it reschedules
   - [ ] View gesture suggestion and mark as done
   - [ ] Test subscription gate (try adding 11th friend on free tier)
   - [ ] Close and reopen app — verify data persists

4. **Notification testing**
   - Schedule a reminder for 1 minute in the future
   - Lock device and wait
   - Verify notification appears with correct text
   - Tap notification and verify it opens friend detail

5. **Edge cases**
   - Add friend with no birthday (should work)
   - Log interaction with future date (should warn)
   - Delete friend with interactions (should cascade)
   - Test with 50+ friends (performance check)

### Automated testing:

```bash
npm test -- --coverage --verbose
```

**Expected output:**
- All tests pass (green checkmarks)
- Coverage ≥80% for `lib/` directory
- No console errors or warnings

### Production build verification:

```bash
# iOS
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

- Test on physical device (not simulator)
- Verify notifications work in production build
- Check app size (<50 MB for initial download)
- Test cold start time (<3 seconds)

### Pre-launch checklist:

- [ ] All tests pass
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No ESLint warnings
- [ ] App icon displays correctly
- [ ] Splash screen shows
- [ ] Privacy policy linked in settings
- [ ] Subscription flow tested (even if mocked)
- [ ] Crash-free on iOS 15+ and Android 10+
- [ ] Accessibility: VoiceOver/TalkBack navigation works
- [ ] Data export produces valid JSON

**Success criteria:** A user can download the app, add 3 friends, log interactions, receive a reminder notification, and understand their friendship health status — all within 5 minutes of first launch.