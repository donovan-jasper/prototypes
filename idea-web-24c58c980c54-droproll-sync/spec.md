# MediaMesh

## One-line pitch
Your entire photo library, every cloud service, one organized camera roll — no manual downloads, ever.

## Expanded vision

**Core audience:** Anyone who uses more than one cloud service and feels frustrated by fragmentation.

**Broadest reach:**
- **Parents** who have photos scattered across Google Photos (Android days), iCloud (current iPhone), and Dropbox (shared family albums) — they just want everything in one place to make slideshows or print books
- **Content creators** who shoot on multiple devices, store in different clouds, and need everything local for editing without hunting through apps
- **Small business owners** (real estate agents, event planners) who receive client photos via various cloud links and need them organized by project on their device
- **Students** managing group project media across Google Drive, OneDrive (school account), and personal iCloud
- **Travelers** who want offline access to their entire photo history without manually downloading albums before flights

**Adjacent use cases:**
- Automatic backup verification (prove your cloud files actually made it to your device)
- Cross-cloud deduplication (same photo in three services? Keep one copy)
- Smart albums by location/date/people without vendor lock-in
- Emergency local archive (if cloud accounts get locked/hacked, you have everything)

**Non-technical appeal:** "I just want all my photos in one place" — no understanding of APIs or sync protocols needed. It's the universal remote for your photo chaos.

**Why this wins:** Cloud services want lock-in. This app is Switzerland — it works with everyone, which means it serves the massive audience tired of choosing sides or managing multiple apps.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite) for sync metadata, file paths, and organization rules
- **File system:** expo-file-system for media downloads and caching
- **Background tasks:** expo-task-manager + expo-background-fetch for sync when app is closed
- **Cloud APIs:** 
  - Dropbox SDK
  - Google Drive REST API
  - iCloud via CloudKit (iOS only, graceful degradation on Android)
- **Media handling:** expo-media-library for camera roll integration
- **State management:** Zustand (lightweight, no boilerplate)
- **Auth:** expo-auth-session for OAuth flows
- **Notifications:** expo-notifications for sync completion alerts
- **Testing:** Jest + React Native Testing Library

## Core features (MVP)

1. **One-tap cloud connect** — OAuth login for Dropbox, Google Drive, iCloud. No manual folder selection; app auto-discovers photo/video folders.

2. **Smart sync rules** — Choose "sync everything" or set filters (date range, file type, specific folders). Runs automatically in background every 6 hours or on-demand.

3. **Unified gallery** — All synced media appears in one chronological feed with cloud source badges. Tap to view full-res, long-press for original cloud link.

4. **Duplicate detection** — AI-powered image hashing identifies same photo across clouds. User chooses which copy to keep or auto-merge metadata.

5. **Offline mode** — Everything synced is available without internet. Premium users get priority sync and larger cache limits.

## Monetization strategy

**Free tier (hook):**
- Connect 1 cloud service
- Sync up to 500 photos/videos
- Manual sync only (no background automation)
- Basic chronological gallery

**Premium ($4.99/month or $39.99/year):**
- Unlimited cloud connections
- Unlimited media sync
- Background auto-sync every 6 hours
- AI duplicate detection and smart albums
- Priority sync queue (faster downloads)
- Export organized albums back to any cloud

**Lifetime ($79.99 one-time):**
- All premium features forever
- Early access to new cloud integrations

**Pricing reasoning:** Higher than typical photo apps ($2.99) because this solves a real pain (fragmentation) that professionals and power users will pay to fix. Annual discount encourages commitment. Lifetime option captures users who hate subscriptions.

**Retention drivers:**
- Once synced, switching away means re-downloading everything manually (high friction)
- Smart albums improve over time with more data
- New cloud services added regularly (Flickr, OneDrive, etc.)
- Background sync becomes invisible habit — users forget it's working until they need a photo and it's just there

## File structure

```
mediamesh/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Gallery view
│   │   ├── clouds.tsx             # Cloud connections manager
│   │   ├── settings.tsx           # Sync rules & preferences
│   │   └── _layout.tsx
│   ├── auth/
│   │   ├── dropbox.tsx            # Dropbox OAuth callback
│   │   ├── google.tsx             # Google Drive OAuth callback
│   │   └── icloud.tsx             # iCloud auth flow
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── MediaGrid.tsx              # Gallery grid component
│   ├── CloudBadge.tsx             # Source indicator
│   ├── SyncProgress.tsx           # Download progress UI
│   └── DuplicateCard.tsx          # Duplicate resolution UI
├── services/
│   ├── cloudSync.ts               # Core sync orchestration
│   ├── dropboxService.ts          # Dropbox API wrapper
│   ├── googleDriveService.ts      # Google Drive API wrapper
│   ├── icloudService.ts           # iCloud API wrapper
│   ├── mediaLibrary.ts            # Device camera roll integration
│   ├── duplicateDetector.ts       # Image hashing & comparison
│   └── backgroundSync.ts          # Background task registration
├── store/
│   ├── syncStore.ts               # Zustand store for sync state
│   └── mediaStore.ts              # Media metadata store
├── database/
│   ├── schema.ts                  # SQLite table definitions
│   └── queries.ts                 # Database operations
├── utils/
│   ├── imageHash.ts               # Perceptual hashing for duplicates
│   ├── fileHelpers.ts             # File system utilities
│   └── constants.ts               # API keys, limits, etc.
├── __tests__/
│   ├── cloudSync.test.ts
│   ├── duplicateDetector.test.ts
│   ├── imageHash.test.ts
│   └── database.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/cloudSync.test.ts
import { syncCloudService } from '../services/cloudSync';
import { getMediaFromDropbox } from '../services/dropboxService';

jest.mock('../services/dropboxService');

describe('Cloud Sync', () => {
  it('should fetch and store media from connected cloud', async () => {
    (getMediaFromDropbox as jest.Mock).mockResolvedValue([
      { id: '1', name: 'photo.jpg', path: '/photos/photo.jpg' }
    ]);
    
    const result = await syncCloudService('dropbox', 'mock-token');
    expect(result.synced).toBe(1);
    expect(result.errors).toBe(0);
  });
});

// __tests__/duplicateDetector.test.ts
import { findDuplicates } from '../services/duplicateDetector';
import { computeImageHash } from '../utils/imageHash';

describe('Duplicate Detection', () => {
  it('should identify identical images from different clouds', async () => {
    const hash1 = await computeImageHash('file:///path/photo1.jpg');
    const hash2 = await computeImageHash('file:///path/photo1_copy.jpg');
    
    const duplicates = findDuplicates([
      { id: '1', hash: hash1, source: 'dropbox' },
      { id: '2', hash: hash2, source: 'google' }
    ]);
    
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].matches).toHaveLength(2);
  });
});

// __tests__/imageHash.test.ts
import { computeImageHash, compareHashes } from '../utils/imageHash';

describe('Image Hashing', () => {
  it('should generate consistent hash for same image', async () => {
    const hash1 = await computeImageHash('file:///test.jpg');
    const hash2 = await computeImageHash('file:///test.jpg');
    expect(hash1).toBe(hash2);
  });

  it('should detect similar images with high similarity score', () => {
    const hash1 = 'abc123def456';
    const hash2 = 'abc123def457'; // 1 char different
    const similarity = compareHashes(hash1, hash2);
    expect(similarity).toBeGreaterThan(0.9);
  });
});

// __tests__/database.test.ts
import { initDatabase, insertMedia, getMediaBySource } from '../database/queries';

describe('Database Operations', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  it('should store and retrieve media metadata', async () => {
    await insertMedia({
      cloudId: 'dropbox-123',
      source: 'dropbox',
      localPath: 'file:///media/photo.jpg',
      hash: 'abc123',
      syncedAt: Date.now()
    });

    const media = await getMediaBySource('dropbox');
    expect(media).toHaveLength(1);
    expect(media[0].cloudId).toBe('dropbox-123');
  });
});
```

## Implementation steps

1. **Project setup**
   ```bash
   npx create-expo-app mediamesh --template blank-typescript
   cd mediamesh
   npx expo install expo-sqlite expo-file-system expo-media-library expo-task-manager expo-background-fetch expo-auth-session expo-notifications
   npm install zustand @react-native-async-storage/async-storage
   npm install -D jest @testing-library/react-native @types/jest
   ```

2. **Database schema** (`database/schema.ts`)
   - Create SQLite tables: `media` (id, cloudId, source, localPath, hash, metadata, syncedAt), `clouds` (id, service, token, lastSync), `sync_rules` (id, cloudId, filters)
   - Write init function to create tables on first launch

3. **Cloud service wrappers** (`services/`)
   - Implement OAuth flows for each service using expo-auth-session
   - Create API wrappers: `getMediaFromDropbox()`, `getMediaFromGoogleDrive()`, `getMediaFromiCloud()`
   - Each returns standardized array: `{ id, name, path, modifiedTime, thumbnailUrl }`

4. **Core sync engine** (`services/cloudSync.ts`)
   - `syncCloudService(service, token)` function:
     - Fetch media list from cloud API
     - Compare with local database to find new/updated files
     - Download files using expo-file-system
     - Compute image hash for each file
     - Insert metadata into SQLite
     - Save to device camera roll via expo-media-library
   - Handle errors gracefully (network failures, quota limits)

5. **Duplicate detection** (`services/duplicateDetector.ts`, `utils/imageHash.ts`)
   - Implement perceptual hashing (pHash or dHash algorithm)
   - `computeImageHash(localPath)` returns hash string
   - `findDuplicates(mediaArray)` groups by similar hashes (Hamming distance < 5)
   - Return array of duplicate groups with source info

6. **Background sync** (`services/backgroundSync.ts`)
   - Register background task with expo-task-manager
   - Task runs every 6 hours (or user-defined interval)
   - Calls `syncCloudService()` for each connected cloud
   - Sends notification on completion or errors

7. **UI - Cloud connections** (`app/(tabs)/clouds.tsx`)
   - List connected clouds with last sync time
   - "Add Cloud" button triggers OAuth flow
   - Disconnect button removes token and stops sync
   - Manual sync button for immediate refresh

8. **UI - Gallery** (`app/(tabs)/index.tsx`, `components/MediaGrid.tsx`)
   - FlatList with 3-column grid of thumbnails
   - Each item shows CloudBadge overlay (Dropbox/Google/iCloud icon)
   - Tap opens full-screen viewer
   - Pull-to-refresh triggers manual sync

9. **UI - Settings** (`app/(tabs)/settings.tsx`)
   - Sync frequency selector (manual, 6h, 12h, 24h)
   - Storage limit slider (free: 500 items, premium: unlimited)
   - Duplicate detection toggle
   - Premium upgrade button

10. **Duplicate resolution UI** (`components/DuplicateCard.tsx`)
    - Show side-by-side comparison of duplicate images
    - Display source badges and file sizes
    - "Keep this one" button deletes others
    - "Keep all" dismisses suggestion

11. **State management** (`store/`)
    - Zustand store for sync progress (current file, total, completed)
    - Media store for gallery data (loaded from SQLite on mount)
    - Cloud store for connection status

12. **Monetization gates**
    - Check subscription status before allowing >1 cloud connection
    - Limit sync to 500 items for free users
    - Disable background sync for free tier
    - Show paywall modal when limits hit

13. **Testing**
    - Write tests for each service module
    - Mock cloud API responses
    - Test database CRUD operations
    - Test duplicate detection with sample images

14. **Polish**
    - Add loading states and error messages
    - Implement retry logic for failed downloads
    - Add onboarding flow explaining cloud permissions
    - Create app icon and splash screen

## How to verify it works

**Setup:**
1. Run `npm install` to install dependencies
2. Run `npm test` — all tests must pass (cloud sync, duplicate detection, database operations)
3. Create test accounts for Dropbox and Google Drive with sample photos

**Expo Go testing:**
1. Run `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Grant camera roll and notification permissions when prompted

**Verification steps:**
1. **Cloud connection:** Tap "Add Cloud" → select Dropbox → complete OAuth → verify token stored and "Connected" badge appears
2. **Manual sync:** Tap sync button → watch progress bar → verify photos appear in gallery with Dropbox badge
3. **Duplicate detection:** Connect Google Drive with same photos → sync → verify duplicate card appears with side-by-side comparison
4. **Background sync:** Wait 6 hours (or trigger manually via dev menu) → verify notification appears and new photos synced
5. **Free tier limits:** Add 501st photo → verify paywall modal blocks sync
6. **Offline mode:** Enable airplane mode → verify gallery still loads and photos viewable

**Success criteria:**
- All `npm test` suites pass
- Photos from 2+ clouds appear in unified gallery
- Duplicates detected and resolvable
- Background sync runs without app open (test via notification)
- Free tier limits enforced correctly
- No crashes when network fails mid-sync