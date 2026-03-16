# PageFlow

## One-line pitch
Never lose your place again — track your progress across every book, audiobook, movie, and show you're enjoying, no matter where or how you consume it.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** The 78% of adults who consume media across multiple formats and devices daily. This isn't just for "readers" — it's for anyone who:

- Starts a book on Kindle during lunch, continues the audiobook on their commute, then picks up the physical copy at bedtime
- Watches Netflix on their TV but wants to continue on their phone during a flight
- Listens to podcasts/audiobooks at 1.5x speed and needs to remember where they paused
- Shares media recommendations with friends and wants to show "I'm 67% through this, it gets amazing at chapter 12"
- Has ADHD or memory challenges and genuinely forgets what episode they're on

**Broadest audience:** Anyone who consumes media in 2026. That's nearly everyone with a smartphone.

**Adjacent use cases:**
- **Social proof for recommendations:** "I'm halfway through this thriller and it's incredible" carries more weight than "I heard this is good"
- **Accountability for learning:** Students tracking textbook chapters, professionals tracking industry books
- **Family coordination:** Parents tracking which bedtime story they read last night, couples syncing their binge-watching
- **Content creators:** Reviewers and BookTubers tracking what they need to finish
- **Library/rental management:** Know exactly where you left off before your library loan expires

**Why non-technical people want this:**
It solves the universal frustration of "Wait, what episode was I on?" or "Did I already read this chapter?" It's not a productivity tool — it's a memory aid that respects how people actually consume media in 2026: chaotically, across devices, in stolen moments.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **Barcode scanning:** expo-camera + expo-barcode-scanner
- **Cloud sync:** Expo's built-in AsyncStorage + optional Firebase Firestore (free tier)
- **UI:** React Native Paper (Material Design)
- **State management:** Zustand (lightweight, no Redux bloat)
- **Testing:** Jest + React Native Testing Library
- **APIs:** Open Library API (books), TMDB API (movies/TV), iTunes API (audiobooks)

## Core features (MVP)

1. **Universal progress tracking**
   - Add any media (book, movie, show, audiobook, podcast) via search or barcode scan
   - Track progress as percentage, page number, chapter, episode, or timestamp
   - Quick-add via voice: "I'm on page 247 of Dune"

2. **Smart format linking**
   - Automatically detect when the same content exists in multiple formats (e.g., "Atomic Habits" as book, audiobook, Kindle)
   - Sync progress across formats using percentage-based conversion
   - One tap to switch: "Continue on audiobook from where you left off reading"

3. **Instant capture**
   - Scan book barcode or streaming app QR code to instantly log progress
   - Camera OCR to capture page numbers from physical books
   - Screenshot detection: automatically extract episode/timestamp from Netflix/YouTube screenshots

4. **Social sharing**
   - Generate beautiful progress cards: "I'm 73% through Project Hail Mary 🚀"
   - Private sharing links for accountability partners
   - "Currently consuming" widget for home screen

5. **Offline-first with cloud backup**
   - Everything works without internet
   - Optional cloud sync across devices (premium feature)
   - Export data as CSV/JSON anytime

## Monetization strategy

**Free tier (the hook):**
- Track up to 10 active items simultaneously
- Manual progress entry
- Basic search (no barcode scanning)
- Local storage only (no cloud sync)
- Standard progress cards

**Premium ($4.99 one-time OR $1.99/month):**
- Unlimited tracking
- Barcode/QR scanning
- Cloud sync across unlimited devices
- OCR page capture from photos
- Custom progress card themes
- Export/import data
- Priority API access (faster search)
- "Rewind" feature: undo accidental progress updates

**Why one-time payment works:**
This is a utility, not a service. Users pay once for the "pro" camera and sync features, similar to scanner apps. The free tier is generous enough to hook casual users, but anyone serious about tracking (the target audience) will hit the 10-item limit within a week.

**Retention strategy:**
- Cloud sync creates lock-in (your data lives here)
- The more you track, the more valuable your history becomes
- Social sharing drives organic growth (every shared progress card is marketing)
- Habit formation: checking progress becomes part of the media consumption ritual

**Price reasoning:**
$4.99 one-time is impulse-buy territory (less than a coffee). Monthly option at $1.99 captures users who prefer subscriptions and generates recurring revenue. Break-even at 3 months makes the one-time option attractive.

## File structure

```
pageflow/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home: currently tracking list
│   │   ├── library.tsx               # Full library view
│   │   ├── add.tsx                   # Add new media
│   │   └── profile.tsx               # Settings & premium
│   ├── _layout.tsx
│   └── media/[id].tsx                # Detail view for single item
├── components/
│   ├── MediaCard.tsx                 # Progress card component
│   ├── ProgressInput.tsx             # Universal progress entry
│   ├── BarcodeScanner.tsx            # Camera scanner
│   ├── FormatLinker.tsx              # Link multiple formats
│   └── ShareCard.tsx                 # Social sharing generator
├── lib/
│   ├── database.ts                   # SQLite setup & queries
│   ├── sync.ts                       # Cloud sync logic
│   ├── api.ts                        # External API calls
│   ├── progress.ts                   # Progress calculation utils
│   └── storage.ts                    # AsyncStorage wrapper
├── store/
│   └── mediaStore.ts                 # Zustand state management
├── types/
│   └── index.ts                      # TypeScript definitions
├── __tests__/
│   ├── progress.test.ts              # Progress calculation tests
│   ├── database.test.ts              # SQLite operations tests
│   ├── sync.test.ts                  # Sync logic tests
│   └── components/
│       ├── MediaCard.test.tsx
│       └── ProgressInput.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/progress.test.ts`
```typescript
import { calculateProgress, convertProgress, estimateTimeRemaining } from '../lib/progress';

describe('Progress calculations', () => {
  test('calculates percentage from page numbers', () => {
    expect(calculateProgress(150, 300, 'page')).toBe(50);
  });

  test('converts page progress to audiobook timestamp', () => {
    const result = convertProgress(150, 300, 'page', 'audiobook', 600);
    expect(result).toBe(300); // 50% of 600 minutes
  });

  test('estimates time remaining for audiobook', () => {
    const result = estimateTimeRemaining(300, 600, 'audiobook');
    expect(result).toBe(300); // 300 minutes left
  });
});
```

### `__tests__/database.test.ts`
```typescript
import { addMedia, updateProgress, getActiveMedia } from '../lib/database';

describe('Database operations', () => {
  test('adds new media item', async () => {
    const media = await addMedia({
      title: 'Test Book',
      type: 'book',
      totalPages: 400
    });
    expect(media.id).toBeDefined();
  });

  test('updates progress', async () => {
    const updated = await updateProgress(1, 200, 'page');
    expect(updated.currentProgress).toBe(200);
  });

  test('retrieves active media', async () => {
    const active = await getActiveMedia();
    expect(Array.isArray(active)).toBe(true);
  });
});
```

### `__tests__/components/MediaCard.test.tsx`
```typescript
import { render } from '@testing-library/react-native';
import MediaCard from '../../components/MediaCard';

describe('MediaCard component', () => {
  test('renders media title and progress', () => {
    const { getByText } = render(
      <MediaCard
        title="Dune"
        progress={67}
        type="book"
      />
    );
    expect(getByText('Dune')).toBeTruthy();
    expect(getByText('67%')).toBeTruthy();
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app pageflow --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-camera expo-barcode-scanner
   npm install zustand react-native-paper @react-navigation/native
   npm install -D jest @testing-library/react-native @types/jest
   ```
3. Configure `app.json`:
   - Set app name to "PageFlow"
   - Add camera permissions for iOS/Android
   - Configure splash screen and icon placeholders
4. Set up TypeScript types in `types/index.ts`:
   ```typescript
   export type MediaType = 'book' | 'audiobook' | 'movie' | 'tv' | 'podcast';
   export type ProgressUnit = 'page' | 'chapter' | 'episode' | 'timestamp' | 'percentage';
   
   export interface Media {
     id: string;
     title: string;
     type: MediaType;
     currentProgress: number;
     totalProgress: number;
     unit: ProgressUnit;
     coverUrl?: string;
     linkedFormats?: string[]; // IDs of same content in other formats
     lastUpdated: Date;
     isPremium?: boolean;
   }
   ```

### Phase 2: Database layer
1. Create `lib/database.ts`:
   - Initialize SQLite database with `expo-sqlite`
   - Create `media` table schema:
     ```sql
     CREATE TABLE IF NOT EXISTS media (
       id TEXT PRIMARY KEY,
       title TEXT NOT NULL,
       type TEXT NOT NULL,
       current_progress INTEGER DEFAULT 0,
       total_progress INTEGER NOT NULL,
       unit TEXT NOT NULL,
       cover_url TEXT,
       linked_formats TEXT,
       last_updated INTEGER NOT NULL,
       is_premium INTEGER DEFAULT 0
     );
     ```
   - Implement CRUD functions: `addMedia`, `updateProgress`, `getMedia`, `deleteMedia`, `getActiveMedia`
   - Add migration logic for future schema changes

2. Create `lib/storage.ts`:
   - Wrap AsyncStorage for user preferences
   - Store premium status, sync settings, theme preferences
   - Implement `getPremiumStatus()`, `setPremiumStatus()`, `getSyncEnabled()`

### Phase 3: Core logic
1. Create `lib/progress.ts`:
   - `calculateProgress(current, total, unit)`: returns percentage
   - `convertProgress(current, total, fromUnit, toUnit, newTotal)`: converts between formats
   - `estimateTimeRemaining(current, total, unit)`: calculates time left
   - `formatProgressDisplay(progress, unit)`: returns human-readable string

2. Create `lib/api.ts`:
   - Implement search functions for each media type:
     - `searchBooks(query)`: calls Open Library API
     - `searchMovies(query)`: calls TMDB API
     - `searchAudiobooks(query)`: calls iTunes API
   - `lookupBarcode(code)`: converts barcode to media metadata
   - Add error handling and rate limiting

3. Create `store/mediaStore.ts` (Zustand):
   ```typescript
   interface MediaStore {
     media: Media[];
     activeMedia: Media[];
     addMedia: (media: Media) => void;
     updateProgress: (id: string, progress: number) => void;
     deleteMedia: (id: string) => void;
     linkFormats: (ids: string[]) => void;
     loadMedia: () => Promise<void>;
   }
   ```

### Phase 4: UI components
1. Create `components/MediaCard.tsx`:
   - Display media title, cover image, progress bar
   - Show progress as percentage + unit-specific display
   - Tap to open detail view
   - Long-press for quick actions (edit, delete)

2. Create `components/ProgressInput.tsx`:
   - Universal input supporting all progress units
   - Quick increment buttons (+1 page, +1 episode, +5 min)
   - Voice input button (future enhancement)
   - Validation based on total progress

3. Create `components/BarcodeScanner.tsx`:
   - Camera view with barcode overlay
   - Auto-detect and lookup barcode
   - Manual entry fallback
   - Premium feature gate

4. Create `components/FormatLinker.tsx`:
   - Search and link multiple formats of same content
   - Display linked formats with sync status
   - One-tap format switching

5. Create `components/ShareCard.tsx`:
   - Generate styled progress card image
   - Include title, cover, progress, custom message
   - Export as image or share link

### Phase 5: Screens
1. Implement `app/(tabs)/index.tsx` (Home):
   - Display active media (in progress)
   - Sort by last updated
   - Quick progress update buttons
   - Pull to refresh
   - Empty state with onboarding

2. Implement `app/(tabs)/library.tsx`:
   - Full media library with filters (type, status)
   - Search functionality
   - Completed items archive
   - Bulk actions (delete, export)

3. Implement `app/(tabs)/add.tsx`:
   - Search bar with type selector
   - Barcode scan button (premium)
   - Manual entry form
   - Recent searches

4. Implement `app/(tabs)/profile.tsx`:
   - Premium upgrade CTA
   - Sync settings
   - Export data
   - Theme selector
   - About/support

5. Implement `app/media/[id].tsx` (Detail):
   - Full media details
   - Progress history graph
   - Format switcher (if linked)
   - Notes/tags (future)
   - Share button

### Phase 6: Premium features
1. Implement barcode scanning in `components/BarcodeScanner.tsx`:
   - Request camera permissions
   - Use `expo-barcode-scanner` to detect codes
   - Call `lookupBarcode()` from API layer
   - Show premium gate if not subscribed

2. Implement cloud sync in `lib/sync.ts`:
   - Set up Firebase Firestore (or Expo's backend)
   - `syncToCloud()`: upload local changes
   - `syncFromCloud()`: download remote changes
   - Conflict resolution (last-write-wins)
   - Background sync on app resume

3. Add premium paywall:
   - Create `components/PremiumGate.tsx`
   - Integrate with Expo's in-app purchases
   - Handle one-time and subscription purchases
   - Restore purchases functionality

### Phase 7: Polish
1. Add animations:
   - Progress bar fill animation
   - Card swipe gestures
   - Screen transitions

2. Implement notifications:
   - Daily reminder to update progress
   - Completion celebrations
   - Sync status alerts

3. Add accessibility:
   - Screen reader labels
   - High contrast mode
   - Font scaling support

4. Error handling:
   - Offline mode indicators
   - API failure fallbacks
   - User-friendly error messages

### Phase 8: Testing
1. Write unit tests for all `lib/` functions
2. Write component tests for all `components/`
3. Add integration tests for critical flows:
   - Add media → update progress → view detail
   - Link formats → sync progress
   - Premium upgrade → unlock features
4. Run `npm test` and ensure 80%+ coverage

### Phase 9: Deployment prep
1. Generate app icons and splash screens
2. Configure EAS Build for iOS and Android
3. Set up app store listings:
   - Screenshots showing key features
   - Description emphasizing universal tracking
   - Keywords: progress tracker, media sync, book tracker
4. Submit for review

## How to verify it works

### Local development
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Test core flows:
   - Add a book manually (search "Dune")
   - Update progress to 50%
   - Add same book as audiobook
   - Link formats and verify progress syncs
   - Scan a barcode (use premium trial)
   - Share a progress card
   - Toggle offline mode and verify local storage

### Automated tests
1. Run test suite: `npm test`
2. Verify all tests pass:
   - Progress calculations
   - Database operations
   - Component rendering
   - API mocking
3. Check coverage report: `npm test -- --coverage`
4. Ensure no critical paths are untested

### Device testing
1. Test on physical iOS device via TestFlight
2. Test on physical Android device via internal testing
3. Verify camera permissions work
4. Test offline mode (airplane mode)
5. Test cloud sync across two devices
6. Verify premium purchase flow (sandbox)

### Acceptance criteria
- [ ] Can add media via search in under 10 seconds
- [ ] Progress updates persist after app restart
- [ ] Linked formats sync progress correctly
- [ ] Barcode scanning works in good lighting
- [ ] App works fully offline
- [ ] Cloud sync completes within 5 seconds
- [ ] All tests pass with 80%+ coverage
- [ ] No crashes during 30-minute usage session
- [ ] Premium paywall displays correctly
- [ ] Share cards generate and export successfully