```markdown
# DiscoverDeck Mobile → **Curio**

## 1. App Name
**Curio** (short for "Curious" + "I/O" — the act of seeking knowledge and discovery)

## 2. One-line pitch
"Your AI-powered concierge for discovering the best apps, tools, and services to solve everyday problems."

## 3. Expanded vision
**Who is this REALLY for?**
- **Non-technical users**: Parents, students, and professionals who want to find the best apps for their needs without sifting through endless recommendations.
- **Digital minimalists**: People who want to declutter their device by replacing bloated apps with efficient alternatives.
- **Indie creators**: Bloggers, podcasters, and small businesses looking for tools to streamline workflows.
- **Gamers**: Finding the best emulators, mods, or companion apps for their favorite games.
- **Health & wellness enthusiasts**: Apps for meditation, fitness tracking, and mental health tools.
- **Parents**: Safe, educational, and engaging apps for kids and teens.

**Adjacent use cases**:
- **Corporate IT**: Internal app directories for employees.
- **Schools/universities**: Curated learning tools for students.
- **Gyms/wellness centers**: Recommended fitness and recovery apps.

**Why non-technical users?**
- No need to understand "APIs" or "SDKs" — just tap to install.
- Solves real pain points (e.g., "How do I organize my photos?" or "What’s the best note-taking app?").

## 4. Tech stack
- **Frontend**: React Native (Expo) + TypeScript
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Local storage**: SQLite (for offline recommendations)
- **Analytics**: Mixpanel (for user behavior tracking)
- **Dependencies**: Minimal (React Navigation, React Query, Expo modules)

## 5. Core features (MVP)
1. **Smart Recommendations**
   - AI-driven suggestions based on user goals (e.g., "I need a better calendar app").
   - Contextual triggers (e.g., "You’re traveling soon — here are the best travel apps").

2. **One-Tap Install**
   - Direct links to App Store/Play Store with affiliate tracking.

3. **Expert-Curated Lists**
   - Monthly "Top 10" lists (e.g., "Best Password Managers" or "Hidden Gems for Productivity").

4. **Search with Intent**
   - Natural language queries (e.g., "Find an app to track my sleep and sync with my fitness tracker").

5. **Community Ratings (Optional)**
   - User reviews (with moderation) to supplement expert reviews.

## 6. Monetization strategy
- **Free tier**:
  - Basic recommendations, limited lists, and ads.
  - Hook: "Try before you buy" with a free trial.

- **Paid tier ($4.99/month or $49.99/year)**:
  - Ad-free experience.
  - Exclusive deep-dive reviews (e.g., "Why Notion beats Evernote").
  - Advanced personalization (e.g., "Based on your usage, here’s an app you’ll love").
  - Early access to "Curio Picks" (exclusive lists).

- **Affiliate model**:
  - 10-20% commission on app purchases (transparently disclosed).
  - Only for apps that genuinely solve user needs.

**Why stay subscribed?**
- **Time savings**: No more wasted time on bad apps.
- **Exclusivity**: Early access to curated lists.
- **Trust**: No ads or misleading recommendations.

## 7. Skip if saturated
**NO SKIP**: The app store discovery problem is massive, and existing solutions (App Store, Wirecutter) are either too generic or web-first.

## 8. File structure
```
curio/
├── app/
│   ├── components/ (reusable UI)
│   ├── screens/ (main views)
│   ├── utils/ (helpers, API calls)
│   └── types/ (TypeScript interfaces)
├── assets/ (icons, images)
├── firebase/ (config, functions)
├── tests/ (Jest test files)
└── package.json
```

## 9. Tests
```javascript
// tests/recommendations.test.ts
import { getRecommendations } from '../app/utils/recommendations';

describe('Recommendations', () => {
  it('returns curated apps for a given category', async () => {
    const apps = await getRecommendations('productivity');
    expect(apps.length).toBeGreaterThan(0);
    expect(apps[0]).toHaveProperty('name');
  });
});
```

## 10. Implementation steps
1. **Setup**:
   ```bash
   npx create-expo-app -t expo-template-blank-typescript curio
   cd curio
   npm install firebase react-query @react-navigation/native
   ```

2. **Firebase setup**:
   - Initialize Firestore for app data.
   - Set up Auth for user accounts (optional for MVP).

3. **Core flow**:
   - Build the search screen with intent-based queries.
   - Add one-tap install via deep links.
   - Implement expert-curated lists (static JSON first, then Firestore).

4. **Monetization**:
   - Add a subscription screen (use `react-native-purchases`).
   - Track ad impressions (Mixpanel).

5. **Testing**:
   - Write Jest tests for recommendation logic.
   - Test Expo Go on iOS/Android.

## 11. Verification
- Run `npm test` (all tests pass).
- Open Expo Go on a device/simulator and test:
  - Search functionality.
  - One-tap install.
  - Curated lists load.
```