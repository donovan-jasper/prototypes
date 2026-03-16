# LocalLink Play Spec

## 1. App Name

**NearNow**

## 2. One-Line Pitch

Meet people nearby who want to do what you want to do, right now.

## 3. Expanded Vision

### Who This Is Really For

**Primary Audience:**
- Urban professionals (25-45) who moved cities for work and lack local friends
- Parents seeking spontaneous playdates without the scheduling overhead
- Remote workers craving human interaction during work breaks
- Retirees with flexible schedules wanting to stay socially active
- College students in new cities looking for study partners or activity buddies

**Broadest Audience:**
This serves anyone who's ever thought "I wish I had someone to [activity] with right now" — whether that's grabbing coffee, playing basketball, walking dogs, or hitting a museum. It's the anti-scheduling app for a world drowning in calendar invites.

**Adjacent Use Cases:**
- Emergency childcare swaps (parent networks)
- Skill sharing (guitar lessons, language practice)
- Safety buddies (walking home at night, jogging partners)
- Local business discovery (group restaurant tries, shop crawls)
- Fitness accountability (gym partners, running groups)
- Mental health support (combating isolation for remote workers, new parents, elderly)

**Why Non-Technical People Want This:**
Loneliness is an epidemic. People have hundreds of social media "friends" but no one to grab lunch with today. NearNow removes the friction of "let me check my calendar" and "we should hang out sometime" — it's for people who value spontaneity over planning, and real connection over digital likes.

## 4. Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand (lightweight, no boilerplate)
- **Local Storage:** Expo SQLite
- **Location:** expo-location
- **Push Notifications:** expo-notifications
- **Real-time Messaging:** Supabase Realtime (free tier supports MVP scale)
- **Backend:** Supabase (auth, database, real-time subscriptions)
- **Maps:** react-native-maps
- **Testing:** Jest + React Native Testing Library

## 5. Core Features (MVP)

1. **Activity Broadcasting**
   - Post what you want to do right now (coffee, walk, basketball, etc.)
   - Set radius (0.5mi, 1mi, 3mi, 5mi)
   - Auto-expires in 2 hours
   - One-tap templates ("Coffee in 15min", "Dog park now", "Pickup basketball")

2. **Smart Matching**
   - See nearby broadcasts within your radius
   - Filter by activity type, time window, group size
   - Tap to express interest, instant chat unlocks if mutual
   - Safety: profiles show first name, age range, mutual interests only

3. **Quick Chat**
   - Ephemeral messaging (auto-deletes after meetup time passes)
   - Share live location only when both parties agree
   - "I'm here" button for meetup coordination
   - Block/report with one tap

4. **Trust Score**
   - Verified phone number required
   - Completed meetups build reputation
   - Mutual friends from contacts (opt-in)
   - Community flagging system

5. **Premium: Instant Match**
   - Jump to top of interest lists
   - Create private recurring groups (weekly basketball crew)
   - See who viewed your broadcasts
   - Unlimited broadcasts (free = 3/day)

## 6. Monetization Strategy

**Free Tier (Hook):**
- 3 broadcasts per day
- Unlimited browsing and responses
- Basic chat functionality
- Standard matching (chronological order)

**Premium: $4.99/month (Paywall):**
- Unlimited broadcasts
- Priority matching (appear first in feeds)
- Create private groups (up to 20 members)
- Advanced filters (age range, interests, verified only)
- "Rewind" feature (re-activate expired broadcasts)
- Analytics (who viewed, response rates)

**Price Reasoning:**
- Lower than dating apps ($9.99+) because meetups are platonic
- Higher than utility apps ($2.99) because it solves loneliness (high emotional value)
- Monthly vs annual to reduce commitment friction for new users

**Retention Drivers:**
- Private groups create lock-in (your basketball crew is here)
- Priority matching becomes addictive once you experience instant responses
- Sunk cost of built reputation/trust score
- Network effects (more users = better matches)

**Future Revenue:**
- Local business partnerships (coffee shops pay to be suggested meetup spots)
- Event promotion (concerts, classes looking for attendees)
- Premium group features (scheduling tools, shared photo albums)

## 7. Market Gap Analysis

**NOT SKIP — Clear differentiation:**

- **Meetup:** Requires days/weeks of planning, formal events, $40+/year
- **Bumble BFF:** Dating app mechanics feel forced, no real-time component
- **Nextdoor:** Focused on neighborhood issues, not social connection
- **Facebook Groups:** Buried in feeds, no location-based matching
- **WhatsApp:** Requires existing relationships

**NearNow's Gap:** Zero apps combine real-time availability + hyper-local matching + activity-specific filtering. Closest competitor is Meetup, but they're event-focused (plan ahead) vs. spontaneous (right now). Market is fragmented across general social networks that don't solve "I'm free right now, who wants to hang?"

## 8. File Structure

```
nearnow/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Broadcast feed
│   │   ├── create.tsx             # Create broadcast
│   │   ├── chats.tsx              # Active conversations
│   │   └── profile.tsx            # User profile/settings
│   ├── broadcast/[id].tsx         # Broadcast detail
│   ├── chat/[id].tsx              # Chat screen
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── _layout.tsx
├── components/
│   ├── BroadcastCard.tsx
│   ├── ActivityPicker.tsx
│   ├── RadiusSelector.tsx
│   ├── ChatBubble.tsx
│   ├── TrustBadge.tsx
│   └── MapPreview.tsx
├── lib/
│   ├── supabase.ts                # Supabase client
│   ├── database.ts                # SQLite setup
│   ├── location.ts                # Location utilities
│   ├── notifications.ts           # Push notification handlers
│   └── matching.ts                # Matching algorithm
├── store/
│   ├── authStore.ts               # Auth state (Zustand)
│   ├── broadcastStore.ts          # Broadcasts state
│   └── chatStore.ts               # Chat state
├── types/
│   └── index.ts                   # TypeScript types
├── __tests__/
│   ├── matching.test.ts
│   ├── location.test.ts
│   ├── BroadcastCard.test.tsx
│   └── authStore.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### `__tests__/matching.test.ts`
```typescript
import { calculateDistance, filterByRadius, rankMatches } from '../lib/matching';

describe('Matching Algorithm', () => {
  test('calculates distance between coordinates', () => {
    const distance = calculateDistance(
      { lat: 40.7128, lng: -74.0060 }, // NYC
      { lat: 40.7589, lng: -73.9851 }  // Times Square
    );
    expect(distance).toBeCloseTo(3.1, 1); // ~3.1 miles
  });

  test('filters broadcasts by radius', () => {
    const userLocation = { lat: 40.7128, lng: -74.0060 };
    const broadcasts = [
      { id: '1', lat: 40.7589, lng: -73.9851 }, // 3.1mi
      { id: '2', lat: 40.7128, lng: -74.0070 }, // 0.05mi
      { id: '3', lat: 41.8781, lng: -87.6298 }, // Chicago, 700mi
    ];
    const filtered = filterByRadius(broadcasts, userLocation, 5);
    expect(filtered).toHaveLength(2);
    expect(filtered.map(b => b.id)).toEqual(['1', '2']);
  });

  test('ranks matches by distance and recency', () => {
    const broadcasts = [
      { id: '1', distance: 5, createdAt: Date.now() - 3600000 }, // 5mi, 1hr ago
      { id: '2', distance: 1, createdAt: Date.now() - 7200000 }, // 1mi, 2hr ago
      { id: '3', distance: 2, createdAt: Date.now() - 600000 },  // 2mi, 10min ago
    ];
    const ranked = rankMatches(broadcasts);
    expect(ranked[0].id).toBe('3'); // Closest + most recent
  });
});
```

### `__tests__/location.test.ts`
```typescript
import { isWithinRadius, formatDistance } from '../lib/location';

describe('Location Utilities', () => {
  test('checks if location is within radius', () => {
    const center = { lat: 40.7128, lng: -74.0060 };
    const nearby = { lat: 40.7589, lng: -73.9851 }; // 3.1mi
    const far = { lat: 41.8781, lng: -87.6298 }; // 700mi
    
    expect(isWithinRadius(center, nearby, 5)).toBe(true);
    expect(isWithinRadius(center, far, 5)).toBe(false);
  });

  test('formats distance for display', () => {
    expect(formatDistance(0.3)).toBe('0.3 mi');
    expect(formatDistance(1.0)).toBe('1.0 mi');
    expect(formatDistance(12.7)).toBe('12.7 mi');
  });
});
```

### `__tests__/BroadcastCard.test.tsx`
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BroadcastCard from '../components/BroadcastCard';

describe('BroadcastCard', () => {
  const mockBroadcast = {
    id: '1',
    activity: 'Coffee',
    userName: 'Alex',
    distance: 1.2,
    expiresAt: Date.now() + 3600000,
    groupSize: 2,
  };

  test('renders broadcast details', () => {
    const { getByText } = render(<BroadcastCard broadcast={mockBroadcast} />);
    expect(getByText('Coffee')).toBeTruthy();
    expect(getByText('Alex')).toBeTruthy();
    expect(getByText('1.2 mi')).toBeTruthy();
  });

  test('calls onInterest when tapped', () => {
    const onInterest = jest.fn();
    const { getByText } = render(
      <BroadcastCard broadcast={mockBroadcast} onInterest={onInterest} />
    );
    fireEvent.press(getByText('Interested'));
    expect(onInterest).toHaveBeenCalledWith('1');
  });

  test('shows expired state', () => {
    const expired = { ...mockBroadcast, expiresAt: Date.now() - 1000 };
    const { getByText } = render(<BroadcastCard broadcast={expired} />);
    expect(getByText('Expired')).toBeTruthy();
  });
});
```

### `__tests__/authStore.test.ts`
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthStore } from '../store/authStore';

describe('Auth Store', () => {
  test('initializes with no user', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('sets user on login', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = { id: '1', email: 'test@example.com' };
    
    act(() => {
      result.current.setUser(mockUser);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('clears user on logout', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setUser({ id: '1', email: 'test@example.com' });
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

## 10. Implementation Steps

### Phase 1: Project Setup
1. Initialize Expo project with TypeScript:
   ```bash
   npx create-expo-app nearnow --template expo-template-blank-typescript
   cd nearnow
   ```

2. Install dependencies:
   ```bash
   npx expo install expo-router expo-location expo-notifications expo-sqlite
   npm install @supabase/supabase-js zustand react-native-maps
   npm install -D jest @testing-library/react-native @testing-library/react-hooks
   ```

3. Configure `app.json`:
   - Add location permissions (iOS: NSLocationWhenInUseUsageDescription)
   - Add notification permissions
   - Set scheme for deep linking

4. Set up Supabase:
   - Create project at supabase.com
   - Create tables: `profiles`, `broadcasts`, `chats`, `interests`
   - Enable Row Level Security (RLS)
   - Copy API keys to `.env`

### Phase 2: Core Infrastructure
5. Create `lib/supabase.ts`:
   - Initialize Supabase client with AsyncStorage
   - Export typed client

6. Create `lib/database.ts`:
   - Set up SQLite for offline caching
   - Create tables for broadcasts, chats, user preferences
   - Add sync functions

7. Create `lib/location.ts`:
   - Request location permissions
   - Get current location
   - Calculate distance between coordinates (Haversine formula)
   - Format distance for display

8. Create `lib/matching.ts`:
   - Filter broadcasts by radius
   - Rank by distance + recency
   - Apply premium user boosts

9. Create `lib/notifications.ts`:
   - Register for push notifications
   - Handle incoming notifications
   - Schedule local reminders

### Phase 3: State Management
10. Create `store/authStore.ts`:
    - User state (id, email, isPremium)
    - Login/logout actions
    - Session persistence

11. Create `store/broadcastStore.ts`:
    - Active broadcasts list
    - User's own broadcasts
    - CRUD operations
    - Real-time subscription handlers

12. Create `store/chatStore.ts`:
    - Active chats
    - Unread counts
    - Message sending/receiving

### Phase 4: Authentication
13. Create `app/auth/login.tsx`:
    - Phone number input
    - OTP verification
    - Error handling

14. Create `app/auth/signup.tsx`:
    - Phone verification
    - Basic profile setup (name, interests)
    - Terms acceptance

15. Implement auth flow in `app/_layout.tsx`:
    - Check session on mount
    - Redirect to login if unauthenticated

### Phase 5: Main Features
16. Create `app/(tabs)/index.tsx` (Feed):
    - Fetch broadcasts within radius
    - Display as scrollable list
    - Pull-to-refresh
    - Filter controls (activity type, radius)

17. Create `components/BroadcastCard.tsx`:
    - Show activity, user name, distance, time left
    - Trust badge display
    - "Interested" button
    - Premium badge if applicable

18. Create `app/(tabs)/create.tsx`:
    - Activity picker (predefined + custom)
    - Radius selector (0.5mi - 5mi slider)
    - Group size input
    - Expiry time (default 2hr)
    - Submit button (check daily limit for free users)

19. Create `components/ActivityPicker.tsx`:
    - Grid of common activities with icons
    - Search for custom activities
    - Recently used activities

20. Create `app/broadcast/[id].tsx`:
    - Full broadcast details
    - User profile preview
    - Map showing approximate location
    - Express interest button
    - Report/block options

### Phase 6: Matching & Chat
21. Implement matching logic:
    - When user expresses interest, create chat room
    - Send push notification to broadcast creator
    - If mutual interest, unlock chat

22. Create `app/(tabs)/chats.tsx`:
    - List of active chats
    - Unread indicators
    - Swipe to delete/archive

23. Create `app/chat/[id].tsx`:
    - Message list (reverse chronological)
    - Input field with send button
    - "Share location" button (requires confirmation)
    - "I'm here" quick action
    - Auto-delete warning (shows time until deletion)

24. Create `components/ChatBubble.tsx`:
    - Sender/receiver styling
    - Timestamp
    - Location sharing display
    - System messages (user joined, location shared)

### Phase 7: Profile & Settings
25. Create `app/(tabs)/profile.tsx`:
    - Display name, trust score, member since
    - Interests tags
    - Completed meetups count
    - Settings button

26. Add settings screen:
    - Notification preferences
    - Default radius
    - Privacy settings (who can see broadcasts)
    - Blocked users list
    - Delete account

27. Implement trust score system:
    - +1 for completed meetup (both parties confirm)
    - +0.5 for verified phone
    - -2 for community flag (reviewed by moderation)
    - Display as badge (Newcomer, Trusted, Verified)

### Phase 8: Premium Features
28. Create paywall screen:
    - Feature comparison table
    - Pricing display
    - "Start Free Trial" button
    - Restore purchases

29. Integrate in-app purchases:
    - Use expo-in-app-purchases or RevenueCat
    - Validate receipts server-side (Supabase Edge Function)
    - Update user's `isPremium` flag

30. Implement premium features:
    - Remove broadcast limit check
    - Boost broadcasts in ranking algorithm
    - Enable private group creation
    - Show analytics (views, interest rate)

### Phase 9: Safety & Moderation
31. Add reporting system:
    - Report reasons (spam, inappropriate, safety concern)
    - Auto-hide content after 3 reports
    - Admin dashboard (Supabase + Retool)

32. Implement blocking:
    - Block user from profile or chat
    - Hide all their broadcasts
    - Prevent future matching

33. Add verification:
    - Phone number verification (Twilio)
    - Optional photo verification (manual review)
    - Display verification badges

### Phase 10: Polish & Optimization
34. Add loading states:
    - Skeleton screens for feeds
    - Shimmer effects
    - Pull-to-refresh indicators

35. Implement error handling:
    - Network errors (retry logic)
    - Location permission denied (fallback to manual entry)
    - Push notification permission denied (in-app alerts)

36. Optimize performance:
    - Memoize expensive calculations
    - Virtualize long lists (FlashList)
    - Cache images
    - Debounce search inputs

37. Add analytics:
    - Track key events (broadcast created, interest expressed, chat started)
    - Use Expo Analytics or Mixpanel
    - Monitor conversion funnel (signup → first broadcast → first match)

### Phase 11: Testing
38. Write unit tests for all `lib/` functions

39. Write component tests for key UI elements

40. Write integration tests for critical flows:
    - Signup → create broadcast → receive interest → chat
    - Premium upgrade flow

41. Manual testing checklist:
    - Test on iOS and Android
    - Test with location services off
    - Test with poor network connection
    - Test push notifications (foreground, background, killed)
    - Test with multiple users (use multiple devices/simulators)

### Phase 12: Deployment Prep
42. Set up Supabase production environment:
    - Separate project for prod
    - Configure RLS policies
    - Set up database backups

43. Configure app store assets:
    - App icon (1024x1024)
    - Screenshots (iOS: 6.5", 5.5"; Android: phone, tablet)
    - Privacy policy URL
    - App description (use one-line pitch)

44. Build and submit:
    ```bash
    eas build --platform ios
    eas build --platform android
    eas submit --platform ios
    eas submit --platform android
    ```

## 11. How to Verify It Works

### Local Development
1. Start Expo dev server:
   ```bash
   npx expo start
   ```

2. Test on physical device (recommended for location/notifications):
   - Scan QR code with Expo Go app
   - Grant location and notification permissions

3. Test core flows:
   - **Signup:** Create account with phone number
   - **Create broadcast:** Post "Coffee in 15min" with 1mi radius
   - **Browse feed:** See nearby broadcasts (use second device/account)
   - **Express interest:** Tap "Interested" on a broadcast
   - **Chat:** Send messages, share location
   - **Premium:** Trigger paywall (create 4th broadcast in a day)

4. Run tests:
   ```bash
   npm test
   ```
   All tests must pass before deployment.

### Simulator Testing
- **iOS Simulator:** Test location with Debug → Location → Custom Location
- **Android Emulator:** Use Extended Controls → Location to set coordinates

### Multi-User Testing
- Use two devices or one device + simulator
- Create broadcasts from one account, view from another
- Verify real-time updates (new broadcasts appear without refresh)
- Test chat delivery and push notifications

### Edge Cases to Test
- Location permission denied (should prompt manual city entry)
- No broadcasts nearby (show empty state with "Create first broadcast" CTA)
- Expired broadcast (should show "Expired" and disable interest button)
- Blocked user (their broadcasts should not appear)
- Network offline (should show cached broadcasts with "Offline" indicator)

### Success Criteria
- ✅ User can sign up and create profile in <2 minutes
- ✅ Broadcasts appear in feed within 5 seconds of creation
- ✅ Push notifications arrive within 10 seconds
- ✅ Chat messages deliver in real-time (<1 second)
- ✅ Location accuracy within 0.1 miles
- ✅ App loads in <3 seconds on 4G connection
- ✅ All Jest tests pass
- ✅ No crashes during 30-minute usage session