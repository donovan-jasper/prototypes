# SaveStack

## One-line pitch
Your personal media library — save any video, article, or image from anywhere on the web, organized and ready offline.

## Expanded vision

### Who is this REALLY for?

**Broadest audience:** Anyone who consumes content on their phone and thinks "I want to watch/read this later" but never does because it disappears, requires internet, or gets lost in bookmarks.

**Core segments:**
- **Commuters & travelers** — Download content at home, consume during dead zones (subway, flights, rural areas)
- **Students & lifelong learners** — Build research libraries, save educational videos/articles for exam prep
- **Parents** — Download kids' content for car trips, doctor's offices, anywhere without reliable WiFi
- **Content creators** — Collect inspiration, reference material, competitor analysis in one searchable place
- **News junkies** — Archive important articles/videos before they're taken down or paywalled
- **Hobbyists** — Curate cooking videos, DIY tutorials, fitness routines without relying on platform algorithms

### Adjacent use cases:
- **Digital decluttering** — Replace 47 browser tabs and scattered bookmarks with one organized library
- **Content insurance** — Preserve content that might disappear (deleted posts, expired stories, removed videos)
- **Offline entertainment hub** — Personal Netflix for saved content, no subscription required
- **Cross-platform bridge** — Save from TikTok, watch on your terms without the app's distractions
- **Gift/share curation** — Build collections to share with friends ("Best recipes I found this month")

### Why non-technical people want this:
- **It just works** — Share sheet integration means saving is as easy as sharing to a friend
- **No more "video unavailable"** — Content you saved is yours, even if the original is deleted
- **Reclaim attention** — Consume saved content intentionally, not via algorithm-driven feeds
- **One app, everything** — No more juggling Pocket for articles, separate apps for videos, Pinterest for images

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite) for metadata, FileSystem for media files
- **Media processing:** expo-av for video/audio playback, expo-media-library for camera roll integration
- **Networking:** axios for downloads with progress tracking
- **Parsing:** cheerio-without-node-native for web scraping, yt-dlp-exec wrapper for video extraction
- **UI:** React Native Paper for Material Design components
- **State:** Zustand for lightweight global state
- **Testing:** Jest + React Native Testing Library

## Core features (MVP)

1. **Universal save via share sheet**
   - iOS/Android share extension captures URLs from any app
   - Automatically detects content type (video, article, image)
   - Downloads and saves locally with metadata (title, source, thumbnail, date)

2. **Smart offline library**
   - Grid/list view with thumbnails and previews
   - Filter by type (videos, articles, images) and source
   - Full-text search across titles and content
   - Built-in video player and article reader (no external apps needed)

3. **Organized collections**
   - Create custom folders/tags (e.g., "Watch Later", "Recipes", "Work Research")
   - Drag-and-drop to organize
   - Quick-add to collections during save

4. **Quality & format options**
   - Choose video quality (720p, 1080p) before download
   - Convert videos to audio-only for podcasts/music
   - Batch download multiple items from a shared collection link

5. **Export & share**
   - Save videos/images to camera roll
   - Share saved content with friends (re-upload or send file)
   - Export collections as shareable links

## Monetization strategy

### Free tier (hook):
- Save up to 25 items per month
- Standard quality downloads (720p max)
- 2 custom collections
- Ads on library home screen (non-intrusive banner)

### Paid tier — SaveStack Pro ($5.99/month or $49.99/year):
- **Unlimited saves** — No monthly cap
- **High-quality downloads** — Up to 4K video, original image resolution
- **Unlimited collections** — Organize however you want
- **Ad-free experience**
- **Cloud backup** — Auto-sync to iCloud/Google Drive (metadata + files)
- **Batch operations** — Download entire playlists, bulk tag/move items
- **Priority processing** — Faster downloads, skip queue during peak times
- **Advanced search** — Filter by date range, source domain, file size

### Price reasoning:
- $5.99/month positions between Pocket Premium ($4.99) and YouTube Premium ($13.99)
- Annual discount (30% off) encourages commitment
- Price reflects value of storage, processing costs, and ongoing maintenance of scrapers

### Retention drivers:
- **Sunk cost** — Users build large libraries they don't want to lose (export limited on free tier)
- **Habit formation** — Daily use for commutes/downtime makes it indispensable
- **Reliability** — Consistent performance where free alternatives fail (broken scrapers, ads, malware)
- **Cross-device sync** — Once you're on multiple devices, canceling means losing that convenience

## File structure

```
savestack/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Library home
│   │   ├── collections.tsx        # Collections view
│   │   └── settings.tsx           # Settings & subscription
│   ├── item/[id].tsx              # Item detail/player
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── ItemCard.tsx               # Grid/list item component
│   ├── MediaPlayer.tsx            # Video/audio player
│   ├── ArticleReader.tsx          # Article view
│   ├── CollectionPicker.tsx       # Collection selector modal
│   ├── DownloadProgress.tsx       # Progress indicator
│   └── SearchBar.tsx              # Search input
├── lib/
│   ├── db.ts                      # SQLite setup & queries
│   ├── downloader.ts              # Media download logic
│   ├── parser.ts                  # URL parsing & metadata extraction
│   ├── storage.ts                 # FileSystem operations
│   ├── share-extension.ts         # Share sheet handler
│   └── subscription.ts            # In-app purchase logic
├── store/
│   └── useStore.ts                # Zustand store
├── types/
│   └── index.ts                   # TypeScript types
├── __tests__/
│   ├── downloader.test.ts
│   ├── parser.test.ts
│   ├── storage.test.ts
│   └── db.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/parser.test.ts`
```typescript
import { parseUrl, detectContentType } from '../lib/parser';

describe('URL Parser', () => {
  test('detects YouTube video', () => {
    const result = parseUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.type).toBe('video');
    expect(result.platform).toBe('youtube');
  });

  test('detects article URL', () => {
    const result = parseUrl('https://example.com/article');
    expect(result.type).toBe('article');
  });

  test('detects image URL', () => {
    const result = parseUrl('https://example.com/image.jpg');
    expect(result.type).toBe('image');
  });
});
```

### `__tests__/downloader.test.ts`
```typescript
import { downloadMedia, getVideoInfo } from '../lib/downloader';

describe('Media Downloader', () => {
  test('extracts video metadata', async () => {
    const info = await getVideoInfo('https://www.youtube.com/watch?v=test');
    expect(info).toHaveProperty('title');
    expect(info).toHaveProperty('thumbnail');
    expect(info).toHaveProperty('duration');
  });

  test('handles invalid URL gracefully', async () => {
    await expect(downloadMedia('not-a-url')).rejects.toThrow();
  });
});
```

### `__tests__/storage.test.ts`
```typescript
import { saveFile, deleteFile, getFileUri } from '../lib/storage';

describe('File Storage', () => {
  test('saves file and returns URI', async () => {
    const uri = await saveFile('test.txt', 'Hello World');
    expect(uri).toContain('test.txt');
  });

  test('deletes file successfully', async () => {
    const uri = await saveFile('temp.txt', 'Temp');
    await deleteFile(uri);
    const exists = await getFileUri('temp.txt');
    expect(exists).toBeNull();
  });
});
```

### `__tests__/db.test.ts`
```typescript
import { initDB, addItem, getItems, deleteItem } from '../lib/db';

describe('Database Operations', () => {
  beforeAll(async () => {
    await initDB();
  });

  test('adds and retrieves item', async () => {
    const item = {
      url: 'https://example.com',
      title: 'Test',
      type: 'article',
      fileUri: '/path/to/file'
    };
    const id = await addItem(item);
    const items = await getItems();
    expect(items.find(i => i.id === id)).toBeDefined();
  });

  test('deletes item', async () => {
    const id = await addItem({ url: 'test', title: 'Test', type: 'article' });
    await deleteItem(id);
    const items = await getItems();
    expect(items.find(i => i.id === id)).toBeUndefined();
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest savestack --template blank-typescript
cd savestack
npx expo install expo-sqlite expo-file-system expo-av expo-media-library expo-sharing
npm install zustand axios cheerio react-native-paper
npm install -D jest @testing-library/react-native @types/jest
```

### 2. Database schema (`lib/db.ts`)
- Create SQLite database with tables:
  - `items` (id, url, title, type, fileUri, thumbnailUri, source, createdAt, collectionId)
  - `collections` (id, name, color, createdAt)
- Write functions: `initDB()`, `addItem()`, `getItems()`, `updateItem()`, `deleteItem()`, `addCollection()`, `getCollections()`

### 3. File storage (`lib/storage.ts`)
- Use `FileSystem.documentDirectory` for saved media
- Create folder structure: `/media/videos/`, `/media/images/`, `/media/articles/`
- Implement `saveFile(filename, data)`, `deleteFile(uri)`, `getFileUri(filename)`
- Add progress tracking for downloads using `FileSystem.createDownloadResumable()`

### 4. URL parser (`lib/parser.ts`)
- Detect content type from URL (video platforms, image extensions, article domains)
- Extract metadata using cheerio for HTML parsing
- For videos: integrate yt-dlp wrapper or use platform APIs (YouTube Data API, TikTok unofficial API)
- Return structured data: `{ type, title, thumbnail, source, downloadUrl }`

### 5. Downloader (`lib/downloader.ts`)
- Implement `downloadMedia(url, quality)` that:
  - Parses URL to get download link
  - Downloads file with progress callback
  - Saves to appropriate folder
  - Generates thumbnail for videos
  - Returns file URI and metadata
- Handle errors (network failures, unsupported URLs, rate limits)

### 6. Share extension setup
- Configure `app.json` with share extension intent filters (iOS/Android)
- Create `lib/share-extension.ts` to handle incoming URLs
- Trigger download flow when URL is shared to app
- Show toast notification on successful save

### 7. Zustand store (`store/useStore.ts`)
- State: `items`, `collections`, `isLoading`, `downloadProgress`
- Actions: `addItem()`, `removeItem()`, `updateItem()`, `setCollection()`, `searchItems()`
- Persist state to AsyncStorage for quick app launches

### 8. UI Components

**ItemCard.tsx:**
- Display thumbnail, title, source, duration/word count
- Long-press for context menu (delete, move to collection, share)
- Tap to open detail view

**MediaPlayer.tsx:**
- Use `expo-av` Video component
- Controls: play/pause, seek, speed, quality toggle
- Picture-in-picture support (iOS)

**ArticleReader.tsx:**
- Render saved HTML with WebView or custom text renderer
- Reading progress indicator
- Font size/theme controls

**CollectionPicker.tsx:**
- Modal with list of collections
- "Create new collection" button
- Assign item to collection on selection

### 9. Screens

**app/(tabs)/index.tsx (Library):**
- Grid view of all saved items
- Filter chips (All, Videos, Articles, Images)
- Search bar at top
- Pull-to-refresh
- Empty state with onboarding

**app/(tabs)/collections.tsx:**
- List of collections with item counts
- Tap to view collection contents
- Create/edit/delete collections

**app/(tabs)/settings.tsx:**
- Subscription status & upgrade button
- Storage usage indicator
- Default quality settings
- Export/import data
- About & support links

**app/item/[id].tsx:**
- Full-screen media player or article reader
- Metadata display (source, date saved, collection)
- Actions: share, export to camera roll, delete

### 10. Subscription logic (`lib/subscription.ts`)
- Integrate `expo-in-app-purchases` or RevenueCat
- Check subscription status on app launch
- Gate premium features (unlimited saves, high quality, cloud sync)
- Restore purchases flow

### 11. Testing
- Write unit tests for all `lib/` modules
- Test edge cases: invalid URLs, network failures, large files
- Mock external APIs in tests
- Run `npm test` to verify all tests pass

### 12. Polish
- Add haptic feedback on actions
- Implement skeleton loaders during downloads
- Show download queue with cancel option
- Add onboarding tutorial on first launch
- Optimize thumbnail generation for performance

## How to verify it works

### On device/simulator:
1. Run `npx expo start` and scan QR code with Expo Go
2. Grant permissions (storage, media library) when prompted
3. Test share sheet:
   - Open Safari/Chrome, navigate to YouTube video
   - Tap share button, select "SaveStack"
   - Verify download starts and item appears in library
4. Test playback:
   - Tap saved video, verify it plays offline (disable WiFi/cellular)
   - Seek, pause, resume should work smoothly
5. Test collections:
   - Create new collection "Cooking"
   - Long-press item, assign to collection
   - Navigate to Collections tab, verify item appears
6. Test search:
   - Save multiple items with different titles
   - Search for keyword, verify filtering works
7. Test subscription:
   - Attempt to save 26th item on free tier
   - Verify paywall appears with upgrade prompt

### Automated tests:
```bash
npm test
```
All tests in `__tests__/` must pass with 100% success rate.

### Performance checks:
- Library with 100+ items should scroll smoothly (60fps)
- Video playback should start within 2 seconds
- Search results should appear instantly (<100ms)
- Download progress should update in real-time