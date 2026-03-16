# TuneLocal

## One-line pitch
Watch free local TV channels on any device—no cable box, no antenna in every room, just your phone.

## Expanded vision

**Broadest audience:**
This isn't just for cord-cutters. It's for:
- **Parents** who want kids to watch PBS Kids in the car during errands
- **Sports fans** who need local game broadcasts while traveling or at work
- **Immigrants and expats** who rely on local ethnic broadcasting (Spanish, Korean, Vietnamese stations)
- **Emergency-conscious households** who want reliable access to local news during power outages (phone battery lasts longer than TV)
- **Multi-generational homes** where grandparents want local news but don't want to monopolize the living room TV
- **Small business owners** (restaurants, waiting rooms) who want free background TV without cable contracts

**Adjacent use cases:**
- Local election coverage and city council meetings (civic engagement)
- High school sports broadcasts that only air on local channels
- Weather radar and emergency alerts with local context
- Community programming (church services, local events) that never makes it to streaming

**Non-technical appeal:**
"Remember when TV was free? It still is—you just need this app." No explaining OTA vs cable vs streaming. Just: open app, see your local channels, watch. The hardware setup (antenna + tuner box) is one-time, then it's invisible.

## Tech stack

- **React Native (Expo SDK 52+)** — cross-platform iOS/Android
- **expo-av** — video playback
- **expo-sqlite** — channel favorites, viewing history
- **expo-network** — detect home WiFi vs remote access
- **@react-navigation/native** — tab + stack navigation
- **react-native-video** — advanced streaming controls (fallback if expo-av insufficient)
- **Backend (separate service, not in mobile repo):**
  - Node.js + Express for streaming proxy
  - HDHomeRun or similar network tuner API integration
  - HLS transcoding for mobile delivery

## Core features

1. **Auto-discover local channels** — Scan user's network for compatible OTA tuner, pull channel guide via ZIP code
2. **Live TV grid** — Familiar channel guide UI with "what's on now" and next 2 hours
3. **Remote streaming** — Watch from anywhere via secure tunnel to home tuner (VPN-like, user-friendly setup)
4. **Favorites & notifications** — Pin channels, get alerts when favorite shows start (e.g., local news at 6pm)
5. **Picture-in-picture** — Keep watching while using other apps (iOS/Android native PiP)

## Monetization strategy

**Free tier:**
- Watch at home on local WiFi (unlimited)
- Up to 3 favorite channels
- Standard definition (480p)

**Premium ($5.99/month):**
- Remote streaming from anywhere
- Unlimited favorites + show alerts
- HD streaming (720p/1080p)
- 30-day cloud DVR (record up to 50 hours)
- Ad-skip for recorded content
- Multi-device sync (watch on tablet, resume on phone)

**Why this price?** 
- Cheaper than any cable/streaming bundle ($5.99 vs $40+ for YouTube TV)
- Comparable to single-app subscriptions (Hulu ads-free is $7.99)
- High perceived value: "I'm getting 20+ channels for less than a coffee"

**Retention hooks:**
- DVR recordings lock people in (sunk cost: "I have 10 shows saved")
- Remote access becomes habit-forming for commuters
- Local sports/news creates daily usage pattern

## Market position

**NOT saturated.** Incumbents have critical gaps:
- **Pluto/Tubi** — curated content, not true local OTA
- **Sling/YouTube TV** — expensive ($40+/month), not OTA-based
- **HDHomeRun app** — exists but clunky, tech-focused UI, no mobile-first design
- **Local station apps** — fragmented (need 5 apps for 5 channels), poor UX

**Our wedge:** We're the only mobile-first, design-forward OTA aggregator. Think "Spotify for free TV."

## File structure

```
tune-local/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Live TV grid
│   │   ├── favorites.tsx          # Saved channels
│   │   └── settings.tsx           # Tuner setup, account
│   ├── channel/[id].tsx           # Full-screen player
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── ChannelGrid.tsx            # TV guide grid
│   ├── VideoPlayer.tsx            # Live stream player
│   ├── TunerSetup.tsx             # First-run tuner discovery
│   └── PiPController.tsx          # Picture-in-picture wrapper
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── tuner.ts                   # Network tuner discovery/API
│   ├── streaming.ts               # HLS stream handling
│   └── notifications.ts           # Show alerts
├── hooks/
│   ├── useChannels.ts             # Fetch/cache channel list
│   ├── useStreamUrl.ts            # Get playback URL (local vs remote)
│   └── useFavorites.ts            # Manage favorites in SQLite
├── constants/
│   └── Config.ts                  # API endpoints, feature flags
├── __tests__/
│   ├── database.test.ts
│   ├── tuner.test.ts
│   ├── streaming.test.ts
│   └── favorites.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

**`__tests__/database.test.ts`**
```typescript
import { openDatabase, createTables, addFavorite, getFavorites } from '../lib/database';

describe('Database', () => {
  it('should create tables without error', async () => {
    const db = openDatabase();
    await expect(createTables(db)).resolves.not.toThrow();
  });

  it('should add and retrieve favorites', async () => {
    const db = openDatabase();
    await createTables(db);
    await addFavorite(db, { channelId: '2.1', name: 'PBS' });
    const favorites = await getFavorites(db);
    expect(favorites).toHaveLength(1);
    expect(favorites[0].name).toBe('PBS');
  });
});
```

**`__tests__/tuner.test.ts`**
```typescript
import { discoverTuners, getChannelList } from '../lib/tuner';

describe('Tuner Discovery', () => {
  it('should return empty array when no tuners found', async () => {
    const tuners = await discoverTuners();
    expect(Array.isArray(tuners)).toBe(true);
  });

  it('should fetch channel list from valid tuner', async () => {
    const mockTuner = { ip: '192.168.1.100', model: 'HDHomeRun' };
    const channels = await getChannelList(mockTuner);
    expect(Array.isArray(channels)).toBe(true);
  });
});
```

**`__tests__/streaming.test.ts`**
```typescript
import { buildStreamUrl, isOnHomeNetwork } from '../lib/streaming';

describe('Streaming', () => {
  it('should build local stream URL when on home WiFi', () => {
    const url = buildStreamUrl('2.1', true);
    expect(url).toContain('192.168');
  });

  it('should build remote stream URL when away from home', () => {
    const url = buildStreamUrl('2.1', false);
    expect(url).toContain('https://');
  });
});
```

**`__tests__/favorites.test.ts`**
```typescript
import { useFavorites } from '../hooks/useFavorites';
import { renderHook, act } from '@testing-library/react-hooks';

describe('useFavorites Hook', () => {
  it('should toggle favorite status', async () => {
    const { result } = renderHook(() => useFavorites());
    
    await act(async () => {
      await result.current.toggleFavorite({ channelId: '5.1', name: 'NBC' });
    });
    
    expect(result.current.favorites).toHaveLength(1);
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. `npx create-expo-app@latest tune-local --template tabs`
2. `cd tune-local && npm install expo-av expo-sqlite @react-navigation/native react-native-video`
3. Update `app.json`:
   - Set `name: "TuneLocal"`
   - Add `ios.infoPlist.NSLocalNetworkUsageDescription` for tuner discovery
   - Add `android.permissions` for `INTERNET`, `ACCESS_NETWORK_STATE`
4. Install dev dependencies: `npm install -D jest @testing-library/react-native @testing-library/react-hooks`

### Phase 2: Database layer
5. Create `lib/database.ts`:
   - Export `openDatabase()` using `expo-sqlite`
   - Export `createTables()` to initialize `favorites` and `viewing_history` tables
   - Export CRUD functions: `addFavorite()`, `removeFavorite()`, `getFavorites()`
6. Write `__tests__/database.test.ts` (see Tests section)
7. Run `npm test` to verify

### Phase 3: Tuner integration
8. Create `lib/tuner.ts`:
   - Export `discoverTuners()` — scan local network for HDHomeRun devices (use SSDP or HTTP discovery)
   - Export `getChannelList(tuner)` — fetch available channels from tuner API
   - Mock responses for testing (real hardware not required for MVP)
9. Create `components/TunerSetup.tsx`:
   - Show "Searching for tuner..." spinner
   - Display found tuners with "Connect" button
   - Store selected tuner IP in AsyncStorage
10. Write `__tests__/tuner.test.ts`

### Phase 4: Streaming logic
11. Create `lib/streaming.ts`:
   - Export `buildStreamUrl(channelId, isLocal)` — construct HLS URL
   - If `isLocal`, use tuner's local IP (e.g., `http://192.168.1.100:5004/auto/v{channelId}`)
   - If remote, use backend proxy URL (e.g., `https://api.tunelocal.app/stream/{userId}/{channelId}`)
   - Export `isOnHomeNetwork()` using `expo-network` to check WiFi SSID
12. Create `hooks/useStreamUrl.ts`:
   - Custom hook that calls `isOnHomeNetwork()` and `buildStreamUrl()`
   - Returns playback URL for given channel
13. Write `__tests__/streaming.test.ts`

### Phase 5: Video player
14. Create `components/VideoPlayer.tsx`:
   - Use `expo-av` `Video` component
   - Accept `streamUrl` prop
   - Show loading spinner while buffering
   - Add play/pause, volume controls
   - Implement error handling (show "Stream unavailable" message)
15. Create `app/channel/[id].tsx`:
   - Get `channelId` from route params
   - Use `useStreamUrl(channelId)` hook
   - Render `VideoPlayer` with stream URL
   - Add back button to return to grid

### Phase 6: Channel grid UI
16. Create `hooks/useChannels.ts`:
   - Fetch channel list from tuner on mount
   - Cache in state (or SQLite for persistence)
   - Return `{ channels, loading, error }`
17. Create `components/ChannelGrid.tsx`:
   - Display channels in FlatList (2 columns)
   - Each item shows channel number, name, current show
   - Tap to navigate to `channel/[id]` screen
18. Update `app/(tabs)/index.tsx`:
   - Render `ChannelGrid`
   - Show `TunerSetup` if no tuner configured

### Phase 7: Favorites
19. Create `hooks/useFavorites.ts`:
   - Load favorites from SQLite on mount
   - Export `toggleFavorite(channel)`, `isFavorite(channelId)`
20. Update `ChannelGrid.tsx`:
   - Add star icon to each channel
   - Tap star to toggle favorite (call `toggleFavorite`)
21. Create `app/(tabs)/favorites.tsx`:
   - Render `ChannelGrid` filtered to favorites only
22. Write `__tests__/favorites.test.ts`

### Phase 8: Settings & onboarding
23. Create `app/(tabs)/settings.tsx`:
   - Show connected tuner info
   - "Re-scan for tuners" button
   - Account/subscription status (mock for MVP)
   - "Remote access" toggle (premium feature gate)
24. Add first-run flow:
   - If no tuner in AsyncStorage, show `TunerSetup` modal on app launch
   - After setup, navigate to channel grid

### Phase 9: Picture-in-picture (optional for MVP, but high-value)
25. Create `components/PiPController.tsx`:
   - Wrap `VideoPlayer` with PiP logic
   - Use `expo-av` PiP APIs (iOS) and Android native PiP
   - Show mini player when user navigates away from channel screen
26. Update `app/channel/[id].tsx` to use `PiPController`

### Phase 10: Polish & testing
27. Add loading states to all screens
28. Add error boundaries for network failures
29. Test on physical device (Expo Go):
   - Verify tuner discovery works on local WiFi
   - Verify video playback (use test HLS stream if no tuner available)
30. Run full test suite: `npm test`
31. Fix any failing tests

### Phase 11: Backend (separate from mobile app, but required for remote streaming)
32. Create Node.js Express server:
   - `/api/stream/:userId/:channelId` endpoint
   - Proxy requests to user's home tuner via secure tunnel (ngrok-style)
   - Transcode to HLS if needed
33. Deploy to cloud (Railway, Render, or AWS Lambda)
34. Update `lib/streaming.ts` to use production backend URL

## How to verify it works

### Local development
1. `npm install` to install dependencies
2. `npm test` — all tests must pass (database, tuner, streaming, favorites)
3. `npx expo start` — launch Expo dev server
4. Open Expo Go on iOS/Android device (must be on same WiFi as dev machine)
5. Scan QR code to load app

### Functional testing
- **Tuner setup:** Tap "Settings" → "Re-scan for tuners" (should show mock tuner or real HDHomeRun if available)
- **Channel grid:** Navigate to "Live TV" tab, verify channels load (use mock data if no tuner)
- **Video playback:** Tap any channel, verify player loads (use public HLS test stream: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`)
- **Favorites:** Tap star icon on channel, navigate to "Favorites" tab, verify channel appears
- **Remote streaming:** Toggle "Remote access" in settings (should show paywall for free users)

### Acceptance criteria
- App launches without crashes
- Channel grid displays at least 5 mock channels
- Tapping a channel opens full-screen player
- Video plays smoothly (test stream or local tuner)
- Favorites persist after app restart
- All Jest tests pass (`npm test` exits with code 0)