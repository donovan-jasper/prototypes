# CrediGen

## One-line pitch
Create stunning AI content with built-in credit tracking—give proper attribution to the artists and creators who inspired your work.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** The ethical creator class—people who want AI's power but feel uncomfortable with the attribution void. This includes:
- Social media managers at small businesses who need to show clients they're using AI responsibly
- Educators and students who must cite sources and demonstrate academic integrity
- Content creators who want to build trust with their audience by being transparent about AI use
- Marketing professionals who need to comply with emerging AI disclosure regulations
- Hobbyists and enthusiasts who genuinely care about supporting human artists

**Broadest audience:** Anyone creating content in 2026 who wants to stay ahead of the inevitable AI attribution regulations. As governments worldwide implement AI transparency laws, CrediGen becomes the app that makes compliance effortless.

**Adjacent use cases:**
- Portfolio building for aspiring creators who want to show "AI-assisted" vs "original" work clearly
- Brand safety for businesses that need audit trails showing proper AI usage
- Educational tool for teaching responsible AI use in schools and universities
- Collaboration platform where human artists can opt-in to be credited when their style influences AI outputs
- Legal compliance tool as AI attribution laws emerge globally

**Why non-technical people want this:**
- Guilt-free AI creation—no more wondering if you're "stealing" from artists
- Future-proof content—when platforms start requiring AI disclosure, you're already compliant
- Trust building—audiences increasingly value transparency about AI use
- Professional credibility—showing you care about attribution sets you apart
- One-tap sharing with automatic attribution watermarks

The killer insight: **Attribution isn't a burden, it's a feature.** In a world drowning in AI slop, properly attributed content signals quality and trustworthiness.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **AI integration:** OpenAI API (DALL-E 3), Anthropic API (Claude for text)
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Navigation:** Expo Router (file-based routing)
- **UI components:** React Native Paper (Material Design)
- **Image handling:** expo-image, expo-media-library
- **Sharing:** expo-sharing
- **Authentication:** Expo AuthSession (for future premium features)
- **Analytics:** Expo Application Services (basic usage tracking)

## Core features (MVP)

1. **One-tap AI generation with auto-attribution**
   - Text prompt → instant image/text generation
   - Automatic attribution metadata embedded in every creation
   - Shows which AI model, training data sources (when available), and style influences
   - Export with visible watermark or metadata-only (premium)

2. **Attribution library**
   - Every creation saved locally with full attribution chain
   - Filter by AI model, date, or attribution type
   - One-tap re-share with updated attribution as regulations evolve
   - Export attribution reports (premium feature)

3. **Ethical score dashboard**
   - Gamified transparency: earn points for proper attribution
   - Show users their "ethical creator" score based on attribution practices
   - Share your score on social media (viral growth mechanism)
   - Leaderboard for most transparent creators (community building)

4. **Smart sharing**
   - One-tap share to Instagram, Twitter, LinkedIn with attribution intact
   - Automatic caption generation that includes attribution
   - Platform-specific formatting (hashtags, mentions, etc.)
   - Preview before sharing with attribution watermark options

5. **Creator credit registry (differentiator)**
   - Human artists can register their style/work in the app
   - When AI generates something similar, they get credited automatically
   - Users can tip credited artists directly through the app (we take 15% fee)
   - Artists build portfolios of "AI-influenced" work, driving new revenue streams

## Monetization strategy

### Free tier (the hook):
- 10 AI generations per month
- Basic attribution (AI model name only)
- Standard quality outputs (1024x1024 images)
- Watermarked exports
- Ethical score tracking
- Community leaderboard access

### Premium tier: $9.99/month (the paywall):
**Why this price?** Positioned between Canva Pro ($12.99) and Midjourney Basic ($10), but with unique attribution value. Users pay for peace of mind and professional credibility.

**Premium features:**
- Unlimited AI generations
- Full attribution chains (training data sources, style influences)
- High-resolution exports (up to 4K)
- Watermark-free exports with embedded metadata
- Attribution report exports (PDF/CSV for compliance)
- Priority generation queue
- Early access to new AI models
- Commercial usage rights
- Direct artist tipping with reduced fees (10% vs 15%)

### What makes people STAY subscribed?

1. **Compliance insurance:** As AI regulations tighten, premium users have audit-ready attribution records
2. **Professional credibility:** Attribution reports become portfolio pieces and client deliverables
3. **Sunk cost:** Users build attribution libraries over time—switching means losing that history
4. **Network effects:** Ethical scores and leaderboards create social pressure to maintain premium status
5. **Artist relationships:** Users who tip artists regularly build reputations in the creator community

### Additional revenue streams:
- **Artist tips:** 10-15% commission on all tips sent through the app
- **Enterprise tier:** $49/month for teams needing centralized attribution management
- **API access:** $99/month for developers wanting to integrate CrediGen attribution into their apps
- **White-label licensing:** Sell attribution infrastructure to other AI apps

## File structure

```
credigen/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Generate screen
│   │   ├── library.tsx            # Attribution library
│   │   ├── profile.tsx            # Ethical score & settings
│   │   └── registry.tsx           # Creator credit registry
│   ├── generation/
│   │   └── [id].tsx               # Individual generation detail
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── GenerationCard.tsx
│   ├── AttributionBadge.tsx
│   ├── EthicalScoreWidget.tsx
│   ├── ShareSheet.tsx
│   └── PromptInput.tsx
├── lib/
│   ├── database.ts                # SQLite setup & queries
│   ├── ai-service.ts              # AI API integration
│   ├── attribution.ts             # Attribution logic
│   ├── ethical-score.ts           # Score calculation
│   └── storage.ts                 # Media storage helpers
├── store/
│   └── app-store.ts               # Zustand state management
├── types/
│   └── index.ts                   # TypeScript types
├── constants/
│   └── config.ts                  # API keys, limits, etc.
├── __tests__/
│   ├── attribution.test.ts
│   ├── ethical-score.test.ts
│   ├── database.test.ts
│   └── ai-service.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

### `__tests__/attribution.test.ts`
```typescript
import { generateAttribution, validateAttribution } from '../lib/attribution';

describe('Attribution System', () => {
  test('generates valid attribution metadata', () => {
    const attribution = generateAttribution({
      model: 'dall-e-3',
      prompt: 'sunset over mountains',
      timestamp: new Date(),
    });
    
    expect(attribution).toHaveProperty('model');
    expect(attribution).toHaveProperty('prompt');
    expect(attribution).toHaveProperty('timestamp');
    expect(attribution).toHaveProperty('attributionId');
  });

  test('validates attribution completeness', () => {
    const validAttribution = {
      model: 'dall-e-3',
      prompt: 'test',
      timestamp: new Date(),
      attributionId: 'test-123',
    };
    
    expect(validateAttribution(validAttribution)).toBe(true);
    expect(validateAttribution({ model: 'dall-e-3' })).toBe(false);
  });
});
```

### `__tests__/ethical-score.test.ts`
```typescript
import { calculateEthicalScore, updateScore } from '../lib/ethical-score';

describe('Ethical Score System', () => {
  test('calculates score based on attribution completeness', () => {
    const generations = [
      { hasFullAttribution: true, shared: true },
      { hasFullAttribution: true, shared: false },
      { hasFullAttribution: false, shared: true },
    ];
    
    const score = calculateEthicalScore(generations);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('increases score for proper attribution', () => {
    const initialScore = 50;
    const newScore = updateScore(initialScore, { hasFullAttribution: true, shared: true });
    expect(newScore).toBeGreaterThan(initialScore);
  });
});
```

### `__tests__/database.test.ts`
```typescript
import { initDatabase, saveGeneration, getGenerations } from '../lib/database';

describe('Database Operations', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('saves and retrieves generations', async () => {
    const generation = {
      prompt: 'test prompt',
      imageUri: 'file://test.jpg',
      attribution: { model: 'dall-e-3', timestamp: new Date() },
    };
    
    const id = await saveGeneration(generation);
    expect(id).toBeDefined();
    
    const retrieved = await getGenerations();
    expect(retrieved.length).toBeGreaterThan(0);
  });
});
```

### `__tests__/ai-service.test.ts`
```typescript
import { generateImage, generateText } from '../lib/ai-service';

describe('AI Service Integration', () => {
  test('generates image with valid prompt', async () => {
    const result = await generateImage('sunset over mountains');
    expect(result).toHaveProperty('imageUrl');
    expect(result).toHaveProperty('attribution');
  }, 30000);

  test('handles API errors gracefully', async () => {
    await expect(generateImage('')).rejects.toThrow();
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app credigen --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-image expo-media-library expo-sharing
   npm install zustand react-native-paper openai @anthropic-ai/sdk
   npm install -D @types/react @types/react-native jest @testing-library/react-native
   ```
3. Configure `app.json` with app name, bundle ID, permissions (camera, media library)
4. Set up TypeScript strict mode in `tsconfig.json`
5. Create environment variables file for API keys (use `expo-constants`)

### Phase 2: Database layer
1. Implement `lib/database.ts`:
   - Create SQLite schema for generations (id, prompt, imageUri, attribution JSON, timestamp, ethicalScore)
   - Create schema for user profile (totalScore, generationCount, premiumStatus)
   - Write CRUD functions: `initDatabase()`, `saveGeneration()`, `getGenerations()`, `updateGeneration()`
   - Add indexes for timestamp and ethicalScore queries
2. Write database tests in `__tests__/database.test.ts`
3. Run tests: `npm test database.test.ts`

### Phase 3: Attribution system
1. Implement `lib/attribution.ts`:
   - `generateAttribution()`: Create attribution metadata with unique ID, timestamp, model info
   - `validateAttribution()`: Check completeness of attribution data
   - `formatAttributionText()`: Generate human-readable attribution strings
   - `embedAttributionInImage()`: Add metadata to image files (EXIF/IPTC)
2. Implement `lib/ethical-score.ts`:
   - `calculateEthicalScore()`: Score algorithm based on attribution completeness, sharing frequency
   - `updateScore()`: Increment/decrement score based on user actions
   - `getScoreLevel()`: Map score to levels (Beginner, Ethical, Exemplary, etc.)
3. Write tests for both modules
4. Run tests: `npm test attribution.test.ts ethical-score.test.ts`

### Phase 4: AI integration
1. Implement `lib/ai-service.ts`:
   - `generateImage()`: Call OpenAI DALL-E 3 API with prompt, return image URL + attribution
   - `generateText()`: Call Anthropic Claude API for text generation
   - `handleRateLimit()`: Implement exponential backoff for API rate limits
   - `cacheResponse()`: Cache recent generations to reduce API calls
2. Add error handling for API failures, network issues
3. Implement free tier limits (10 generations/month) in service layer
4. Write AI service tests (mock API responses)
5. Run tests: `npm test ai-service.test.ts`

### Phase 5: Core UI components
1. Create `components/PromptInput.tsx`:
   - Text input with character counter
   - Style suggestions (dropdown with common styles)
   - Generate button with loading state
2. Create `components/GenerationCard.tsx`:
   - Display generated image/text
   - Show attribution badge
   - Share and save buttons
3. Create `components/AttributionBadge.tsx`:
   - Compact attribution display
   - Expandable to show full details
   - Copy attribution text button
4. Create `components/EthicalScoreWidget.tsx`:
   - Circular progress indicator
   - Score level label
   - Tap to view breakdown
5. Create `components/ShareSheet.tsx`:
   - Platform selection (Instagram, Twitter, etc.)
   - Watermark toggle (premium only)
   - Preview with attribution

### Phase 6: State management
1. Implement `store/app-store.ts` with Zustand:
   - User state: `premiumStatus`, `generationCount`, `ethicalScore`
   - Generation state: `currentGeneration`, `generationHistory`
   - UI state: `isGenerating`, `selectedPlatform`
   - Actions: `generateContent()`, `saveGeneration()`, `shareGeneration()`, `updateScore()`
2. Connect store to database layer for persistence
3. Add subscription to sync state changes across components

### Phase 7: Main screens
1. Implement `app/(tabs)/index.tsx` (Home/Generate):
   - PromptInput component at top
   - Recent generations grid below
   - Floating action button for new generation
   - Pull-to-refresh for generation history
2. Implement `app/(tabs)/library.tsx` (Attribution Library):
   - Filterable list of all generations
   - Sort by date, ethical score, platform shared
   - Swipe actions: re-share, delete, view details
3. Implement `app/(tabs)/profile.tsx` (Profile & Settings):
   - EthicalScoreWidget at top
   - Generation stats (total, this month, etc.)
   - Premium upgrade CTA
   - Settings: API keys, export options, account management
4. Implement `app/(tabs)/registry.tsx` (Creator Registry):
   - List of registered artists
   - Search and filter
   - Artist profile pages with tip button
   - "Register as Artist" CTA

### Phase 8: Generation detail screen
1. Implement `app/generation/[id].tsx`:
   - Full-screen image/text display
   - Complete attribution details
   - Share button with platform options
   - Edit attribution (premium)
   - Export attribution report (premium)
   - Delete generation

### Phase 9: Sharing functionality
1. Implement `lib/storage.ts`:
   - `saveToMediaLibrary()`: Save generated content to device
   - `addWatermark()`: Overlay attribution watermark on images
   - `prepareForSharing()`: Format content for specific platforms
2. Integrate `expo-sharing` for native share sheet
3. Add platform-specific formatting (Instagram square crop, Twitter character limits)
4. Implement share tracking for ethical score updates

### Phase 10: Premium features
1. Add paywall UI component (modal with feature comparison)
2. Integrate Expo AuthSession for user accounts
3. Implement subscription check in AI service (block after 10 generations)
4. Add premium-only features: watermark removal, high-res export, attribution reports
5. Create PDF generation for attribution reports (use `react-native-html-to-pdf`)

### Phase 11: Polish & optimization
1. Add loading skeletons for all async operations
2. Implement image caching with `expo-image`
3. Add haptic feedback for key interactions
4. Optimize SQLite queries with proper indexes
5. Add error boundaries for graceful failure handling
6. Implement offline mode (queue generations when offline)
7. Add onboarding flow for first-time users

### Phase 12: Testing & QA
1. Run full test suite: `npm test`
2. Test on iOS simulator and Android emulator
3. Test on physical devices via Expo Go
4. Verify all premium features are properly gated
5. Test offline functionality
6. Verify attribution metadata in exported files
7. Test share functionality on all target platforms
8. Load test with 100+ generations in library

## How to verify it works

### Development testing:
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app on iOS/Android device
3. Test core flow:
   - Enter prompt → Generate image → Verify attribution appears
   - Save generation → Check library screen → Verify it's saved
   - Share generation → Verify attribution included in share
   - Check profile → Verify ethical score updated
4. Test premium features (mock premium status in code):
   - Generate 11th image → Verify paywall appears
   - Toggle watermark → Verify watermark removed
   - Export attribution report → Verify PDF generated
5. Test offline mode:
   - Enable airplane mode → Queue generation → Verify queued
   - Disable airplane mode → Verify generation processes

### Automated testing:
1. Run test suite: `npm test`
2. Verify all tests pass (minimum 80% coverage)
3. Run specific test suites:
   - `npm test attribution.test.ts`
   - `npm test ethical-score.test.ts`
   - `npm test database.test.ts`
   - `npm test ai-service.test.ts`

### Production readiness checklist:
- [ ] All tests passing
- [ ] App runs on iOS simulator without crashes
- [ ] App runs on Android emulator without crashes
- [ ] App tested on physical iOS device via Expo Go
- [ ] App tested on physical Android device via Expo Go
- [ ] Attribution metadata verified in exported images (check EXIF data)
- [ ] Ethical score calculation verified with multiple scenarios
- [ ] Premium paywall blocks free users after 10 generations
- [ ] Share functionality works on Instagram, Twitter, LinkedIn
- [ ] Offline mode queues and processes generations correctly
- [ ] Database migrations tested (add dummy data, upgrade schema, verify data intact)
- [ ] API error handling tested (disconnect network, verify graceful failure)
- [ ] Performance tested with 100+ generations in library (smooth scrolling)