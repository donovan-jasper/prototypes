# ChapterCast

## One-line pitch
Turn any audio into a chaptered audiobook — organize lectures, podcasts, and recordings with smart chapters and offline playback.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- **Students & lifelong learners** who download lecture recordings, conference talks, or educational podcasts and want to navigate them like textbooks (jump to specific topics, bookmark sections)
- **Podcast power users** who binge long-form content (Joe Rogan, Lex Fridman, Huberman Lab) and want chapters for 3+ hour episodes
- **Audiobook pirates/library users** who have DRM-free files but want the polished experience of Audible (progress tracking, sleep timer, speed control)
- **Content creators** who produce audio courses, guided meditations, or serialized content and need to package it professionally before distribution

**Broadest audience:**
Anyone with a folder of MP3s who's frustrated that their phone's music app doesn't remember where they left off, doesn't let them skip to "the good part," and treats a 2-hour lecture like a song.

**Adjacent use cases:**
- **Language learners** organizing lesson audio with chapters per grammar topic
- **Musicians/producers** creating demo reels with chaptered song sections
- **Journalists** archiving interview recordings with timestamped topics
- **Parents** packaging bedtime stories with chapters per tale
- **Fitness instructors** bundling workout audio with chapters per exercise

**Why non-technical people want this:**
"I downloaded a 4-hour podcast. My music app keeps losing my place. I can't skip to the interview part without scrubbing blindly. ChapterCast fixes this in 30 seconds."

## Tech stack

- **React Native (Expo SDK 52+)** — cross-platform iOS/Android
- **expo-av** — audio playback and metadata
- **expo-file-system** — local file management
- **expo-document-picker** — import audio files
- **expo-media-library** — access device audio library
- **SQLite (expo-sqlite)** — store audiobook metadata, chapters, playback progress
- **react-native-track-player** — advanced playback controls (sleep timer, speed, chapters)
- **ffmpeg-kit-react-native** — audio processing (merge files, embed chapters, convert formats)
- **zustand** — lightweight state management
- **React Navigation** — tab + stack navigation

## Core features (MVP)

1. **Smart Import & Auto-Chapter**
   - Import multiple audio files (MP3/M4A/WAV) from device or Files app
   - Auto-detect natural chapter breaks using silence detection or equal time splits
   - Manual chapter editing with waveform visualization (drag to adjust timestamps)

2. **Audiobook Player with Memory**
   - Remembers playback position per audiobook (even after app closes)
   - Chapter navigation (skip forward/back, tap chapter list to jump)
   - Playback speed (0.5x–3x), sleep timer, 15s skip buttons

3. **Offline Processing & Export**
   - Merge files + embed chapters into single M4B file (all on-device, no cloud)
   - Export to Files app or share to Books/Audible apps
   - Cover art upload + metadata editing (title, author, description)

4. **Library Management**
   - Grid/list view of audiobooks with progress bars
   - Search and filter by title, author, duration
   - Delete or archive completed audiobooks

5. **Playback Analytics (paid tier)**
   - Track listening streaks, total hours, completion rate
   - Chapter heatmap (which chapters get replayed most)

## Monetization strategy

**Free tier (hook):**
- Import up to 3 audiobooks
- Basic auto-chapter (equal time splits only)
- Standard playback features (speed, sleep timer, progress tracking)
- Export with watermarked cover art

**Paid tier ($4.99 one-time unlock):**
- Unlimited audiobooks
- Smart auto-chapter (silence detection, AI-suggested breaks)
- Custom cover art (no watermark)
- Playback analytics dashboard
- Priority support

**Why one-time vs subscription:**
- Audio processing is 100% on-device (no server costs)
- Users want to "own" the tool, not rent it
- Comparable to paid audiobook player apps (BookPlayer is $9.99)
- Lower barrier than $2.99/month for hobbyist use

**Upsell strategy:**
- Show "Upgrade to unlock smart chapters" after 3rd audiobook import
- Display analytics preview (blurred) in free tier
- Offer 50% launch discount for first 1,000 users

**What makes people stay:**
- Their audiobook library is locked in the app (switching cost)
- Continuous improvements (new auto-chapter algorithms, playback features)
- No subscription fatigue — one payment, lifetime value

## File structure

```
chaptercast/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Library screen
│   │   ├── import.tsx             # Import & chapter editor
│   │   └── settings.tsx           # Settings & upgrade
│   ├── audiobook/
│   │   └── [id].tsx               # Audiobook player screen
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── AudiobookCard.tsx
│   ├── ChapterEditor.tsx
│   ├── WaveformVisualizer.tsx
│   ├── PlayerControls.tsx
│   ├── ProgressBar.tsx
│   └── UpgradeModal.tsx
├── lib/
│   ├── audio/
│   │   ├── processor.ts           # FFmpeg audio processing
│   │   ├── chapterDetector.ts     # Auto-chapter algorithms
│   │   └── metadata.ts            # ID3/M4A metadata handling
│   ├── db/
│   │   ├── schema.ts              # SQLite schema
│   │   ├── audiobooks.ts          # Audiobook CRUD
│   │   └── chapters.ts            # Chapter CRUD
│   ├── player/
│   │   ├── playback.ts            # Playback state management
│   │   └── progress.ts            # Progress tracking
│   └── store/
│       └── useStore.ts            # Zustand store
├── hooks/
│   ├── useAudiobooks.ts
│   ├── usePlayer.ts
│   └── useUpgrade.ts
├── constants/
│   └── Config.ts
├── assets/
│   ├── fonts/
│   └── images/
├── __tests__/
│   ├── audio/
│   │   ├── processor.test.ts
│   │   └── chapterDetector.test.ts
│   ├── db/
│   │   └── audiobooks.test.ts
│   └── player/
│       └── playback.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/audio/chapterDetector.test.ts
import { detectChaptersBySilence, detectChaptersByTime } from '@/lib/audio/chapterDetector';

describe('Chapter Detection', () => {
  test('splits audio into equal time chapters', () => {
    const duration = 3600; // 1 hour
    const chapters = detectChaptersByTime(duration, 4);
    expect(chapters).toHaveLength(4);
    expect(chapters[0].startTime).toBe(0);
    expect(chapters[0].endTime).toBe(900);
  });

  test('detects silence-based chapter breaks', async () => {
    const mockAudioPath = 'file:///mock/audio.mp3';
    const chapters = await detectChaptersBySilence(mockAudioPath, -40, 2);
    expect(chapters.length).toBeGreaterThan(0);
  });
});

// __tests__/db/audiobooks.test.ts
import { createAudiobook, getAudiobooks, updateProgress } from '@/lib/db/audiobooks';
import { openDatabase } from '@/lib/db/schema';

describe('Audiobook Database', () => {
  beforeAll(async () => {
    await openDatabase();
  });

  test('creates and retrieves audiobook', async () => {
    const audiobook = await createAudiobook({
      title: 'Test Book',
      author: 'Test Author',
      duration: 3600,
      filePath: 'file:///test.m4b',
    });
    expect(audiobook.id).toBeDefined();

    const books = await getAudiobooks();
    expect(books.length).toBeGreaterThan(0);
  });

  test('updates playback progress', async () => {
    const audiobook = await createAudiobook({
      title: 'Progress Test',
      author: 'Test',
      duration: 1000,
      filePath: 'file:///test2.m4b',
    });
    await updateProgress(audiobook.id, 500);
    const books = await getAudiobooks();
    const updated = books.find(b => b.id === audiobook.id);
    expect(updated?.currentPosition).toBe(500);
  });
});

// __tests__/player/playback.test.ts
import { calculateProgress, formatTime } from '@/lib/player/playback';

describe('Playback Utilities', () => {
  test('calculates progress percentage', () => {
    expect(calculateProgress(500, 1000)).toBe(50);
    expect(calculateProgress(0, 1000)).toBe(0);
    expect(calculateProgress(1000, 1000)).toBe(100);
  });

  test('formats time correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(3661)).toBe('1:01:01');
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app chaptercast --template tabs
cd chaptercast
npm install expo-av expo-file-system expo-document-picker expo-media-library expo-sqlite zustand react-native-track-player ffmpeg-kit-react-native
```

### 2. Database schema (`lib/db/schema.ts`)
- Create SQLite schema with tables: `audiobooks`, `chapters`, `settings`
- `audiobooks`: id, title, author, duration, filePath, coverArt, currentPosition, createdAt
- `chapters`: id, audiobookId, title, startTime, endTime, order
- Initialize database on app launch with migration support

### 3. Audio processor (`lib/audio/processor.ts`)
- Implement `mergeAudioFiles(filePaths: string[]): Promise<string>` using ffmpeg-kit
- Implement `embedChapters(audioPath: string, chapters: Chapter[]): Promise<string>`
- Implement `extractMetadata(filePath: string): Promise<Metadata>`
- Handle M4A/MP3/WAV input, output M4B with chapter markers

### 4. Chapter detection (`lib/audio/chapterDetector.ts`)
- `detectChaptersByTime(duration: number, count: number): Chapter[]` — equal splits
- `detectChaptersBySilence(audioPath: string, threshold: number, minDuration: number): Promise<Chapter[]>` — use ffmpeg silence detection
- Return array of `{ title: string, startTime: number, endTime: number }`

### 5. Import screen (`app/(tabs)/import.tsx`)
- Use `expo-document-picker` to select multiple audio files
- Display file list with durations and sizes
- Show "Auto-Chapter" button with options (equal splits, silence detection)
- Navigate to chapter editor after processing

### 6. Chapter editor (`components/ChapterEditor.tsx`)
- Display waveform visualization using `expo-av` audio analysis
- Render draggable chapter markers on timeline
- Allow adding/removing/renaming chapters
- "Save Audiobook" button triggers merge + embed process

### 7. Library screen (`app/(tabs)/index.tsx`)
- Query audiobooks from SQLite, display in grid with cover art
- Show progress bar and "X% complete" badge
- Tap card to navigate to player screen
- Long-press for delete/archive options

### 8. Player screen (`app/audiobook/[id].tsx`)
- Use `react-native-track-player` for playback
- Display cover art, title, author, current chapter
- Playback controls: play/pause, 15s skip, speed selector (0.5x–3x)
- Chapter list drawer (swipe up) with tap-to-jump
- Sleep timer with 5/10/15/30/60 min presets
- Update `currentPosition` in SQLite every 5 seconds

### 9. Playback state (`lib/player/playback.ts`)
- Zustand store for current audiobook, playback state, speed, timer
- `usePlayer()` hook for components to access/update state
- Persist playback position to SQLite on pause/close

### 10. Upgrade modal (`components/UpgradeModal.tsx`)
- Show after 3rd audiobook import attempt in free tier
- Display feature comparison table (free vs paid)
- Integrate Expo In-App Purchases for $4.99 unlock
- Store purchase status in SQLite `settings` table

### 11. Settings screen (`app/(tabs)/settings.tsx`)
- Display upgrade status (free/paid)
- Storage usage (total audiobooks, disk space)
- Export all audiobooks to Files app
- Clear cache, reset app data
- About/support links

### 12. Waveform visualizer (`components/WaveformVisualizer.tsx`)
- Use `expo-av` to extract audio samples
- Render canvas with amplitude bars
- Overlay chapter markers as vertical lines
- Handle touch gestures for scrubbing

### 13. Analytics (paid tier, `lib/analytics/`)
- Track listening sessions (start/end time, duration)
- Calculate streaks (consecutive days with >10 min listening)
- Chapter heatmap (replay count per chapter)
- Display in settings screen as charts (use `react-native-chart-kit`)

### 14. Export functionality (`lib/audio/export.ts`)
- `exportToFiles(audiobookId: string): Promise<void>` — copy M4B to Files app
- `shareAudiobook(audiobookId: string): Promise<void>` — native share sheet
- Preserve chapter metadata in exported file

### 15. Error handling & loading states
- Show loading spinner during audio processing (can take 30s+ for large files)
- Display error alerts for unsupported formats, corrupted files
- Retry logic for failed FFmpeg operations

### 16. Onboarding flow
- First launch: show 3-screen tutorial (import → chapter → play)
- Sample audiobook included (public domain content) for demo
- Skip button to go straight to library

### 17. Polish
- Dark mode support (follow system theme)
- Haptic feedback on button presses
- Smooth animations (chapter marker drag, player controls)
- Accessibility labels for VoiceOver

## How to verify it works

### Development testing
```bash
npm install
npm test  # All Jest tests must pass
npx expo start
```

### Device testing (Expo Go)
1. Scan QR code with Expo Go app (iOS/Android)
2. Grant permissions: Files, Media Library
3. Import test audio files (use 3 short MP3s, <5 min each)
4. Verify auto-chapter detection creates 3+ chapters
5. Edit chapter titles and timestamps in editor
6. Save audiobook and confirm it appears in library
7. Open player, verify:
   - Playback starts/pauses correctly
   - Chapter navigation works (tap chapter list)
   - Progress persists after closing app
   - Speed control changes playback rate
   - Sleep timer stops playback after countdown
8. Test free tier limit (import 4th audiobook, see upgrade modal)
9. Export audiobook to Files app, verify M4B file has chapters

### Simulator testing
```bash
npx expo run:ios  # or run:android
```
- Same tests as device, but use simulator file picker
- Verify SQLite persistence across app restarts
- Test background audio (lock screen controls)

### Test checklist
- [ ] `npm test` passes all unit tests
- [ ] Import 3 audio files successfully
- [ ] Auto-chapter creates valid timestamps
- [ ] Manual chapter editing saves correctly
- [ ] Audiobook appears in library with progress bar
- [ ] Player remembers position after app close
- [ ] Chapter navigation jumps to correct timestamps
- [ ] Speed control works (0.5x, 1x, 2x tested)
- [ ] Sleep timer stops playback
- [ ] Upgrade modal appears on 4th import
- [ ] Export creates valid M4B file with chapters
- [ ] Dark mode renders correctly
- [ ] No crashes or memory leaks during 30+ min playback