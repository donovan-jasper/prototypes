# BridgeGen

## One-line pitch
Connect across generations for meaningful friendships, mentorship, and support—right from your phone.

## Expanded vision

### Who is this REALLY for?

**Primary audiences:**
- Isolated seniors seeking companionship and purpose through mentoring younger people
- Young adults (18-35) craving guidance, life advice, or a parental figure they lack
- Empty nesters wanting to stay relevant and share their wisdom
- International students far from family needing local cultural guidance
- Career changers seeking mentors outside their immediate network
- Retirees with specific skills (cooking, languages, crafts) wanting to teach

**Broadest audience:** Anyone experiencing social isolation or seeking intergenerational connection—a problem affecting 60+ million Americans across all age groups.

**Adjacent use cases:**
- Language exchange between native speakers of different generations
- Skill-sharing marketplace (seniors teaching traditional crafts, cooking, gardening)
- Oral history preservation (recording life stories from elders)
- Local community building (neighborhood connections across age groups)
- Grief support (connecting those who've lost parents/children)
- Cultural bridge for immigrant families (connecting elders with heritage language speakers)

**Why non-technical people want this:**
- Combats loneliness with real human connection, not algorithms
- Provides structure and safety for meeting new people (unlike random social apps)
- Gives purpose to both parties (mentors feel valued, mentees get guidance)
- Replaces expensive therapy or life coaching with authentic relationships
- Creates accountability partnerships for goals and habits

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **Local storage:** SQLite (expo-sqlite)
- **Authentication:** Expo SecureStore + JWT
- **Real-time:** WebSocket (native WebSocket API)
- **Video/Audio:** expo-av for basic calls (MVP), WebRTC for production
- **Location:** expo-location
- **Push notifications:** expo-notifications
- **Image handling:** expo-image-picker
- **State management:** React Context (keep it simple)
- **Testing:** Jest + React Native Testing Library
- **Backend assumption:** REST API (implementation not included, mock for MVP)

## Core features

1. **Smart Matching Algorithm**
   - Profile creation with interests, availability, and connection goals
   - Location-based suggestions (within 25 miles for potential in-person meetups)
   - Compatibility scoring based on shared interests and complementary needs
   - Safety vetting: ID verification, background check integration hooks

2. **Guided Conversation Starters**
   - Pre-built conversation prompts tailored to match type (mentorship, friendship, skill-sharing)
   - Icebreaker questions that evolve as relationship deepens
   - Activity suggestions (virtual coffee, book club, skill lesson)
   - Reduces awkwardness for both parties, especially seniors new to apps

3. **Scheduled Check-ins with Reminders**
   - Calendar integration for regular meetup scheduling
   - Push notifications for upcoming calls/meetings
   - Streak tracking to build habit and accountability
   - Emergency contact alerts if check-ins are missed (safety feature for elderly)

4. **In-app Audio/Video Calls**
   - One-tap calling without leaving the app
   - Call recording option (with consent) for memory preservation
   - Caregiver monitoring mode (optional transparency for family members)
   - Low-bandwidth mode for seniors with poor connectivity

5. **Community Circles**
   - Group activities (virtual game nights, storytelling sessions, skill workshops)
   - Public events feed (local senior centers, community meetups)
   - Shared photo albums and memory books
   - Drives retention through network effects

## Monetization strategy

**Free tier (the hook):**
- Create profile and browse matches
- 3 connection requests per month
- Text chat only
- Basic conversation starters
- Community event browsing

**Premium ($7.99/month or $59.99/year — 37% savings):**
- Unlimited connection requests
- Audio/video calls (up to 2 hours per call)
- Advanced matching filters (distance, specific interests, availability)
- Priority matching (appear first in search results)
- Conversation starter library (100+ prompts)
- Schedule recurring check-ins
- Call recording and transcription
- Ad-free experience

**Why $7.99?**
- Lower than therapy ($100+/session) or life coaching ($50+/session)
- Comparable to streaming services (familiar price point)
- Affordable for fixed-income seniors
- High enough to filter out non-serious users (safety benefit)

**What makes people STAY subscribed:**
- Emotional investment in existing connections (sunk cost)
- Scheduled recurring calls create habit loop
- Fear of losing access to their "adopted grandparent/grandchild"
- Community circles create network lock-in
- Premium features become essential after first video call

**Additional revenue streams (future):**
- Enterprise partnerships with senior living facilities ($500-2000/month per facility)
- Sponsored skill workshops from brands (cooking, crafts)
- Affiliate commissions on recommended products (books, games)

## File structure

```
bridgegen/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Matches
│   │   ├── connections.tsx        # Active connections
│   │   ├── community.tsx          # Community circles
│   │   └── profile.tsx            # User profile
│   ├── match/[id].tsx             # Match detail
│   ├── call/[connectionId].tsx    # Video/audio call
│   └── _layout.tsx
├── components/
│   ├── MatchCard.tsx
│   ├── ConversationStarter.tsx
│   ├── CheckInReminder.tsx
│   ├── CallControls.tsx
│   └── SafetyBadge.tsx
├── services/
│   ├── database.ts                # SQLite setup
│   ├── matching.ts                # Matching algorithm
│   ├── auth.ts                    # Authentication
│   ├── notifications.ts           # Push notifications
│   └── api.ts                     # Backend API calls
├── hooks/
│   ├── useMatches.ts
│   ├── useConnections.ts
│   ├── useLocation.ts
│   └── useCallState.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── ConnectionContext.tsx
├── utils/
│   ├── compatibility.ts           # Matching score calculation
│   ├── validation.ts
│   └── constants.ts
├── __tests__/
│   ├── services/
│   │   ├── matching.test.ts
│   │   └── database.test.ts
│   ├── utils/
│   │   └── compatibility.test.ts
│   └── components/
│       └── MatchCard.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/utils/compatibility.test.ts`
```typescript
import { calculateCompatibilityScore, findCommonInterests } from '../../utils/compatibility';

describe('Compatibility Algorithm', () => {
  test('calculates high score for matching interests', () => {
    const user1 = { interests: ['cooking', 'gardening', 'reading'], age: 70 };
    const user2 = { interests: ['cooking', 'reading', 'hiking'], age: 25 };
    const score = calculateCompatibilityScore(user1, user2);
    expect(score).toBeGreaterThan(60);
  });

  test('finds common interests correctly', () => {
    const interests1 = ['cooking', 'gardening', 'reading'];
    const interests2 = ['cooking', 'reading', 'hiking'];
    const common = findCommonInterests(interests1, interests2);
    expect(common).toEqual(['cooking', 'reading']);
  });

  test('returns low score for no common interests', () => {
    const user1 = { interests: ['cooking'], age: 70 };
    const user2 = { interests: ['gaming'], age: 25 };
    const score = calculateCompatibilityScore(user1, user2);
    expect(score).toBeLessThan(30);
  });
});
```

### `__tests__/services/matching.test.ts`
```typescript
import { getMatchSuggestions, filterByDistance } from '../../services/matching';

describe('Matching Service', () => {
  const mockUsers = [
    { id: '1', lat: 40.7128, lon: -74.0060, interests: ['cooking'] },
    { id: '2', lat: 40.7580, lon: -73.9855, interests: ['reading'] },
    { id: '3', lat: 34.0522, lon: -118.2437, interests: ['cooking'] },
  ];

  test('filters users by distance', () => {
    const userLocation = { lat: 40.7128, lon: -74.0060 };
    const nearby = filterByDistance(mockUsers, userLocation, 25);
    expect(nearby.length).toBe(2);
    expect(nearby.find(u => u.id === '3')).toBeUndefined();
  });

  test('returns matches sorted by compatibility', () => {
    const currentUser = { interests: ['cooking', 'gardening'], age: 25 };
    const matches = getMatchSuggestions(currentUser, mockUsers);
    expect(matches[0].id).toBe('1'); // Best match
  });
});
```

### `__tests__/services/database.test.ts`
```typescript
import { initDatabase, saveConnection, getConnections } from '../../services/database';

describe('Database Service', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  test('saves and retrieves connections', async () => {
    const connection = {
      id: 'conn1',
      userId: 'user1',
      matchId: 'user2',
      status: 'active',
      createdAt: Date.now(),
    };
    
    await saveConnection(connection);
    const connections = await getConnections('user1');
    
    expect(connections.length).toBe(1);
    expect(connections[0].matchId).toBe('user2');
  });
});
```

### `__tests__/components/MatchCard.test.tsx`
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MatchCard from '../../components/MatchCard';

describe('MatchCard Component', () => {
  const mockMatch = {
    id: '1',
    name: 'Margaret Smith',
    age: 72,
    interests: ['cooking', 'gardening'],
    distance: 5.2,
    compatibilityScore: 85,
  };

  test('renders match information correctly', () => {
    const { getByText } = render(<MatchCard match={mockMatch} onPress={() => {}} />);
    expect(getByText('Margaret Smith')).toBeTruthy();
    expect(getByText('72')).toBeTruthy();
    expect(getByText('5.2 miles away')).toBeTruthy();
  });

  test('calls onPress when card is tapped', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<MatchCard match={mockMatch} onPress={onPressMock} />);
    fireEvent.press(getByTestId('match-card'));
    expect(onPressMock).toHaveBeenCalledWith(mockMatch);
  });
});
```

## Implementation steps

### Phase 1: Project Setup
1. Initialize Expo project: `npx create-expo-app bridgegen --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-router expo-sqlite expo-location expo-notifications expo-av expo-image-picker expo-secure-store
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json` with permissions (location, camera, microphone, notifications)
4. Set up TypeScript strict mode in `tsconfig.json`
5. Configure Jest in `jest.config.js`

### Phase 2: Database & Core Services
1. Create `services/database.ts`:
   - Initialize SQLite with tables: users, connections, messages, check_ins
   - Implement CRUD operations for each table
   - Add migration system for schema updates

2. Create `services/auth.ts`:
   - Mock JWT authentication (store token in SecureStore)
   - User registration/login functions
   - Token refresh logic

3. Create `services/api.ts`:
   - HTTP client wrapper with auth headers
   - Mock API responses for MVP (replace with real backend later)
   - Error handling and retry logic

### Phase 3: Matching Algorithm
1. Create `utils/compatibility.ts`:
   - `calculateCompatibilityScore(user1, user2)`: Returns 0-100 score based on:
     - Shared interests (40% weight)
     - Age gap appropriateness (20% weight)
     - Availability overlap (20% weight)
     - Connection goals alignment (20% weight)
   - `findCommonInterests(interests1, interests2)`: Returns array of shared interests

2. Create `services/matching.ts`:
   - `getMatchSuggestions(currentUser, allUsers, limit)`: Returns top N matches
   - `filterByDistance(users, location, maxMiles)`: Uses Haversine formula
   - `applyUserPreferences(matches, preferences)`: Filter by age range, gender, etc.

3. Write tests for matching logic (see Tests section)

### Phase 4: Authentication Flow
1. Create `app/(auth)/signup.tsx`:
   - Multi-step form: basic info → interests → availability → photo
   - Age verification (must be 18+ or 65+)
   - Terms of service acceptance
   - Store user data in SQLite and SecureStore

2. Create `app/(auth)/login.tsx`:
   - Email/password form
   - "Forgot password" flow
   - Biometric login option (future enhancement)

3. Create `app/(auth)/onboarding.tsx`:
   - Tutorial slides explaining app features
   - Permission requests (location, notifications)
   - Safety guidelines and community rules

4. Create `contexts/AuthContext.tsx`:
   - Manage auth state globally
   - Provide login/logout/signup functions
   - Auto-refresh tokens

### Phase 5: Home & Matching UI
1. Create `app/(tabs)/index.tsx` (Home/Matches):
   - Fetch match suggestions on mount
   - Display MatchCard components in FlatList
   - Pull-to-refresh functionality
   - Empty state for no matches

2. Create `components/MatchCard.tsx`:
   - Display profile photo, name, age, distance
   - Show compatibility score as percentage
   - List 3 common interests
   - "Connect" button (opens match detail)

3. Create `app/match/[id].tsx` (Match Detail):
   - Full profile view with bio, interests, availability
   - Photo gallery
   - "Send Connection Request" button
   - Safety reporting option

4. Create `hooks/useMatches.ts`:
   - Fetch matches from API/database
   - Cache results locally
   - Handle loading/error states

### Phase 6: Connections & Messaging
1. Create `app/(tabs)/connections.tsx`:
   - List of active connections (accepted requests)
   - Show last message preview and timestamp
   - Unread message badges
   - Swipe actions (archive, block)

2. Create chat screen (add to app structure):
   - Real-time messaging UI
   - Message bubbles with timestamps
   - "Start Video Call" button
   - Conversation starter suggestions

3. Create `components/ConversationStarter.tsx`:
   - Display random prompt from library
   - Categories: getting to know you, deep questions, fun activities
   - "Shuffle" button for new prompt
   - Premium badge for locked prompts

4. Create `hooks/useConnections.ts`:
   - Fetch user's connections
   - Subscribe to new messages (WebSocket)
   - Update unread counts

### Phase 7: Check-ins & Reminders
1. Create `services/notifications.ts`:
   - Request notification permissions
   - Schedule recurring check-in reminders
   - Send push when match accepts request
   - Emergency alert if check-in missed (premium feature)

2. Create `components/CheckInReminder.tsx`:
   - Display next scheduled check-in
   - "Mark as Complete" button
   - Streak counter (gamification)
   - Reschedule option

3. Add check-in scheduling to connection detail screen:
   - Calendar picker for recurring schedule
   - Frequency options (daily, weekly, bi-weekly)
   - Time zone handling

### Phase 8: Audio/Video Calls
1. Create `app/call/[connectionId].tsx`:
   - Initialize expo-av for audio/video
   - Display local and remote video streams
   - Call controls (mute, video toggle, end call)
   - Call timer and quality indicator

2. Create `components/CallControls.tsx`:
   - Mute/unmute button
   - Camera on/off toggle
   - Switch camera (front/back)
   - End call button
   - Record button (premium, with consent UI)

3. Create `hooks/useCallState.ts`:
   - Manage call connection state
   - Handle permissions (camera, microphone)
   - Track call duration for billing

4. Implement call signaling:
   - WebSocket connection for call initiation
   - Send/receive call invitations
   - Handle accept/reject/busy states

### Phase 9: Community Circles
1. Create `app/(tabs)/community.tsx`:
   - List of public group activities
   - Filter by category (games, storytelling, skills)
   - "Create Circle" button (premium)
   - RSVP functionality

2. Create group activity detail screen:
   - Event description and schedule
   - Participant list with avatars
   - Join/leave buttons
   - Chat room for participants

3. Implement group video calls:
   - Support up to 6 participants (MVP)
   - Grid layout for video streams
   - Raise hand feature
   - Screen sharing (future)

### Phase 10: Profile & Settings
1. Create `app/(tabs)/profile.tsx`:
   - Display user's own profile
   - Edit profile button
   - Subscription status and upgrade CTA
   - Settings navigation

2. Create profile edit screen:
   - Update photo, bio, interests
   - Change availability schedule
   - Privacy settings (who can see profile)
   - Account deletion option

3. Create settings screen:
   - Notification preferences
   - Blocked users list
   - Safety resources and reporting
   - Logout button

### Phase 11: Monetization & Paywall
1. Create subscription screen:
   - Feature comparison table (free vs premium)
   - Pricing options (monthly/annual)
   - Mock payment integration (use Expo In-App Purchases in production)
   - Restore purchases button

2. Implement paywall logic:
   - Check subscription status before premium features
   - Show upgrade prompt when hitting free tier limits
   - Track feature usage (connection requests, call minutes)

3. Add premium badges throughout app:
   - Lock icons on premium features
   - "Upgrade to Premium" CTAs
   - Success stories from premium users

### Phase 12: Safety & Moderation
1. Create `components/SafetyBadge.tsx`:
   - Display verification status (ID verified, background check)
   - Trust score based on user behavior
   - Report button

2. Implement reporting system:
   - Report user modal with reason selection
   - Block user functionality
   - Store reports in database for review

3. Add safety guidelines:
   - First-time user tutorial on safe interactions
   - In-app safety tips
   - Emergency contact setup

### Phase 13: Testing & Polish
1. Write all unit tests (see Tests section)
2. Run `npm test` and ensure 100% pass rate
3. Test on iOS simulator and Android emulator
4. Test on physical devices via Expo Go
5. Fix any UI/UX issues found during testing
6. Optimize performance (lazy loading, image caching)
7. Add loading skeletons and error boundaries
8. Implement analytics tracking (mock for MVP)

### Phase 14: Documentation & Deployment
1. Write README with setup instructions
2. Document API endpoints (for backend team)
3. Create user guide for app features
4. Build production bundles: `eas build --platform all`
5. Submit to App Store and Google Play (requires developer accounts)

## How to verify it works

### Local Development
1. Install dependencies: `npm install`
2. Start Expo dev server: `npx expo start`
3. Scan QR code with Expo Go app (iOS/Android)
4. Test core flows:
   - Sign up with mock credentials
   - Browse match suggestions (should show mock data)
   - Send connection request
   - Navigate to connections tab
   - Start a mock video call
   - Schedule a check-in reminder
   - Browse community circles
   - Upgrade to premium (mock payment)

### Automated Tests
1. Run test suite: `npm test`
2. Verify all tests pass:
   - Compatibility algorithm tests
   - Matching service tests
   - Database CRUD tests
   - Component rendering tests
3. Check test coverage: `npm test -- --coverage` (aim for >80%)

### Manual Testing Checklist
- [ ] App launches without crashes
- [ ] Onboarding flow completes successfully
- [ ] Match cards display correctly with photos and info
- [ ] Connection requests can be sent and accepted
- [ ] Push notifications appear for new messages
- [ ] Video call connects and displays video streams
- [ ] Check-in reminders schedule correctly
- [ ] Community circles load and allow RSVP
- [ ] Premium paywall blocks free users appropriately
- [ ] Profile editing saves changes
- [ ] Location permissions work correctly
- [ ] App works offline (cached data)
- [ ] No console errors or warnings

### Performance Benchmarks
- App launch time: <3 seconds
- Match list load time: <2 seconds
- Video call connection time: <5 seconds
- Smooth scrolling (60fps) on match list
- Image loading with progressive enhancement

### Accessibility Testing
- Test with VoiceOver (iOS) and TalkBack (Android)
- Verify all interactive elements have labels
- Check color contrast ratios (WCAG AA minimum)
- Test with large text sizes
- Ensure keyboard navigation works