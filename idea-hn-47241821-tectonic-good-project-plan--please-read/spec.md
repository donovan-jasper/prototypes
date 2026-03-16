# SafeCircle

## One-line pitch
Your lifeline in crisis—instant access to shelters, legal help, and emergency resources, even offline.

## Expanded vision

**Core audience:** Anyone facing urgent vulnerability—homelessness, domestic violence, eviction, natural disasters, immigration challenges, or sudden job loss.

**Broader appeal:**
- **Travelers in unfamiliar cities** needing emergency services, pharmacies, or legal help abroad
- **College students** navigating housing insecurity, Title IX issues, or mental health crises
- **Elderly populations** with limited tech literacy who need simple, voice-guided access to services
- **Parents** seeking child-specific resources (food banks, school supplies, pediatric care)
- **Gig workers** without employer benefits who need instant access to healthcare, legal aid, or housing assistance

**Adjacent use cases:**
- Crisis preparedness toolkit (wildfire evacuation routes, flood zones, emergency contacts)
- Community mutual aid coordination (share resources, organize donations)
- Legal document generation for common needs (lease disputes, restraining orders, immigration forms)
- Multilingual support for non-English speakers navigating social services

**Why non-technical users want this:**
- Works via SMS—no app download required for basic features
- Voice-guided navigation in 20+ languages
- Offline maps and cached resource directories
- One-tap emergency sharing (location + situation to trusted contacts)
- No jargon—plain language explanations of rights and options

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite) for offline resource caching
- **Maps:** react-native-maps with offline tile support
- **SMS integration:** Twilio API (server-side)
- **AI:** OpenAI API for document generation and chatbot (rate-limited free tier)
- **Location:** expo-location with background tracking for safety check-ins
- **Voice:** expo-speech for text-to-speech guidance
- **Minimal deps:** Avoid heavy libraries—prioritize bundle size for low-end devices

## Core features (MVP)

1. **Resource Finder** — Location-based search for shelters, food banks, legal aid, pharmacies, and hospitals. Works offline with cached data. Filters by availability (open now, wheelchair accessible, pet-friendly).

2. **Crisis Chatbot** — AI-powered assistant that answers questions like "How do I fight an eviction?" or "Where can I get free healthcare?" in plain language. Generates simple legal letters (eviction response, restraining order request).

3. **Safety Check-In** — Schedule automatic location shares to trusted contacts. If you don't check in within a set time, your location and a pre-written message are sent via SMS.

4. **Offline Survival Kit** — Downloadable guides (know your rights, disaster prep, first aid) that work without internet. Includes voice playback for low-literacy users.

5. **Community Board** — Hyperlocal mutual aid posts (free meals, clothing donations, ride shares). Moderated to prevent scams.

## Monetization strategy

**Free tier:**
- Resource finder (basic filters)
- Crisis chatbot (5 questions/day)
- Safety check-in (1 trusted contact)
- Offline guides (limited selection)

**Premium ($4.99/month or $39.99/year):**
- Unlimited chatbot access
- AI-generated legal documents (unlimited)
- Advanced resource filters (LGBTQ+ friendly, language-specific, pet-friendly)
- Up to 5 safety check-in contacts
- Ad-free experience
- Priority support from partner organizations

**One-time purchases:**
- Critical legal document ($2.99 each) — eviction response, restraining order, immigration form
- Offline map packs by region ($1.99 each)

**Why people stay subscribed:**
- Monthly legal document generation saves $100+ in lawyer fees
- Peace of mind from safety check-ins (especially for domestic violence survivors)
- Continuous updates to resource database (new shelters, policy changes)
- Community board access for ongoing mutual aid

**Revenue reasoning:**
- $4.99 is impulse-buy territory (less than a coffee)
- Annual discount incentivizes commitment
- One-time purchases capture users in acute crisis who won't subscribe
- Partner referral fees (shelters, legal orgs) for premium users

## File structure

```
safecircle/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Resource Finder
│   │   ├── chatbot.tsx            # Crisis Chatbot
│   │   ├── safety.tsx             # Safety Check-In
│   │   ├── community.tsx          # Community Board
│   │   └── profile.tsx            # Settings & Premium
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── ResourceCard.tsx
│   ├── ChatMessage.tsx
│   ├── SafetyTimer.tsx
│   ├── CommunityPost.tsx
│   └── PremiumGate.tsx
├── services/
│   ├── database.ts                # SQLite setup
│   ├── location.ts                # Geolocation logic
│   ├── chatbot.ts                 # AI API calls
│   ├── sms.ts                     # Twilio integration
│   └── resources.ts               # Resource data fetching
├── utils/
│   ├── offlineStorage.ts
│   ├── permissions.ts
│   └── constants.ts
├── __tests__/
│   ├── database.test.ts
│   ├── location.test.ts
│   ├── chatbot.test.ts
│   └── resources.test.ts
├── assets/
│   ├── guides/                    # Offline PDFs
│   └── icons/
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/database.test.ts
import { initDatabase, getResourcesByLocation } from '../services/database';

describe('Database', () => {
  it('initializes SQLite database', async () => {
    const db = await initDatabase();
    expect(db).toBeDefined();
  });

  it('fetches resources within 5km radius', async () => {
    const resources = await getResourcesByLocation(37.7749, -122.4194, 5);
    expect(resources.length).toBeGreaterThan(0);
  });
});

// __tests__/location.test.ts
import { getCurrentLocation, calculateDistance } from '../services/location';

describe('Location', () => {
  it('calculates distance between two coordinates', () => {
    const distance = calculateDistance(37.7749, -122.4194, 37.7849, -122.4094);
    expect(distance).toBeCloseTo(1.2, 1);
  });
});

// __tests__/chatbot.test.ts
import { generateResponse, generateLegalDocument } from '../services/chatbot';

describe('Chatbot', () => {
  it('generates response to crisis question', async () => {
    const response = await generateResponse('Where can I find a shelter?');
    expect(response).toContain('shelter');
  });

  it('generates eviction response letter', async () => {
    const doc = await generateLegalDocument('eviction', { name: 'John Doe' });
    expect(doc).toContain('eviction');
  });
});

// __tests__/resources.test.ts
import { filterResources, cacheResourcesOffline } from '../services/resources';

describe('Resources', () => {
  it('filters resources by type', () => {
    const shelters = filterResources('shelter');
    expect(shelters.every(r => r.type === 'shelter')).toBe(true);
  });

  it('caches resources for offline use', async () => {
    await cacheResourcesOffline([{ id: 1, name: 'Test Shelter' }]);
    // Verify cached data exists
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app safecircle --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-location expo-speech react-native-maps
   npm install @react-navigation/native axios
   npm install -D jest @testing-library/react-native
   ```
3. Configure `app.json`:
   - Set permissions: `LOCATION`, `LOCATION_BACKGROUND`, `NOTIFICATIONS`
   - Add privacy descriptions for iOS
4. Set up TypeScript strict mode in `tsconfig.json`

### Phase 2: Database layer
1. Create `services/database.ts`:
   - Initialize SQLite with tables: `resources`, `saved_locations`, `check_ins`, `community_posts`
   - Write seed data for common resources (shelters, food banks)
   - Implement CRUD operations with error handling
2. Add offline sync logic:
   - Cache API responses locally
   - Queue writes when offline, sync when online
3. Write tests in `__tests__/database.test.ts`

### Phase 3: Location services
1. Create `services/location.ts`:
   - Request foreground/background permissions
   - Get current location with fallback to last known
   - Implement haversine formula for distance calculation
   - Add geofencing for safety check-ins
2. Integrate with `react-native-maps`:
   - Display user location and nearby resources
   - Add custom markers for resource types
   - Enable offline map tiles (cache 10km radius)
3. Write tests in `__tests__/location.test.ts`

### Phase 4: Resource Finder UI
1. Build `app/(tabs)/index.tsx`:
   - Search bar with autocomplete
   - Filter chips (type, distance, open now)
   - List view with `ResourceCard` components
   - Map view toggle
2. Create `components/ResourceCard.tsx`:
   - Display name, address, distance, hours
   - Call/directions buttons
   - Save to favorites
3. Implement pull-to-refresh and infinite scroll
4. Add empty states for no results

### Phase 5: Crisis Chatbot
1. Create `services/chatbot.ts`:
   - OpenAI API integration with rate limiting
   - System prompt for crisis-appropriate responses
   - Document generation templates (eviction, restraining order)
   - Fallback to cached responses when offline
2. Build `app/(tabs)/chatbot.tsx`:
   - Chat interface with `ChatMessage` components
   - Voice input button (speech-to-text)
   - Text-to-speech for responses
   - Premium gate after 5 questions/day
3. Write tests in `__tests__/chatbot.test.ts`

### Phase 6: Safety Check-In
1. Create `services/sms.ts`:
   - Twilio API integration for SMS sending
   - Background task scheduling (expo-task-manager)
2. Build `app/(tabs)/safety.tsx`:
   - Timer setup UI (15min, 1hr, 4hr, custom)
   - Trusted contacts list (phone numbers)
   - Pre-written message editor
   - Manual check-in button
3. Implement background location tracking:
   - Start tracking when timer is active
   - Send SMS if timer expires without check-in
4. Add local notifications for reminders

### Phase 7: Offline Survival Kit
1. Bundle PDF guides in `assets/guides/`:
   - Know Your Rights (eviction, police encounters)
   - Disaster Prep (earthquake, flood, fire)
   - First Aid Basics
2. Add download manager:
   - Progress indicators
   - Storage space checks
3. Integrate expo-speech for audio playback
4. Add multilingual support (Spanish, Mandarin, Arabic)

### Phase 8: Community Board
1. Build `app/(tabs)/community.tsx`:
   - Post creation form (title, description, location)
   - Feed with `CommunityPost` components
   - Upvote/flag system
2. Add moderation:
   - Auto-flag posts with suspicious keywords
   - Report button
   - Admin review queue (future)
3. Implement location-based filtering (10km radius)

### Phase 9: Premium features
1. Create `components/PremiumGate.tsx`:
   - Paywall UI with feature comparison
   - In-app purchase integration (expo-in-app-purchases)
2. Build `app/(tabs)/profile.tsx`:
   - Subscription status
   - Usage stats (chatbot questions, check-ins)
   - Settings (language, notifications)
3. Implement feature flags:
   - Check subscription status before premium actions
   - Graceful degradation for free users

### Phase 10: Polish & testing
1. Add error boundaries and crash reporting
2. Optimize bundle size (code splitting, lazy loading)
3. Test on low-end Android devices (4GB RAM, slow network)
4. Run accessibility audit (screen reader support)
5. Write integration tests for critical flows
6. Set up CI/CD for automated testing

### Phase 11: Backend (optional for MVP)
1. Deploy Node.js API (Express + PostgreSQL):
   - Resource database with admin panel
   - SMS webhook for Twilio
   - Community post moderation
2. Add authentication (Clerk or Supabase)
3. Implement analytics (Mixpanel or PostHog)

## How to verify it works

### Local development
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Test core flows:
   - Search for resources near current location
   - Ask chatbot a question (verify response)
   - Set up safety check-in timer (verify SMS sent)
   - Download offline guide (verify accessible without internet)
   - Post to community board (verify appears in feed)

### Automated tests
1. Run test suite: `npm test`
2. Verify all tests pass:
   - Database operations (CRUD, filtering)
   - Location calculations (distance, geofencing)
   - Chatbot responses (API mocking)
   - Resource caching (offline mode)

### Device testing
1. Test on physical device with location services enabled
2. Verify background location tracking works when app is closed
3. Test offline mode:
   - Enable airplane mode
   - Verify cached resources load
   - Verify offline guides accessible
4. Test SMS delivery (use real phone number)
5. Test on low-end Android device (check performance)

### Acceptance criteria
- App launches in <3 seconds on mid-range device
- Resource search returns results within 5km in <1 second
- Chatbot responds in <5 seconds (with network)
- Safety check-in SMS delivers within 30 seconds of timer expiration
- Offline guides load instantly without network
- All tests pass with >80% code coverage