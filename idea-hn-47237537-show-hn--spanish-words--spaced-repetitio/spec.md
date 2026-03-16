# VocaVault

## One-line pitch
Master the 1,000 most useful words in any language—in weeks, not years.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- **Travelers** preparing for trips who need survival vocabulary fast (ordering food, asking directions, basic conversation)
- **Career professionals** relocating internationally or working with foreign clients who need practical business vocabulary
- **Parents** teaching their heritage language to children through daily micro-lessons
- **Retirees** keeping their minds sharp through language learning without overwhelming complexity
- **Students** supplementing formal language classes with high-frequency vocabulary practice

**Broadest audience:** Anyone who's ever felt embarrassed not knowing basic words in another language. The app solves the "I studied Spanish for 4 years but can't order coffee" problem by focusing ruthlessly on frequency over completeness.

**Adjacent use cases:**
- **Medical professionals** learning patient-facing vocabulary in immigrant communities
- **Service workers** (retail, hospitality) learning customer-facing phrases
- **Dating app users** impressing matches by learning their native language basics
- **Grandparents** connecting with multilingual grandchildren
- **Podcast/Netflix fans** understanding their favorite foreign content without subtitles

**Why non-technical people want this:**
- No grammar rules, no conjugation tables—just the words you'll actually use
- 5-minute daily sessions that fit into coffee breaks, commutes, or bathroom breaks
- Immediate practical results: order food, read signs, have basic conversations within days
- Gamified streaks and progress tracking create habit formation
- Offline-first means no data charges while traveling

**The hook:** Most language apps teach you to say "the cat is under the table." VocaVault teaches you to say "Where's the bathroom?" and "How much does this cost?"—the words that actually matter.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** expo-sqlite for vocabulary, progress, and FSRS scheduling
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Notifications:** expo-notifications for spaced repetition reminders
- **Audio:** expo-av for pronunciation playback
- **Styling:** NativeWind (Tailwind for React Native)
- **Testing:** Jest + React Native Testing Library
- **Analytics:** expo-tracking-transparency + basic event logging (no third-party initially)

**Dependencies kept minimal:**
```json
{
  "expo": "~52.0.0",
  "react-native": "0.76.0",
  "expo-sqlite": "~15.0.0",
  "zustand": "^5.0.0",
  "expo-notifications": "~0.29.0",
  "expo-av": "~15.0.0",
  "nativewind": "^4.0.0",
  "tailwindcss": "^3.4.0"
}
```

## Core features (MVP)

1. **Smart Daily Queue (5 new + 10 review)**
   - FSRS algorithm schedules reviews based on individual word retention
   - Daily streak tracking with gentle push notifications
   - Words presented with native audio, example sentence, and image
   - Swipe right (know it) / left (learning) / down (forgot) for instant feedback

2. **Frequency-First Curriculum**
   - Pre-loaded with top 1,000 most frequent words in Spanish (expandable to 10 languages)
   - Words ranked by real-world usage (corpus analysis), not textbook order
   - Categories: survival (100 words), conversation (500), fluency (1000)
   - Progress bar shows "You can understand X% of everyday Spanish"

3. **Offline-First Learning**
   - All vocabulary, audio, and images downloaded on first launch
   - No internet required after initial setup
   - Sync progress across devices when online (simple cloud backup)

4. **Contextual Examples**
   - Every word shown in 2-3 real-world sentences
   - Audio pronunciation by native speakers
   - Visual mnemonics (simple illustrations, not stock photos)

5. **Progress Insights**
   - Vocabulary mastery dashboard (beginner/intermediate/advanced)
   - Estimated comprehension percentage for real-world content
   - Weekly review of hardest words with focused practice

## Monetization strategy

**Free tier (the hook):**
- First 100 words (survival vocabulary) completely free
- 7-day trial of full features
- Limited to Spanish only
- Basic spaced repetition (no FSRS optimization)

**Paid tier - $2.99 one-time unlock:**
- Full 1,000-word curriculum in Spanish
- Advanced FSRS scheduling for optimal retention
- Offline audio and images
- Progress sync across devices
- No ads, ever

**Premium subscription - $4.99/month or $29.99/year:**
- 10 languages (Spanish, French, German, Italian, Portuguese, Japanese, Korean, Mandarin, Arabic, Russian)
- AI-powered personalized word selection based on interests (travel, business, medical, etc.)
- Conversation practice mode (AI-generated dialogues using learned words)
- Real-time camera translation (point at signs, menus, labels)
- Voice recognition for pronunciation practice
- Priority support and early access to new languages

**What makes people STAY subscribed:**
- Language switching without losing progress (polyglots learning multiple languages)
- Monthly "language challenges" with community leaderboards
- Personalized word recommendations based on usage patterns
- Continuous content updates (slang, regional variations, cultural notes)

**Pricing reasoning:**
- $2.99 one-time is impulse-buy territory (less than a coffee)
- Targets casual learners who want Spanish for vacation
- Premium at $4.99/mo competes with Duolingo Plus ($6.99) but offers more focus
- Annual discount (50% off) encourages long-term commitment

## File structure

```
vocavault/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Daily practice screen
│   │   ├── progress.tsx           # Stats and insights
│   │   └── settings.tsx           # Language selection, notifications
│   ├── _layout.tsx
│   ├── onboarding.tsx             # First-time user flow
│   └── review.tsx                 # Spaced repetition review session
├── components/
│   ├── WordCard.tsx               # Swipeable card with word, audio, example
│   ├── ProgressBar.tsx            # Visual progress indicator
│   ├── StreakCounter.tsx          # Daily streak display
│   └── AudioPlayer.tsx            # Native pronunciation playback
├── lib/
│   ├── database.ts                # SQLite setup and queries
│   ├── fsrs.ts                    # FSRS scheduling algorithm
│   ├── vocabulary.ts              # Word data and frequency rankings
│   └── notifications.ts           # Daily reminder scheduling
├── store/
│   └── useStore.ts                # Zustand global state
├── assets/
│   ├── audio/                     # MP3 files for pronunciations
│   ├── images/                    # Visual mnemonics
│   └── vocabulary/
│       └── spanish-1000.json      # Pre-loaded word list
├── __tests__/
│   ├── fsrs.test.ts
│   ├── database.test.ts
│   ├── vocabulary.test.ts
│   └── components/
│       └── WordCard.test.tsx
├── app.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Tests

```typescript
// __tests__/fsrs.test.ts
import { calculateNextReview, updateCardState } from '../lib/fsrs';

describe('FSRS Algorithm', () => {
  test('schedules first review for 1 day after correct answer', () => {
    const nextReview = calculateNextReview({ difficulty: 0, stability: 0, retrievability: 0 }, 'correct');
    expect(nextReview.intervalDays).toBe(1);
  });

  test('increases interval after consecutive correct answers', () => {
    let card = { difficulty: 2.5, stability: 1, retrievability: 0.9 };
    card = updateCardState(card, 'correct');
    expect(card.stability).toBeGreaterThan(1);
  });

  test('resets interval after incorrect answer', () => {
    const card = { difficulty: 2.5, stability: 5, retrievability: 0.9 };
    const updated = updateCardState(card, 'incorrect');
    expect(updated.stability).toBeLessThan(card.stability);
  });
});

// __tests__/database.test.ts
import { initDatabase, addWord, getWordById, updateProgress } from '../lib/database';

describe('Database Operations', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  test('adds and retrieves a word', async () => {
    await addWord({ word: 'hola', translation: 'hello', frequency: 1 });
    const word = await getWordById(1);
    expect(word.word).toBe('hola');
  });

  test('updates word progress', async () => {
    await addWord({ word: 'gracias', translation: 'thank you', frequency: 2 });
    await updateProgress(1, { lastReviewed: Date.now(), correctCount: 1 });
    const word = await getWordById(1);
    expect(word.correctCount).toBe(1);
  });
});

// __tests__/vocabulary.test.ts
import { getTopWords, getWordsByCategory } from '../lib/vocabulary';

describe('Vocabulary Management', () => {
  test('returns top N most frequent words', () => {
    const top10 = getTopWords(10);
    expect(top10).toHaveLength(10);
    expect(top10[0].frequency).toBeLessThanOrEqual(top10[1].frequency);
  });

  test('filters words by category', () => {
    const survival = getWordsByCategory('survival');
    expect(survival.length).toBeGreaterThan(0);
    expect(survival.every(w => w.category === 'survival')).toBe(true);
  });
});

// __tests__/components/WordCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import WordCard from '../../components/WordCard';

describe('WordCard Component', () => {
  const mockWord = {
    word: 'agua',
    translation: 'water',
    example: 'Necesito agua.',
    audioUrl: 'agua.mp3'
  };

  test('renders word and translation', () => {
    const { getByText } = render(<WordCard word={mockWord} onSwipe={() => {}} />);
    expect(getByText('agua')).toBeTruthy();
    expect(getByText('water')).toBeTruthy();
  });

  test('calls onSwipe with correct direction', () => {
    const onSwipe = jest.fn();
    const { getByTestId } = render(<WordCard word={mockWord} onSwipe={onSwipe} />);
    fireEvent(getByTestId('word-card'), 'swipeRight');
    expect(onSwipe).toHaveBeenCalledWith('correct');
  });
});
```

## Implementation steps

### Phase 1: Project Setup
1. Initialize Expo project with TypeScript template:
   ```bash
   npx create-expo-app@latest vocavault --template expo-template-blank-typescript
   cd vocavault
   ```

2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-notifications expo-av
   npm install zustand nativewind
   npm install --save-dev tailwindcss jest @testing-library/react-native
   ```

3. Configure NativeWind in `tailwind.config.js` and `app/_layout.tsx`

4. Set up file structure as outlined above

### Phase 2: Database Layer
5. Create `lib/database.ts`:
   - Initialize SQLite database with tables: `words`, `user_progress`, `settings`
   - Schema for `words`: id, word, translation, frequency, category, example, audioUrl, imageUrl
   - Schema for `user_progress`: wordId, lastReviewed, nextReview, difficulty, stability, retrievability, correctCount, incorrectCount
   - Write CRUD functions: `initDatabase()`, `addWord()`, `getWordById()`, `updateProgress()`, `getDueWords()`

6. Create `lib/vocabulary.ts`:
   - Load `assets/vocabulary/spanish-1000.json` with pre-ranked words
   - Functions: `getTopWords(n)`, `getWordsByCategory(category)`, `seedDatabase()`
   - On first launch, populate database with Spanish vocabulary

### Phase 3: FSRS Algorithm
7. Create `lib/fsrs.ts`:
   - Implement FSRS-4.5 algorithm (simplified version)
   - `calculateNextReview(card, rating)`: returns next review date based on difficulty/stability
   - `updateCardState(card, rating)`: updates difficulty and stability after review
   - Rating types: 'forgot' (1), 'hard' (2), 'good' (3), 'easy' (4)
   - Initial stability: 1 day for new cards

8. Write tests for FSRS logic in `__tests__/fsrs.test.ts`

### Phase 4: State Management
9. Create `store/useStore.ts` with Zustand:
   - State: `currentWord`, `dailyQueue`, `reviewQueue`, `streak`, `totalWordsLearned`, `settings`
   - Actions: `loadDailyQueue()`, `markWordReviewed()`, `incrementStreak()`, `updateSettings()`
   - Persist streak and settings to AsyncStorage

### Phase 5: Core Components
10. Create `components/WordCard.tsx`:
    - Swipeable card using PanResponder or react-native-gesture-handler
    - Display word, translation, example sentence, image
    - Audio playback button using expo-av
    - Swipe gestures: right (know it), left (learning), down (forgot)
    - Animate card exit and load next word

11. Create `components/AudioPlayer.tsx`:
    - Load audio file from `assets/audio/` or remote URL
    - Play button with loading state
    - Handle playback errors gracefully

12. Create `components/ProgressBar.tsx`:
    - Visual bar showing X/1000 words learned
    - Percentage text: "You understand 15% of everyday Spanish"
    - Color gradient from red (beginner) to green (advanced)

13. Create `components/StreakCounter.tsx`:
    - Display current streak with fire emoji
    - Show last practice date
    - Encourage message if streak is broken

### Phase 6: Screens
14. Create `app/onboarding.tsx`:
    - Welcome screen explaining app concept
    - Language selection (Spanish only for MVP)
    - Notification permission request
    - "Start Learning" button that seeds database and navigates to main screen

15. Create `app/(tabs)/index.tsx` (Daily Practice):
    - Load daily queue (5 new + 10 review words)
    - Render WordCard for current word
    - Handle swipe actions: update progress, calculate next review, load next card
    - Show completion screen when queue is empty
    - Display streak counter at top

16. Create `app/review.tsx` (Spaced Repetition Session):
    - Load all due words from database
    - Same WordCard interface as daily practice
    - Focus mode: no distractions, just review
    - Progress indicator: "5/12 words reviewed"

17. Create `app/(tabs)/progress.tsx`:
    - Stats dashboard: total words learned, mastery breakdown (beginner/intermediate/advanced)
    - Comprehension percentage estimate
    - Weekly review: show 5 hardest words with focused practice button
    - Streak calendar view

18. Create `app/(tabs)/settings.tsx`:
    - Notification time picker
    - Daily goal (5, 10, 15 new words)
    - Language selection (locked for free tier)
    - About/FAQ section
    - Restore purchases button

### Phase 7: Notifications
19. Create `lib/notifications.ts`:
    - Request notification permissions on onboarding
    - Schedule daily reminder at user-selected time
    - Notification content: "Your daily Spanish words are ready! 🔥"
    - Cancel/reschedule when user changes settings

### Phase 8: Audio Assets
20. Prepare audio files:
    - Record or source native Spanish pronunciations for top 1000 words
    - Convert to MP3, optimize for mobile (64kbps, mono)
    - Store in `assets/audio/` with naming convention: `word.mp3`
    - Implement lazy loading: download audio on first word encounter

### Phase 9: Testing
21. Write component tests in `__tests__/components/`
22. Write integration tests for database operations
23. Test FSRS algorithm with various scenarios
24. Manual testing on iOS simulator and Android emulator
25. Test offline functionality by disabling network

### Phase 10: Polish
26. Add loading states for database initialization
27. Error boundaries for graceful failure handling
28. Haptic feedback on swipe gestures
29. Smooth animations for card transitions
30. Dark mode support using system preferences

### Phase 11: Monetization
31. Integrate expo-store-review for App Store ratings prompt (after 50 words learned)
32. Implement paywall screen after 100 free words
33. Add in-app purchase for $2.99 unlock using expo-in-app-purchases
34. Gate premium features (multiple languages, AI features) behind subscription check

### Phase 12: Deployment
35. Configure `app.json` with app name, bundle ID, icons, splash screen
36. Generate app icons and splash screens using Expo's asset tools
37. Build iOS and Android apps using EAS Build
38. Submit to App Store and Google Play with compelling screenshots and description

## How to verify it works

### Local Development
1. Start Expo development server:
   ```bash
   npx expo start
   ```

2. Test on iOS Simulator:
   ```bash
   npx expo start --ios
   ```

3. Test on Android Emulator:
   ```bash
   npx expo start --android
   ```

4. Test on physical device:
   - Install Expo Go app
   - Scan QR code from terminal
   - Verify offline functionality by enabling airplane mode

### Automated Tests
5. Run Jest test suite:
   ```bash
   npm test
   ```
   - All tests in `__tests__/` must pass
   - Coverage should be >80% for core logic (FSRS, database, vocabulary)

### Manual Verification Checklist
- [ ] Onboarding flow completes and seeds database with 1000 Spanish words
- [ ] Daily practice screen loads 5 new + 10 review words
- [ ] Swipe gestures correctly mark words as known/learning/forgot
- [ ] Audio playback works for all words
- [ ] FSRS algorithm schedules next review (check database directly)
- [ ] Streak increments after completing daily queue
- [ ] Notifications fire at scheduled time (test with 1-minute delay)
- [ ] Progress screen shows accurate stats
- [ ] Settings persist after app restart
- [ ] Paywall appears after 100 words
- [ ] App works completely offline after initial setup
- [ ] No crashes or errors in console

### Performance Benchmarks
- [ ] App launches in <2 seconds on mid-range device
- [ ] Database queries return in <100ms
- [ ] Card swipe animations run at 60fps
- [ ] Audio playback starts in <500ms
- [ ] App bundle size <50MB (including audio assets)

### Pre-Launch Testing
- [ ] Test on iOS 15+ and Android 10+
- [ ] Verify App Store screenshots and description
- [ ] Test in-app purchase flow in sandbox environment
- [ ] Confirm privacy policy and terms of service links work
- [ ] Run accessibility audit (VoiceOver, TalkBack support)