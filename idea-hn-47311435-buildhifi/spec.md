# SoundMap

## One-line pitch
Design your dream audio system in minutes—see what works together, avoid costly mistakes, and get pro-level sound without the guesswork.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- First-time home buyers setting up their living spaces (25-40)
- Apartment dwellers upgrading from soundbars to real systems
- Parents creating family entertainment spaces
- Remote workers building home offices with quality audio
- Gift buyers helping audiophile friends/family

**Beyond the original niche:**
The app isn't just for audiophiles—it's for anyone who's ever stood in Best Buy overwhelmed by choices, or bought equipment that didn't work together, or wondered if their $2000 setup sounds as good as it should.

**Adjacent use cases:**
- **Budget planning**: "I have $1500, show me the best system I can build"
- **Upgrade paths**: "I have X and Y, what should I add next?"
- **Troubleshooting**: "Why doesn't my system sound right?"
- **Room acoustics**: Basic guidance on speaker placement for any room
- **Resale value**: Track what your gear is worth over time
- **Social proof**: Share your setup, get feedback from the community
- **Shopping assistant**: Scan barcodes while browsing stores, check compatibility instantly

**Why non-technical people want this:**
- Eliminates the fear of buying incompatible equipment
- Saves money by preventing mistakes
- Makes them feel confident in their choices
- Turns a stressful purchase into an exciting project
- Provides validation that their setup is "good enough"

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Language**: TypeScript
- **Local storage**: expo-sqlite for product database and user configurations
- **State management**: Zustand (lightweight, simple)
- **Navigation**: Expo Router (file-based)
- **Camera**: expo-camera + expo-barcode-scanner
- **UI**: React Native Paper (Material Design)
- **Forms**: React Hook Form
- **Testing**: Jest + React Native Testing Library
- **API**: Expo SQLite for local-first, optional cloud sync later

## Core features (MVP)

1. **Smart System Builder**
   - Drag-and-drop interface to add components (receiver, speakers, subwoofer, sources)
   - Real-time compatibility checking (impedance, power, connections)
   - Visual signal chain showing how everything connects
   - Instant warnings for mismatches

2. **Barcode Scanner Product Library**
   - Scan any audio product barcode to add to your system
   - Pre-loaded database of 5000+ popular products (receivers, speakers, cables)
   - Offline-first: all data stored locally
   - Specs displayed: power, impedance, connections, dimensions

3. **Budget Optimizer**
   - Set your total budget
   - App suggests complete systems at different price points
   - "Upgrade path" feature: shows what to buy next for best improvement
   - Price tracking for products (manual entry in MVP)

4. **Room Setup Guide**
   - Simple questionnaire about room size and shape
   - Speaker placement recommendations with visual diagrams
   - Basic acoustic tips (avoid corners, distance from walls)
   - Photo upload to visualize placement (camera roll only)

5. **Configuration Export**
   - Generate shopping list with all components
   - Share your setup as an image (social proof)
   - Export wiring diagram for installation day

## Monetization strategy

**Free tier (the hook):**
- Build one system configuration
- Scan up to 10 products
- Basic compatibility checking
- Access to 1000 most popular products
- Room setup guide for standard rectangular rooms

**Premium ($14.99 one-time unlock):**
- Unlimited system configurations
- Full product database (5000+ items)
- Advanced compatibility analysis (power calculations, frequency response matching)
- Budget optimizer with upgrade paths
- Custom room shapes and acoustic analysis
- Priority access to new product additions
- Export high-res wiring diagrams
- Community features (share setups, get feedback)

**Why this price point:**
- Higher than $9.99 because this prevents expensive mistakes (easily $100+ saved)
- One-time payment, not subscription—respects that this is a project app, not daily use
- Comparable to a single audio cable, trivial vs. system cost
- Premium users are serious buyers who will evangelize

**Retention strategy:**
- Users return when upgrading components (years later)
- Community aspect: people share their setups, browse others
- Seasonal reminders: "Black Friday deals—time to upgrade?"
- Push notifications for price drops on saved products (future)

## File structure

```
soundmap/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # System builder
│   │   ├── library.tsx            # Product library
│   │   ├── room.tsx               # Room setup
│   │   └── profile.tsx            # Settings/premium
│   ├── scanner.tsx                # Barcode scanner modal
│   ├── product/[id].tsx           # Product detail
│   ├── system/[id].tsx            # System detail/edit
│   └── _layout.tsx
├── components/
│   ├── SystemBuilder/
│   │   ├── ComponentCard.tsx
│   │   ├── SignalChain.tsx
│   │   └── CompatibilityAlert.tsx
│   ├── ProductCard.tsx
│   ├── BudgetSlider.tsx
│   └── RoomVisualizer.tsx
├── lib/
│   ├── database/
│   │   ├── schema.ts
│   │   ├── seed.ts                # Initial product data
│   │   └── queries.ts
│   ├── compatibility/
│   │   ├── checker.ts             # Core compatibility logic
│   │   ├── rules.ts               # Compatibility rules
│   │   └── calculator.ts          # Power/impedance calculations
│   ├── store/
│   │   ├── systemStore.ts         # Zustand store for systems
│   │   └── premiumStore.ts        # Premium status
│   └── utils/
│       ├── barcode.ts
│       └── export.ts
├── assets/
│   ├── products/                  # Product images
│   └── diagrams/                  # Room layout templates
├── __tests__/
│   ├── compatibility.test.ts
│   ├── calculator.test.ts
│   ├── systemStore.test.ts
│   └── queries.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/compatibility.test.ts
import { checkCompatibility, CompatibilityIssue } from '../lib/compatibility/checker';

describe('Compatibility Checker', () => {
  test('detects impedance mismatch', () => {
    const receiver = { minImpedance: 8, maxPower: 100 };
    const speaker = { impedance: 4, powerHandling: 150 };
    const issues = checkCompatibility(receiver, speaker);
    expect(issues).toContainEqual(
      expect.objectContaining({ type: 'impedance', severity: 'warning' })
    );
  });

  test('detects power overload', () => {
    const receiver = { maxPower: 50 };
    const speaker = { powerHandling: 30 };
    const issues = checkCompatibility(receiver, speaker);
    expect(issues).toContainEqual(
      expect.objectContaining({ type: 'power', severity: 'error' })
    );
  });

  test('passes compatible components', () => {
    const receiver = { minImpedance: 4, maxPower: 100 };
    const speaker = { impedance: 8, powerHandling: 120 };
    const issues = checkCompatibility(receiver, speaker);
    expect(issues).toHaveLength(0);
  });
});

// __tests__/calculator.test.ts
import { calculateTotalPower, calculateImpedanceLoad } from '../lib/compatibility/calculator';

describe('Power Calculator', () => {
  test('calculates total power for parallel speakers', () => {
    const speakers = [
      { impedance: 8, count: 2 },
      { impedance: 8, count: 2 }
    ];
    const totalImpedance = calculateImpedanceLoad(speakers);
    expect(totalImpedance).toBe(4);
  });

  test('calculates power requirement', () => {
    const speakers = [{ powerHandling: 100, count: 2 }];
    const totalPower = calculateTotalPower(speakers);
    expect(totalPower).toBe(200);
  });
});

// __tests__/systemStore.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useSystemStore } from '../lib/store/systemStore';

describe('System Store', () => {
  test('adds component to system', () => {
    const { result } = renderHook(() => useSystemStore());
    
    act(() => {
      result.current.addComponent({
        id: '1',
        type: 'receiver',
        name: 'Test Receiver'
      });
    });

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].name).toBe('Test Receiver');
  });

  test('removes component from system', () => {
    const { result } = renderHook(() => useSystemStore());
    
    act(() => {
      result.current.addComponent({ id: '1', type: 'receiver', name: 'Test' });
      result.current.removeComponent('1');
    });

    expect(result.current.components).toHaveLength(0);
  });

  test('enforces free tier limits', () => {
    const { result } = renderHook(() => useSystemStore());
    
    act(() => {
      result.current.setPremium(false);
      result.current.createSystem('System 1');
      result.current.createSystem('System 2');
    });

    expect(result.current.systems).toHaveLength(1);
  });
});

// __tests__/queries.test.ts
import { searchProducts, getProductById } from '../lib/database/queries';

describe('Database Queries', () => {
  test('searches products by name', async () => {
    const results = await searchProducts('yamaha');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('yamaha');
  });

  test('filters by category', async () => {
    const results = await searchProducts('', 'receiver');
    expect(results.every(p => p.category === 'receiver')).toBe(true);
  });

  test('retrieves product by ID', async () => {
    const product = await getProductById('1');
    expect(product).toBeDefined();
    expect(product?.id).toBe('1');
  });
});
```

## Implementation steps

### Phase 1: Project setup and database

1. **Initialize Expo project**
   ```bash
   npx create-expo-app soundmap --template tabs
   cd soundmap
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-sqlite expo-camera expo-barcode-scanner expo-image-picker
   npm install zustand react-native-paper react-hook-form
   npm install -D @testing-library/react-native @testing-library/jest-native jest-expo
   ```

3. **Configure TypeScript**
   - Update `tsconfig.json` with strict mode
   - Add path aliases for `@/components`, `@/lib`

4. **Create database schema** (`lib/database/schema.ts`)
   - Products table: id, name, category, brand, impedance, power, connections, price, imageUrl
   - Systems table: id, name, createdAt, updatedAt
   - SystemComponents table: systemId, productId, quantity, position
   - UserSettings table: isPremium, scanCount, systemCount

5. **Seed initial product data** (`lib/database/seed.ts`)
   - Add 50 popular products across categories (receivers, speakers, subwoofers)
   - Include major brands: Yamaha, Denon, Klipsch, SVS, KEF
   - Ensure data includes all compatibility fields

6. **Write database queries** (`lib/database/queries.ts`)
   - `searchProducts(query, category, maxPrice)`
   - `getProductById(id)`
   - `addProduct(product)`
   - `getUserSystems()`
   - `saveSystem(system)`
   - `deleteSystem(id)`

### Phase 2: Core compatibility engine

7. **Define compatibility rules** (`lib/compatibility/rules.ts`)
   - Impedance matching rules (4Ω, 6Ω, 8Ω)
   - Power handling thresholds (50-150% of speaker rating)
   - Connection type requirements (banana, binding post, RCA, HDMI)
   - Channel count validation

8. **Implement compatibility checker** (`lib/compatibility/checker.ts`)
   - `checkCompatibility(receiver, speakers)` returns array of issues
   - Issue types: error (blocking), warning (suboptimal), info (suggestion)
   - Each issue includes: type, severity, message, affectedComponents

9. **Build power calculator** (`lib/compatibility/calculator.ts`)
   - `calculateImpedanceLoad(speakers)` for parallel/series configurations
   - `calculateTotalPower(speakers)` for power requirements
   - `calculateHeadroom(receiver, speakers)` for safety margin

10. **Write tests for compatibility logic**
    - Test all rules with edge cases
    - Verify calculations are accurate
    - Ensure error messages are helpful

### Phase 3: State management

11. **Create system store** (`lib/store/systemStore.ts`)
    - State: currentSystem, components, systems, isPremium
    - Actions: addComponent, removeComponent, saveSystem, loadSystem
    - Persist to SQLite on changes
    - Enforce free tier limits (1 system, 10 scans)

12. **Create premium store** (`lib/store/premiumStore.ts`)
    - State: isPremium, purchaseDate, features
    - Actions: unlockPremium, checkFeatureAccess
    - Mock purchase flow for MVP (real IAP later)

### Phase 4: UI components

13. **Build ComponentCard** (`components/SystemBuilder/ComponentCard.tsx`)
    - Display product image, name, key specs
    - Show compatibility status (green/yellow/red indicator)
    - Tap to view details, long-press to remove
    - Drag handle for reordering

14. **Build SignalChain** (`components/SystemBuilder/SignalChain.tsx`)
    - Visual flow diagram: Source → Receiver → Speakers
    - Animated connections between components
    - Highlight incompatibilities with red lines
    - Tap connections to see details

15. **Build CompatibilityAlert** (`components/SystemBuilder/CompatibilityAlert.tsx`)
    - Banner at top showing issues count
    - Expandable list of all issues
    - Color-coded by severity
    - Tap issue to highlight affected components

16. **Build ProductCard** (`components/ProductCard.tsx`)
    - Grid/list view toggle
    - Product image, name, price
    - Key specs badge (impedance, power)
    - Add to system button

17. **Build BudgetSlider** (`components/BudgetSlider.tsx`)
    - Range slider for min/max budget
    - Real-time filtering of products
    - Show total cost of current system
    - Visual indicator when over budget

18. **Build RoomVisualizer** (`components/RoomVisualizer.tsx`)
    - Top-down 2D room view
    - Draggable speaker icons
    - Distance measurements
    - Acoustic warnings (too close to walls, etc.)

### Phase 5: Main screens

19. **System Builder screen** (`app/(tabs)/index.tsx`)
    - Empty state: "Start by adding a receiver"
    - Component list with SignalChain
    - Floating action button to add components
    - Compatibility alerts at top
    - Save/share buttons in header

20. **Product Library screen** (`app/(tabs)/library.tsx`)
    - Search bar with category filters
    - Grid of ProductCards
    - Floating scan button (camera icon)
    - Sort by: price, popularity, compatibility

21. **Scanner modal** (`app/scanner.tsx`)
    - Full-screen camera view
    - Barcode detection overlay
    - Auto-dismiss on successful scan
    - Manual entry fallback
    - Show product preview before adding

22. **Product Detail screen** (`app/product/[id].tsx`)
    - Large product image
    - Full specifications table
    - Compatibility with current system
    - Add to system button
    - Similar products section

23. **Room Setup screen** (`app/(tabs)/room.tsx`)
    - Room dimensions input
    - Shape selector (rectangle, L-shape, open concept)
    - RoomVisualizer component
    - Speaker placement recommendations
    - Export diagram button (premium)

24. **Profile/Settings screen** (`app/(tabs)/profile.tsx`)
    - Premium status card
    - Upgrade button (if free)
    - Saved systems list
    - App settings (units, theme)
    - About/help links

### Phase 6: Premium features

25. **Implement upgrade flow**
    - Premium features modal with benefits list
    - Mock purchase button (console.log for MVP)
    - Unlock all features on "purchase"
    - Persist premium status to database

26. **Add premium gates**
    - Check `isPremium` before allowing:
      - Creating 2nd system
      - Scanning 11th product
      - Exporting diagrams
      - Advanced compatibility analysis
    - Show upgrade prompt when hitting limits

27. **Build export functionality** (`lib/utils/export.ts`)
    - Generate shopping list as text
    - Create wiring diagram as image (react-native-view-shot)
    - Share via native share sheet
    - Premium-only feature

### Phase 7: Polish and testing

28. **Add loading states**
    - Skeleton screens for product lists
    - Spinner for database operations
    - Progress indicator for barcode scanning

29. **Error handling**
    - Graceful failures for camera permissions
    - Offline mode messaging
    - Database error recovery
    - Invalid barcode handling

30. **Accessibility**
    - Screen reader labels for all interactive elements
    - Sufficient color contrast for compatibility indicators
    - Keyboard navigation support
    - Haptic feedback for actions

31. **Run all tests**
    ```bash
    npm test
    ```
    - Ensure 100% pass rate
    - Fix any failing tests
    - Add missing test coverage

32. **Manual testing checklist**
    - [ ] Scan a barcode (use test barcode image)
    - [ ] Add components to system
    - [ ] Verify compatibility warnings appear
    - [ ] Save and load system
    - [ ] Hit free tier limits
    - [ ] Upgrade to premium
    - [ ] Export shopping list
    - [ ] Test on both iOS and Android

## How to verify it works

### Development setup
```bash
npm install
npm test                    # All tests must pass
npx expo start
```

### Testing on device/simulator

1. **Scan Expo Go QR code** or press `i` for iOS simulator, `a` for Android

2. **Test core flow:**
   - Tap "Library" tab
   - Tap scan button (use test barcode or skip to manual entry)
   - Search for "Yamaha" and add a receiver
   - Add 2-3 speakers
   - Return to "Builder" tab
   - Verify signal chain displays correctly
   - Check for compatibility alerts (intentionally add mismatched components)

3. **Test free tier limits:**
   - Create a system and save it
   - Try to create a 2nd system → should show upgrade prompt
   - Scan 10 products → 11th scan should show upgrade prompt

4. **Test premium unlock:**
   - Go to Profile tab
   - Tap "Upgrade to Premium"
   - Tap mock purchase button
   - Verify all features unlock
   - Create multiple systems
   - Export a shopping list

5. **Test room setup:**
   - Go to Room tab
   - Enter room dimensions (e.g., 15ft x 20ft)
   - Drag speakers around
   - Verify placement recommendations appear

6. **Test persistence:**
   - Close app completely
   - Reopen
   - Verify saved systems load
   - Verify premium status persists

### Success criteria
- [ ] `npm test` shows all tests passing
- [ ] App launches without errors on iOS and Android
- [ ] Can scan barcode and add product (or manually add)
- [ ] Compatibility checker shows warnings for mismatched components
- [ ] Free tier limits enforced correctly
- [ ] Premium upgrade unlocks all features
- [ ] Systems persist across app restarts
- [ ] No crashes during normal usage