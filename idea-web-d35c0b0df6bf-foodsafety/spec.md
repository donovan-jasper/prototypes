# FoodGuard

## One-line pitch
Know before you go — instant food safety scores for every restaurant, grocery store, and food service near you.

## Expanded vision

**Broadest audience:** Anyone who eats food prepared by others — which is everyone. This isn't just for anxious parents or health nuts. It's for:

- **Busy professionals** who grab lunch near the office and want to avoid the sketchy taco truck
- **Date night planners** who don't want food poisoning to ruin the evening
- **Tourists and travelers** in unfamiliar cities who can't rely on local knowledge
- **Elderly users and caregivers** who need to avoid foodborne illness risks
- **College students** eating cheap food and wanting to know which spots are actually safe
- **Real estate shoppers** evaluating neighborhoods (food safety = neighborhood quality signal)
- **Food delivery users** who want to vet restaurants before ordering through DoorDash/Uber Eats

**Adjacent use cases:**
- Allergy and dietary restriction tracking (cross-contamination risks at restaurants)
- Travel planning (safe eating guides for trips)
- Neighborhood safety scoring (aggregate food safety = area quality indicator)
- Corporate compliance (businesses checking vendor safety records)
- Insurance and legal (documentation for food poisoning claims)

**Why non-technical people want this:** It's Yelp meets weather radar. You don't need to understand health codes or inspection reports — just open the app, see a color-coded map, and know which places are safe. The fear of food poisoning is universal and visceral. This app removes that anxiety.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **Local storage:** SQLite (expo-sqlite)
- **Maps:** React Native Maps (expo-maps)
- **Location:** expo-location
- **Notifications:** expo-notifications
- **HTTP client:** Axios
- **State management:** React Context + hooks (no Redux for MVP)
- **Testing:** Jest + React Native Testing Library
- **API:** Mock REST API for MVP (later: real government data feeds + user-generated content)

## Core features

1. **Live Safety Map** — Open the app, see color-coded pins (green/yellow/red) for every food establishment within 2 miles. Tap a pin for instant safety score, last inspection date, and violation summary.

2. **Smart Search** — Search by cuisine, dietary restriction, or establishment name. Filter by safety score threshold ("Show me only A-rated sushi spots").

3. **Recall Alerts** — Push notifications when a restaurant you've visited or saved gets a new violation, recall, or outbreak report. This is the killer retention feature.

4. **Inspection History** — Full timeline of health inspections, violations, and corrective actions for any establishment. Photos of inspection reports when available.

5. **Offline Mode (Premium)** — Download safety data for entire cities before traveling. Works without internet.

## Monetization strategy

**Free tier:**
- View safety scores and basic inspection data for current location
- Search and filter within 5-mile radius
- Save up to 5 favorite locations
- Generic recall alerts (city-wide, not personalized)

**Premium ($4.99/month or $39.99/year):**
- Unlimited saved locations with personalized alerts
- Allergy and dietary restriction filters (e.g., "Show me nut-free kitchens with A ratings")
- Offline maps for unlimited cities
- Recall history and trend analysis
- Priority support
- Ad-free experience

**Why $4.99?** It's the "coffee price point" — cheap enough to impulse-subscribe after one close call with food poisoning, expensive enough to signal quality. Annual discount encourages long-term commitment.

**Retention hooks:**
- Saved locations create lock-in (switching cost = losing your safety watchlist)
- Recall alerts are addictive — every notification reinforces value
- Offline mode is essential for frequent travelers (can't switch mid-trip)
- Social proof: "127 people near you are using FoodGuard Premium"

## Market position

**NOT saturated.** Here's why we win:

- **Google Maps Food Safety:** Buried in business listings, no proactive alerts, no filtering
- **Yelp Health Scores:** Only available in some cities, not the primary use case, no recall tracking
- **Government apps:** Terrible UX, city-specific, no cross-referencing or mobile-first design
- **Niche apps (e.g., Sitata):** Focus on travel health broadly, not hyper-local food safety

**Our gap:** We're the ONLY app that combines real-time government data, user reports, recall tracking, and proactive alerts in a mobile-first, location-aware experience. We're not competing with Yelp for restaurant discovery — we're the safety layer that sits on top of all food decisions.

## File structure

```
foodguard/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Map view
│   │   ├── search.tsx             # Search & filter
│   │   ├── saved.tsx              # Saved locations
│   │   └── profile.tsx            # Settings & premium
│   ├── establishment/
│   │   └── [id].tsx               # Detail view
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── EstablishmentCard.tsx
│   ├── SafetyBadge.tsx
│   ├── InspectionTimeline.tsx
│   ├── MapMarker.tsx
│   └── SearchFilters.tsx
├── services/
│   ├── database.ts                # SQLite setup
│   ├── api.ts                     # Mock API client
│   ├── location.ts                # Location services
│   └── notifications.ts           # Push notification setup
├── hooks/
│   ├── useEstablishments.ts
│   ├── useLocation.ts
│   └── useSavedLocations.ts
├── types/
│   └── index.ts
├── utils/
│   ├── safetyScore.ts             # Score calculation logic
│   └── dateHelpers.ts
├── constants/
│   └── Colors.ts
├── __tests__/
│   ├── safetyScore.test.ts
│   ├── database.test.ts
│   ├── EstablishmentCard.test.tsx
│   └── useEstablishments.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/safetyScore.test.ts
// __tests__/database.test.ts
// __tests__/EstablishmentCard.test.tsx
// __tests__/useEstablishments.test.ts
```

Each test file validates:
- Safety score calculation logic (A/B/C/F grading)
- SQLite CRUD operations for saved locations
- Component rendering and user interactions
- Custom hooks data fetching and state management

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app foodguard --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-location expo-notifications react-native-maps axios
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json` with location and notification permissions
4. Set up TypeScript types in `types/index.ts` for Establishment, Inspection, SafetyScore

### Phase 2: Database layer
1. Create `services/database.ts` with SQLite initialization
2. Define tables: `establishments`, `inspections`, `saved_locations`
3. Write CRUD functions: saveEstablishment, getSavedLocations, deleteLocation
4. Write tests in `__tests__/database.test.ts`

### Phase 3: Mock API
1. Create `services/api.ts` with mock data generator
2. Implement functions: fetchNearbyEstablishments, fetchEstablishmentDetails, fetchInspections
3. Mock data should include 50+ establishments with varied safety scores
4. Add realistic inspection violation data (critical/non-critical)

### Phase 4: Safety scoring logic
1. Create `utils/safetyScore.ts` with grading algorithm
2. Input: inspection violations (critical count, non-critical count, date)
3. Output: letter grade (A/B/C/F), color code, risk level
4. Algorithm: Critical violations = -10 points, non-critical = -2 points, base score 100
5. Write comprehensive tests in `__tests__/safetyScore.test.ts`

### Phase 5: Location services
1. Create `services/location.ts` wrapper around expo-location
2. Implement: getCurrentLocation, watchLocation, calculateDistance
3. Handle permissions gracefully with user-friendly prompts
4. Create `hooks/useLocation.ts` for component consumption

### Phase 6: Map view (home screen)
1. Build `app/(tabs)/index.tsx` with React Native Maps
2. Fetch user location on mount
3. Load nearby establishments from API
4. Render custom markers with color-coded pins (SafetyBadge component)
5. Handle marker press to navigate to detail view
6. Add loading states and error handling

### Phase 7: Establishment detail view
1. Create `app/establishment/[id].tsx` dynamic route
2. Fetch establishment details and inspection history
3. Build InspectionTimeline component (chronological list)
4. Add "Save Location" button (writes to SQLite)
5. Display safety badge, address, last inspection date, violation summary

### Phase 8: Search & filter
1. Build `app/(tabs)/search.tsx` with search input
2. Implement filters: cuisine type, safety grade, distance radius
3. Display results as scrollable list of EstablishmentCard components
4. Add "No results" state with helpful suggestions

### Phase 9: Saved locations
1. Build `app/(tabs)/saved.tsx` reading from SQLite
2. Create `hooks/useSavedLocations.ts` for reactive updates
3. Display saved establishments with swipe-to-delete
4. Show "Get Premium" upsell if user hits 5-location limit

### Phase 10: Notifications setup
1. Create `services/notifications.ts` with expo-notifications
2. Request permissions on app launch
3. Schedule mock recall alert (for demo purposes)
4. Handle notification tap to open relevant establishment

### Phase 11: Premium paywall
1. Build `app/(tabs)/profile.tsx` with subscription UI
2. Mock subscription state (free vs premium) in Context
3. Gate offline mode and unlimited saves behind premium check
4. Add "Upgrade to Premium" CTAs throughout app

### Phase 12: Polish & testing
1. Add loading skeletons for async operations
2. Implement error boundaries for crash recovery
3. Add haptic feedback for key interactions
4. Run full test suite: `npm test`
5. Test on iOS simulator and Android emulator
6. Verify location permissions, map rendering, navigation flow

## How to verify it works

### Development testing
1. Start Expo: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Grant location permissions when prompted
4. Verify map loads with color-coded pins near your location
5. Tap a pin, verify navigation to detail view
6. Search for "pizza", verify filtered results
7. Save a location, verify it appears in Saved tab
8. Try to save 6th location (free tier), verify premium prompt

### Automated testing
```bash
npm test
```

All tests must pass:
- Safety score calculation (A/B/C/F grades)
- Database operations (save/retrieve/delete)
- Component rendering (EstablishmentCard, SafetyBadge)
- Hook behavior (useEstablishments data fetching)

### Manual checklist
- [ ] Map renders with user location centered
- [ ] Pins are color-coded (green/yellow/red)
- [ ] Tapping pin navigates to detail screen
- [ ] Detail screen shows inspection history
- [ ] Search filters work (cuisine, grade, distance)
- [ ] Saved locations persist across app restarts
- [ ] Premium paywall appears at 5 saved locations
- [ ] Mock notification appears after 30 seconds
- [ ] App works offline (cached data only)