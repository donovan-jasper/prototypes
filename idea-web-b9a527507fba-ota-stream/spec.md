# OTA Stream Spec

## 1. App Name

**StreamLocal**

## 2. One-line pitch

Watch your city's live TV, sports, and breaking news—free, no cable, no hassle.

## 3. Expanded vision

### Who is this REALLY for?

**Broadest audience:** Anyone who cut the cable but still wants local content—news, weather, sports, community events—without juggling multiple apps or antennas.

**Core segments:**
- **Cord-cutters (25-55):** People who ditched cable but miss local news, weather, and sports. They want one app that replaces the "channel surf" experience for local content.
- **College students & young renters:** Can't afford cable, don't own a TV, but want to watch hometown games or local news when something big happens.
- **Commuters & travelers:** People who want to stay connected to their home city's news/sports while on the go, or discover local channels when visiting new cities.
- **Parents & families:** Want to watch local high school sports, community events, parades, city council meetings—hyperlocal content that streaming giants ignore.
- **Emergency-conscious users:** People who want instant access to local news during storms, fires, or breaking events when social media is unreliable.

**Adjacent use cases:**
- **Hyperlocal discovery:** Find out what's happening in your city right now—festivals, protests, sports games, weather alerts.
- **Nostalgia & connection:** Expats or people who moved away can watch their hometown's local channels to stay connected.
- **Social viewing:** Watch the same local broadcast as friends and chat about it in real-time (like a virtual watch party for local news).
- **Citizen journalism hub:** Aggregate local news from multiple stations to compare coverage of the same event.

**Why non-technical people want this:**
- **It's TV, but on your phone.** No setup, no antenna, no login hell. Just open the app and watch.
- **It's free.** Local broadcast TV is legally free over-the-air; this just makes it accessible without hardware.
- **It's personal.** Get alerts when your kid's school is on the news, when your team plays, or when severe weather hits your neighborhood.

## 4. Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Video streaming:** `expo-av` for HLS/MPEG-DASH playback
- **Local storage:** `expo-sqlite` for channel favorites, viewing history, alert preferences
- **Location:** `expo-location` for automatic local channel discovery
- **Notifications:** `expo-notifications` for live event alerts
- **State management:** React Context API (keep it simple)
- **HTTP client:** `axios` for API calls to channel aggregation backend
- **UI:** React Native Paper for Material Design components
- **Testing:** Jest + React Native Testing Library

**Backend (out of scope for MVP, but assumed):**
- Node.js API that aggregates local broadcast streams (via partnerships or public HLS feeds)
- PostgreSQL for channel metadata, schedules, and user preferences
- Redis for caching stream URLs and schedules

## 5. Core features (MVP)

1. **Auto-detect local channels**
   - On first launch, use GPS to detect user's city/region
   - Display available local broadcast channels (ABC, NBC, CBS, FOX, PBS affiliates)
   - Show channel logos, current program, and next up

2. **Live stream playback**
   - Tap a channel to start streaming immediately
   - Picture-in-picture support for multitasking
   - Chromecast support for TV viewing

3. **Personalized alerts**
   - Set alerts for specific programs (e.g., "notify me when the Seahawks play")
   - Weather alerts for severe conditions in your area
   - Breaking news notifications from selected channels

4. **Favorites & history**
   - Star favorite channels for quick access
   - View recently watched channels
   - Resume where you left off (if stream supports DVR-like features)

5. **Social sharing**
   - Share "I'm watching [Channel] live" to social media
   - Generate shareable clips (if legally allowed) of moments
   - In-app chat for watching with friends (premium feature)

## 6. Monetization strategy

### Free tier (the hook):
- Watch all local channels with ads (pre-roll, mid-roll from broadcasters)
- Basic alerts (1 program alert at a time)
- Favorites limited to 5 channels
- Standard video quality (720p)

### Premium ($4.99/month):
- **Ad-free experience:** Skip pre-roll ads on supported channels
- **Unlimited alerts:** Set alerts for unlimited programs, teams, weather conditions
- **Unlimited favorites:** Star as many channels as you want
- **HD streaming:** 1080p where available
- **Social features:** Watch parties with friends, in-app chat, share clips
- **Multi-city access:** Watch channels from multiple cities (great for travelers or people with ties to multiple places)
- **DVR-like features:** Pause, rewind live TV (where legally allowed)

### Price reasoning:
- $4.99 is impulse-buy territory—cheaper than a coffee, less than any streaming service
- Positioned as "cable replacement for local content" justifies the cost
- Lower than competitors (Hulu Live $77/mo, YouTube TV $73/mo) by focusing only on local

### What makes people STAY subscribed:
- **Habit formation:** If they watch local news every morning, they'll keep paying to avoid ads
- **Event-driven retention:** Sports seasons, election coverage, severe weather—people re-subscribe when they need it
- **Social lock-in:** If their friends are on the platform for watch parties, they'll stay
- **Multi-city value:** Travelers and people with family in other cities get unique value

## 7. Skip if saturated

**NOT SKIPPING.** 

While Pluto TV and Tubi exist, they focus on on-demand content and national channels. Local broadcast aggregation is underserved:
- **Locast** (now defunct) proved demand but failed due to legal issues—we'd partner with broadcasters directly
- **Local station apps** are fragmented (one app per channel)—we aggregate them
- **Antenna apps** require hardware—we're software-only
- **YouTube TV / Hulu Live** are $70+/month—we're $5 or free

The gap is real: no one offers a simple, affordable, mobile-first way to watch ALL your local channels in one app.

## 8. File structure

```
streamlocal/
├── app.json
├── package.json
├── babel.config.js
├── jest.config.js
├── App.tsx
├── src/
│   ├── components/
│   │   ├── ChannelCard.tsx
│   │   ├── ChannelCard.test.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoPlayer.test.tsx
│   │   ├── AlertSetup.tsx
│   │   └── AlertSetup.test.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── HomeScreen.test.tsx
│   │   ├── PlayerScreen.tsx
│   │   ├── PlayerScreen.test.tsx
│   │   ├── FavoritesScreen.tsx
│   │   ├── FavoritesScreen.test.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── locationService.ts
│   │   ├── locationService.test.ts
│   │   ├── channelService.ts
│   │   ├── channelService.test.ts
│   │   ├── notificationService.ts
│   │   ├── notificationService.test.ts
│   │   └── database.ts
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── AppContext.test.tsx
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
├── assets/
│   ├── icon.png
│   └── splash.png
└── README.md
```

## 9. Tests

### Test files included:

1. **ChannelCard.test.tsx** — Verify channel rendering, favorite toggle, tap to play
2. **VideoPlayer.test.tsx** — Test stream loading, play/pause, error handling
3. **AlertSetup.test.tsx** — Validate alert creation, editing, deletion
4. **HomeScreen.test.tsx** — Test channel list rendering, location detection, filtering
5. **PlayerScreen.test.tsx** — Verify player screen navigation, PiP toggle
6. **FavoritesScreen.test.tsx** — Test favorites list, empty state, removal
7. **locationService.test.ts** — Mock GPS, test city detection, permission handling
8. **channelService.test.ts** — Mock API calls, test channel fetching, caching
9. **notificationService.test.ts** — Test alert scheduling, notification display
10. **AppContext.test.tsx** — Verify state management, context updates

All tests use Jest + React Native Testing Library with mocked Expo modules.

## 10. Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app streamlocal --template blank-typescript`
2. Install dependencies:
   ```bash
   npx expo install expo-av expo-sqlite expo-location expo-notifications react-native-paper
   npm install axios @react-navigation/native @react-navigation/bottom-tabs
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json` with permissions (location, notifications), app name, icons
4. Set up Jest config for React Native with Expo preset

### Phase 2: Core services
5. **Database service** (`src/services/database.ts`):
   - Create SQLite tables: `channels`, `favorites`, `alerts`, `history`
   - Write CRUD functions for each table
   - Add migration logic for schema updates

6. **Location service** (`src/services/locationService.ts`):
   - Request location permissions
   - Get current GPS coordinates
   - Reverse geocode to city/state
   - Cache location to avoid repeated requests

7. **Channel service** (`src/services/channelService.ts`):
   - Fetch channels from backend API based on location
   - Parse channel metadata (name, logo, stream URL, schedule)
   - Cache channels locally in SQLite
   - Handle offline mode with cached data

8. **Notification service** (`src/services/notificationService.ts`):
   - Request notification permissions
   - Schedule alerts based on user preferences
   - Handle notification taps (deep link to player)
   - Cancel/update alerts when user changes settings

### Phase 3: State management
9. **AppContext** (`src/context/AppContext.tsx`):
   - Create context for global state: user location, channels, favorites, alerts
   - Provide methods to update state (addFavorite, removeAlert, etc.)
   - Persist state changes to SQLite

### Phase 4: UI components
10. **ChannelCard** (`src/components/ChannelCard.tsx`):
    - Display channel logo, name, current program
    - Show "LIVE" indicator with red dot
    - Favorite star icon (toggle on tap)
    - Tap card to navigate to player

11. **VideoPlayer** (`src/components/VideoPlayer.tsx`):
    - Use `expo-av` Video component
    - Load HLS stream URL
    - Show loading spinner, error state
    - Controls: play/pause, PiP toggle, Chromecast button
    - Display current program info overlay

12. **AlertSetup** (`src/components/AlertSetup.tsx`):
    - Form to create alert: select channel, program type, time
    - Toggle switches for weather alerts, breaking news
    - Save button to persist alert to database

### Phase 5: Screens
13. **HomeScreen** (`src/screens/HomeScreen.tsx`):
    - Detect location on mount (show loading state)
    - Fetch and display channels in grid/list
    - Search bar to filter channels
    - Pull-to-refresh to reload channels
    - Empty state if no channels found

14. **PlayerScreen** (`src/screens/PlayerScreen.tsx`):
    - Receive channel ID from navigation params
    - Load stream URL from channel data
    - Render VideoPlayer component
    - Show program schedule below player
    - "Add to Favorites" button
    - Share button (social sharing)

15. **FavoritesScreen** (`src/screens/FavoritesScreen.tsx`):
    - Load favorites from database
    - Display as list of ChannelCards
    - Swipe-to-delete to remove favorite
    - Empty state with CTA to add favorites

16. **SettingsScreen** (`src/screens/SettingsScreen.tsx`):
    - Manage alerts (list, edit, delete)
    - Change location manually
    - Toggle notifications on/off
    - Premium upgrade CTA (link to paywall)
    - About, privacy policy, terms links

### Phase 6: Navigation
17. Set up React Navigation with bottom tabs:
    - Home (channels list)
    - Favorites (starred channels)
    - Alerts (notification settings)
    - Settings
18. Add stack navigator for PlayerScreen (modal presentation)

### Phase 7: Testing
19. Write unit tests for all services (mock Expo modules)
20. Write component tests (render, user interactions)
21. Write integration tests for key flows (add favorite, play stream, set alert)
22. Run `npm test` to verify all tests pass

### Phase 8: Polish
23. Add app icon and splash screen (use Expo's asset system)
24. Implement error boundaries for crash handling
25. Add analytics events (channel played, alert set, etc.) using Expo Analytics or Firebase
26. Optimize performance (lazy load channels, cache images)
27. Test on physical iOS and Android devices via Expo Go

### Phase 9: Backend integration (assumed external)
28. Replace mock API calls with real backend endpoints
29. Implement authentication for premium features (Expo AuthSession + backend JWT)
30. Add payment flow (Expo In-App Purchases or Stripe)

### Phase 10: Deployment
31. Build standalone apps: `eas build --platform all`
32. Submit to App Store and Google Play
33. Set up CI/CD for automated testing and builds

## 11. How to verify it works

### Local development:
1. **Install dependencies:** `npm install`
2. **Run tests:** `npm test` — All tests must pass (green output)
3. **Start Expo:** `npx expo start`
4. **Test on device:**
   - Scan QR code with Expo Go app (iOS/Android)
   - Grant location and notification permissions when prompted
   - Verify location detection shows your city
   - Verify channels load and display correctly
5. **Test core flows:**
   - Tap a channel → player screen opens → stream plays
   - Tap favorite star → channel appears in Favorites tab
   - Go to Alerts → create alert → verify notification scheduled
   - Pull-to-refresh on Home → channels reload
6. **Test offline mode:**
   - Enable airplane mode
   - Verify cached channels still display
   - Verify error message when trying to play stream
7. **Test on simulator:**
   - iOS: `npx expo run:ios`
   - Android: `npx expo run:android`
   - Mock location in simulator settings to test different cities

### Acceptance criteria:
- ✅ All Jest tests pass (`npm test`)
- ✅ App launches without crashes on iOS and Android
- ✅ Location detection works and shows relevant channels
- ✅ Video streams play without buffering issues (on good network)
- ✅ Favorites persist across app restarts
- ✅ Alerts trigger notifications at scheduled times
- ✅ UI is responsive and follows Material Design guidelines
- ✅ No console errors or warnings in Expo logs