```markdown
# SoloVault → **BrainVault**

## 1. App Name
**BrainVault** – A sleek, all-in-one digital brain for capturing, organizing, and recalling everything you need.

## 2. One-line pitch
"Your personal digital assistant that remembers everything—notes, links, images, and voice memos—so you never lose your thoughts."

## 3. Expanded vision
**Broadest audience:**
- **Every knowledge worker** (researchers, writers, professionals)
- **Students** (study notes, project management)
- **Creatives** (inspiration archives, project timelines)
- **Parents** (child development logs, family memories)
- **Freelancers** (client contracts, project timelines)
- **Non-technical users** (private journals, personal archives)

**Adjacent use cases:**
- **Digital journaling** (private, encrypted entries)
- **Personal CRM** (contact notes, meeting summaries)
- **Recipe/meal planner** (image + text storage)
- **Travel organizer** (itineraries, receipts, photos)
- **Gift registry** (wishlists with notes)

**Why non-technical users?**
- No setup required—just start typing or sharing.
- Private by default (end-to-end encrypted).
- Acts as a "digital filing cabinet" for paper documents (via OCR).

## 4. Tech stack
- **Frontend:** React Native (Expo) for cross-platform (iOS/Android).
- **Local storage:** SQLite (encrypted) for offline-first sync.
- **Backend:** Firebase (auth, sync, minimal server logic).
- **AI:** On-device ML (TensorFlow Lite) for OCR/transcription (no cloud dependency).
- **Testing:** Jest + React Testing Library.

## 5. Core features (MVP)
1. **Instant Capture**
   - Share Sheet integration (save from any app).
   - Voice memo + text hybrid input (tap to type, hold to record).
   - Auto-categorize by content type (notes, links, images).

2. **Smart Channels**
   - Pre-built channels (Work, Personal, Ideas, etc.).
   - Customizable tags/filters for flexible organization.

3. **Private & Secure**
   - End-to-end encryption (Biometric + passcode).
   - No ads, no tracking.

4. **Quick Recall**
   - Voice search + contextual suggestions.
   - "Last 7 days" digest for forgotten ideas.

5. **Cross-Device Sync**
   - Real-time updates (Firebase).
   - Conflict resolution (last-write-wins for simplicity).

## 6. Monetization strategy
- **Free tier:**
  - 1GB storage, 3 channels, basic search.
  - Ads (non-intrusive, only in free tier).
- **Premium ($4.99/month or $49.99/year):**
  - Unlimited storage, unlimited channels.
  - Advanced AI search (semantic understanding).
  - OCR + voice transcription.
  - Priority support.
- **Hook vs. Paywall:**
  - Free tier feels "good enough" for casual users.
  - Paywall unlocks **time-saving features** (e.g., AI-powered organization).
- **Retention:**
  - Annual discount (30% off).
  - "BrainVault Pro" badge in app (social proof).
  - Usage analytics (e.g., "You’ve saved 100+ items—upgrade for full access").

## 7. Skip if saturated
**SKIP:** Notion and Evernote already dominate the "personal knowledge management" space. BrainVault’s gap is **simplicity + privacy** for non-technical users, but competitors offer more advanced features. Focus on a **vertical niche** (e.g., "BrainVault for Parents" or "BrainVault for Travelers") to differentiate.

## 8. File structure
```
brainvault/
├── app/
│   ├── components/ (reusable UI)
│   ├── screens/ (React Native screens)
│   ├── utils/ (core logic, tested)
│   └── styles/ (theming)
├── assets/ (icons, fonts)
├── tests/ (Jest unit tests)
└── firebase/ (Firestore rules, auth config)
```

## 9. Tests
```javascript
// Example: utils/channel.test.js
import { createChannel, getChannels } from './channel';

describe('Channel Management', () => {
  it('creates a new channel', () => {
    const channel = createChannel('Work');
    expect(channel.name).toBe('Work');
    expect(channel.id).toBeDefined();
  });

  it('retrieves all channels', () => {
    const channels = getChannels();
    expect(channels.length).toBeGreaterThan(0);
  });
});
```

## 10. Implementation steps
1. **Setup:**
   ```bash
   expo init brainvault
   cd brainvault
   npm install @react-navigation/native react-native-sqlite-storage firebase
   ```

2. **Core flow:**
   - Build `CaptureScreen` (share sheet + voice input).
   - Implement `ChannelScreen` (smart organization).
   - Add `SearchScreen` (voice + contextual).

3. **Sync:**
   - Configure Firebase Auth + Firestore.
   - Add offline-first logic (SQLite + Firestore merge).

4. **Testing:**
   ```bash
   npm test
   ```

5. **Release:**
   - Test on Expo Go → iOS/Android simulators.
   - Submit to App Store/Play Store.

## 11. Verification
- **Run locally:**
  ```bash
  expo start
  ```
- **Test core logic:**
  ```bash
  npm test
  ```
- **Verify sync:**
  - Create item on Device A → check Device B.
  - Test offline mode (disable network → save item → re-enable network → sync).
```