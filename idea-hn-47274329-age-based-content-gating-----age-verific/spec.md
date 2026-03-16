# GuardianGate

## One-line pitch
Screen time that actually protects — age-appropriate content filtering that works across every app, with zero setup.

## Expanded vision

**Who this is REALLY for:**

This isn't just a parental control app. It's a **universal content safety layer** for mobile devices.

**Broadest audience:**
- **Parents** (primary): 40M+ US households with kids under 18 need effortless content protection
- **Schools & institutions**: Bulk device management for student phones and tablets
- **Adults with ADHD/addiction concerns**: Self-imposed content boundaries (gambling, adult content, social media)
- **Elderly care**: Caregivers protecting vulnerable adults from scams and inappropriate content
- **Corporate IT**: BYOD policies requiring content compliance on employee devices
- **Religious communities**: Families wanting values-aligned content filtering

**Adjacent use cases:**
- **Screen time coaching**: Not just blocking, but teaching healthy digital habits with age-appropriate nudges
- **Family digital contracts**: Kids earn privileges by meeting goals (homework, chores)
- **Content discovery**: Curated "safe" alternatives when blocked content is requested
- **Digital inheritance**: Parents gradually release controls as kids demonstrate responsibility

**Why non-technical people want this:**
- **One tap setup** — no router configs, no per-app settings, no tech support calls
- **Works everywhere** — YouTube, TikTok, Safari, Chrome, every app uses the same rules
- **Invisible to kids** — no "parent mode" button to hack, enforcement happens at OS level
- **Peace of mind** — notifications when risky content is blocked, not constant monitoring

**The gap competitors miss:**
Existing solutions are either too technical (router-level DNS filtering), too invasive (screen recording), or too easy to bypass (app-specific blocks). GuardianGate uses OS-level content policy APIs (iOS Screen Time API, Android Digital Wellbeing API) to enforce rules **before** content loads, with zero performance impact.

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Language**: TypeScript
- **Local storage**: SQLite (expo-sqlite)
- **State management**: Zustand (lightweight, no boilerplate)
- **Native modules**:
  - `expo-device` — device info
  - `expo-local-authentication` — biometric parent PIN
  - Custom native modules for iOS Screen Time API / Android Digital Wellbeing API
- **Backend**: Supabase (auth, profile sync, content policy updates)
- **Testing**: Jest + React Native Testing Library
- **CI/CD**: EAS Build + EAS Submit

## Core features (MVP)

1. **One-Tap Age Profiles**
   - Pre-configured content policies: Toddler (0-4), Kid (5-12), Teen (13-17), Adult
   - Instant activation with biometric parent lock
   - Blocks mature content across all apps using OS-level APIs

2. **Smart Content Blocking**
   - Real-time URL/domain filtering using curated blocklists
   - AI-powered image analysis for visual content (NSFW detection)
   - Keyword filtering for search queries and social media

3. **Parent Dashboard**
   - Weekly digest: what was blocked, when, and where
   - No invasive monitoring — just safety alerts
   - Remote profile updates via cloud sync

4. **Bypass Requests**
   - Kids can request access to blocked content with context ("need for school project")
   - Parents approve/deny with one tap, with optional time limits

5. **Offline-First Protection**
   - All rules enforced locally — no internet required
   - Policies sync when online, but never fail open

## Monetization strategy

**Free tier (the hook):**
- One child profile
- Basic age-appropriate filtering (curated blocklists only)
- Weekly email digest
- Community-sourced blocklists

**Premium ($4.99/month or $39.99/year — 33% savings):**
- Unlimited child profiles
- AI-powered visual content analysis
- Custom keyword/domain blocks
- Real-time push notifications
- Priority support
- Family sharing (up to 6 devices)

**Why this price point:**
- Higher than competitors ($2.99) because we offer **true OS-level enforcement**, not just app wrappers
- Annual plan drives LTV and reduces churn
- Comparable to streaming services parents already pay for

**What makes people STAY subscribed:**
- **Sunk cost**: Once set up, removing it feels risky ("what if my kid sees something?")
- **Habit formation**: Weekly digests become part of parenting routine
- **Network effects**: Family sharing means multiple stakeholders invested
- **Feature creep**: We add new content sources (gaming, VR) as they emerge

**Additional revenue streams:**
- **B2B licensing**: Schools pay $2/student/year for bulk deployment
- **Hardware partnerships**: Pre-installed on kid-focused devices (Amazon Fire Kids, etc.)

## File structure

```
guardian-gate/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard
│   │   ├── profiles.tsx           # Manage child profiles
│   │   └── settings.tsx           # App settings
│   ├── _layout.tsx
│   ├── onboarding.tsx             # First-run setup
│   └── bypass-request.tsx         # Kid's request screen
├── components/
│   ├── AgeProfileCard.tsx
│   ├── BlockedContentAlert.tsx
│   ├── ParentPinModal.tsx
│   └── WeeklyDigest.tsx
├── lib/
│   ├── database/
│   │   ├── schema.ts              # SQLite schema
│   │   └── queries.ts             # DB operations
│   ├── filtering/
│   │   ├── contentFilter.ts       # Core filtering logic
│   │   ├── blocklists.ts          # Domain/keyword lists
│   │   └── imageAnalysis.ts       # NSFW detection
│   ├── native/
│   │   ├── screenTimeAPI.ts       # iOS Screen Time wrapper
│   │   └── digitalWellbeingAPI.ts # Android wrapper
│   ├── store/
│   │   └── useStore.ts            # Zustand store
│   └── supabase.ts                # Supabase client
├── constants/
│   ├── ageProfiles.ts             # Pre-configured profiles
│   └── Colors.ts
├── __tests__/
│   ├── contentFilter.test.ts
│   ├── ageProfiles.test.ts
│   ├── database.test.ts
│   └── components/
│       └── AgeProfileCard.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

**Core logic tests (Jest):**

```typescript
// __tests__/contentFilter.test.ts
describe('ContentFilter', () => {
  it('blocks adult domains for kid profile', () => {
    const result = filterURL('https://example-adult-site.com', 'kid');
    expect(result.blocked).toBe(true);
    expect(result.reason).toBe('domain_blocklist');
  });

  it('allows educational sites for all profiles', () => {
    const result = filterURL('https://khanacademy.org', 'toddler');
    expect(result.blocked).toBe(false);
  });

  it('blocks keywords in search queries', () => {
    const result = filterSearchQuery('inappropriate keyword', 'teen');
    expect(result.blocked).toBe(true);
  });
});

// __tests__/ageProfiles.test.ts
describe('AgeProfiles', () => {
  it('returns correct restrictions for toddler profile', () => {
    const profile = getAgeProfile('toddler');
    expect(profile.allowedDomains).toContain('pbskids.org');
    expect(profile.blockAdultContent).toBe(true);
  });

  it('teen profile allows more domains than kid', () => {
    const teen = getAgeProfile('teen');
    const kid = getAgeProfile('kid');
    expect(teen.allowedDomains.length).toBeGreaterThan(kid.allowedDomains.length);
  });
});

// __tests__/database.test.ts
describe('Database', () => {
  it('creates child profile with correct schema', async () => {
    const profile = await createChildProfile({
      name: 'Test Child',
      age: 8,
      profileType: 'kid'
    });
    expect(profile.id).toBeDefined();
    expect(profile.profileType).toBe('kid');
  });

  it('logs blocked content events', async () => {
    await logBlockedContent({
      profileId: 'test-id',
      url: 'blocked-site.com',
      reason: 'domain_blocklist',
      timestamp: Date.now()
    });
    const logs = await getBlockedContentLogs('test-id');
    expect(logs.length).toBeGreaterThan(0);
  });
});

// __tests__/components/AgeProfileCard.test.tsx
describe('AgeProfileCard', () => {
  it('renders profile name and age', () => {
    const { getByText } = render(
      <AgeProfileCard name="Emma" age={7} profileType="kid" />
    );
    expect(getByText('Emma')).toBeTruthy();
    expect(getByText('7 years old')).toBeTruthy();
  });

  it('shows correct icon for profile type', () => {
    const { getByTestId } = render(
      <AgeProfileCard name="Test" age={5} profileType="toddler" />
    );
    expect(getByTestId('toddler-icon')).toBeTruthy();
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app guardian-gate --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-device expo-local-authentication zustand
   npm install @supabase/supabase-js
   npm install -D jest @testing-library/react-native @types/jest
   ```
3. Configure TypeScript in `tsconfig.json` with strict mode
4. Set up Supabase project and add credentials to `.env`

### Phase 2: Database layer
1. Create SQLite schema in `lib/database/schema.ts`:
   - `profiles` table: id, name, age, profileType, createdAt
   - `blocked_content` table: id, profileId, url, reason, timestamp
   - `bypass_requests` table: id, profileId, url, reason, status, requestedAt
2. Implement database queries in `lib/database/queries.ts`:
   - `createChildProfile()`, `getProfiles()`, `updateProfile()`, `deleteProfile()`
   - `logBlockedContent()`, `getBlockedContentLogs()`
   - `createBypassRequest()`, `getBypassRequests()`, `updateBypassRequest()`
3. Write tests for all database operations

### Phase 3: Content filtering engine
1. Define age profiles in `constants/ageProfiles.ts`:
   - Toddler: whitelist-only (pbskids.org, youtube.com/kids, etc.)
   - Kid: blocklist for adult content, violence, gambling
   - Teen: lighter restrictions, focus on extreme content
   - Adult: minimal filtering (user-defined only)
2. Implement `lib/filtering/contentFilter.ts`:
   - `filterURL(url: string, profileType: string)` — checks domain against blocklists
   - `filterSearchQuery(query: string, profileType: string)` — keyword matching
   - `analyzeImage(imageUri: string)` — placeholder for NSFW detection (use TensorFlow Lite model)
3. Create curated blocklists in `lib/filtering/blocklists.ts`:
   - Adult content domains (10k+ entries)
   - Violence/gore domains
   - Gambling sites
   - Social media (configurable per profile)
4. Write comprehensive tests for filtering logic

### Phase 4: Native module stubs
1. Create `lib/native/screenTimeAPI.ts` (iOS):
   - `enableContentFilter(profileType: string)` — activates Screen Time API restrictions
   - `disableContentFilter()` — removes restrictions
   - `getScreenTimeStatus()` — checks if API is available
2. Create `lib/native/digitalWellbeingAPI.ts` (Android):
   - Same interface as iOS module
   - Uses Android Digital Wellbeing API
3. For MVP, implement as stubs that log actions (full native implementation requires custom native modules)

### Phase 5: State management
1. Set up Zustand store in `lib/store/useStore.ts`:
   - `profiles` — array of child profiles
   - `activeProfile` — currently selected profile
   - `blockedContentLogs` — recent blocks
   - `bypassRequests` — pending requests
   - Actions: `addProfile`, `selectProfile`, `logBlock`, `addBypassRequest`
2. Persist store to SQLite on changes

### Phase 6: UI components
1. Build `components/AgeProfileCard.tsx`:
   - Shows profile name, age, icon
   - Tap to select/edit
   - Long press to delete (with confirmation)
2. Build `components/ParentPinModal.tsx`:
   - Biometric auth (Face ID/Touch ID/fingerprint)
   - Fallback to 4-digit PIN
   - Used before sensitive actions (profile changes, bypass approvals)
3. Build `components/BlockedContentAlert.tsx`:
   - Shows when content is blocked
   - Displays reason and timestamp
   - Button to request bypass
4. Build `components/WeeklyDigest.tsx`:
   - Summary card: X items blocked this week
   - Top blocked categories
   - Tap to see full log
5. Write component tests

### Phase 7: Screens
1. Implement `app/onboarding.tsx`:
   - Welcome screen explaining app purpose
   - Create first child profile (name, age, photo)
   - Set parent PIN
   - Request OS permissions (Screen Time API access)
2. Implement `app/(tabs)/index.tsx` (Dashboard):
   - List of child profiles (AgeProfileCard components)
   - Quick stats: blocks today, pending bypass requests
   - Weekly digest card
3. Implement `app/(tabs)/profiles.tsx`:
   - Full list of profiles with edit/delete
   - Add new profile button
   - Profile detail view: age, restrictions, activity log
4. Implement `app/(tabs)/settings.tsx`:
   - Premium upgrade CTA
   - Notification preferences
   - Custom blocklists (premium)
   - Export data
   - About/support
5. Implement `app/bypass-request.tsx`:
   - Kid-facing screen when content is blocked
   - Text input: "Why do you need access?"
   - Submit request button
   - Shows pending request status

### Phase 8: Supabase integration
1. Set up Supabase tables:
   - `user_profiles` — parent accounts
   - `child_profiles` — synced from local DB
   - `content_policies` — server-side blocklist updates
2. Implement sync logic in `lib/supabase.ts`:
   - `syncProfiles()` — upload local profiles to cloud
   - `downloadPolicyUpdates()` — fetch latest blocklists
   - `uploadBlockedContentLogs()` — for analytics (anonymized)
3. Add auth flow (email/password or social login)

### Phase 9: Premium features
1. Implement paywall in settings screen:
   - Show feature comparison table
   - Integrate RevenueCat or Expo In-App Purchases
   - Unlock premium features on successful purchase
2. Add custom blocklist UI (premium only):
   - Add/remove domains manually
   - Import blocklists from files
3. Add real-time notifications (premium only):
   - Push notification when content is blocked
   - Bypass request alerts

### Phase 10: Testing & polish
1. Run all Jest tests: `npm test`
2. Test on physical devices (iOS + Android):
   - Create profiles for different ages
   - Attempt to access blocked content in Safari/Chrome
   - Verify blocks are logged
   - Submit bypass requests
   - Test parent PIN flow
3. Performance testing:
   - Ensure filtering adds <50ms latency
   - Check battery impact (should be negligible)
4. Accessibility audit:
   - Screen reader support
   - High contrast mode
   - Font scaling
5. Localization (if time permits):
   - Spanish, French, German translations

### Phase 11: Deployment
1. Build production apps:
   ```bash
   eas build --platform ios --profile production
   eas build --platform android --profile production
   ```
2. Submit to App Store:
   - Prepare screenshots (6.5" iPhone, 12.9" iPad, Android)
   - Write App Store description emphasizing privacy and ease of use
   - Set age rating (4+)
   - Submit for review
3. Set up analytics (PostHog or Mixpanel):
   - Track onboarding completion rate
   - Monitor feature usage
   - A/B test premium paywall

## How to verify it works

### Local development (Expo Go)
1. Start dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Test flows:
   - Complete onboarding, create a child profile
   - Navigate to dashboard, verify profile appears
   - Tap profile card, check that detail view loads
   - Go to settings, verify premium CTA shows
   - Open device Safari/Chrome, attempt to visit blocked domain (e.g., `example-adult-site.com`)
   - Verify blocked content alert appears in app
   - Submit bypass request, check it appears in dashboard

### Automated tests
```bash
npm test
```
All tests must pass:
- Content filtering logic (blocklist matching, keyword detection)
- Database operations (CRUD for profiles, logs, requests)
- Component rendering (profile cards, modals, alerts)

### Production verification (TestFlight/Internal Testing)
1. Install production build on device
2. Grant Screen Time API permissions (iOS) or Digital Wellbeing access (Android)
3. Create profile, enable filtering
4. Verify that blocked domains are actually blocked at OS level (not just in-app)
5. Check that blocks are logged even when app is backgrounded
6. Test biometric parent PIN (Face ID/Touch ID/fingerprint)
7. Verify cloud sync: create profile on device A, check it appears on device B

### Success criteria
- Onboarding completion rate >70%
- Content blocking works across all apps (Safari, Chrome, TikTok, YouTube)
- Zero false positives on educational sites (Khan Academy, Wikipedia, etc.)
- Parent PIN cannot be bypassed by child
- App uses <5% battery per day
- All automated tests pass
- 4.5+ star rating on App Store within first month