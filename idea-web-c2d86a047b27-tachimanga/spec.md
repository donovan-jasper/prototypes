```markdown
# TachiManga App Spec

## 1. App Name
**PageTurner Pro**

## 2. One-line pitch
"Read comics, manga, and books offline with smart sync, social sharing, and endless customization—all in one polished app."

## 3. Expanded vision
**Broadest audience:**
- **Casual readers** (commuters, students) who want distraction-free reading.
- **Hardcore fans** (manga/webtoon collectors) who need advanced tracking.
- **Book clubs** (sync reading progress, annotate together).
- **Accessibility users** (text-to-speech, dyslexia-friendly fonts).
- **Content creators** (publish manga/webtoons directly via the app).

**Adjacent use cases:**
- **Offline-first productivity** (read PDFs, e-books, or research papers).
- **Gamers** (comic-style walkthroughs for games).
- **Language learners** (read manga to practice vocabulary).

**Why non-technical users want this:**
- No ads or clutter (unlike webtoon apps).
- Syncs across devices without manual uploads.
- Community features (discussions, recommendations) built in.

## 4. Tech stack
- **Frontend:** React Native (Expo) + TypeScript
- **Local storage:** SQLite (for offline content)
- **Sync:** Firebase (for cross-device sync)
- **Testing:** Jest + React Testing Library

## 5. Core features (MVP)
1. **Smart Offline Library** – Auto-downloads content for offline reading.
2. **Social Sync** – Share reading progress, annotations, and highlights.
3. **Custom Reader** – Adjustable font, brightness, and page-turn animations.
4. **Community Hub** – Discover and discuss content with friends.
5. **Exclusive Content** – Premium-only manga/webtoons.

## 6. Monetization strategy
- **Free tier:** Basic offline reading + limited sync.
- **Paid tier ($4.99/month):**
  - Ad-free reading.
  - Unlimited offline storage.
  - Early access to exclusive content.
  - Advanced customization (themes, gestures).
- **Why they stay subscribed:**
  - **Exclusive content** (e.g., serialized manga/webtoons).
  - **Social exclusivity** (private reading groups).
  - **No ads** (unlike competitors).

## 7. Skip if saturated
**NO SKIP:** The gap is clear—no app combines offline-first reading with social features this well.

## 8. File structure
```
pageturner-pro/
├── app/
│   ├── components/ (UI)
│   ├── hooks/ (logic)
│   ├── screens/ (views)
│   └── utils/ (helpers)
├── assets/ (images, fonts)
├── tests/ (Jest tests)
├── firebase.js (sync config)
└── App.tsx (entry)
```

## 9. Tests
```javascript
// tests/offlineLibrary.test.js
import { downloadContent } from '../app/utils/offlineLibrary';

test('downloads content and stores locally', async () => {
  const mockContent = { id: '123', title: 'Test Manga' };
  const result = await downloadContent(mockContent);
  expect(result).toHaveProperty('localPath');
});
```

## 10. Implementation steps
1. **Setup Expo project** (`npx create-expo-app -t expo-template-blank-typescript`).
2. **Add SQLite** (`expo-sqlite`).
3. **Build core reader UI** (page-turn gestures, font controls).
4. **Add Firebase sync** (handle offline-first logic).
5. **Write Jest tests** (mock SQLite/Firebase calls).
6. **Polish UX** (animations, accessibility).

## 11. Verification
- Run `npm test` (all tests pass).
- Test offline reading in Expo Go (simulator/device).
- Verify Firebase sync across devices.
```