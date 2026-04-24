```markdown
# CramEase Evolution: "MindMeld"

## 1. App Name
**MindMeld** — A clever blend of "mind" and "meld," suggesting seamless knowledge integration.

## 2. One-line pitch
"Master any skill faster with AI-powered spaced repetition and real-time mastery tracking."

## 3. Expanded vision
**Broadest audience:**
- **Lifelong learners** (ages 18-65) — from hobbyists to professionals.
- **Parents** — for kids' education and homeschooling.
- **Corporate trainers** — for employee upskilling.
- **Students** — for exam prep, language learning, and STEM skills.
- **Gamers** — for memorizing game mechanics, lore, or strategies.
- **Healthcare professionals** — for medical certifications and procedures.

**Adjacent use cases:**
- **Memory training** (for athletes, musicians, or public speakers).
- **Job interview prep** (technical skills, behavioral questions).
- **Hobbyists** (crafting, cooking, DIY projects).
- **Language learners** (beyond just vocabulary).

**Why non-technical users?**
- **Parents** can track their child’s progress and adjust pacing.
- **Students** can sync with school curricula.
- **Corporate users** can enforce learning policies.

## 4. Tech stack
- **Frontend:** React Native (Expo) for cross-platform.
- **Local DB:** SQLite for offline-first storage.
- **Backend:** Firebase (Auth, Analytics, Cloud Functions).
- **AI/ML:** TensorFlow.js for lightweight local spaced repetition.
- **Testing:** Jest + React Testing Library.

## 5. Core features (MVP)
1. **Adaptive Spaced Repetition** — AI-driven scheduling based on recall strength.
2. **Mastery Dashboard** — Visual progress tracking (heatmaps, streaks).
3. **Microlearning Mode** — 5-15s flashcards for mobile use.
4. **Skill Import** — Sync with Quizlet, Anki, or custom CSV.
5. **Offline Mode** — Syncs when connectivity returns.

## 6. Monetization strategy
- **Free tier:**
  - Basic spaced repetition.
  - Limited offline storage (500 cards).
  - Ads (non-intrusive).
- **Paid tier ($4.99/month):**
  - Unlimited offline cards.
  - Advanced analytics (weak areas, learning style insights).
  - Ad-free.
  - Priority support.
- **One-time "Mastery Pass" ($9.99):**
  - Lifetime access to all premium features.
  - Early access to new skills.
- **Hook:** Free tier is addictive (gamified progress).
- **Paywall:** Premium analytics and offline access are the "aha!" moments.

## 7. Skip if saturated
N/A — No direct competitor combines AI-driven spaced repetition with mastery tracking in a mobile-first way.

## 8. File structure
```
mindmeld/
├── app/
│   ├── components/
│   ├── screens/
│   ├── utils/
│   └── hooks/
├── assets/
├── tests/
│   ├── unit/
│   └── integration/
├── firebase/
└── package.json
```

## 9. Tests (Jest)
```javascript
// tests/unit/spacedRepetition.test.js
import { calculateNextReview } from '../../app/utils/spacedRepetition';

test('calculates next review date correctly', () => {
  const lastReview = new Date('2023-01-01');
  const recallStrength = 0.8;
  const nextReview = calculateNextReview(lastReview, recallStrength);
  expect(nextReview).toBeInstanceOf(Date);
});
```

## 10. Implementation steps
1. **Setup:**
   ```bash
   npx create-expo-app mindmeld --template expo-template-blank-typescript
   ```
2. **Core logic:**
   - Implement `spacedRepetition.ts` (SM-2 algorithm).
   - Build `Card` and `Deck` models in SQLite.
3. **UI:**
   - Dashboard screen with progress charts.
   - Flashcard swipe interface.
4. **Firebase:**
   - Set up Auth for user accounts.
   - Cloud Functions for sync.
5. **Testing:**
   ```bash
   npm test
   ```

## 11. Verification
- Run `npx expo start` and test on iOS/Android simulator.
- Run `npm test` to validate core logic.
- Test offline mode by toggling airplane mode.
```