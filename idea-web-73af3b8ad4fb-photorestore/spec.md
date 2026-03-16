```markdown
# PhotoRestore App Spec

## 1. App Name
**Memora** (short for "memory" + "restore")

## 2. One-line pitch
"Restore, enhance, and relive your memories with AI—turn old, damaged photos into stunning, shareable masterpieces."

## 3. Expanded vision
**Broadest audience:**
- **Family historians** (digitizing and preserving generations of photos)
- **Social media influencers** (quickly enhancing content for viral appeal)
- **Casual travelers** (preserving trip memories with imperfect smartphone photos)
- **Artists & hobbyists** (experimenting with AI-driven artistic styles)
- **Corporate users** (digitizing and enhancing archival company photos)

**Adjacent use cases:**
- **Legal evidence** (restoring damaged courtroom or accident photos)
- **Academic research** (enhancing historical documents)
- **E-commerce** (retouching product photos for online stores)
- **Therapy & mental health** (helping users process memories through restoration)

**Why non-technical users want this:**
- No need to learn complex software—AI handles the heavy lifting.
- Instantly transforms "ugly" photos into professional-quality images.
- Emotional value of preserving memories for loved ones.

## 4. Tech stack
- **Frontend:** React Native (Expo) for cross-platform iOS/Android
- **Local storage:** SQLite for caching processed photos
- **AI processing:** Cloud-based API (Firebase ML Kit or custom TensorFlow Lite)
- **Backend:** Firebase (Auth, Firestore for cloud storage, Functions for processing)
- **Dependencies:** Minimal (React Navigation, Redux for state, Expo ImagePicker)

## 5. Core features (MVP)
1. **AI Restoration Hub** – One-tap restoration for scratches, blurs, and colorization.
2. **Smart Enhancer** – Auto-adjusts brightness, contrast, and sharpness.
3. **Artistic Styles** – Apply vintage, modern, or custom AI-driven filters.
4. **Batch Processing** – Restore multiple photos at once (paid feature).
5. **Cloud Backup** – Secure storage for all restored photos (paid feature).

## 6. Monetization strategy
- **Free tier:**
  - Basic restoration (1 photo/day)
  - Limited filters
  - Watermarked exports
- **Paid tier ($4.99/month or $39.99/year):**
  - Unlimited high-res exports
  - Advanced AI models (e.g., deep-scratch removal)
  - Batch processing
  - Exclusive filters
  - Priority support
- **Hook vs. Paywall:**
  - Free tier shows "Upgrade for unlimited restorations" after 3 uses.
  - Paid users get **exclusive AI models** (e.g., "Pro Colorize" for deep B&W restoration).
- **Retention:**
  - Monthly AI model updates (e.g., "New: 2024 Historical Photo Restoration").
  - Family sharing (paid feature).

## 7. Skip if saturated
No clear gap—existing apps like Remini and Photomyne already dominate. **SKIP: Incumbent competition in AI photo restoration.**

## 8. File structure
```
memora/
├── assets/ (icons, splash screens)
├── components/ (reusable UI)
├── screens/ (main app flows)
├── services/ (API, AI processing)
├── store/ (Redux state)
├── tests/ (Jest test files)
├── App.js (entry point)
└── package.json
```

## 9. Tests
```javascript
// Example: RestorationService.test.js
import { restorePhoto } from '../services/RestorationService';

test('restorePhoto should return enhanced image', async () => {
  const mockImage = { uri: 'test.jpg' };
  const result = await restorePhoto(mockImage);
  expect(result).toHaveProperty('uri');
  expect(result.quality).toBeGreaterThan(0.8);
});
```

## 10. Implementation steps
1. **Setup Expo project:**
   ```bash
   npx create-expo-app memora
   cd memora
   ```
2. **Add core dependencies:**
   ```bash
   npm install @react-navigation/native react-redux @reduxjs/toolkit expo-image-picker
   ```
3. **Build MVP screens:**
   - `HomeScreen` (upload/restore)
   - `GalleryScreen` (saved photos)
   - `UpgradeScreen` (subscription CTA)
4. **Integrate AI API:**
   - Use Firebase ML Kit for basic restoration.
   - For advanced features, mock with placeholder images until backend is ready.
5. **Write tests:**
   ```bash
   npm test
   ```

## 11. Verification
- Run in Expo Go:
  ```bash
  npx expo start
  ```
- Run tests:
  ```bash
  npm test
  ```
- Test cases:
  - Upload a damaged photo → verify restoration.
  - Check free tier limits.
  - Verify paid features (batch processing) are locked behind subscription.
```