```markdown
# ClosetVision Evolution: App Spec

## 1. App Name
**StyleSift** (or **SiftStyle** if StyleSift is taken)

## 2. One-line pitch
"Your AI stylist that learns your wardrobe and suggests outfits in seconds—no manual input needed."

## 3. Expanded vision
**Primary Audience:**
- Fashion-conscious young adults (18-35)
- Busy professionals (time-starved outfit planners)
- People with limited closet space (minimalists, students)
- Gender-neutral users (non-binary, agender, etc.)
- Aging users (who want to avoid "grandma fashion")

**Adjacent Use Cases:**
- **Virtual shopping assistants** (try on clothes from online stores)
- **Wardrobe decluttering** (AI flags duplicates/underused items)
- **Occasion planners** (weddings, interviews, dates)
- **Sustainability tool** (reduces fast fashion by optimizing existing wardrobe)
- **Accessibility** (voice-guided outfit suggestions for visually impaired users)

**Why Non-Technical Users Want This:**
- Saves time (no more "What should I wear?" moments)
- Reduces decision fatigue (AI handles the hard part)
- Encourages self-expression (personalized style advice)
- Lowers stress (no more wardrobe malfunctions)

## 4. Tech stack
- **Frontend:** React Native (Expo) for cross-platform
- **Backend:** Firebase (auth, storage, AI APIs)
- **Database:** SQLite (local wardrobe data) + Firestore (cloud sync)
- **AI/ML:** TensorFlow Lite (on-device outfit suggestions)
- **AR:** ARKit (iOS) + ARCore (Android)
- **Camera:** Expo Camera API

## 5. Core features (MVP)
1. **Smart Wardrobe Scanner** – Snap photos of clothes; AI auto-categorizes (color, fabric, occasion).
2. **AI Outfit Generator** – "Generate 3 outfits for work" or "Match this shirt with my jeans."
3. **AR Virtual Try-On** – Overlay clothes on your body (no mirror needed).
4. **Occasion-Based Suggestions** – "Date night," "Casual Friday," "Interview."
5. **Wardrobe Analytics** – "You wear these 3 items 90% of the time."

## 6. Monetization strategy
- **Free tier:** Basic outfit suggestions, AR try-on, wardrobe scanner.
- **Premium ($4.99/month):**
  - Unlimited outfit generations
  - Designer brand integrations (e.g., Zara, H&M)
  - Personal stylist chatbot (weekly style tips)
  - Wardrobe decluttering reports
- **Why users stay subscribed:**
  - **Habit loop:** Daily outfit suggestions create dependency.
  - **Social proof:** Share outfits to Instagram/TikTok (premium users get "Styled by [App]" badge).
  - **Exclusivity:** Designer collabs only for subscribers.

## 7. Skip if saturated
No major competitors combine **wardrobe AI + AR try-on + occasion-based suggestions** in one app. Gap exists.

## 8. File structure
```
style-sift/
├── app/
│   ├── components/ (UI widgets)
│   ├── screens/ (main flows)
│   ├── utils/ (AI logic, AR helpers)
├── assets/ (icons, mock wardrobe data)
├── tests/
│   ├── __mocks__/
│   ├── unit/ (Jest tests)
├── firebase.js (config)
├── package.json
```

## 9. Tests
```javascript
// tests/unit/outfitGenerator.test.js
import { generateOutfit } from '../../app/utils/outfitGenerator';

test('generates 3 outfits for "work" occasion', () => {
  const wardrobe = { shirts: ['blue'], pants: ['black'] };
  const outfits = generateOutfit(wardrobe, 'work');
  expect(outfits.length).toBe(3);
});
```

## 10. Implementation steps
1. **Setup:**
   ```bash
   expo init StyleSift
   cd StyleSift
   expo install expo-camera expo-gl expo-firebase
   ```
2. **Core flow:**
   - Build `WardrobeScanner` screen (camera + TensorFlow Lite model).
   - Add `OutfitGenerator` utility (rule-based or API-backed).
   - Integrate AR try-on (ARKit/ARCore).
3. **Firebase setup:**
   - Enable Auth, Firestore, and Storage.
   - Add `firebase.js` with config.

## 11. Verification
- Run `npm test` (all unit tests pass).
- Test on Expo Go:
  - Scan a shirt → verify AI categorization.
  - Generate 3 work outfits → check AR overlay.
```