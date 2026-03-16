# HobbyHub

## One-line pitch
Find your people and plan spontaneous hangouts around the hobbies you love—tonight, this weekend, or right now.

## Expanded vision

**Who is this REALLY for?**

This is for the 70% of adults who feel socially isolated despite living in cities. It's for:

- **The transplant** who moved for work and doesn't know anyone
- **The new parent** craving adult conversation beyond baby talk
- **The remote worker** who misses casual social interaction
- **The retiree** looking to stay active and engaged
- **The introvert** who wants structured, interest-based socializing (not bars/clubs)
- **The hobbyist** who's outgrown their current friend group's interests

**Broadest audience:** Anyone who wants to make friends as an adult without the awkwardness of dating apps or the commitment of formal clubs.

**Adjacent use cases:**
- Skill-sharing (teach guitar, learn pottery)
- Fitness accountability partners
- Language exchange meetups
- Pet owner playdates
- Volunteer coordination
- Professional networking (but casual)
- Travel buddy finding

**Why non-technical people want this:** Making friends as an adult is hard. This removes the friction—no need to commit to weekly meetings, no pressure to host, no awkward "we should hang out sometime" that never happens. Just "I'm playing board games at 7pm, 3 spots left."

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based)
- **State:** Zustand (lightweight, no boilerplate)
- **Database:** SQLite (expo-sqlite) for offline-first local data
- **Maps:** react-native-maps
- **Auth:** Expo SecureStore for tokens
- **Push notifications:** Expo Notifications
- **Location:** expo-location
- **Image handling:** expo-image-picker
- **Testing:** Jest + React Native Testing Library

Keep it lean—no Firebase, no heavy backend dependencies in MVP.

## Core features

1. **Instant Hangout Creation** — Tap "Create Hangout," pick your hobby, set time/place, done. Others nearby see it immediately. No event pages, no RSVPs—just "I'm going" or not.

2. **Proximity Feed** — See what's happening within 5 miles in the next 48 hours. Filter by hobby tags. Swipe to express interest, auto-match when groups hit capacity.

3. **Trust Scores** — Every attendee rates the hangout (not individuals). Consistent no-shows lose visibility. Hosts with high ratings get badges. This solves the flake problem.

4. **Hobby Profiles** — Your profile shows your top 5 interests with skill levels (beginner/intermediate/expert). People can find you for specific activities. No swiping, no DMs—just "join my next hike."

5. **Neighborhood Circles** — Auto-join your local area's feed. See recurring groups (Tuesday night trivia crew, Saturday morning runners). One-tap to join their next event.

## Monetization strategy

**Free tier:**
- Create/join up to 3 hangouts per month
- See events within 5 miles
- Basic profile with 3 hobby tags
- Standard trust score visibility

**Premium ($4.99/month or $39.99/year):**
- Unlimited hangout creation/joining
- Expand radius to 25 miles
- 10 hobby tags + skill level badges
- See who's attending before you commit
- "Verified Local" badge (reduces no-shows)
- Priority placement in feeds
- Create private recurring groups

**Why $4.99?** Less than a single coffee meetup. Cheaper than Meetup ($15/month for organizers). The annual plan ($3.33/month) converts commitment-phobes.

**Retention hooks:**
- You've built a reputation (trust score)
- Your recurring groups depend on you
- You've found "your people" (sunk social cost)
- Premium users get 3x more matches (data-driven nudge)

**Additional revenue:**
- Local business sponsorships (coffee shops, game stores, gyms) pay to be "suggested venues"
- Affiliate commissions on hobby gear recommendations
- Premium group features for organizers ($9.99/month for groups >20 members)

## File structure

```
hobbyhub/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Proximity feed
│   │   ├── create.tsx             # Create hangout
│   │   ├── my-hangouts.tsx        # Your upcoming/past events
│   │   └── profile.tsx            # User profile & settings
│   ├── hangout/
│   │   └── [id].tsx               # Hangout detail view
│   ├── onboarding/
│   │   ├── location.tsx           # Request location permission
│   │   └── interests.tsx          # Select hobbies
│   ├── _layout.tsx                # Root layout
│   └── +not-found.tsx
├── components/
│   ├── HangoutCard.tsx
│   ├── HobbyTag.tsx
│   ├── TrustBadge.tsx
│   ├── ProximityMap.tsx
│   └── AttendeeList.tsx
├── lib/
│   ├── database.ts                # SQLite setup & migrations
│   ├── location.ts                # Geolocation utilities
│   ├── notifications.ts           # Push notification handlers
│   └── trust-score.ts             # Rating calculation logic
├── store/
│   ├── hangouts.ts                # Zustand store for hangouts
│   ├── user.ts                    # User profile & auth state
│   └── filters.ts                 # Feed filter preferences
├── types/
│   └── index.ts                   # TypeScript interfaces
├── __tests__/
│   ├── trust-score.test.ts
│   ├── location.test.ts
│   ├── database.test.ts
│   └── components/
│       ├── HangoutCard.test.tsx
│       └── HobbyTag.test.tsx
├── assets/
│   ├── images/
│   └── icons/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**lib/__tests__/trust-score.test.ts**
```typescript
import { calculateTrustScore, shouldReduceVisibility } from '../trust-score';

describe('Trust Score System', () => {
  test('calculates score from attendance history', () => {
    const history = [
      { attended: true, rating: 5 },
      { attended: true, rating: 4 },
      { attended: false, rating: 0 },
    ];
    expect(calculateTrustScore(history)).toBe(75); // 2/3 attendance, avg 4.5 rating
  });

  test('reduces visibility after 3 consecutive no-shows', () => {
    const history = [
      { attended: false, rating: 0 },
      { attended: false, rating: 0 },
      { attended: false, rating: 0 },
    ];
    expect(shouldReduceVisibility(history)).toBe(true);
  });
});
```

**lib/__tests__/location.test.ts**
```typescript
import { calculateDistance, isWithinRadius } from '../location';

describe('Location Utilities', () => {
  test('calculates distance between two coordinates', () => {
    const pointA = { latitude: 40.7128, longitude: -74.0060 }; // NYC
    const pointB = { latitude: 34.0522, longitude: -118.2437 }; // LA
    const distance = calculateDistance(pointA, pointB);
    expect(distance).toBeGreaterThan(3900); // ~3944 km
  });

  test('checks if location is within radius', () => {
    const center = { latitude: 40.7128, longitude: -74.0060 };
    const nearby = { latitude: 40.7580, longitude: -73.9855 }; // ~5km away
    expect(isWithinRadius(center, nearby, 10)).toBe(true);
    expect(isWithinRadius(center, nearby, 3)).toBe(false);
  });
});
```

**lib/__tests__/database.test.ts**
```typescript
import { initDatabase, createHangout, getHangoutsNearby } from '../database';

describe('Database Operations', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('creates and retrieves hangout', async () => {
    const hangout = {
      title: 'Board Game Night',
      hobby: 'board-games',
      latitude: 40.7128,
      longitude: -74.0060,
      startTime: new Date().toISOString(),
      maxAttendees: 6,
    };
    
    const id = await createHangout(hangout);
    const nearby = await getHangoutsNearby(40.7128, -74.0060, 5);
    
    expect(nearby.find(h => h.id === id)).toBeDefined();
  });
});
```

**components/__tests__/HangoutCard.test.tsx**
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import HangoutCard from '../HangoutCard';

describe('HangoutCard', () => {
  const mockHangout = {
    id: '1',
    title: 'Morning Yoga',
    hobby: 'fitness',
    distance: 2.3,
    startTime: new Date().toISOString(),
    attendees: 3,
    maxAttendees: 8,
  };

  test('renders hangout details', () => {
    const { getByText } = render(<HangoutCard hangout={mockHangout} />);
    expect(getByText('Morning Yoga')).toBeTruthy();
    expect(getByText('2.3 mi away')).toBeTruthy();
  });

  test('calls onJoin when pressed', () => {
    const onJoin = jest.fn();
    const { getByText } = render(<HangoutCard hangout={mockHangout} onJoin={onJoin} />);
    fireEvent.press(getByText('Join'));
    expect(onJoin).toHaveBeenCalledWith('1');
  });
});
```

## Implementation steps

### Phase 1: Project Setup
1. Initialize Expo project: `npx create-expo-app hobbyhub --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-router expo-sqlite expo-location expo-notifications
   npx expo install react-native-maps expo-image-picker expo-secure-store
   npm install zustand @react-native-async-storage/async-storage
   npm install -D jest @testing-library/react-native @types/jest
   ```
3. Configure `app.json` with location permissions and notification settings
4. Set up TypeScript types in `types/index.ts`

### Phase 2: Database Layer
1. Create `lib/database.ts` with SQLite initialization
2. Define schema:
   - `users` table (id, name, location, trust_score, premium_status)
   - `hangouts` table (id, creator_id, title, hobby, lat, lng, start_time, max_attendees)
   - `attendees` table (hangout_id, user_id, status, rating)
   - `hobbies` table (id, name, icon, category)
3. Write migration functions for schema updates
4. Implement CRUD operations with proper error handling
5. Add indexes on lat/lng for proximity queries

### Phase 3: Location Services
1. Create `lib/location.ts` with permission request flow
2. Implement Haversine formula for distance calculation
3. Build proximity query function (SQLite spatial query)
4. Add background location updates (for "nearby now" feature)
5. Handle location permission denial gracefully

### Phase 4: Core UI Components
1. Build `HangoutCard.tsx` with distance, time, attendee count
2. Create `HobbyTag.tsx` with icon + label (use emoji for MVP)
3. Implement `TrustBadge.tsx` with color-coded score display
4. Build `ProximityMap.tsx` with react-native-maps showing pins
5. Create `AttendeeList.tsx` with avatar grid

### Phase 5: Onboarding Flow
1. Build `app/onboarding/location.tsx` with permission request
2. Create `app/onboarding/interests.tsx` with multi-select hobby picker
3. Add skip option (but nudge for better matches)
4. Store selections in SQLite and Zustand
5. Navigate to main feed after completion

### Phase 6: Main Feed
1. Implement `app/(tabs)/index.tsx` proximity feed
2. Query hangouts within user's radius (default 5 mi)
3. Sort by distance + start time
4. Add pull-to-refresh
5. Implement filter chips (hobby, time, distance)
6. Show empty state with "Create first hangout" CTA

### Phase 7: Hangout Creation
1. Build `app/(tabs)/create.tsx` form
2. Fields: title, hobby (dropdown), date/time picker, location (map or address), max attendees
3. Validate all fields before submission
4. Insert into database with creator's user_id
5. Show success modal with share option
6. Navigate to hangout detail view

### Phase 8: Hangout Detail
1. Create `app/hangout/[id].tsx` dynamic route
2. Show full details: description, map, attendee list, host profile
3. Add "Join" button (check capacity)
4. Implement "Leave" functionality
5. Show chat preview (stub for MVP, just "Chat coming soon")
6. Add "Report" option in menu

### Phase 9: Trust Score System
1. Implement `lib/trust-score.ts` calculation logic
2. After hangout ends, prompt attendees to rate (1-5 stars)
3. Calculate score: (attendance rate × 0.6) + (avg rating × 0.4)
4. Update user's trust_score in database
5. Reduce feed visibility if score < 50

### Phase 10: User Profile
1. Build `app/(tabs)/profile.tsx`
2. Show trust score, hobby tags, joined hangouts count
3. Add edit profile (name, bio, hobbies)
4. Implement settings: notification preferences, radius, premium upgrade
5. Add logout functionality

### Phase 11: Notifications
1. Set up `lib/notifications.ts` with Expo Notifications
2. Send push when:
   - Someone joins your hangout
   - Hangout starts in 1 hour
   - New hangout matches your interests nearby
3. Handle notification taps (deep link to hangout detail)
4. Add notification permission request in onboarding

### Phase 12: Premium Features
1. Add paywall modal (triggered from profile or when hitting free tier limits)
2. Implement feature gating in Zustand store
3. Mock payment flow (use Expo's in-app purchases in production)
4. Show "Upgrade to Premium" badges on locked features
5. Add premium badge to user profiles

### Phase 13: Polish & Testing
1. Add loading states (skeletons for feed)
2. Implement error boundaries
3. Add haptic feedback on key actions
4. Test on iOS and Android simulators
5. Run `npm test` and ensure all tests pass
6. Test offline mode (SQLite should work, show cached data)

### Phase 14: Deployment Prep
1. Configure EAS Build: `npx eas build:configure`
2. Set up environment variables (API keys if needed)
3. Create app icons and splash screen
4. Write App Store description and screenshots
5. Submit for TestFlight/Google Play internal testing

## How to verify it works

### Local Development
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Grant location permissions when prompted
4. Complete onboarding (select 3+ hobbies)
5. Verify feed shows sample hangouts (seed database with test data)
6. Create a new hangout and confirm it appears in feed
7. Join a hangout and verify attendee count updates
8. Check profile shows correct trust score (default 100 for new users)

### Testing
1. Run unit tests: `npm test`
2. All tests in `__tests__/` must pass
3. Check coverage: `npm test -- --coverage` (aim for >70%)

### Simulator Testing
1. iOS: `npx expo run:ios`
2. Android: `npx expo run:android`
3. Test location simulation (Xcode: Debug > Simulate Location)
4. Verify maps render correctly
5. Test push notifications (use Expo push notification tool)

### Manual QA Checklist
- [ ] Can create hangout with all fields
- [ ] Feed updates in real-time when new hangout added
- [ ] Distance calculation is accurate (compare with Google Maps)
- [ ] Trust score decreases after no-show
- [ ] Premium features are locked for free users
- [ ] Offline mode shows cached data
- [ ] App doesn't crash on permission denial
- [ ] Notifications arrive within 30 seconds
- [ ] Profile edits persist after app restart