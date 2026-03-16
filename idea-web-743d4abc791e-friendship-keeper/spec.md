# Friendship Keeper App Spec

## 1. App Name

**Kinkeeper**

## 2. One-Line Pitch

Never lose touch with the people who matter — smart reminders and conversation starters that keep your relationships thriving.

## 3. Expanded Vision

### Who This Is Really For

**Broadest Audience:**
- Anyone with a phone and relationships they care about (essentially everyone 18-65+)
- People who feel guilty about not staying in touch
- Those who want to be better friends/family members but lack the mental bandwidth
- Individuals rebuilding social lives after isolation, relocation, or life changes

**Adjacent Use Cases:**
- **Professional networking**: Maintain mentor relationships, former colleagues, industry contacts
- **Family caregiving**: Adult children checking in on aging parents, coordinating with siblings
- **Community building**: Religious groups, hobby clubs, volunteer organizations staying connected
- **Mental health support**: People in recovery maintaining accountability partnerships
- **Expat communities**: People living abroad staying connected to home
- **Military families**: Maintaining connections during deployments and relocations
- **College students**: Keeping high school friendships alive while building new ones
- **Retirees**: Combating loneliness and maintaining social engagement

**Why Non-Technical People Want This:**
- Removes the cognitive load of "who haven't I talked to lately?"
- Eliminates the awkwardness of reaching out after long silence
- Provides conversation starters so you're never stuck with "how are you?"
- Makes you look thoughtful and caring without extra effort
- Reduces relationship anxiety and guilt
- Creates a system for something that feels overwhelming when unstructured

**The Real Problem We're Solving:**
Modern life fragments our attention across work, family, and digital noise. People genuinely care about their relationships but lack a system to maintain them. This isn't about being fake or transactional — it's about being intentional with limited time and energy.

## 4. Tech Stack

- **Framework**: React Native (Expo SDK 52+)
- **Language**: TypeScript
- **Database**: SQLite (expo-sqlite)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + hooks (no Redux needed for MVP)
- **Notifications**: expo-notifications
- **Contacts Integration**: expo-contacts
- **Date/Time**: date-fns
- **UI Components**: React Native Paper (Material Design)
- **Testing**: Jest + React Native Testing Library
- **Storage**: expo-secure-store (for sensitive data), AsyncStorage (for preferences)

## 5. Core Features (MVP)

### 1. Smart Contact Tracking
- Import contacts and categorize relationships (close friend, family, acquaintance, professional)
- Set desired contact frequency per person (weekly, monthly, quarterly)
- Visual "relationship health" indicator showing who you're neglecting
- Quick actions: call, text, schedule hangout

### 2. Intelligent Nudges
- Context-aware notifications: "You haven't talked to Sarah in 3 weeks — she mentioned her job interview last time"
- Conversation starters based on past interactions: "Ask about her trip to Portland"
- Adaptive timing: learns when you're most likely to reach out
- Snooze/reschedule options with smart suggestions

### 3. Interaction Logging
- One-tap logging after calls/texts/meetups
- Quick notes: "Talked about new job, planning camping trip"
- Automatic detection of communication (optional calendar/message integration)
- Timeline view of relationship history

### 4. Shared Activity Planner
- Suggest activities based on shared interests
- Group coordination: "You haven't seen Mike and Jordan together in 6 months"
- Integration with calendar for scheduling
- Reminder before planned meetups with conversation prep

### 5. Relationship Insights (Premium)
- Analytics: who you talk to most, relationship balance across categories
- Streak tracking: "You've checked in with Mom every week for 3 months"
- Milestone reminders: birthdays, anniversaries, important dates
- Export relationship history

## 6. Monetization Strategy

### Free Tier (The Hook)
- Track up to 5 relationships
- Basic reminders (weekly frequency only)
- Manual interaction logging
- Simple conversation notes
- Core nudge notifications

**Why This Works**: Gets people hooked on the system. 5 relationships is enough to see value (immediate family + 1-2 close friends) but not enough for most people's full social circle.

### Premium: $5.99/month or $49.99/year (17% discount)

**Premium Features:**
- Unlimited relationships
- Custom reminder frequencies (daily to yearly)
- Smart conversation starters based on past notes
- Relationship analytics and insights
- Shared activity suggestions
- Group coordination tools
- Calendar integration
- Contact sync across devices
- Priority support
- Export data

**Price Reasoning:**
- Higher than basic productivity apps ($2.99) because relationships are emotionally valuable
- Lower than therapy/coaching apps ($15+) to remain accessible
- Comparable to streaming services people pay for entertainment
- Annual option encourages commitment (relationships are long-term)

### What Makes People Stay Subscribed

**Emotional Lock-In:**
- Guilt of losing relationship data/history
- Fear of reverting to old patterns of neglect
- Positive reinforcement from improved relationships
- Social proof: "My friends noticed I'm more present"

**Practical Lock-In:**
- Accumulated relationship notes become irreplaceable
- Established habits around the nudge system
- Integrated into daily routine
- Network effects: if others use it, coordination is easier

**Value Demonstration:**
- Monthly recap: "You connected with 12 people this month"
- Relationship health improvements over time
- Testimonials from people who rekindled important friendships

## 7. Market Assessment

**NOT SKIP** — Clear gap exists:

**Why Incumbents Haven't Won:**
- Reminder apps (Todoist, Things) are too generic and require manual setup
- Relationship apps (Couple, Between) focus only on romantic partnerships
- CRMs (Dex, Clay) are too business-focused and expensive
- Social media doesn't solve the problem (passive scrolling ≠ meaningful connection)

**Our Advantage:**
- Purpose-built for personal relationships
- Mobile-first (competitors are often web-first)
- Affordable consumer pricing (not B2B SaaS pricing)
- Focuses on action, not just tracking
- Emotional intelligence in UX (doesn't feel robotic)

**Market Validation:**
- Loneliness epidemic is well-documented
- Post-pandemic relationship maintenance is a recognized need
- Existing apps have small user bases (opportunity for better execution)
- No dominant player with strong brand recognition

## 8. File Structure

```
kinkeeper/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Dashboard
│   │   ├── relationships.tsx      # Relationship list
│   │   ├── insights.tsx           # Analytics (premium)
│   │   └── settings.tsx           # Settings
│   ├── relationship/
│   │   ├── [id].tsx               # Relationship detail
│   │   └── add.tsx                # Add new relationship
│   ├── interaction/
│   │   └── log.tsx                # Log interaction
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── RelationshipCard.tsx
│   ├── HealthIndicator.tsx
│   ├── NudgeNotification.tsx
│   ├── InteractionTimeline.tsx
│   ├── ConversationStarter.tsx
│   └── ActivitySuggestion.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── notifications.ts           # Notification scheduling
│   ├── contacts.ts                # Contact import
│   └── analytics.ts               # Relationship insights
├── services/
│   ├── relationshipService.ts     # CRUD operations
│   ├── interactionService.ts      # Interaction logging
│   ├── nudgeService.ts            # Nudge generation logic
│   └── insightService.ts          # Analytics calculations
├── types/
│   └── index.ts                   # TypeScript types
├── constants/
│   └── index.ts                   # App constants
├── hooks/
│   ├── useRelationships.ts
│   ├── useInteractions.ts
│   └── useNudges.ts
├── context/
│   └── AppContext.tsx             # Global state
├── utils/
│   ├── dateHelpers.ts
│   └── relationshipHelpers.ts
├── __tests__/
│   ├── services/
│   │   ├── relationshipService.test.ts
│   │   ├── interactionService.test.ts
│   │   ├── nudgeService.test.ts
│   │   └── insightService.test.ts
│   ├── utils/
│   │   ├── dateHelpers.test.ts
│   │   └── relationshipHelpers.test.ts
│   └── components/
│       ├── RelationshipCard.test.tsx
│       └── HealthIndicator.test.tsx
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 9. Tests

### Core Test Files

**`__tests__/services/relationshipService.test.ts`**
- Create relationship with valid data
- Update relationship frequency
- Delete relationship and cascade interactions
- Retrieve relationships by category
- Calculate relationship health score

**`__tests__/services/interactionService.test.ts`**
- Log interaction with notes
- Retrieve interaction history for relationship
- Calculate days since last interaction
- Update interaction timestamps

**`__tests__/services/nudgeService.test.ts`**
- Generate nudge for overdue relationship
- Skip nudge for recently contacted person
- Prioritize nudges by relationship importance
- Generate conversation starters from past notes
- Respect user's quiet hours

**`__tests__/services/insightService.test.ts`**
- Calculate total interactions per month
- Identify most/least contacted relationships
- Generate relationship balance report
- Track streaks for consistent contact

**`__tests__/utils/dateHelpers.test.ts`**
- Calculate days between dates
- Format relative time ("3 days ago")
- Determine if contact is overdue
- Generate next contact date based on frequency

**`__tests__/utils/relationshipHelpers.test.ts`**
- Calculate health score (0-100)
- Categorize relationship strength
- Generate health indicator color
- Suggest contact frequency based on category

**`__tests__/components/RelationshipCard.test.tsx`**
- Renders relationship name and category
- Displays correct health indicator
- Shows days since last contact
- Triggers navigation on press

**`__tests__/components/HealthIndicator.test.tsx`**
- Shows green for healthy relationships
- Shows yellow for at-risk relationships
- Shows red for neglected relationships
- Displays correct percentage

## 10. Implementation Steps

### Phase 1: Project Setup & Database

1. **Initialize Expo project**
   ```bash
   npx create-expo-app kinkeeper --template tabs
   cd kinkeeper
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-sqlite expo-notifications expo-contacts expo-secure-store @react-native-async-storage/async-storage
   npm install react-native-paper date-fns
   npm install -D @types/jest @testing-library/react-native @testing-library/jest-native jest-expo
   ```

3. **Configure TypeScript**
   - Update `tsconfig.json` with strict mode
   - Create `types/index.ts` with core interfaces:
     - `Relationship`: id, name, category, frequency, importance, createdAt
     - `Interaction`: id, relationshipId, type, notes, timestamp
     - `Nudge`: id, relationshipId, message, conversationStarter, scheduledFor
     - `RelationshipHealth`: score, status, daysSinceContact, isOverdue

4. **Set up SQLite database**
   - Create `lib/database.ts`
   - Define schema with 3 tables: relationships, interactions, nudges
   - Write migration functions
   - Initialize database on app launch
   - Add indexes for performance (relationshipId, timestamp)

5. **Configure Jest**
   - Create `jest.config.js` with expo-preset
   - Set up test utilities and mocks
   - Configure coverage thresholds (80% minimum)

### Phase 2: Core Services

6. **Build relationshipService**
   - `createRelationship(data)`: Insert with validation
   - `updateRelationship(id, data)`: Update fields
   - `deleteRelationship(id)`: Cascade delete interactions
   - `getRelationships(category?)`: Retrieve with filters
   - `getRelationshipById(id)`: Single relationship with stats
   - `calculateHealth(relationship, lastInteraction)`: Health score algorithm

7. **Build interactionService**
   - `logInteraction(relationshipId, type, notes)`: Insert interaction
   - `getInteractions(relationshipId, limit?)`: Retrieve history
   - `getLastInteraction(relationshipId)`: Most recent contact
   - `updateInteraction(id, data)`: Edit notes
   - `deleteInteraction(id)`: Remove interaction

8. **Build nudgeService**
   - `generateNudges()`: Scan all relationships, create nudges for overdue
   - `getNudges(limit?)`: Retrieve pending nudges sorted by priority
   - `dismissNudge(id)`: Mark as handled
   - `snoozeNudge(id, duration)`: Reschedule
   - `generateConversationStarter(relationship)`: Parse last interaction notes
   - `scheduleNotification(nudge)`: Use expo-notifications

9. **Build insightService** (Premium feature)
   - `getMonthlyStats(userId)`: Total interactions, breakdown by category
   - `getRelationshipBalance()`: Distribution across categories
   - `getStreaks(relationshipId)`: Consecutive contact periods
   - `getTopRelationships(limit)`: Most contacted people
   - `getNeglectedRelationships(limit)`: Least contacted people

10. **Write utility functions**
    - `dateHelpers.ts`: daysBetween, formatRelativeTime, isOverdue, getNextContactDate
    - `relationshipHelpers.ts`: calculateHealthScore, getHealthStatus, getHealthColor, suggestFrequency

### Phase 3: State Management & Hooks

11. **Create AppContext**
    - Global state: relationships, interactions, nudges, isPremium
    - Actions: refresh data, toggle premium (for testing)
    - Provider wrapper in `app/_layout.tsx`

12. **Build custom hooks**
    - `useRelationships()`: CRUD operations with context updates
    - `useInteractions(relationshipId)`: Interaction history with refresh
    - `useNudges()`: Pending nudges with dismiss/snooze actions
    - `useRelationshipHealth(relationshipId)`: Real-time health calculation

### Phase 4: UI Components

13. **Build RelationshipCard**
    - Display: name, category badge, health indicator, days since contact
    - Actions: Quick log interaction, view details
    - Pressable navigation to detail screen
    - Accessibility labels

14. **Build HealthIndicator**
    - Visual: circular progress or color-coded bar
    - Props: score (0-100), size variant
    - Color mapping: green (80-100), yellow (50-79), red (0-49)
    - Animated transitions

15. **Build NudgeNotification**
    - Card layout with relationship name
    - Conversation starter suggestion
    - Action buttons: Call, Text, Log, Snooze, Dismiss
    - Swipe gestures for quick actions

16. **Build InteractionTimeline**
    - Chronological list of interactions
    - Each item: date, type icon, notes preview
    - Expandable for full notes
    - Edit/delete actions

17. **Build ConversationStarter**
    - Display suggested topic from last interaction
    - Refresh button for alternative suggestions
    - Copy to clipboard functionality

18. **Build ActivitySuggestion** (Premium)
    - Suggest activities based on relationship category
    - Show mutual friends for group activities
    - Calendar integration button

### Phase 5: Screens & Navigation

19. **Home/Dashboard (`app/(tabs)/index.tsx`)**
    - Today's nudges section (top priority)
    - Quick stats: relationships tracked, interactions this week
    - Upcoming reminders
    - Quick action: Log interaction
    - Premium upsell banner (if free tier)

20. **Relationships List (`app/(tabs)/relationships.tsx`)**
    - Filterable by category (All, Family, Friends, Professional)
    - Sortable by health, last contact, name
    - Search functionality
    - FloatingActionButton to add relationship
    - Pull to refresh

21. **Relationship Detail (`app/relationship/[id].tsx`)**
    - Header: name, category, edit button
    - Health indicator with explanation
    - Contact frequency setting
    - Quick actions: Call, Text, Schedule
    - Interaction timeline
    - Conversation starters
    - Delete relationship (with confirmation)

22. **Add Relationship (`app/relationship/add.tsx`)**
    - Import from contacts or manual entry
    - Fields: name, category, frequency, importance, notes
    - Optional: birthday, photo
    - Save button with validation

23. **Log Interaction (`app/interaction/log.tsx`)**
    - Select relationship (if not pre-selected)
    - Interaction type: Call, Text, In-person, Video, Other
    - Notes field with suggestions
    - Date/time picker (defaults to now)
    - Save button

24. **Insights (`app/(tabs)/insights.tsx`)** (Premium)
    - Monthly interaction chart
    - Relationship balance pie chart
    - Top 5 most contacted
    - Neglected relationships alert
    - Streak achievements
    - Export data button

25. **Settings (`app/(tabs)/settings.tsx`)**
    - Notification preferences (quiet hours, frequency)
    - Premium subscription management
    - Contact import/sync
    - Data export
    - About/Help
    - Privacy policy

### Phase 6: Notifications & Background Tasks

26. **Set up notification system**
    - Request permissions on first launch
    - Schedule daily nudge check (morning time)
    - Local notifications for overdue relationships
    - Handle notification taps (deep link to relationship)

27. **Implement contact import**
    - Request contacts permission
    - Parse phone contacts
    - Match with existing relationships
    - Bulk import flow with category assignment

### Phase 7: Premium Features & Monetization

28. **Implement subscription logic**
    - Free tier enforcement (max 5 relationships)
    - Premium feature gates (insights, unlimited relationships)
    - Mock subscription for testing (toggle in settings)
    - Paywall screens with benefits
    - (Note: Actual payment integration would use expo-in-app-purchases, but mock for MVP)

29. **Build premium upsell flows**
    - Contextual prompts when hitting limits
    - Feature discovery modals
    - Testimonials/social proof
    - Free trial offer (7 days)

### Phase 8: Polish & Optimization

30. **Add loading states**
    - Skeleton screens for lists
    - Spinners for async operations
    - Optimistic updates for interactions

31. **Error handling**
    - Try-catch blocks in all services
    - User-friendly error messages
    - Retry mechanisms for failed operations
    - Offline support (queue interactions)

32. **Accessibility**
    - Screen reader labels
    - Sufficient color contrast
    - Touch target sizes (44x44 minimum)
    - Keyboard navigation support

33. **Performance optimization**
    - Memoize expensive calculations
    - Virtualized lists for large datasets
    - Debounce search inputs
    - Lazy load screens

34. **Onboarding flow**
    - Welcome screens explaining value
    - Permission requests with context
    - Import contacts or add manually
    - Set up first 3 relationships
    - Schedule first nudge

### Phase 9: Testing

35. **Write unit tests**
    - All service functions (relationshipService, interactionService, nudgeService, insightService)
    - Utility functions (dateHelpers, relationshipHelpers)
    - Achieve 80%+ code coverage

36. **Write component tests**
    - RelationshipCard rendering and interactions
    - HealthIndicator visual states
    - NudgeNotification actions
    - InteractionTimeline display

37. **Manual testing checklist**
    - Add/edit/delete relationships
    - Log interactions across all types
    - Verify nudge generation logic
    - Test notification delivery
    - Check premium feature gates
    - Import contacts
    - Test on iOS and Android
    - Verify offline behavior

### Phase 10: Launch Preparation

38. **Configure app.json**
    - App name, slug, version
    - Icons and splash screen
    - Permissions (notifications, contacts)
    - iOS bundle identifier
    - Android package name

39. **Create app assets**
    - App icon (1024x1024)
    - Splash screen
    - Screenshots for App Store/Play Store
    - Promotional graphics

40. **Documentation**
    - README with setup instructions
    - User guide for key features
    - Privacy policy
    - Terms of service

## 11. How to Verify It Works

### Development Testing

1. **Start the development server**
   ```bash
   npx expo start
   ```

2. **Test on iOS Simulator**
   ```bash
   npx expo start --ios
   ```
   - Add 3-5 test relationships with different categories
   - Log interactions with various dates
   - Verify health indicators update correctly
   - Check that nudges appear for overdue relationships
   - Test notification scheduling (may need to advance system time)

3. **Test on Android Emulator**
   ```bash
   npx expo start --android
   ```
   - Repeat iOS tests
   - Verify Material Design components render correctly
   - Test back button navigation

4. **Test on Physical Device (Expo Go)**
   - Scan QR code from Expo Dev Tools
   - Test contact import with real contacts
   - Verify notifications appear on lock screen
   - Test offline behavior (airplane mode)
   - Check performance with 20+ relationships

### Automated Testing

5. **Run test suite**
   ```bash
   npm test
   ```
   - All tests must pass
   - Coverage should be 80%+ for services and utils
   - No console errors or warnings

6. **Run tests in watch mode during development**
   ```bash
   npm test -- --watch
   ```

### Feature Verification Checklist

**Relationship Management:**
- [ ] Can add relationship with all fields
- [ ] Can edit relationship details
- [ ] Can delete relationship (with confirmation)
- [ ] Health indicator shows correct color based on last contact
- [ ] Relationships filter by category
- [ ] Search finds relationships by name

**Interaction Logging:**
- [ ] Can log interaction from multiple entry points
- [ ] Interaction appears in timeline immediately
- [ ] Health indicator updates after logging
- [ ] Can edit/delete past interactions
- [ ] Notes save correctly

**Nudges:**
- [ ] Nudges generate for relationships past due date
- [ ] Conversation starters pull from last interaction notes
- [ ] Can dismiss nudge
- [ ] Can snooze nudge (reschedules)
- [ ] Nudges don't appear for recently contacted people

**Notifications:**
- [ ] Permission request appears on first launch
- [ ] Notifications deliver at scheduled time
- [ ] Tapping notification opens correct relationship
- [ ] Quiet hours respected

**Premium Features:**
- [ ] Free tier limited to 5 relationships
- [ ] Insights screen shows paywall for free users
- [ ] Premium toggle (mock) unlocks all features
- [ ] Analytics calculate correctly

**Data Persistence:**
- [ ] Data survives app restart
- [ ] Database migrations run without errors
- [ ] No data loss on updates

### Performance Benchmarks

- App launch: < 2 seconds
- Relationship list render: < 500ms for 50 items
- Interaction logging: < 200ms
- Nudge generation: < 1 second for 100 relationships
- Database queries: < 100ms average

### Acceptance Criteria

The app is ready for beta testing when:
1. All automated tests pass
2. No crashes during 30-minute usage session
3. Core user flow works end-to-end: Add relationship → Log interaction → Receive nudge → Log follow-up
4. Works on both iOS and Android
5. Notifications deliver reliably
6. Data persists across app restarts
7. Premium features properly gated
8. No accessibility violations in core flows