# FileVault

## One-line pitch
Share files instantly with military-grade encryption — no signup, no tracking, no limits on who you send to.

## Expanded vision

**Core audience:** Anyone who's ever hesitated before uploading a file to the cloud.

This isn't just for journalists and activists. It's for:
- **Parents** sharing medical records with doctors without creating yet another account
- **Freelancers** sending client deliverables without exposing their email to data brokers
- **Students** collaborating on projects without institutional surveillance
- **Small business owners** sharing contracts and invoices without subscription fees
- **Anyone** who's tired of "Sign up to download" walls

The real insight: privacy isn't a niche concern anymore. It's table stakes. But existing solutions make you choose between convenience and security. FileVault gives you both.

**Adjacent use cases:**
- Emergency document access (medical records, insurance, legal docs) without cloud dependency
- Temporary file drops for one-time collaborations
- Secure handoff between personal and work devices
- Cross-platform file transfer without platform lock-in (AirDrop only works Apple-to-Apple)

**Why non-technical people want this:**
- No password to remember or account to manage
- Works offline (plane, subway, rural areas)
- Recipient doesn't need the app to receive files
- Visual proof of encryption (lock icon, expiration timer)
- Feels like texting a file, not "uploading to the cloud"

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Encryption:** `expo-crypto` for hashing, `react-native-quick-crypto` for AES-256-GCM
- **Storage:** `expo-sqlite` for local file metadata and transfer history
- **File system:** `expo-file-system` for secure local storage
- **Networking:** `expo-network` for P2P discovery, WebRTC for direct transfers
- **Sharing:** `expo-sharing` and deep links for recipient access
- **Camera/Files:** `expo-image-picker` and `expo-document-picker`
- **Background:** `expo-task-manager` for transfer completion
- **Minimal deps:** Avoid heavy libraries; use Expo's built-in modules

## Core features

1. **Instant encrypted sharing** — Tap a file, generate a secure link, share via any app. Recipient gets a web view (no app required) or opens in FileVault for full features. Files auto-delete after 24 hours or first download.

2. **Camera-to-encrypted-file** — Snap a photo/document, it's instantly encrypted and ready to share. No cloud upload, no metadata leakage. Perfect for receipts, whiteboards, contracts.

3. **Offline P2P transfer** — When both devices are on the same network, files transfer directly via local WiFi (no internet needed). Faster than cloud, zero server costs.

4. **Encrypted vault** — All files stored locally with device-level encryption. Biometric unlock. Organized by recency and tags (auto-suggested via file type).

5. **Expiring links** — Set custom expiration (1 hour to 7 days) or download limits (1-10 downloads). Links self-destruct, leaving no trace.

## Monetization strategy

**Free tier (the hook):**
- Up to 10 file shares per month
- 100MB max file size
- 24-hour link expiration only
- 500MB local vault storage
- Basic encryption (AES-256)

**Premium ($4.99/month or $39.99/year — 33% savings):**
- Unlimited shares
- 5GB max file size
- Custom expiration (1 hour to 30 days)
- 50GB local vault storage
- Advanced features: password-protected links, download notifications, transfer analytics
- Priority P2P transfer (faster peer discovery)

**Why people stay subscribed:**
- Vault becomes their secure file system (switching cost)
- Monthly share limit hits fast for active users (freelancers, small teams)
- Peace of mind: "I can share anything, anytime"
- Cheaper than Dropbox/Google One but more secure

**Revenue reasoning:**
$4.99 is impulse-buy territory (less than a coffee). Target 10K users in year one, 5% conversion = 500 paid users = $30K ARR. Break-even at ~2K users (server costs for web viewer + app store fees).

## File structure

```
filevault/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Vault (file list)
│   │   ├── share.tsx          # Share new file
│   │   └── settings.tsx       # Settings & premium
│   ├── _layout.tsx
│   ├── receive/[linkId].tsx   # Receive shared file
│   └── +not-found.tsx
├── components/
│   ├── FileCard.tsx           # File preview card
│   ├── EncryptionBadge.tsx    # Visual encryption indicator
│   ├── ShareModal.tsx         # Share options modal
│   ├── ExpirationPicker.tsx   # Expiration time selector
│   └── PremiumGate.tsx        # Paywall UI
├── lib/
│   ├── crypto.ts              # Encryption/decryption logic
│   ├── database.ts            # SQLite setup and queries
│   ├── p2p.ts                 # WebRTC P2P transfer
│   ├── storage.ts             # File system operations
│   ├── sharing.ts             # Link generation and validation
│   └── subscription.ts        # Premium tier logic
├── hooks/
│   ├── useEncryption.ts
│   ├── useFileVault.ts
│   ├── useP2PTransfer.ts
│   └── usePremium.ts
├── constants/
│   ├── Config.ts              # App config (limits, pricing)
│   └── Colors.ts
├── __tests__/
│   ├── crypto.test.ts
│   ├── database.test.ts
│   ├── sharing.test.ts
│   ├── storage.test.ts
│   └── subscription.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

**`__tests__/crypto.test.ts`**
```typescript
import { encryptFile, decryptFile, generateKey } from '../lib/crypto';

describe('Encryption', () => {
  it('encrypts and decrypts file data', async () => {
    const key = await generateKey();
    const data = 'sensitive content';
    const encrypted = await encryptFile(data, key);
    const decrypted = await decryptFile(encrypted, key);
    expect(decrypted).toBe(data);
  });

  it('fails decryption with wrong key', async () => {
    const key1 = await generateKey();
    const key2 = await generateKey();
    const encrypted = await encryptFile('data', key1);
    await expect(decryptFile(encrypted, key2)).rejects.toThrow();
  });
});
```

**`__tests__/sharing.test.ts`**
```typescript
import { generateShareLink, validateShareLink, isLinkExpired } from '../lib/sharing';

describe('Sharing', () => {
  it('generates valid share link', () => {
    const link = generateShareLink('file123', 24);
    expect(link).toMatch(/^filevault:\/\/receive\//);
  });

  it('detects expired links', () => {
    const expiredTime = Date.now() - 1000;
    expect(isLinkExpired(expiredTime)).toBe(true);
  });

  it('validates link structure', () => {
    const valid = validateShareLink('filevault://receive/abc123?exp=123456');
    expect(valid).toBe(true);
  });
});
```

**`__tests__/storage.test.ts`**
```typescript
import { saveFile, getFile, deleteFile } from '../lib/storage';

describe('Storage', () => {
  it('saves and retrieves file', async () => {
    const fileId = await saveFile('test.txt', 'content');
    const retrieved = await getFile(fileId);
    expect(retrieved.name).toBe('test.txt');
  });

  it('deletes file completely', async () => {
    const fileId = await saveFile('temp.txt', 'data');
    await deleteFile(fileId);
    await expect(getFile(fileId)).rejects.toThrow();
  });
});
```

**`__tests__/subscription.test.ts`**
```typescript
import { canShare, getRemainingShares, isPremium } from '../lib/subscription';

describe('Subscription', () => {
  it('enforces free tier limits', () => {
    const user = { shareCount: 10, isPremium: false };
    expect(canShare(user)).toBe(false);
  });

  it('allows unlimited shares for premium', () => {
    const user = { shareCount: 100, isPremium: true };
    expect(canShare(user)).toBe(true);
  });

  it('calculates remaining shares', () => {
    const user = { shareCount: 7, isPremium: false };
    expect(getRemainingShares(user)).toBe(3);
  });
});
```

**`__tests__/database.test.ts`**
```typescript
import { initDatabase, addFile, getFiles, deleteExpiredFiles } from '../lib/database';

describe('Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('stores file metadata', async () => {
    await addFile({ id: '1', name: 'test.pdf', size: 1024 });
    const files = await getFiles();
    expect(files.length).toBeGreaterThan(0);
  });

  it('removes expired files', async () => {
    const expiredTime = Date.now() - 1000;
    await addFile({ id: '2', name: 'old.txt', expiresAt: expiredTime });
    await deleteExpiredFiles();
    const files = await getFiles();
    expect(files.find(f => f.id === '2')).toBeUndefined();
  });
});
```

## Implementation steps

1. **Project setup**
   - Run `npx create-expo-app@latest filevault --template tabs`
   - Install dependencies: `npx expo install expo-crypto expo-file-system expo-sqlite expo-image-picker expo-document-picker expo-sharing expo-task-manager react-native-quick-crypto`
   - Configure `app.json` with deep linking scheme: `"scheme": "filevault"`

2. **Database layer (`lib/database.ts`)**
   - Initialize SQLite with tables: `files` (id, name, size, encryptedPath, createdAt, expiresAt), `shares` (id, fileId, linkId, expiresAt, downloadCount, maxDownloads)
   - Implement CRUD operations: `addFile`, `getFiles`, `deleteFile`, `addShare`, `getShare`, `deleteExpiredFiles`
   - Add migration logic for schema updates

3. **Encryption module (`lib/crypto.ts`)**
   - Implement `generateKey()` using `expo-crypto.getRandomBytes(32)`
   - Create `encryptFile(data, key)` using AES-256-GCM from `react-native-quick-crypto`
   - Create `decryptFile(encryptedData, key)` with error handling
   - Store keys securely using `expo-secure-store`

4. **File storage (`lib/storage.ts`)**
   - Create `saveFile(name, data)` that encrypts and writes to `FileSystem.documentDirectory + 'vault/'`
   - Implement `getFile(id)` to read and decrypt
   - Add `deleteFile(id)` to remove from filesystem and database
   - Handle file size validation (100MB free, 5GB premium)

5. **Sharing logic (`lib/sharing.ts`)**
   - Implement `generateShareLink(fileId, expirationHours)` that creates deep link with encrypted file ID and expiration timestamp
   - Create `validateShareLink(link)` to parse and verify link structure
   - Add `isLinkExpired(timestamp)` and `incrementDownloadCount(shareId)`
   - Generate web fallback URL for non-app users

6. **P2P transfer (`lib/p2p.ts`)**
   - Set up WebRTC peer connection using `react-native-webrtc` (or fallback to HTTP for MVP)
   - Implement local network discovery using `expo-network.getNetworkStateAsync()`
   - Create `sendFileP2P(fileId, peerId)` and `receiveFileP2P(peerId)`
   - Add progress callbacks for transfer UI

7. **Subscription logic (`lib/subscription.ts`)**
   - Define tier limits in `constants/Config.ts`: `FREE_SHARE_LIMIT = 10`, `FREE_FILE_SIZE = 100MB`, etc.
   - Implement `canShare(user)`, `canUploadSize(size, user)`, `getRemainingShares(user)`
   - Add `isPremium(user)` check (mock for MVP, integrate RevenueCat later)
   - Create upgrade prompt logic

8. **Vault screen (`app/(tabs)/index.tsx`)**
   - Display file list from database using `useFileVault` hook
   - Show file cards with name, size, encryption badge, expiration countdown
   - Add pull-to-refresh and swipe-to-delete
   - Implement search and filter by file type
   - Show storage usage bar (free: 500MB, premium: 50GB)

9. **Share screen (`app/(tabs)/share.tsx`)**
   - Add buttons for camera, photo library, document picker
   - Show file preview after selection
   - Display `ExpirationPicker` component (1h, 6h, 24h, 7d, custom)
   - Generate share link on confirm, copy to clipboard
   - Show native share sheet with link
   - Enforce free tier limits with `PremiumGate` component

10. **Receive screen (`app/receive/[linkId].tsx`)**
    - Parse link ID from URL params
    - Validate link and check expiration
    - Show file preview (name, size, sender info if available)
    - Add "Download" button that decrypts and saves to device
    - Increment download count and check max downloads
    - Show "Link expired" or "Download limit reached" states

11. **Settings screen (`app/(tabs)/settings.tsx`)**
    - Display current tier (Free/Premium) and usage stats
    - Show "Upgrade to Premium" card with benefits list
    - Add biometric lock toggle (use `expo-local-authentication`)
    - Include auto-delete settings (keep files 7/30/90 days)
    - Add "Clear vault" and "Export data" options

12. **Premium gate (`components/PremiumGate.tsx`)**
    - Show when user hits free tier limit
    - Display benefit comparison table
    - Add "Upgrade Now" button (mock payment for MVP)
    - Include "Restore Purchase" option

13. **Background tasks**
    - Register task with `expo-task-manager` to delete expired files daily
    - Add notification when file is downloaded by recipient (premium only)

14. **Polish**
    - Add loading states and error boundaries
    - Implement haptic feedback on key actions
    - Add empty states with onboarding hints
    - Create app icon and splash screen
    - Test on iOS and Android devices

## How to verify it works

**Local development:**
1. Run `npm install` to install dependencies
2. Run `npm test` — all tests must pass
3. Run `npx expo start` and scan QR code with Expo Go app
4. Test flow:
   - Tap "Share" tab, select a photo from library
   - Set expiration to 1 hour, tap "Generate Link"
   - Copy link and paste into device browser or share to another device
   - Verify file downloads and decrypts correctly
   - Check that link expires after set time
   - Verify free tier limit (try sharing 11 files)
5. Test P2P: Connect two devices to same WiFi, initiate transfer, verify direct connection
6. Test vault: Add multiple files, verify encryption badge, test search and delete
7. Test biometric lock in settings (if device supports it)

**Production readiness:**
- All Jest tests pass (`npm test`)
- No console errors in Expo Go
- App works offline (vault access, P2P transfer)
- Links open correctly in browser and app
- File encryption/decryption is seamless (no visible lag for <10MB files)
- Premium gate appears at correct limits
- App handles low storage gracefully (shows warning before save fails)