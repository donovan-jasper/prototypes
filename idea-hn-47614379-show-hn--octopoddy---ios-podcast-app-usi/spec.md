```markdown
# Octopoddy Evolution: App Spec

## 1. App Name
**PodSkipper** (or **PodScribe** if transcripts are a major selling point)

## 2. One-line pitch
"Your AI-powered podcast assistant that skips ads, summarizes episodes, and learns your listening habits—all on your phone."

## 3. Expanded vision
**Primary Audience:**
- **Podcast listeners** (ages 18-45) who hate ads, want faster navigation, and prefer privacy.
- **Commuters/office workers** who listen to long-form content (e.g., true crime, history, business).
- **Niche show fans** (e.g., indie podcasts with frequent sponsorships).

**Adjacent Use Cases:**
- **Audiobook lovers** who want ad-free chapters and chapter navigation.
- **Language learners** who can toggle transcripts for comprehension.
- **Workplace productivity apps** (e.g., integrate with Slack/Teams for podcast summaries).
- **Parents/teachers** who want ad-free content for kids/young learners.

**Why Non-Technical Users Want This:**
- No cloud dependency = faster, private listening.
- AI-generated summaries save time (e.g., "Skip to the key points").
- "Smart playback" (e.g., auto-speed for ads, rewind for missed details).

## 4. Tech stack
- **React Native (Expo)** for cross-platform iOS/Android.
- **SQLite** for local storage (transcripts, playback history).
- **On-device LLM** (e.g., TinyLlama or Whisper.cpp) for ad detection/summarization.
- **Expo Audio** for playback controls.
- **Minimal deps**: Only add libraries for core features (e.g., `react-native-sqlite-storage`).

## 5. Core features (MVP)
1. **AI Ad Skipping**: On-device LLM detects and skips ads in real time.
2. **Chapter Navigation**: AI-generated chapters (or user-created) for fast seeking.
3. **Smart Playback**: Auto-speed for ads, rewind for missed details.
4. **Transcripts**: Toggleable for comprehension or review.
5. **Offline Mode**: Download episodes with ad-free versions.

## 6. Monetization strategy
- **Free tier**: Ad skipping, basic chapter navigation, transcripts.
- **Premium ($4.99/month)**:
  - AI-generated summaries (e.g., "TL;DR" for episodes).
  - Offline ad detection (no cloud dependency).
  - Priority support.
  - Custom playback speeds per show.
- **Why stay subscribed**:
  - **Time savings**: Summaries replace listening.
  - **Privacy**: No cloud processing.
  - **Convenience**: Offline ad detection works everywhere.

## 7. Skip if saturated
**NO SKIP**: Podcast apps are fragmented, and no competitor offers on-device AI ad skipping + transcripts.

## 8. File structure
```
podskipper/
├── app/
│   ├── components/ (reusable UI)
│   ├── hooks/ (custom logic)
│   ├── screens/ (main views)
│   ├── utils/ (helpers)
│   └── models/ (SQLite schema)
├── assets/ (icons, fonts)
├── tests/
│   ├── unit/ (Jest tests)
│   └── e2e/ (Detox tests)
└── package.json
```

## 9. Tests
```javascript
// tests/unit/adDetection.test.js
import { detectAd } from '../../app/utils/adDetection';

test('detects ad segments in audio', () => {
  const mockAudio = { duration: 300, segments: [{ start: 10, end: 30, isAd: true }] };
  expect(detectAd(mockAudio)).toEqual([{ start: 10, end: 30 }]);
});
```

## 10. Implementation steps
1. **Setup**: `expo init PodSkipper` + add `react-native-sqlite-storage`.
2. **Core Logic**:
   - Implement `adDetection.js` (on-device LLM inference).
   - Build `ChapterGenerator` (extracts chapters from transcripts).
3. **UI**:
   - `PodcastPlayerScreen` with ad-skip button.
   - `TranscriptModal` for toggleable text.
4. **Storage**:
   - SQLite table for downloaded episodes + ad metadata.
5. **Monetization**:
   - Add `PremiumModal` with subscription flow (RevenueCat).

## 11. Verification
- Run `npm test` (Jest) for unit tests.
- Test on-device with `expo start --ios`:
  - Play a podcast with ads → verify skipping.
  - Toggle transcripts → check text alignment.
```