# CritWave

## One-line pitch
Never miss a critically acclaimed album again — get instant alerts when your favorite artists drop new music, plus real-time consensus scores from top critics.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Music enthusiasts (18-45) who feel overwhelmed by the sheer volume of new releases every week
- People who want to discover music through critical consensus, not just algorithmic playlists
- Fans who follow specific artists but miss release announcements buried in social media noise

**Broader audience beyond the original niche:**
- **Casual listeners** who want a "what's worth listening to this week" digest without doing research
- **Social music fans** who want to share and discuss albums with friends based on critical reception
- **Playlist curators** (gym, study, party) who need quality filters for new music
- **Gift buyers** looking for trending albums to purchase for music lovers
- **FOMO-driven users** who want to stay culturally relevant in music conversations

**Adjacent use cases:**
- Concert discovery: "This artist you follow is playing nearby next month"
- Vinyl/merch alerts: "Limited edition pressing announced for this album you rated 5 stars"
- Social proof for music taste: Share your year-end stats and top-rated albums
- Music journalism gateway: Discover new critics and publications through aggregated reviews

**Why non-technical people want this:**
- Eliminates decision paralysis ("What should I listen to?")
- Provides social currency (be the friend who knows about great albums first)
- Saves time (no more scrolling through Spotify's endless recommendations)
- Validates taste (see if your opinions align with critics or friends)

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **State management:** Zustand (lightweight, no boilerplate)
- **Notifications:** expo-notifications
- **API calls:** Axios
- **Navigation:** Expo Router (file-based routing)
- **UI:** React Native Paper (Material Design components)
- **Testing:** Jest + React Native Testing Library
- **Date handling:** date-fns

**External APIs (mock for MVP, integrate later):**
- MusicBrainz API (free, open-source music metadata)
- Spotify Web API (for listening integration)
- Custom backend (Node.js + Express) for review aggregation and push notifications

## Core features (MVP)

1. **Artist Following + Smart Notifications**
   - Follow unlimited artists (free tier: 10 artists, premium: unlimited)
   - Push notifications when followed artists release new albums
   - Notification includes aggregated critic score (0-100) and top review snippet
   - Snooze/dismiss with "remind me in 1 week" option

2. **Consensus Score Dashboard**
   - Real-time aggregated score from 20+ music publications (Pitchfork, Rolling Stone, NME, etc.)
   - Visual score breakdown: see which critics loved/hated an album
   - "Trending This Week" feed sorted by consensus score
   - Filter by genre, release date, or score threshold

3. **Personal Rating + Year-End Stats**
   - Rate albums 1-5 stars with optional notes
   - Auto-generated "Your Top Albums of 2026" list
   - Compare your ratings vs critic consensus (alignment score)
   - Shareable year-end graphics for social media

4. **Quick Listen Integration**
   - One-tap "Listen Now" buttons for Spotify/Apple Music
   - Deep links to specific albums (no app switching friction)
   - "Add to Library" without leaving CritWave

5. **Offline-First Architecture**
   - All followed artists, ratings, and cached reviews stored locally
   - Sync when online, fully functional offline
   - Background sync for new releases (check every 6 hours)

## Monetization strategy

### Free tier (the hook):
- Follow up to 10 artists
- View consensus scores for any album
- Rate up to 25 albums per year
- Ads in feed (non-intrusive, between album cards)
- Basic notifications (new releases only)

### Premium tier: $4.99/month or $39.99/year (the paywall):
- **Unlimited artist follows** (power users follow 50+ artists)
- **Advanced notifications:** "Artist you follow just got a 90+ score" or "Album you rated 5 stars is now on vinyl"
- **Ad-free experience**
- **Unlimited ratings + notes** (build your personal music journal)
- **Early access features:** Genre-specific digests, critic profiles, concert alerts
- **Export data:** Download your ratings as CSV/JSON
- **Exclusive content:** Monthly "Editor's Pick" playlist with liner notes

### Price reasoning:
- $4.99 is impulse-buy territory (cheaper than one coffee)
- Annual discount (17% off) encourages long-term commitment
- Comparable to Spotify ($10.99) but positioned as complementary, not competitive

### Retention drivers:
- **Sunk cost:** Users build a personal rating history they don't want to lose
- **FOMO:** Missing notifications on followed artists feels like missing out
- **Year-end stats:** Users return annually to see their music journey
- **Social proof:** Sharing stats creates viral loops and re-engagement

### Revenue projections (conservative):
- 10,000 downloads in Year 1
- 5% conversion to premium = 500 subscribers
- Monthly recurring revenue: $2,495
- Annual run rate: ~$30K (covers hosting + part-time dev)

## File structure

```
critwave/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx             # Home feed (trending albums)
│   │   ├── artists.tsx           # Followed artists list
│   │   ├── ratings.tsx           # User's rated albums
│   │   └── profile.tsx           # Settings + year-end stats
│   ├── album/[id].tsx            # Album detail screen
│   ├── artist/[id].tsx           # Artist detail screen
│   └── _layout.tsx               # Root layout
├── components/
│   ├── AlbumCard.tsx             # Album card with score + cover
│   ├── ArtistRow.tsx             # Artist list item
│   ├── ConsensusScore.tsx        # Visual score breakdown
│   ├── NotificationBanner.tsx    # In-app notification UI
│   └── RatingStars.tsx           # 5-star rating input
├── services/
│   ├── database.ts               # SQLite setup + queries
│   ├── notifications.ts          # Push notification logic
│   ├── api.ts                    # API client (mock + real)
│   └── sync.ts                   # Background sync logic
├── stores/
│   ├── artistStore.ts            # Zustand store for artists
│   ├── albumStore.ts             # Zustand store for albums
│   └── userStore.ts              # User preferences + premium status
├── types/
│   └── index.ts                  # TypeScript interfaces
├── utils/
│   ├── scoreCalculator.ts        # Aggregate critic scores
│   └── dateHelpers.ts            # Format release dates
├── __tests__/
│   ├── scoreCalculator.test.ts
│   ├── database.test.ts
│   ├── artistStore.test.ts
│   └── components/
│       ├── AlbumCard.test.tsx
│       └── ConsensusScore.test.tsx
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### Core logic tests:

**`__tests__/scoreCalculator.test.ts`**
- Calculate consensus score from multiple critic reviews
- Handle missing/incomplete review data
- Weight scores by publication credibility

**`__tests__/database.test.ts`**
- Insert/update/delete artists, albums, ratings
- Query followed artists with release dates
- Sync local data with remote API

**`__tests__/artistStore.test.ts`**
- Follow/unfollow artists
- Enforce free tier limits (10 artists max)
- Persist state to SQLite

**`__tests__/components/AlbumCard.test.tsx`**
- Render album cover, title, artist, score
- Handle missing cover art gracefully
- Trigger "Listen Now" action on press

**`__tests__/components/ConsensusScore.test.tsx`**
- Display score as color-coded badge (0-49 red, 50-74 yellow, 75-100 green)
- Show score breakdown tooltip on long press
- Handle albums with <3 reviews (show "Not enough data")

### Test coverage requirements:
- Minimum 80% coverage for `services/` and `utils/`
- All Zustand stores must have unit tests
- Critical UI components (AlbumCard, ConsensusScore) must have snapshot tests

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app critwave --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-notifications zustand axios date-fns react-native-paper
   npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo
   ```
3. Configure TypeScript: Update `tsconfig.json` with strict mode
4. Set up Jest: Create `jest.config.js` with React Native preset
5. Configure Expo Router: Update `app.json` with scheme and notification settings

### Phase 2: Database layer
1. Create `services/database.ts`:
   - Initialize SQLite database with tables: `artists`, `albums`, `ratings`, `reviews`
   - Write CRUD functions: `addArtist()`, `getFollowedArtists()`, `rateAlbum()`, etc.
   - Add migration logic for schema updates
2. Write tests in `__tests__/database.test.ts`:
   - Test insert/update/delete operations
   - Test query performance with 100+ records
   - Test foreign key constraints

### Phase 3: State management
1. Create Zustand stores:
   - `stores/artistStore.ts`: Manage followed artists, enforce free tier limits
   - `stores/albumStore.ts`: Cache album data, track user ratings
   - `stores/userStore.ts`: Premium status, notification preferences
2. Integrate stores with SQLite: Persist state changes to database
3. Write store tests: Verify state updates and persistence

### Phase 4: API integration (mock first)
1. Create `services/api.ts`:
   - Mock API responses for artists, albums, reviews
   - Implement `searchArtist()`, `getAlbumDetails()`, `getReviews()`
   - Add error handling and retry logic
2. Create `utils/scoreCalculator.ts`:
   - Aggregate review scores (weighted average)
   - Normalize scores to 0-100 scale
   - Handle edge cases (single review, conflicting scores)
3. Write tests for score calculation logic

### Phase 5: Core UI components
1. Build `components/AlbumCard.tsx`:
   - Display album cover (use placeholder if missing)
   - Show consensus score badge
   - Add "Listen Now" and "Rate" buttons
2. Build `components/ConsensusScore.tsx`:
   - Color-coded score display
   - Tooltip with review breakdown
   - Handle "Not enough data" state
3. Build `components/RatingStars.tsx`:
   - Interactive 5-star input
   - Save rating to database on change
4. Write component tests with snapshots

### Phase 6: Main screens
1. Implement `app/(tabs)/index.tsx` (Home feed):
   - Fetch trending albums (sorted by consensus score)
   - Infinite scroll with pagination
   - Pull-to-refresh
2. Implement `app/(tabs)/artists.tsx`:
   - List followed artists with latest release
   - "Follow Artist" search bar
   - Enforce free tier limit (show upgrade prompt)
3. Implement `app/(tabs)/ratings.tsx`:
   - Display user's rated albums
   - Sort by rating, date, or artist
   - Export ratings (premium only)
4. Implement `app/album/[id].tsx`:
   - Full album details (tracklist, reviews, score breakdown)
   - "Listen Now" integration
   - Rating input

### Phase 7: Notifications
1. Create `services/notifications.ts`:
   - Request notification permissions on first launch
   - Schedule local notifications for new releases
   - Handle notification taps (deep link to album)
2. Implement background sync in `services/sync.ts`:
   - Check for new releases every 6 hours
   - Compare with local database
   - Trigger notifications for followed artists
3. Test notifications on physical device (Expo Go doesn't support background tasks)

### Phase 8: Premium features
1. Add paywall UI:
   - Show upgrade prompt when hitting free tier limits
   - Display premium benefits modal
2. Implement premium checks:
   - Gate unlimited follows, ad-free, export features
   - Mock subscription status for testing (use Zustand store)
3. Add year-end stats screen (premium):
   - Calculate top albums, genres, alignment score
   - Generate shareable graphic (use `react-native-view-shot`)

### Phase 9: Polish
1. Add loading states and error boundaries
2. Implement offline mode indicators
3. Add haptic feedback for interactions
4. Optimize images (use `expo-image` for caching)
5. Add onboarding flow (3-screen tutorial)

### Phase 10: Testing & QA
1. Run full test suite: `npm test`
2. Test on iOS simulator and Android emulator
3. Test on physical devices via Expo Go
4. Verify offline functionality (airplane mode)
5. Test notification delivery and deep linking
6. Check accessibility (screen reader support)

## How to verify it works

### Local development:
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Verify all tabs load without errors
4. Test core flows:
   - Search and follow an artist
   - View trending albums feed
   - Rate an album (1-5 stars)
   - View album details and consensus score
   - Check that ratings persist after app restart

### Automated tests:
1. Run test suite: `npm test`
2. Verify all tests pass (minimum 80% coverage)
3. Check for console warnings/errors

### Notification testing (requires physical device):
1. Build development client: `npx expo run:ios` or `npx expo run:android`
2. Follow an artist
3. Manually trigger background sync (add debug button in dev mode)
4. Verify notification appears with correct album info
5. Tap notification and verify deep link to album screen

### Offline mode:
1. Enable airplane mode on device
2. Open app and verify followed artists/ratings load from SQLite
3. Attempt to search for new artist (should show "Offline" message)
4. Disable airplane mode and verify sync resumes

### Premium flow:
1. Hit free tier limit (follow 10 artists)
2. Verify upgrade prompt appears
3. Mock premium subscription in `userStore`
4. Verify unlimited follows and ad-free experience

### Success criteria:
- App launches in <2 seconds on mid-range device
- All screens render without layout shifts
- Ratings persist across app restarts
- Notifications deliver within 5 minutes of new release
- No crashes during 10-minute usage session
- `npm test` passes with 0 failures