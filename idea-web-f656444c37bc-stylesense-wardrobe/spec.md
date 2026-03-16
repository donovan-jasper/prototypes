# StyleSync

## One-line pitch
Your closet, organized. Your style, elevated. Get dressed in seconds with AI that knows your wardrobe better than you do.

## Expanded vision

**Core audience:** Anyone who opens their closet and thinks "I have nothing to wear" despite owning 100+ items. This is the universal wardrobe paradox.

**Broadest reach:**
- **Busy professionals** (25-45) who need to look polished but hate spending mental energy on outfits
- **Parents** juggling multiple responsibilities who want to look put-together without the effort
- **Sustainable fashion advocates** trying to maximize existing clothes and reduce consumption
- **Travelers** who need efficient packing and outfit planning for trips
- **Fashion enthusiasts** who want to track what they own and discover new combinations
- **People downsizing** (moving, decluttering) who need to audit their wardrobe
- **Online shoppers** who want to see if new items work with what they already own before buying

**Adjacent use cases:**
- **Capsule wardrobe planning** for minimalists
- **Seasonal wardrobe rotation** tracking (store winter clothes, know what you have)
- **Cost-per-wear analytics** to justify purchases or identify underused items
- **Outfit journaling** for special events, dates, interviews
- **Collaborative styling** (share your closet with a friend/partner for gift ideas)
- **Packing lists** that auto-generate from your actual wardrobe

**Why non-technical people want this:**
It solves decision fatigue. Every morning, you get a curated selection of outfits from YOUR clothes, matched to YOUR day (weather, calendar, mood). It's like having a personal stylist who lives in your phone and knows your entire closet. The camera does the hard work—just snap photos, and the AI handles categorization, background removal, and styling logic.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **Image handling:** expo-image-picker, expo-image-manipulator
- **Background removal:** @imgly/background-removal-js (client-side, privacy-first)
- **AI/ML:** Expo's built-in ML capabilities + TensorFlow.js Lite for on-device inference
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Navigation:** Expo Router (file-based)
- **UI:** React Native Paper (Material Design, accessible)
- **Weather:** OpenWeatherMap API (free tier)
- **Calendar:** expo-calendar
- **Payments:** RevenueCat (cross-platform subscriptions)

## Core features (MVP)

1. **Smart Wardrobe Digitization**
   - Snap a photo of any clothing item
   - AI auto-removes background, categorizes item (top/bottom/dress/outerwear/shoes/accessory)
   - Extracts color palette, detects patterns, suggests tags (casual/formal/work/athletic)
   - Manual editing for corrections

2. **Daily Outfit Suggestions**
   - AI generates 3-5 outfit combinations every morning based on:
     - Weather forecast (temperature, precipitation)
     - Calendar events (work meeting vs weekend brunch)
     - Recently worn items (avoids repeats)
     - User preferences (favorite colors, style comfort zones)
   - Swipe to accept/reject, builds learning model over time

3. **Outfit Planner & Calendar**
   - Create and save custom outfits for future events
   - Visual calendar showing what you wore when (avoid outfit repeats at recurring events)
   - "What did I wear to X last time?" search

4. **Wardrobe Analytics**
   - See which items you wear most/least
   - Cost-per-wear calculation (enter purchase price, track wears)
   - Identify gaps ("You have 10 tops but only 3 bottoms")

5. **Packing Assistant**
   - Input trip dates, destination, activities
   - AI suggests outfits from your wardrobe
   - Generates packing checklist with photos

## Monetization strategy

**Free tier (the hook):**
- Digitize up to 30 items
- 3 AI outfit suggestions per day
- Basic wardrobe analytics
- Manual outfit creation (unlimited)

**Paid tier - StyleSync Pro ($6.99/month or $49.99/year):**
- Unlimited wardrobe items
- Unlimited AI suggestions
- Advanced AI (weather + calendar integration, body type/color analysis)
- Packing assistant
- Cost-per-wear tracking
- Outfit history & search
- Virtual try-on (phase 2)
- Shopping recommendations (phase 2)
- Priority support

**Price reasoning:**
- $6.99/month positions between basic utility apps ($4.99) and premium lifestyle apps ($9.99)
- Annual discount (40% off) incentivizes commitment
- Comparable to one coffee per month, but saves hours of decision-making weekly

**Retention drivers:**
- **Sunk cost:** Users invest time digitizing their wardrobe (high switching cost)
- **Daily habit:** Morning outfit suggestions become part of routine
- **Data value:** Outfit history and analytics become more valuable over time
- **Seasonal relevance:** Packing assistant drives re-engagement during travel seasons
- **Social proof:** "You've saved 47 hours of decision-making this year" stats

**Not saturated:** While competitors exist (Cladwell, Stylebook), none have achieved mainstream adoption. The market is fragmented, and most apps have poor UX or require excessive manual input. There's room for a polished, AI-first solution that "just works."

## File structure

```
stylesync/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Daily Suggestions
│   │   ├── wardrobe.tsx           # Wardrobe Grid
│   │   ├── outfits.tsx            # Saved Outfits
│   │   ├── analytics.tsx          # Wardrobe Stats
│   │   └── profile.tsx            # Settings/Subscription
│   ├── item/
│   │   ├── [id].tsx               # Item Detail/Edit
│   │   └── add.tsx                # Add New Item
│   ├── outfit/
│   │   ├── [id].tsx               # Outfit Detail
│   │   └── create.tsx             # Create Outfit
│   ├── packing/
│   │   └── [tripId].tsx           # Packing List
│   └── _layout.tsx
├── components/
│   ├── ItemCard.tsx
│   ├── OutfitCard.tsx
│   ├── SuggestionCard.tsx
│   ├── CategoryFilter.tsx
│   ├── ColorPalette.tsx
│   └── PaywallModal.tsx
├── lib/
│   ├── database.ts                # SQLite setup & queries
│   ├── ai/
│   │   ├── backgroundRemoval.ts
│   │   ├── itemClassifier.ts
│   │   ├── colorExtractor.ts
│   │   └── outfitGenerator.ts
│   ├── weather.ts
│   ├── calendar.ts
│   └── analytics.ts
├── store/
│   ├── wardrobeStore.ts           # Zustand store
│   └── userStore.ts
├── types/
│   └── index.ts
├── constants/
│   └── config.ts
├── __tests__/
│   ├── database.test.ts
│   ├── outfitGenerator.test.ts
│   ├── colorExtractor.test.ts
│   └── analytics.test.ts
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/database.test.ts
import { addItem, getItems, deleteItem } from '../lib/database';

describe('Database operations', () => {
  test('adds and retrieves wardrobe item', async () => {
    const item = await addItem({
      imageUri: 'test.jpg',
      category: 'top',
      colors: ['#FF0000'],
      tags: ['casual']
    });
    expect(item.id).toBeDefined();
    const items = await getItems();
    expect(items.length).toBeGreaterThan(0);
  });
});

// __tests__/outfitGenerator.test.ts
import { generateOutfits } from '../lib/ai/outfitGenerator';

describe('Outfit generator', () => {
  test('generates valid outfit combinations', () => {
    const items = [
      { id: 1, category: 'top', colors: ['#000000'] },
      { id: 2, category: 'bottom', colors: ['#0000FF'] }
    ];
    const outfits = generateOutfits(items, { weather: 'sunny', temp: 72 });
    expect(outfits.length).toBeGreaterThan(0);
    expect(outfits[0].items).toContain(1);
    expect(outfits[0].items).toContain(2);
  });
});

// __tests__/colorExtractor.test.ts
import { extractDominantColors } from '../lib/ai/colorExtractor';

describe('Color extraction', () => {
  test('extracts color palette from image', async () => {
    const colors = await extractDominantColors('mock-image-uri');
    expect(colors).toHaveLength(3);
    expect(colors[0]).toMatch(/^#[0-9A-F]{6}$/i);
  });
});

// __tests__/analytics.test.ts
import { calculateCostPerWear, findLeastWornItems } from '../lib/analytics';

describe('Wardrobe analytics', () => {
  test('calculates cost per wear correctly', () => {
    const item = { purchasePrice: 100, wearCount: 10 };
    expect(calculateCostPerWear(item)).toBe(10);
  });

  test('identifies least worn items', () => {
    const items = [
      { id: 1, wearCount: 5 },
      { id: 2, wearCount: 1 },
      { id: 3, wearCount: 10 }
    ];
    const leastWorn = findLeastWornItems(items, 2);
    expect(leastWorn[0].id).toBe(2);
  });
});
```

## Implementation steps

### Phase 1: Project setup & database

1. **Initialize Expo project**
   ```bash
   npx create-expo-app@latest stylesync --template tabs
   cd stylesync
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-sqlite expo-image-picker expo-image-manipulator expo-file-system
   npx expo install expo-calendar expo-location
   npm install zustand react-native-paper @react-navigation/native
   npm install --save-dev @types/react @types/react-native jest @testing-library/react-native
   ```

3. **Create database schema** (`lib/database.ts`)
   - Tables: `items`, `outfits`, `outfit_items`, `wear_log`, `user_preferences`
   - Items: id, imageUri, category, colors (JSON), tags (JSON), purchasePrice, addedDate
   - Outfits: id, name, items (JSON array of item IDs), createdDate, occasion
   - WearLog: id, itemId/outfitId, wornDate, weather, event
   - Implement CRUD functions with TypeScript types

4. **Setup Zustand stores** (`store/wardrobeStore.ts`, `store/userStore.ts`)
   - wardrobeStore: items, outfits, addItem, deleteItem, updateItem
   - userStore: isPro, preferences (style, favoriteColors), onboarding status

### Phase 2: Image capture & processing

5. **Build item addition flow** (`app/item/add.tsx`)
   - Camera/gallery picker with expo-image-picker
   - Image preview with crop/rotate using expo-image-manipulator
   - Save to local file system with expo-file-system

6. **Implement background removal** (`lib/ai/backgroundRemoval.ts`)
   - Use @imgly/background-removal-js for client-side processing
   - Fallback to simple edge detection if library fails
   - Save processed image with transparent background

7. **Build item classifier** (`lib/ai/itemClassifier.ts`)
   - Simple rule-based classifier using image dimensions (tall = dress, wide = top)
   - Color extraction using canvas API to sample pixels
   - Return category, dominant colors (3-5), suggested tags

8. **Create item detail screen** (`app/item/[id].tsx`)
   - Display full-size image
   - Edit category, tags, purchase price
   - Delete item with confirmation
   - Track wear count

### Phase 3: Wardrobe management

9. **Build wardrobe grid** (`app/(tabs)/wardrobe.tsx`)
   - Display all items in grid with ItemCard component
   - Filter by category (tabs: All, Tops, Bottoms, Dresses, etc.)
   - Search by color or tag
   - Pull-to-refresh

10. **Create ItemCard component** (`components/ItemCard.tsx`)
    - Thumbnail image with category badge
    - Color dots showing palette
    - Tap to open detail screen

11. **Implement category filter** (`components/CategoryFilter.tsx`)
    - Horizontal scrollable tabs
    - Active state styling
    - Count badges per category

### Phase 4: AI outfit generation

12. **Build outfit generator** (`lib/ai/outfitGenerator.ts`)
    - Algorithm:
      - Filter items by weather appropriateness (temp ranges)
      - Ensure outfit has required pieces (top + bottom OR dress)
      - Color harmony rules (complementary, analogous, monochrome)
      - Avoid recently worn items (check wear_log for last 7 days)
      - Score outfits by style coherence (casual items together, formal together)
    - Return top 5 scored outfits

13. **Integrate weather API** (`lib/weather.ts`)
    - Fetch current weather from OpenWeatherMap
    - Cache for 1 hour to reduce API calls
    - Map temp ranges to clothing categories (cold: outerwear, hot: shorts)

14. **Integrate calendar** (`lib/calendar.ts`)
    - Request calendar permissions
    - Fetch today's events
    - Detect event types (work keywords: "meeting", "office"; casual: "brunch", "coffee")

15. **Build daily suggestions screen** (`app/(tabs)/index.tsx`)
    - Display 3-5 outfit suggestions as SuggestionCard components
    - Show weather context ("72°F, Sunny")
    - Show calendar context ("Work meeting at 10am")
    - Swipe to accept (logs outfit to wear_log) or reject
    - "Refresh" button to generate new suggestions

### Phase 5: Outfit planning

16. **Create outfit builder** (`app/outfit/create.tsx`)
    - Multi-select mode for wardrobe grid
    - Drag items into outfit preview area
    - Name outfit, set occasion/date
    - Save to outfits table

17. **Build outfit detail screen** (`app/outfit/[id].tsx`)
    - Display all items in outfit
    - Edit name/occasion
    - "Wear today" button (logs to wear_log)
    - Delete outfit

18. **Create outfit calendar** (`app/(tabs)/outfits.tsx`)
    - List view of saved outfits
    - Filter by occasion
    - Calendar view showing what was worn when (use wear_log)

### Phase 6: Analytics

19. **Build analytics screen** (`app/(tabs)/analytics.tsx`)
    - Most/least worn items (bar chart or list)
    - Cost-per-wear leaderboard
    - Wardrobe composition (pie chart: 40% tops, 30% bottoms, etc.)
    - Wear frequency heatmap (calendar view)

20. **Implement analytics functions** (`lib/analytics.ts`)
    - calculateCostPerWear(item)
    - findLeastWornItems(items, limit)
    - getWardrobeComposition(items)
    - getWearFrequency(wearLog, dateRange)

### Phase 7: Packing assistant

21. **Build packing flow** (`app/packing/[tripId].tsx`)
    - Input: destination, dates, activities (beach, hiking, formal dinner)
    - Generate outfit suggestions for each day
    - Checklist view with item photos
    - Mark items as packed

22. **Create trip planner** (add to profile tab)
    - List of upcoming trips
    - Create new trip button
    - Link to packing list

### Phase 8: Monetization

23. **Implement paywall** (`components/PaywallModal.tsx`)
    - Trigger when user hits free tier limits (30 items, 3 suggestions/day)
    - Show feature comparison table
    - RevenueCat integration for subscriptions
    - Restore purchases button

24. **Setup RevenueCat**
    - Create products in App Store Connect / Google Play Console
    - Configure RevenueCat dashboard
    - Implement purchase flow in userStore
    - Check entitlements before premium features

25. **Add subscription management** (`app/(tabs)/profile.tsx`)
    - Show current plan (Free/Pro)
    - Manage subscription button (links to platform settings)
    - Usage stats (items digitized, suggestions used)

### Phase 9: Polish & testing

26. **Add onboarding flow**
    - Welcome screen explaining app
    - Camera permissions request with context
    - "Add your first item" tutorial
    - Set style preferences (casual/formal, favorite colors)

27. **Implement error handling**
    - Network errors (weather API)
    - Permission denials (camera, calendar)
    - Database errors
    - User-friendly error messages

28. **Write tests** (see Tests section above)
    - Database CRUD operations
    - Outfit generation logic
    - Color extraction
    - Analytics calculations
    - Run `npm test` to verify

29. **Optimize performance**
    - Lazy load images in wardrobe grid
    - Paginate wardrobe if >100 items
    - Debounce search input
    - Cache AI results for 24 hours

30. **Accessibility audit**
    - Add labels to all interactive elements
    - Ensure color contrast meets WCAG AA
    - Test with screen reader (TalkBack/VoiceOver)
    - Keyboard navigation support

## How to verify it works

### Local development
```bash
npm install
npx expo start
```

### Testing on device
1. Install Expo Go app on iOS/Android device
2. Scan QR code from terminal
3. Test core flows:
   - Add item: Take photo → auto-categorize → save
   - View wardrobe: See grid of items, filter by category
   - Get suggestions: See 3 outfits on home screen
   - Create outfit: Select items → save → view in outfits tab
   - Check analytics: See most worn items, cost-per-wear

### Automated tests
```bash
npm test
```
All tests in `__tests__/` must pass.

### Subscription testing
1. Use RevenueCat sandbox mode
2. Test purchase flow (doesn't charge real money)
3. Verify premium features unlock
4. Test restore purchases

### Production checklist
- [ ] All tests pass
- [ ] No console errors in Expo Go
- [ ] Camera permissions work on both platforms
- [ ] Images save and load correctly
- [ ] Outfit generation produces valid combinations
- [ ] Weather API returns data
- [ ] Paywall triggers at correct limits
- [ ] Subscription purchase completes
- [ ] App doesn't crash on low-end devices
- [ ] Works offline (except weather/subscriptions)