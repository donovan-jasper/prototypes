# GrandPal Connect Spec

## 1. App Name

**BridgeCircle**

## 2. One-Line Pitch

Connect with mentors and friends across generations—share stories, learn skills, and build meaningful relationships in a safe, moderated space.

## 3. Expanded Vision

### Who is this REALLY for?

**Primary Audiences:**
- **Isolated seniors** (65+) seeking purpose, social connection, and a way to share their life experience
- **Young professionals and parents** (25-40) craving mentorship, life advice, and authentic human connection beyond their peer group
- **Remote workers** feeling disconnected from community and seeking structured social interaction
- **Teens and young adults** (16-24) looking for career guidance, life skills mentorship, and intergenerational perspective

**Broadest Audience:**
Anyone experiencing social isolation or seeking meaningful connection outside their immediate age group. This includes:
- People who've relocated and lost their social network
- Caregivers needing respite and adult conversation
- Retirees wanting to stay mentally active and relevant
- Students seeking real-world advice beyond academic settings
- Immigrants wanting to learn cultural norms and language practice

**Adjacent Use Cases:**
- **Skill exchange marketplace**: Seniors teach traditional crafts, cooking, gardening; younger users teach tech, social media, modern career skills
- **Story preservation**: Families use it to record and preserve grandparents' life stories and wisdom
- **Language practice partners**: Cross-generational language exchange with native speakers
- **Hobby communities**: Knitting circles, book clubs, chess matches across age groups
- **Volunteer coordination**: Nonprofits and senior centers use it to organize virtual volunteering
- **Corporate mentorship programs**: Companies subscribe for employee development and DEI initiatives

**Why non-technical people want this:**
- Combats the loneliness epidemic with structured, safe interactions (no awkward cold-starts)
- Provides accountability and routine (scheduled check-ins feel like appointments, not obligations)
- Offers validation and purpose (especially for seniors who feel "invisible")
- Delivers practical value (learn skills, get advice) wrapped in emotional connection
- Feels safer than open social media (moderated, purpose-driven, age-verified)

## 4. Tech Stack

- **Framework**: React Native (Expo SDK 52+)
- **Navigation**: Expo Router (file-based routing)
- **Local Storage**: expo-sqlite for offline-first data persistence
- **Authentication**: expo-auth-session with JWT tokens
- **Real-time Communication**: expo-av for video/audio, WebRTC for peer connections
- **State Management**: React Context API + AsyncStorage
- **UI Components**: React Native Paper (Material Design)
- **Image Handling**: expo-image-picker, expo-media-library
- **Push Notifications**: expo-notifications
- **Testing**: Jest + React Native Testing Library
- **Backend (minimal)**: Node.js + Express for auth, matching algorithm, and moderation queue (not included in MVP, mock locally)

## 5. Core Features (MVP)

1. **Verified Profile Creation**
   - Age verification (ID upload or third-party service)
   - Interest tags (hobbies, skills to share/learn, availability)
   - Safety preferences (video-only, text-only, group sessions only)
   - Background check badge for premium users

2. **Smart Matching Algorithm**
   - Suggests connections based on shared interests, complementary skills, and availability
   - "Icebreaker prompts" to start conversations (e.g., "What's a life lesson you wish you'd learned earlier?")
   - Mutual opt-in required before any contact

3. **Moderated Communication Hub**
   - In-app video calls (recorded for safety, auto-deleted after 30 days unless flagged)
   - Text messaging with AI content moderation (flags inappropriate language)
   - Photo/video sharing with approval queue
   - "Panic button" to end session and report concerns

4. **Activity Scheduler**
   - Book recurring or one-time sessions (coffee chats, skill lessons, story time)
   - Calendar integration with reminders
   - Session templates (e.g., "Tech Help Hour," "Recipe Swap," "Career Advice")

5. **Trust & Safety Dashboard**
   - User ratings and reviews (visible only after 3+ completed sessions)
   - Report/block functionality with human moderator review
   - Community guidelines and safety tips
   - Emergency contact setup

## 6. Monetization Strategy

### Free Tier (Hook)
- Create profile and browse potential matches
- 2 video sessions per month (30 min each)
- Text messaging with daily limits (10 messages/day)
- Basic matching algorithm
- Access to public group sessions (max 10 participants)

### Premium Tier - $7.99/month (Paywall)
**Why this price?** Higher than typical social apps ($4.99) because it's a specialized service with moderation costs, but lower than therapy/coaching apps ($15+). Positions as "affordable human connection."

**Premium Features:**
- Unlimited video sessions
- Priority matching with verified users
- Private 1:1 sessions (vs. group-only for free)
- Advanced filters (location, specific skills, availability windows)
- Session recording downloads (for preserving stories)
- "Mentor Badge" for experienced users (unlocked after 20+ sessions)
- Ad-free experience
- Early access to new features

### Enterprise Tier - $199/month (B2B)
- Bulk licenses for schools, senior centers, corporate programs
- Admin dashboard for organizing group sessions
- Custom branding and white-label options
- Dedicated moderation support
- Analytics and engagement reports

### What Makes People STAY Subscribed?
- **Emotional investment**: After 3-4 sessions, users form genuine bonds and don't want to lose access
- **Routine dependency**: Scheduled weekly check-ins become part of their social routine
- **Skill progression**: Users mid-way through learning a skill (knitting, Spanish, coding) won't want to pause
- **Status/identity**: Premium badge signals commitment to the community
- **FOMO on features**: Free users hit message limits during engaging conversations, driving upgrades

## 7. Market Gap Analysis

**NOT SKIP** — Clear differentiation:

- **Skype/Zoom/Messenger**: Generic communication tools with no matching, moderation, or intergenerational focus
- **Bumble BFF/Meetup**: Peer-to-peer, same-age networking, not cross-generational
- **Care.com/Papa**: Transactional caregiving services, not mutual relationship-building
- **Replika/AI companions**: Artificial, not real human connection
- **Existing "GrandPal" apps**: Minimal traction, poor UX, no trust/safety infrastructure

**Our Gap**: First mobile-native platform combining algorithmic matching, built-in moderation, and structured activities specifically for intergenerational connection. No well-funded incumbent owns this niche.

## 8. File Structure

```
bridgecircle/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── verify-age.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Matches
│   │   ├── messages.tsx
│   │   ├── schedule.tsx
│   │   └── profile.tsx
│   ├── call/[sessionId].tsx
│   ├── match/[userId].tsx
│   └── _layout.tsx
├── components/
│   ├── MatchCard.tsx
│   ├── SessionScheduler.tsx
│   ├── VideoCall.tsx
│   ├── SafetyButton.tsx
│   └── MessageThread.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── matching.ts                # Matching algorithm
│   ├── auth.ts                    # Auth helpers
│   ├── moderation.ts              # Content filtering
│   └── types.ts                   # TypeScript types
├── hooks/
│   ├── useDatabase.ts
│   ├── useMatches.ts
│   ├── useMessages.ts
│   └── useAuth.ts
├── constants/
│   └── interests.ts               # Predefined interest tags
├── __tests__/
│   ├── matching.test.ts
│   ├── moderation.test.ts
│   ├── database.test.ts
│   └── components/
│       ├── MatchCard.test.tsx
│       └── SessionScheduler.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### Core Logic Tests

**`__tests__/matching.test.ts`**
- Test matching algorithm scores users correctly based on shared interests
- Test age gap preferences are respected
- Test availability overlap calculation
- Test mutual opt-in requirement

**`__tests__/moderation.test.ts`**
- Test inappropriate content flagging
- Test profanity filter
- Test contact information detection (phone numbers, emails)
- Test emergency keyword detection

**`__tests__/database.test.ts`**
- Test user profile CRUD operations
- Test message storage and retrieval
- Test session history tracking
- Test SQLite schema migrations

**`__tests__/components/MatchCard.test.tsx`**
- Test renders user profile correctly
- Test "Connect" button triggers opt-in flow
- Test displays shared interests
- Test premium badge visibility

**`__tests__/components/SessionScheduler.test.tsx`**
- Test date/time picker functionality
- Test recurring session setup
- Test calendar integration
- Test reminder notifications

## 10. Implementation Steps

### Phase 1: Project Setup
1. Initialize Expo project with TypeScript template:
   ```bash
   npx create-expo-app@latest bridgecircle --template tabs
   cd bridgecircle
   ```

2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-router expo-av expo-image-picker expo-notifications react-native-paper
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```

3. Configure `app.json`:
   - Set app name, slug, version
   - Add permissions: camera, microphone, notifications, media library
   - Configure splash screen and icon

4. Set up Jest in `jest.config.js`:
   ```js
   module.exports = {
     preset: 'jest-expo',
     transformIgnorePatterns: [
       'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
     ],
     setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect']
   };
   ```

### Phase 2: Database Layer
1. Create `lib/types.ts` with TypeScript interfaces:
   - User, Match, Message, Session, Interest types
   - Include fields: id, createdAt, status, metadata

2. Implement `lib/database.ts`:
   - Initialize SQLite database with schema
   - Create tables: users, matches, messages, sessions, interests
   - Write helper functions: insertUser, getMatches, saveMessage, etc.
   - Add migration logic for schema updates

3. Write `__tests__/database.test.ts`:
   - Test database initialization
   - Test CRUD operations for each table
   - Test foreign key constraints
   - Mock SQLite with in-memory database

### Phase 3: Authentication Flow
1. Create `lib/auth.ts`:
   - Mock JWT token generation/validation (replace with real backend later)
   - Store auth token in AsyncStorage
   - Implement logout and token refresh

2. Build `app/(auth)/signup.tsx`:
   - Form with name, email, password, date of birth
   - Age verification notice (18+ required)
   - Terms of service acceptance
   - Store user in SQLite on success

3. Build `app/(auth)/login.tsx`:
   - Email/password form
   - "Forgot password" link (mock for MVP)
   - Navigate to tabs on success

4. Build `app/(auth)/verify-age.tsx`:
   - Upload ID photo (expo-image-picker)
   - Display "Verification pending" message
   - Mock approval for MVP (auto-approve after 2 seconds)

### Phase 4: Matching System
1. Create `constants/interests.ts`:
   - Array of predefined interests: ["Cooking", "Gardening", "Technology", "History", "Music", etc.]
   - Categories: hobbies, skills to teach, skills to learn

2. Implement `lib/matching.ts`:
   - `calculateMatchScore(user1, user2)`: Score based on shared interests, age gap preference, availability
   - `getSuggestedMatches(userId)`: Return top 10 matches from database
   - `createMatch(userId1, userId2)`: Insert mutual match record

3. Write `__tests__/matching.test.ts`:
   - Test score calculation with various interest overlaps
   - Test age gap filtering (e.g., 20-year-old shouldn't match with 80-year-old if preference is ±15 years)
   - Test availability overlap (mock calendar data)

4. Build `components/MatchCard.tsx`:
   - Display user photo, name, age, interests
   - "Connect" button (triggers opt-in)
   - Premium badge if applicable
   - Shared interests highlighted

5. Build `app/(tabs)/index.tsx`:
   - Fetch suggested matches on load
   - Render list of MatchCard components
   - Pull-to-refresh functionality
   - Empty state: "No matches yet, update your interests!"

### Phase 5: Messaging & Communication
1. Implement `lib/moderation.ts`:
   - `filterMessage(text)`: Check for profanity, contact info, inappropriate content
   - Return { allowed: boolean, reason?: string }
   - Use simple regex patterns for MVP (upgrade to ML later)

2. Write `__tests__/moderation.test.ts`:
   - Test blocks messages with phone numbers
   - Test blocks messages with profanity
   - Test allows normal conversation
   - Test flags emergency keywords ("help", "unsafe")

3. Build `components/MessageThread.tsx`:
   - Chat UI with message bubbles
   - Text input with character counter (free tier limit)
   - Send button disabled if over limit or content flagged
   - Display moderation warnings

4. Build `app/(tabs)/messages.tsx`:
   - List of active conversations
   - Unread message badges
   - Tap to open MessageThread
   - Empty state: "Start a conversation with a match!"

5. Create `hooks/useMessages.ts`:
   - Fetch messages from SQLite
   - Send message (save to DB, run moderation)
   - Mark messages as read
   - Real-time updates (poll every 5 seconds for MVP)

### Phase 6: Video Calling
1. Build `components/VideoCall.tsx`:
   - Use expo-av for local video preview
   - Mock peer connection for MVP (display "Connecting..." then show local video only)
   - Mute/unmute, camera on/off buttons
   - End call button (red, prominent)

2. Build `components/SafetyButton.tsx`:
   - Red "End & Report" button overlay
   - Confirmation modal: "Are you sure? This will end the call and notify moderators."
   - Save report to database with timestamp

3. Build `app/call/[sessionId].tsx`:
   - Full-screen video call interface
   - Display peer name and session timer
   - SafetyButton in corner
   - Navigate back to schedule on end

### Phase 7: Session Scheduling
1. Build `components/SessionScheduler.tsx`:
   - Date picker (expo-date-time-picker)
   - Time slot selector (30 min, 1 hour, 2 hours)
   - Recurring option (weekly, biweekly)
   - Session type dropdown (Coffee Chat, Skill Lesson, Story Time)
   - Save to SQLite sessions table

2. Write `__tests__/components/SessionScheduler.test.tsx`:
   - Test date selection updates state
   - Test recurring sessions create multiple records
   - Test validates future dates only
   - Test premium users can schedule unlimited, free users limited to 2/month

3. Build `app/(tabs)/schedule.tsx`:
   - Calendar view of upcoming sessions
   - Tap date to see sessions that day
   - "Schedule New Session" button opens SessionScheduler modal
   - Cancel/reschedule options

4. Implement push notifications:
   - Request permission on first app launch
   - Schedule local notifications 15 min before sessions
   - Handle notification tap (navigate to call screen)

### Phase 8: Profile & Settings
1. Build `app/(tabs)/profile.tsx`:
   - Display user photo, name, age, bio
   - Edit button (opens edit modal)
   - Interest tags (editable)
   - Session stats: total sessions, hours connected, rating
   - Premium badge if subscribed
   - Settings button (logout, delete account, privacy policy)

2. Build `app/match/[userId].tsx`:
   - View another user's profile before connecting
   - Display shared interests prominently
   - "Send Connection Request" button
   - Reviews from other users (mock 4-5 star ratings for MVP)

### Phase 9: Premium Features & Paywall
1. Create `components/PaywallModal.tsx`:
   - Display when free user hits limits (3rd video call, 11th message)
   - List premium benefits with checkmarks
   - "Upgrade for $7.99/month" button
   - "Maybe Later" dismiss button

2. Mock subscription logic in `lib/auth.ts`:
   - Add `isPremium` boolean to user object
   - Check premium status before allowing actions
   - For MVP, add "Simulate Premium" toggle in profile settings

3. Add premium indicators throughout app:
   - Badge on profile
   - "Premium" label on match cards
   - Unlock icons on restricted features

### Phase 10: Testing & Polish
1. Run all tests:
   ```bash
   npm test
   ```
   - Fix any failing tests
   - Aim for >80% code coverage on core logic

2. Test on physical device:
   - Install Expo Go app
   - Scan QR code from `npx expo start`
   - Test all user flows: signup → match → message → schedule → call

3. Add error boundaries:
   - Wrap app in ErrorBoundary component
   - Display friendly error messages
   - Log errors to console for debugging

4. Optimize performance:
   - Use React.memo for MatchCard and MessageThread
   - Implement FlatList for long lists (matches, messages)
   - Lazy load images with expo-image

5. Accessibility:
   - Add accessibilityLabel to all buttons
   - Test with screen reader (TalkBack/VoiceOver)
   - Ensure color contrast meets WCAG AA standards

### Phase 11: Deployment Prep
1. Update `app.json`:
   - Set version to 1.0.0
   - Add app icon (1024x1024 PNG)
   - Add splash screen
   - Configure iOS bundle identifier and Android package name

2. Build for testing:
   ```bash
   npx eas build --profile preview --platform ios
   npx eas build --profile preview --platform android
   ```

3. Create App Store/Play Store assets:
   - Screenshots (5-8 per platform)
   - App description (use one-line pitch + expanded vision)
   - Privacy policy (required for age verification and video recording)

## 11. How to Verify It Works

### Local Development
1. Start Expo dev server:
   ```bash
   npx expo start
   ```

2. Test on iOS Simulator:
   - Press `i` in terminal
   - Or scan QR code with Expo Go on physical iPhone

3. Test on Android Emulator:
   - Press `a` in terminal
   - Or scan QR code with Expo Go on physical Android device

### Verification Checklist
- [ ] Run `npm test` — all tests pass
- [ ] Sign up with new account — profile created in SQLite
- [ ] Browse matches — see at least 5 suggested users (seed database with mock users)
- [ ] Send connection request — match record created
- [ ] Send message — appears in thread, moderation filters work
- [ ] Schedule session — appears in calendar, notification scheduled
- [ ] Start video call — camera preview loads, SafetyButton visible
- [ ] Hit free tier limit — PaywallModal appears
- [ ] Toggle premium in settings — limits removed
- [ ] Log out and log back in — session persists
- [ ] Test on both iOS and Android — UI renders correctly

### Performance Benchmarks
- App launch: <3 seconds on mid-range device
- Match list load: <1 second for 50 users
- Message send: <500ms round-trip
- Video call connect: <5 seconds (will improve with real WebRTC)

### Accessibility Testing
- Enable VoiceOver (iOS) or TalkBack (Android)
- Navigate through signup flow using only screen reader
- Verify all buttons and inputs are labeled
- Test color contrast with grayscale filter

---

**Ready to build?** Start with Phase 1 and work sequentially. Each phase builds on the previous, so don't skip ahead. The MVP should take 40-60 hours for an experienced React Native developer.