# PageTurn

## One-line pitch
Your personal manga library, beautifully organized and always in your pocket—no ads, no limits, just pure reading.

## Expanded vision

**Core audience:** Manga readers who are tired of intrusive ads, unreliable web readers, and apps that feel like afterthoughts. This includes:

- **Casual readers (ages 13-25)** who discovered manga through anime and want a better mobile experience than browser tabs
- **Collectors (ages 20-40)** with large digital libraries who need serious organization tools
- **Parents** looking for a safe, ad-free reading app for their kids
- **Comic/webtoon readers** who realize this works for any sequential art format
- **International users** in regions with limited manga access who rely on personal collections

**Adjacent use cases:**
- Digital comic book reading (Western comics, graphic novels)
- Webtoon consumption with vertical scroll optimization
- Art portfolio browsing for illustrators
- Educational manga (language learning, history)
- Archival reading for researchers studying visual storytelling

**Why non-technical users want this:**
Most people don't want to "self-host" or configure servers—they want to drop files in a folder and start reading. PageTurn makes advanced features feel simple: drag-and-drop library imports, automatic metadata detection, and iCloud sync that "just works." It's the Spotify of manga: your content, organized beautifully, accessible everywhere.

**The gap:** Premium manga apps either don't exist (iOS) or are clunky ports of Android apps. Readers are stuck between ad-riddled free apps and expensive per-volume purchases. PageTurn offers Netflix-style unlimited access to your own library with a polished, native feel.

## Tech stack

- **React Native (Expo SDK 52+)** — Cross-platform iOS/Android with native performance
- **expo-file-system** — Local file management and caching
- **expo-sqlite** — Offline-first library database
- **react-native-gesture-handler** + **react-native-reanimated** — Smooth page transitions and gestures
- **expo-image** — Optimized image rendering with caching
- **react-navigation** — Native navigation patterns
- **zustand** — Lightweight state management
- **expo-document-picker** — Import manga archives (CBZ/CBR/ZIP)
- **jszip** — Extract and parse manga archives
- **expo-secure-store** — Encrypted storage for premium status

## Core features

1. **Smart Library Import** — Drag-and-drop CBZ/CBR/ZIP files or connect to a folder. Auto-detects series, volumes, and chapters. Extracts cover art and metadata.

2. **Gesture-Driven Reading** — Swipe to turn pages, pinch to zoom, double-tap to fit. Supports left-to-right, right-to-left, and vertical scroll modes. Remembers your position across devices.

3. **Offline-First Collections** — All manga stored locally with intelligent caching. Mark favorites, create reading lists, track progress. Works perfectly on planes and subways.

4. **Cloud Sync (Premium)** — Reading progress, bookmarks, and library metadata sync via iCloud/Google Drive. Never lose your place.

5. **Reader Customization** — Adjust brightness, contrast, and page transitions. Dark mode for night reading. Configurable tap zones for navigation.

## Monetization strategy

**Free tier:**
- Import up to 10 manga series
- Basic reading features (all gestures, zoom, bookmarks)
- Local storage only
- Ad-free (always)

**Premium ($3.99/month or $29.99/year):**
- Unlimited library size
- Cloud sync across devices
- Advanced organization (tags, custom lists, filters)
- Reading statistics and streaks
- Priority support

**Why this works:**
- **Hook:** Free tier is genuinely useful—10 series is enough for casual readers to fall in love with the app
- **Price point:** Lower than competitors ($4.99) but higher than throwaway apps ($0.99). Signals quality without being prohibitive for teens
- **Retention:** Cloud sync creates lock-in. Once your library is synced, switching apps means losing all your progress and metadata
- **Annual conversion:** $29.99/year (37% discount) targets collectors who know they'll use this long-term

**Why people stay subscribed:**
- Their entire reading history lives in the app
- Muscle memory from gestures and UI
- Fear of losing curated metadata and progress
- New manga added to library automatically syncs

## File structure

```
pageturn/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Library grid view
│   │   ├── reading-list.tsx       # Continue reading + lists
│   │   └── settings.tsx           # App settings + premium
│   ├── reader/
│   │   └── [id].tsx               # Full-screen reader
│   ├── manga/
│   │   └── [id].tsx               # Manga detail page
│   └── _layout.tsx
├── components/
│   ├── MangaCover.tsx             # Optimized cover image
│   ├── ReaderControls.tsx         # Bottom toolbar in reader
│   ├── PageView.tsx               # Single page renderer
│   ├── GestureReader.tsx          # Swipe/zoom handler
│   ├── LibraryGrid.tsx            # Manga grid with filters
│   ├── ImportButton.tsx           # File picker trigger
│   └── PremiumGate.tsx            # Paywall modal
├── lib/
│   ├── db.ts                      # SQLite setup + queries
│   ├── manga-parser.ts            # CBZ/CBR extraction
│   ├── storage.ts                 # File system operations
│   ├── sync.ts                    # Cloud sync logic
│   └── premium.ts                 # Subscription validation
├── store/
│   ├── library.ts                 # Zustand library state
│   ├── reader.ts                  # Reading preferences
│   └── user.ts                    # Premium status
├── types/
│   └── index.ts                   # TypeScript definitions
├── __tests__/
│   ├── manga-parser.test.ts
│   ├── db.test.ts
│   ├── storage.test.ts
│   └── premium.test.ts
├── assets/
│   └── images/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/manga-parser.test.ts
import { extractMangaArchive, detectMetadata } from '../lib/manga-parser';

describe('Manga Parser', () => {
  it('extracts pages from CBZ archive', async () => {
    const mockZip = { files: { '001.jpg': {}, '002.jpg': {} } };
    const pages = await extractMangaArchive(mockZip);
    expect(pages.length).toBe(2);
  });

  it('detects series name from filename', () => {
    const metadata = detectMetadata('One Piece - Vol 01.cbz');
    expect(metadata.series).toBe('One Piece');
    expect(metadata.volume).toBe(1);
  });
});

// __tests__/db.test.ts
import { initDB, addManga, getMangaById } from '../lib/db';

describe('Database', () => {
  beforeEach(async () => {
    await initDB();
  });

  it('stores and retrieves manga', async () => {
    const manga = { title: 'Test Manga', coverUri: 'file://test.jpg' };
    const id = await addManga(manga);
    const retrieved = await getMangaById(id);
    expect(retrieved.title).toBe('Test Manga');
  });
});

// __tests__/storage.test.ts
import { savePage, getPageUri } from '../lib/storage';

describe('Storage', () => {
  it('saves page to file system', async () => {
    const uri = await savePage('manga-1', 1, 'base64data');
    expect(uri).toContain('manga-1/page-1');
  });
});

// __tests__/premium.test.ts
import { checkPremiumStatus, canAddManga } from '../lib/premium';

describe('Premium', () => {
  it('limits free users to 10 manga', () => {
    const canAdd = canAddManga(10, false);
    expect(canAdd).toBe(false);
  });

  it('allows unlimited for premium users', () => {
    const canAdd = canAddManga(100, true);
    expect(canAdd).toBe(true);
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app pageturn --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-file-system expo-sqlite expo-document-picker expo-image expo-secure-store
   npm install zustand jszip react-native-gesture-handler react-native-reanimated
   npm install -D jest @testing-library/react-native
   ```
3. Configure `app.json`:
   - Set app name to "PageTurn"
   - Add file system permissions for iOS/Android
   - Configure splash screen and icon
4. Set up TypeScript types in `types/index.ts`:
   ```typescript
   export interface Manga {
     id: string;
     title: string;
     coverUri: string;
     totalPages: number;
     currentPage: number;
     readingMode: 'ltr' | 'rtl' | 'vertical';
     lastRead: number;
     isFavorite: boolean;
   }
   ```

### Phase 2: Database layer
1. Create `lib/db.ts`:
   - Initialize SQLite with tables: `manga`, `pages`, `reading_progress`
   - Implement CRUD operations: `addManga`, `updateProgress`, `getMangaList`
   - Add indexes for performance on `lastRead` and `isFavorite`
2. Write tests in `__tests__/db.test.ts`
3. Run `npm test` to verify

### Phase 3: File parsing
1. Create `lib/manga-parser.ts`:
   - Implement `extractMangaArchive(uri)` using jszip to extract CBZ/ZIP
   - Parse filenames to detect series/volume/chapter
   - Sort pages numerically (handle 001.jpg, 1.jpg, page1.png)
2. Create `lib/storage.ts`:
   - Implement `savePage(mangaId, pageNum, base64)` to cache extracted images
   - Use expo-file-system to create manga-specific directories
   - Implement cleanup for deleted manga
3. Write tests for both modules
4. Verify with sample CBZ file

### Phase 4: Library UI
1. Create `components/LibraryGrid.tsx`:
   - FlatList with 2-column grid layout
   - Render MangaCover components with title overlay
   - Pull-to-refresh to reload library
2. Create `components/MangaCover.tsx`:
   - Use expo-image with caching
   - Show progress indicator (e.g., "Page 45/200")
   - Favorite star icon overlay
3. Implement `app/(tabs)/index.tsx`:
   - Load manga from database on mount
   - Filter/sort controls (recent, favorites, A-Z)
   - Navigate to manga detail on tap
4. Test in Expo Go on device

### Phase 5: Import flow
1. Create `components/ImportButton.tsx`:
   - Trigger expo-document-picker for CBZ/CBR/ZIP files
   - Show loading spinner during extraction
   - Display error if file is invalid
2. Implement import logic in `lib/manga-parser.ts`:
   - Extract all images from archive
   - Save to file system via `storage.ts`
   - Insert metadata into database
   - Generate thumbnail from first page
3. Add premium check: block if user has 10+ manga and is not premium
4. Test with multiple file formats

### Phase 6: Reader implementation
1. Create `components/GestureReader.tsx`:
   - Use react-native-gesture-handler for swipe detection
   - Implement pinch-to-zoom with react-native-reanimated
   - Support tap zones (left/right/center for prev/next/menu)
2. Create `components/PageView.tsx`:
   - Render single page with expo-image
   - Handle zoom state and pan gestures
   - Preload next/previous pages
3. Implement `app/reader/[id].tsx`:
   - Full-screen immersive mode (hide status bar)
   - Load pages from file system
   - Update reading progress in database on page change
   - Bottom toolbar with page counter and settings
4. Add reading modes: LTR, RTL, vertical scroll
5. Test gestures on physical device (simulator gestures are limited)

### Phase 7: Premium features
1. Create `lib/premium.ts`:
   - Implement `checkPremiumStatus()` using expo-secure-store
   - Mock subscription validation (use RevenueCat in production)
   - Implement `canAddManga(count, isPremium)` logic
2. Create `components/PremiumGate.tsx`:
   - Modal with feature comparison table
   - "Upgrade" button (mock for now)
   - Dismissible for free users
3. Add cloud sync skeleton in `lib/sync.ts`:
   - Export reading progress as JSON
   - Mock upload/download (use expo-file-system + cloud storage in production)
4. Gate sync behind premium check
5. Write tests for premium logic

### Phase 8: Polish and settings
1. Implement `app/(tabs)/settings.tsx`:
   - Premium status display
   - Reading preferences (default mode, brightness)
   - Library management (clear cache, delete all)
   - About/support links
2. Add dark mode support using Expo's color scheme
3. Implement `app/(tabs)/reading-list.tsx`:
   - "Continue Reading" section with recent manga
   - Custom lists (premium feature)
4. Add haptic feedback on page turns (expo-haptics)
5. Optimize image loading with lower resolution thumbnails

### Phase 9: Testing and refinement
1. Run full test suite: `npm test`
2. Test on both iOS and Android devices via Expo Go
3. Import 15+ manga to test free tier limit
4. Verify all gestures work smoothly
5. Check database performance with 100+ manga
6. Test offline mode (airplane mode)
7. Verify reading progress persists across app restarts

### Phase 10: Deployment prep
1. Generate app icons and splash screens
2. Configure EAS Build for standalone apps
3. Set up RevenueCat for real subscriptions
4. Implement cloud sync with Firebase/Supabase
5. Add analytics (Expo Analytics or Mixpanel)
6. Write App Store/Play Store descriptions
7. Create demo video showing import → read → sync flow

## How to verify it works

### Local development
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app on iOS/Android device
3. Test import flow:
   - Tap "Import Manga" button
   - Select a CBZ/ZIP file from device storage
   - Verify manga appears in library grid with cover
4. Test reader:
   - Tap manga cover to open detail page
   - Tap "Read" to enter full-screen reader
   - Swipe left/right to turn pages
   - Pinch to zoom on a page
   - Verify page counter updates
5. Test premium gate:
   - Import 10 manga files
   - Attempt to import 11th file
   - Verify paywall modal appears
6. Test persistence:
   - Close app completely
   - Reopen and verify library still shows all manga
   - Open a manga and verify it remembers last page read

### Automated tests
1. Run test suite: `npm test`
2. Verify all tests pass:
   - Manga parser extracts pages correctly
   - Database stores and retrieves manga
   - Storage saves pages to file system
   - Premium logic enforces 10-manga limit
3. Check test coverage: `npm test -- --coverage`
4. Aim for >80% coverage on core logic

### Device testing checklist
- [ ] Import works on iOS and Android
- [ ] Gestures feel smooth (60fps page turns)
- [ ] Zoom doesn't lag or stutter
- [ ] Reading progress saves correctly
- [ ] App works offline (airplane mode)
- [ ] Dark mode switches properly
- [ ] Library loads quickly with 50+ manga
- [ ] No memory leaks during long reading sessions
- [ ] Premium gate blocks 11th import
- [ ] Settings persist across restarts