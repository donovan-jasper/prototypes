# LocalLoop

## One-line pitch
Meet neighbors doing what you love, right now — from pickup basketball to book clubs, all within walking distance.

## Expanded vision

**Who this is REALLY for:**

This isn't just for young professionals seeking friends. It's for:

- **Parents** who want their kids to play with neighborhood children without formal playdates
- **Retirees** seeking daily walking buddies or card game partners
- **Remote workers** craving human interaction during lunch breaks
- **Newcomers** to any city who need instant community integration
- **Hobbyists** tired of driving 30 minutes to find one other person who shares their niche interest
- **Small business owners** wanting foot traffic from hyper-local events
- **Fitness enthusiasts** seeking workout partners at odd hours
- **Pet owners** organizing dog park meetups

**Adjacent use cases:**

- Skill sharing (teach guitar, learn Spanish) in 15-minute micro-sessions
- Neighborhood watch coordination
- Carpool matching for school runs or commutes
- Tool/equipment lending circles
- Emergency help requests (jump start, moving a couch)
- Spontaneous childcare swaps between trusted neighbors

**Why non-technical people want this:**

It replaces awkward door-knocking and Facebook group spam with a simple "I'm doing X in 20 minutes, join me" button. No event planning overhead, no commitment anxiety, just real humans nearby doing real things right now.

## Tech stack

- **Framework:** React Native (Expo SDK 52)
- **Navigation:** Expo Router (file-based)
- **Local storage:** Expo SQLite
- **Maps:** react-native-maps (included in Expo)
- **Location:** expo-location
- **Notifications:** expo-notifications
- **State:** React Context + hooks (no Redux for MVP)
- **Auth:** expo-secure-store for tokens (mock auth for MVP)
- **Styling:** NativeWind (Tailwind for React Native)
- **Testing:** Jest + React Native Testing Library

## Core features

1. **Live Activity Feed** — See what's happening within 1 mile in the next 2 hours. Filter by category (sports, food, games, walks, creative). One-tap RSVP.

2. **Quick Post** — Create an activity in under 30 seconds: "Playing chess at Central Park, 6pm, need 1 person." Auto-fills location, time defaults to "now + 1 hour."

3. **Neighbor Profiles** — Minimal profiles showing interests, reliability score (based on show-up rate), and mutual connections. No DMs in MVP — only activity-specific chat.

4. **Radius Control** — Adjust discovery radius from 0.5 to 5 miles. Premium users unlock "notify me when X activity appears nearby."

5. **Safety Layer** — All activities are public locations only. Flag/report system. First-time meetups show "new organizer" badge.

## Monetization strategy

**Free tier:**
- Post 3 activities per week
- Join unlimited activities
- 1-mile radius only
- See ads between activity cards

**Premium ($4.99/month or $39.99/year):**
- Unlimited activity posts
- Up to 5-mile radius
- Custom activity alerts ("notify me when someone posts 'tennis' nearby")
- Ad-free
- "Verified Organizer" badge (shows you've hosted 10+ successful events)
- Early access to new categories

**Why people stay subscribed:**

The person who posts activities (the organizer) gets hooked first — they hit the 3-post limit within days if they're active. Once they pay, they've invested in their reputation (verified badge) and can't go back to limited posting without losing momentum. The network effect keeps them renewing: their regular attendees expect them to keep organizing.

**Price reasoning:**

$4.99 is impulse-buy territory (cheaper than one coffee), and the annual discount creates commitment. Comparable to Strava ($5/mo) or Meetup ($2-8/event for organizers).

## File structure

```
localloop/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Activity feed
│   │   ├── create.tsx         # Quick post
│   │   ├── profile.tsx        # User profile
│   ├── activity/
│   │   └── [id].tsx           # Activity detail
│   ├── _layout.tsx
├── components/
│   ├── ActivityCard.tsx
│   ├── ActivityMap.tsx
│   ├── CategoryFilter.tsx
│   ├── QuickPostForm.tsx
│   ├── RadiusSlider.tsx
├── lib/
│   ├── database.ts            # SQLite setup
│   ├── location.ts            # Location utilities
│   ├── activities.ts          # Activity CRUD
│   ├── users.ts               # User logic
│   ├── distance.ts            # Haversine formula
├── hooks/
│   ├── useActivities.ts
│   ├── useLocation.ts
│   ├── useDatabase.ts
├── constants/
│   ├── Categories.ts
│   ├── Colors.ts
├── types/
│   └── index.ts
├── __tests__/
│   ├── distance.test.ts
│   ├── activities.test.ts
│   ├── ActivityCard.test.tsx
├── app.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── babel.config.js
```

## Tests

```typescript
// __tests__/distance.test.ts
// __tests__/activities.test.ts
// __tests__/ActivityCard.test.tsx
```

Each test file validates:
- Distance calculations (Haversine formula accuracy)
- Activity filtering by radius and time
- RSVP state management
- Component rendering with mock data

## Implementation steps

1. **Initialize Expo project**
   ```bash
   npx create-expo-app@latest localloop --template tabs
   cd localloop
   npx expo install expo-location expo-sqlite expo-notifications react-native-maps
   npm install nativewind tailwindcss
   npm install -D @testing-library/react-native @testing-library/jest-native jest-expo
   ```

2. **Configure NativeWind**
   - Create `tailwind.config.js` with React Native preset
   - Update `babel.config.js` to include NativeWind plugin
   - Add `global.css` with Tailwind directives

3. **Set up SQLite database schema**
   - Create `lib/database.ts` with tables: `users`, `activities`, `rsvps`
   - `activities` table: id, title, description, category, latitude, longitude, startTime, organizerId, maxAttendees
   - `rsvps` table: id, activityId, userId, status (going/interested)
   - Initialize DB on app launch

4. **Build location utilities**
   - `lib/location.ts`: Request permissions, get current location, watch position
   - `lib/distance.ts`: Haversine formula to calculate distance between coordinates
   - Handle permission denied gracefully (default to city center)

5. **Create activity CRUD functions**
   - `lib/activities.ts`: createActivity, getActivitiesNearby, getActivityById, updateRSVP
   - Filter by radius using distance calculation
   - Filter by time (only show activities starting within next 24 hours)

6. **Build Activity Feed (index.tsx)**
   - Fetch user location on mount
   - Load activities within 1 mile (default radius)
   - Render FlatList of ActivityCard components
   - Add CategoryFilter at top (horizontal scroll of chips)
   - Pull-to-refresh to reload activities

7. **Create ActivityCard component**
   - Show title, category icon, distance, time, attendee count
   - Tap to navigate to detail screen
   - Quick RSVP button (changes color when user RSVPs)

8. **Build Quick Post form (create.tsx)**
   - Title input (required)
   - Category picker (dropdown)
   - Time picker (defaults to now + 1 hour)
   - Location auto-filled from current position (show on mini map)
   - Max attendees input (optional, defaults to unlimited)
   - Submit button creates activity and navigates to detail screen

9. **Build Activity Detail screen**
   - Full map showing activity location
   - Organizer profile snippet
   - List of attendees (avatars + names)
   - RSVP button (going/interested/cancel)
   - Report button (flag inappropriate content)

10. **Add Profile screen**
    - Show user's posted activities
    - Show activities user RSVPed to
    - Display reliability score (% of RSVPs where user showed up)
    - Edit interests (multi-select categories)
    - Premium upgrade button (mock payment for MVP)

11. **Implement RadiusSlider component**
    - Slider from 0.5 to 5 miles
    - Show "Premium" lock icon for >1 mile if user is free tier
    - Update activity feed when radius changes

12. **Add notification setup**
    - Request notification permissions on first launch
    - Schedule local notification 30 min before user's RSVPed activities
    - (Premium feature mock: custom alerts for keywords)

13. **Create mock data seeder**
    - Generate 20-30 sample activities around user's location
    - Vary categories, times, distances
    - Useful for testing without real users

14. **Write tests**
    - Test distance calculation accuracy (known coordinates)
    - Test activity filtering (radius, time, category)
    - Test RSVP state changes
    - Test ActivityCard rendering with mock data

15. **Polish UI**
    - Add loading states (skeletons for activity cards)
    - Add empty states ("No activities nearby — be the first to post!")
    - Add error handling (location denied, DB errors)
    - Ensure accessibility (labels, contrast, touch targets)

16. **Add safety features**
    - "New Organizer" badge for users with <3 hosted events
    - Flag/report modal (reasons: spam, inappropriate, safety concern)
    - Public location validation (reject residential addresses)

## How to verify it works

1. **Run on device/simulator:**
   ```bash
   npx expo start
   ```
   - Scan QR code with Expo Go (iOS/Android)
   - Grant location permissions when prompted
   - Should see activity feed with sample data
   - Tap activity card → detail screen loads
   - Tap "Create" tab → post new activity → appears in feed
   - Change radius slider → feed updates with activities in new range

2. **Run tests:**
   ```bash
   npm test
   ```
   - All tests in `__tests__/` must pass
   - Coverage should include distance calculations, activity filtering, RSVP logic

3. **Manual verification checklist:**
   - [ ] Activity feed loads within 2 seconds
   - [ ] Distance shown on cards is accurate (compare to Google Maps)
   - [ ] RSVP button changes state immediately
   - [ ] Quick post form validates required fields
   - [ ] Map on detail screen shows correct pin location
   - [ ] Profile screen shows user's activities
   - [ ] Radius slider updates feed in real-time
   - [ ] App works offline (shows cached activities, queues new posts)