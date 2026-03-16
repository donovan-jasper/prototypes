# FoodSafe Mobile App Specification

## 1. App Name

**SafeBite**

## 2. One-Line Pitch

Know before you go — instant health scores and safety ratings for every restaurant near you.

## 3. Expanded Vision

### Who This Is Really For

**Primary Audience:**
- Parents making quick dining decisions with kids in tow
- Travelers in unfamiliar cities who need trusted food choices fast
- Health-conscious millennials and Gen Z who research everything before buying
- People with compromised immune systems or food allergies who can't afford risks
- Office workers grabbing lunch in new neighborhoods

**Broadest Audience:**
This is for anyone who's ever stood outside a restaurant wondering "is this place clean?" — which is nearly everyone. The app transforms anxiety into confidence at the moment of decision.

**Adjacent Use Cases:**
- Food truck festivals and street food vending events
- Hotel concierge recommendations (B2B partnership opportunity)
- Corporate cafeteria monitoring for HR departments
- Real estate agents showing neighborhoods ("great restaurants AND safe ones")
- Insurance companies incentivizing safe dining choices
- Tourism boards promoting food safety in their regions

**Why Non-Technical People Want This:**
No one wants food poisoning. This app removes the invisible risk from eating out. It's peace of mind in your pocket — as simple as checking the weather before leaving home.

## 4. Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **Local Database:** Expo SQLite for offline caching of ratings
- **Maps:** React Native Maps with native map providers
- **Location:** Expo Location API
- **HTTP Client:** Axios for API calls
- **State Management:** React Context + hooks (no Redux needed for MVP)
- **UI Components:** React Native Paper (Material Design)
- **Testing:** Jest + React Native Testing Library
- **Type Safety:** TypeScript

**Minimal Dependencies Philosophy:**
Only add libraries that solve problems we can't reasonably build ourselves in a weekend.

## 5. Core Features (MVP)

### Feature 1: One-Tap Safety Score
Open app → see map with color-coded pins (green/yellow/red) for nearby restaurants based on latest health inspection scores. Tap any pin for instant score details.

### Feature 2: Smart Search with Filters
Search by restaurant name or cuisine type. Free tier shows basic scores; premium unlocks filters like "no recent violations," "allergy-friendly certified," "passed inspection in last 30 days."

### Feature 3: Inspection History Timeline
View the last 3 inspections for any restaurant (dates, scores, violation types). Premium users see full history + violation photos when available from health departments.

### Feature 4: Offline Mode
Cache the last 50 searched restaurants and their scores for offline access. Critical for travelers in areas with spotty service.

### Feature 5: Save & Share Lists
Create lists like "Safe Date Night Spots" or "Kid-Friendly Clean Eats." Share lists with friends via link. Premium users get unlimited lists (free tier: 3 lists max).

## 6. Monetization Strategy

### Free Tier (The Hook)
- View safety scores for unlimited restaurants
- See basic inspection results (pass/fail, score, date)
- Search by name or location
- Save up to 3 custom lists
- Ads (non-intrusive banner at bottom of search results)

### Premium Tier: SafeBite Pro ($4.99/month or $49.99/year)
**What You Get:**
- Advanced filters (allergy-friendly, recent inspections, zero critical violations)
- Full inspection history (not just last 3)
- Violation photos and detailed reports
- Unlimited saved lists
- Ad-free experience
- Priority access to new features (e.g., food truck tracking)
- Export lists to PDF for travel planning

**Price Reasoning:**
$4.99/month is the "coffee price point" — less than one meal out. Annual plan offers 17% savings to encourage long-term commitment.

**Retention Strategy:**
- Monthly email: "Your neighborhood's safety scores this month" (keeps app top-of-mind)
- Push notifications when a saved favorite gets a new inspection (creates habit loop)
- Gamification: "You've avoided 12 risky restaurants this year" (quantified value)
- Family sharing: One premium account covers up to 5 family members (increases switching cost)

**Why People Stay Subscribed:**
Once you've built lists and experienced the peace of mind, going back to guessing feels reckless. The app becomes part of your dining routine, like checking reviews — but for something that actually matters.

## 7. Market Viability

**NOT SKIPPING** — Here's why:

**Incumbent Analysis:**
- Google Maps: Shows some health scores but buried in UI, not real-time, no filtering
- Yelp: Focuses on subjective reviews, not objective safety data
- Local health department apps: Clunky, desktop-focused, not mobile-optimized

**Clear Gap:**
No one has built a mobile-first, real-time, beautifully designed safety score aggregator. The data exists (public health records) but the UX doesn't. This is a classic "take public data and make it useful" opportunity.

**Defensibility:**
- First-mover advantage in a growing health-conscious market
- Network effects from user-generated lists and shares
- Partnerships with health departments create data moats
- Premium features (filters, history) are hard to replicate without infrastructure

## 8. File Structure

```
safebite/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Map view (home)
│   │   ├── search.tsx             # Search & filters
│   │   ├── lists.tsx              # Saved lists
│   │   └── profile.tsx            # Settings & subscription
│   ├── restaurant/
│   │   └── [id].tsx               # Restaurant detail page
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── RestaurantCard.tsx
│   ├── SafetyScoreBadge.tsx
│   ├── InspectionTimeline.tsx
│   ├── FilterSheet.tsx
│   └── MapMarker.tsx
├── services/
│   ├── database.ts                # SQLite setup & queries
│   ├── api.ts                     # Mock API client
│   ├── location.ts                # Location services
│   └── subscription.ts            # Premium tier logic
├── hooks/
│   ├── useRestaurants.ts
│   ├── useLocation.ts
│   └── useSubscription.ts
├── contexts/
│   └── SubscriptionContext.tsx
├── types/
│   └── index.ts
├── constants/
│   └── Colors.ts
├── __tests__/
│   ├── services/
│   │   ├── database.test.ts
│   │   └── api.test.ts
│   ├── hooks/
│   │   └── useRestaurants.test.ts
│   └── components/
│       └── SafetyScoreBadge.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### Test Coverage Requirements

**services/database.test.ts**
- Test SQLite initialization
- Test caching restaurant data
- Test retrieving cached data offline
- Test clearing old cache entries

**services/api.test.ts**
- Test fetching restaurants by location
- Test fetching restaurant details
- Test search functionality
- Test error handling for network failures

**hooks/useRestaurants.test.ts**
- Test loading restaurants near user location
- Test filtering by safety score
- Test premium filter restrictions
- Test offline fallback to cached data

**components/SafetyScoreBadge.test.ts**
- Test color coding (green/yellow/red) based on score
- Test rendering score text
- Test accessibility labels

**Minimum Requirement:**
Every feature must have at least one test. All tests must pass before considering MVP complete.

## 10. Implementation Steps

### Step 1: Project Setup
```bash
npx create-expo-app@latest safebite --template tabs
cd safebite
npm install react-native-maps expo-location expo-sqlite axios react-native-paper
npm install -D @testing-library/react-native @testing-library/jest-native jest-expo
```

### Step 2: Configure TypeScript & Testing
- Update `tsconfig.json` with strict mode
- Create `jest.config.js` with Expo preset
- Add test scripts to `package.json`

### Step 3: Define Types
Create `types/index.ts`:
```typescript
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  safetyScore: number; // 0-100
  lastInspectionDate: string;
  violationCount: number;
  cuisine: string;
}

export interface Inspection {
  id: string;
  restaurantId: string;
  date: string;
  score: number;
  violations: Violation[];
}

export interface Violation {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface UserList {
  id: string;
  name: string;
  restaurantIds: string[];
  createdAt: string;
}
```

### Step 4: Build Database Service
Create `services/database.ts`:
- Initialize SQLite database with tables for restaurants, inspections, and user lists
- Implement CRUD operations for caching
- Add methods for offline data retrieval
- Write tests in `__tests__/services/database.test.ts`

### Step 5: Build Mock API Service
Create `services/api.ts`:
- Mock endpoints for fetching restaurants by lat/lng
- Mock restaurant detail endpoint with inspection history
- Mock search endpoint
- Simulate network delays for realistic testing
- Write tests in `__tests__/services/api.test.ts`

### Step 6: Build Location Service
Create `services/location.ts`:
- Request location permissions
- Get current user location
- Calculate distance between coordinates
- Handle permission denials gracefully

### Step 7: Create Subscription Context
Create `contexts/SubscriptionContext.tsx`:
- Track premium subscription state (mock for MVP)
- Provide methods to check feature access
- Implement feature gating logic

### Step 8: Build Core Components

**SafetyScoreBadge.tsx:**
- Display score with color coding (green: 90-100, yellow: 70-89, red: <70)
- Show last inspection date
- Add accessibility labels
- Write tests

**RestaurantCard.tsx:**
- Show restaurant name, cuisine, address
- Display SafetyScoreBadge
- Show distance from user
- Tap to navigate to detail page

**MapMarker.tsx:**
- Custom marker with color-coded pin
- Show restaurant name on tap
- Cluster markers when zoomed out

**InspectionTimeline.tsx:**
- Vertical timeline of inspections
- Show date, score, violation count
- Premium gate for full history (show only last 3 for free)

**FilterSheet.tsx:**
- Bottom sheet with filter options
- Premium badge on locked filters
- Apply filters to search results

### Step 9: Build Hooks

**useLocation.ts:**
- Wrap location service in React hook
- Handle loading and error states
- Request permissions on mount

**useRestaurants.ts:**
- Fetch restaurants near user location
- Apply filters (with premium checks)
- Cache results in SQLite
- Fall back to cached data when offline
- Write tests

**useSubscription.ts:**
- Wrap subscription context
- Provide helper methods for feature checks

### Step 10: Build Screens

**app/(tabs)/index.tsx (Map View):**
- Show map centered on user location
- Display restaurant markers with color coding
- Tap marker to show restaurant card
- Tap card to navigate to detail page
- Show loading state while fetching location

**app/(tabs)/search.tsx:**
- Search bar for restaurant name or cuisine
- Filter button (opens FilterSheet)
- List of results with RestaurantCard components
- Empty state when no results

**app/(tabs)/lists.tsx:**
- Show user's saved lists
- Tap list to see restaurants
- Add/remove restaurants from lists
- Premium gate: max 3 lists for free tier

**app/(tabs)/profile.tsx:**
- Show subscription status
- Upgrade to premium CTA
- Settings (notifications, units, etc.)
- About & privacy policy links

**app/restaurant/[id].tsx:**
- Restaurant header with name, address, cuisine
- Large SafetyScoreBadge
- InspectionTimeline component
- "Add to List" button
- Map showing restaurant location

### Step 11: Implement Offline Support
- Cache last 50 searched restaurants in SQLite
- Show cached data when network unavailable
- Display "Offline Mode" banner
- Sync when connection restored

### Step 12: Add Premium Feature Gating
- Check subscription status before showing premium filters
- Show upgrade prompt when tapping locked features
- Display premium badge on locked content
- Mock in-app purchase flow (use expo-in-app-purchases for production)

### Step 13: Polish UI/UX
- Add loading skeletons for async operations
- Implement pull-to-refresh on lists
- Add haptic feedback on interactions
- Ensure proper keyboard handling in search
- Test on both iOS and Android simulators

### Step 14: Write Remaining Tests
- Test all hooks with various scenarios
- Test component rendering and interactions
- Test offline behavior
- Test premium feature gating
- Ensure all tests pass with `npm test`

### Step 15: Final QA Checklist
- [ ] App launches without errors
- [ ] Location permission requested on first launch
- [ ] Map shows user location and nearby restaurants
- [ ] Tapping marker shows restaurant details
- [ ] Search returns relevant results
- [ ] Filters work (premium filters show upgrade prompt)
- [ ] Restaurant detail page shows inspection history
- [ ] Can create and manage lists
- [ ] Offline mode works (airplane mode test)
- [ ] All tests pass
- [ ] No console warnings or errors
- [ ] Smooth performance on older devices

## 11. How to Verify It Works

### Development Testing

**1. Install Dependencies:**
```bash
npm install
```

**2. Run Tests:**
```bash
npm test
```
All tests must pass. Look for 100% pass rate in Jest output.

**3. Start Expo Dev Server:**
```bash
npx expo start
```

**4. Test on iOS Simulator:**
```bash
# Press 'i' in terminal or
npx expo start --ios
```

**5. Test on Android Emulator:**
```bash
# Press 'a' in terminal or
npx expo start --android
```

**6. Test on Physical Device:**
- Install Expo Go from App Store / Play Store
- Scan QR code from terminal
- Grant location permissions when prompted

### Manual Test Scenarios

**Scenario 1: First Launch**
- App requests location permission
- Map loads centered on user location
- At least 5 restaurant markers visible (mock data)
- Tapping marker shows restaurant card

**Scenario 2: Restaurant Detail**
- Tap restaurant card
- Detail page loads with safety score
- Inspection timeline shows last 3 inspections
- "View Full History" shows premium prompt

**Scenario 3: Search & Filter**
- Navigate to Search tab
- Type "pizza" in search bar
- Results appear with matching restaurants
- Tap filter button
- Free filters work (score range)
- Premium filters show upgrade prompt

**Scenario 4: Lists**
- Navigate to Lists tab
- Create new list "Favorites"
- Add restaurant from detail page
- List shows added restaurant
- Try creating 4th list (should show premium prompt)

**Scenario 5: Offline Mode**
- Enable airplane mode on device
- Open app (should load cached data)
- "Offline Mode" banner visible
- Can view previously searched restaurants
- Disable airplane mode
- Banner disappears, data syncs

**Scenario 6: Premium Features**
- Navigate to Profile tab
- Tap "Upgrade to Pro"
- Mock upgrade flow completes
- Return to Search tab
- Premium filters now unlocked
- View restaurant detail
- Full inspection history now visible

### Success Criteria

✅ App launches in under 3 seconds  
✅ Location permission flow works smoothly  
✅ Map renders with accurate user location  
✅ All navigation transitions are smooth (no jank)  
✅ Search returns results in under 1 second  
✅ Offline mode gracefully handles no network  
✅ Premium gates are clear and non-intrusive  
✅ All Jest tests pass with no warnings  
✅ No console errors in development  
✅ App works on both iOS and Android  

### Performance Benchmarks

- **Time to Interactive:** < 3 seconds on mid-range device
- **Map Render:** < 1 second for 50 markers
- **Search Response:** < 500ms for local cache, < 2s for API
- **Screen Transitions:** 60fps (no dropped frames)
- **Memory Usage:** < 150MB on iOS, < 200MB on Android

---

**Ready to build.** This spec provides everything needed for an AI coding agent to implement SafeBite from scratch. The MVP focuses on core value (instant safety scores) while setting up infrastructure for premium features that drive subscriptions.