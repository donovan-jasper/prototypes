# AudioChain

## One-line pitch
Design your dream audio system in minutes — see what works together before you buy.

## Expanded vision

**Core audience:** Anyone spending $200+ on audio gear who wants confidence before checkout.

**Broadest reach:**
- **Casual upgraders** (largest segment): People replacing TV soundbars, buying first turntables, or upgrading PC speakers. They don't know ohms from watts but want something better than Bluetooth.
- **Home theater DIYers**: Building 5.1/7.1 systems, need to match receivers to speakers without hiring installers.
- **Vinyl newcomers**: The exploding record collector market — they need turntable/preamp/speaker chains that actually work.
- **Gamers/streamers**: Want studio-quality mic/headphone setups, confused by XLR vs USB vs audio interfaces.
- **Gift buyers**: Parents/partners buying audio gear for enthusiasts, need to verify compatibility.

**Adjacent use cases:**
- **Budget optimization**: "I have $800 — show me the best 2.1 system I can build"
- **Upgrade paths**: "I have X and Y — what's my next best purchase?"
- **Troubleshooting**: "Why does my setup hum?" → app analyzes signal chain for ground loops, impedance mismatches
- **Shopping assistant**: Scan gear in stores, instantly see if it fits your existing system

**Non-technical hook:** Visual signal flow diagrams that show "this plugs into this" with color-coded compatibility (green = works, yellow = suboptimal, red = won't work). Like LEGO instructions for audio.

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Local storage**: SQLite (expo-sqlite) for gear database, user builds
- **State**: Zustand (lightweight, no boilerplate)
- **UI**: React Native Paper (Material Design, accessible)
- **Validation**: Zod for schema validation
- **Camera**: expo-camera for barcode scanning
- **Charts**: react-native-svg for signal chain visualization
- **Testing**: Jest + React Native Testing Library

## Core features

1. **Visual Build Canvas**
   - Drag-and-drop components (source → preamp → amp → speakers)
   - Real-time compatibility validation with color-coded connections
   - Auto-suggest missing components (e.g., "You need a phono preamp between turntable and receiver")

2. **Smart Compatibility Engine**
   - Impedance matching (speaker ohms vs amp output)
   - Power handling (amp watts vs speaker ratings)
   - Connection type validation (RCA, XLR, optical, etc.)
   - Warns about bottlenecks ("Your $2000 amp is limited by $50 cables")

3. **Barcode Scanner + Gear Database**
   - Scan product barcodes to instantly add gear to your build
   - Crowdsourced database of 10k+ audio products with specs
   - Offline-first: core database syncs locally

4. **Budget Optimizer**
   - Set total budget, app suggests balanced component allocation
   - "Best bang for buck" mode prioritizes price/performance
   - Shows upgrade paths: "Spend $200 more here for 40% better sound"

5. **Setup Assistant**
   - Step-by-step connection guide with diagrams
   - Troubleshooting wizard for common issues (hum, no sound, distortion)
   - Cable length calculator based on room layout

## Monetization strategy

**Free tier (hook):**
- Build one system (up to 5 components)
- Basic compatibility checks (impedance, power, connections)
- Access to 5k most common products
- Community-submitted gear specs

**Paid tier — $7.99/month or $59.99/year** (reasoning: cheaper than one wrong purchase)
- Unlimited builds with cloud sync
- Advanced validation (frequency response matching, room acoustics suggestions)
- Full 50k+ product database with pro specs
- Budget optimizer and upgrade path recommendations
- Barcode scanning (unlimited)
- Priority support + expert Q&A forum
- Export shopping lists to Amazon/Sweetwater with affiliate links

**Retention drivers:**
- **Build library**: Users invest time creating multiple builds (bedroom, living room, studio)
- **Upgrade notifications**: "Your saved build can be improved with this new product"
- **Community**: Share builds, get feedback, discover new gear
- **Learning content**: Monthly deep-dives on audio concepts (DACs, room treatment, etc.)

**Revenue model:**
- Subscriptions (primary)
- Affiliate commissions from gear purchases (secondary, 3-8% from retailers)
- Sponsored "featured builds" from brands (future)

## File structure

```
audio-chain/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Build canvas screen
│   │   ├── library.tsx            # Saved builds
│   │   ├── discover.tsx           # Browse gear database
│   │   └── profile.tsx            # Settings, subscription
│   ├── build/
│   │   └── [id].tsx               # Individual build detail
│   ├── scanner.tsx                # Barcode scanner modal
│   ├── _layout.tsx                # Root layout
│   └── +not-found.tsx
├── components/
│   ├── BuildCanvas.tsx            # Drag-drop component area
│   ├── ComponentCard.tsx          # Individual gear item
│   ├── ConnectionLine.tsx         # Visual signal path
│   ├── CompatibilityBadge.tsx    # Green/yellow/red status
│   └── BudgetOptimizer.tsx        # Budget allocation UI
├── lib/
│   ├── db/
│   │   ├── schema.ts              # SQLite table definitions
│   │   ├── migrations.ts          # Database migrations
│   │   └── queries.ts             # Prepared statements
│   ├── validation/
│   │   ├── impedance.ts           # Ohm matching logic
│   │   ├── power.ts               # Wattage calculations
│   │   ├── connections.ts         # Port compatibility
│   │   └── chain.ts               # Full signal chain validation
│   ├── store/
│   │   └── buildStore.ts          # Zustand state management
│   └── types.ts                   # TypeScript interfaces
├── assets/
│   ├── gear-database.json         # Seed data (5k products)
│   └── connection-types.json      # Port specifications
├── __tests__/
│   ├── validation/
│   │   ├── impedance.test.ts
│   │   ├── power.test.ts
│   │   └── chain.test.ts
│   ├── components/
│   │   └── BuildCanvas.test.tsx
│   └── db/
│       └── queries.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/validation/impedance.test.ts
import { validateImpedance } from '@/lib/validation/impedance';

describe('Impedance Validation', () => {
  test('matches 8Ω speaker to 8Ω amp output', () => {
    expect(validateImpedance(8, 8)).toBe('compatible');
  });

  test('warns on 4Ω speaker with 8Ω-only amp', () => {
    expect(validateImpedance(4, 8, { minOhms: 8 })).toBe('warning');
  });

  test('blocks 2Ω speaker on 8Ω-only amp', () => {
    expect(validateImpedance(2, 8, { minOhms: 8 })).toBe('incompatible');
  });
});

// __tests__/validation/power.test.ts
import { validatePower } from '@/lib/validation/power';

describe('Power Handling', () => {
  test('safe when amp power < speaker max', () => {
    expect(validatePower(50, 100)).toBe('compatible');
  });

  test('warns when amp power > speaker max', () => {
    expect(validatePower(150, 100)).toBe('warning');
  });

  test('optimal when amp is 50-80% of speaker rating', () => {
    expect(validatePower(60, 100)).toBe('optimal');
  });
});

// __tests__/validation/chain.test.ts
import { validateSignalChain } from '@/lib/validation/chain';

describe('Signal Chain Validation', () => {
  test('valid turntable → phono preamp → amp → speakers', () => {
    const chain = [
      { type: 'turntable', outputs: ['rca'] },
      { type: 'preamp', inputs: ['rca'], outputs: ['rca'] },
      { type: 'amplifier', inputs: ['rca'], outputs: ['speaker'] },
      { type: 'speaker', inputs: ['speaker'] }
    ];
    expect(validateSignalChain(chain).isValid).toBe(true);
  });

  test('detects missing phono preamp', () => {
    const chain = [
      { type: 'turntable', outputs: ['rca'] },
      { type: 'amplifier', inputs: ['rca'], outputs: ['speaker'] }
    ];
    const result = validateSignalChain(chain);
    expect(result.isValid).toBe(false);
    expect(result.suggestions).toContain('Add phono preamp');
  });
});
```

## Implementation steps

### Phase 1: Database & Core Logic (Days 1-2)

1. **Initialize Expo project**
   ```bash
   npx create-expo-app audio-chain --template tabs
   cd audio-chain
   npm install expo-sqlite zustand zod react-native-paper react-native-svg
   npm install -D jest @testing-library/react-native
   ```

2. **Create SQLite schema** (`lib/db/schema.ts`)
   - Tables: `components` (id, name, type, brand, price, specs_json), `builds` (id, name, created_at), `build_components` (build_id, component_id, position)
   - Indexes on `type`, `brand` for fast filtering

3. **Seed gear database** (`lib/db/migrations.ts`)
   - Import `assets/gear-database.json` (100 sample products: turntables, amps, speakers, preamps)
   - Each product has: impedance, power rating, input/output types, price

4. **Build validation engine** (`lib/validation/`)
   - `impedance.ts`: Check speaker ohms vs amp output (return 'compatible' | 'warning' | 'incompatible')
   - `power.ts`: Validate amp watts vs speaker max (flag if amp > 120% of speaker rating)
   - `connections.ts`: Match output types to input types (RCA, XLR, optical, speaker wire)
   - `chain.ts`: Orchestrate full signal path validation, detect missing components

5. **Write tests** (`__tests__/validation/`)
   - Cover edge cases: mismatched impedance, overpowered speakers, missing preamps
   - Run `npm test` — all must pass before proceeding

### Phase 2: UI Components (Days 3-4)

6. **Build canvas component** (`components/BuildCanvas.tsx`)
   - Vertical scrollable area with drop zones for each component type
   - Use `react-native-svg` to draw connection lines between components
   - Color-code lines: green (compatible), yellow (warning), red (incompatible)

7. **Component card** (`components/ComponentCard.tsx`)
   - Display product image, name, brand, price
   - Show key specs (impedance, power, connections) as badges
   - Tap to view full details or remove from build

8. **Compatibility badge** (`components/CompatibilityBadge.tsx`)
   - Small colored indicator with icon (checkmark, warning triangle, X)
   - Tap to show detailed validation message

9. **Home screen** (`app/(tabs)/index.tsx`)
   - "New Build" button → creates empty build in SQLite
   - Renders `BuildCanvas` with current build components
   - Floating action button to add components (opens gear picker modal)

### Phase 3: Gear Database & Search (Day 5)

10. **Discover screen** (`app/(tabs)/discover.tsx`)
    - Search bar with filters: type, brand, price range
    - Query SQLite `components` table
    - Tap product → add to current build or view details

11. **Barcode scanner** (`app/scanner.tsx`)
    - Use `expo-camera` to scan product barcodes
    - Look up UPC in local database, fallback to API (future)
    - Add scanned product to build automatically

### Phase 4: Build Management (Day 6)

12. **Library screen** (`app/(tabs)/library.tsx`)
    - List all saved builds from SQLite `builds` table
    - Show thumbnail preview of component chain
    - Swipe to delete, tap to open

13. **Build detail screen** (`app/build/[id].tsx`)
    - Full-screen canvas with current build
    - "Share" button → export as image or link
    - "Optimize Budget" button → opens budget optimizer modal

14. **Budget optimizer** (`components/BudgetOptimizer.tsx`)
    - Input: total budget
    - Algorithm: allocate 40% to speakers, 30% to amp, 20% to source, 10% to cables/accessories
    - Suggest products from database that fit allocation

### Phase 5: Monetization & Polish (Day 7)

15. **Paywall logic**
    - Free users: max 1 build, basic validation only
    - Check subscription status before allowing multiple builds or advanced features
    - Use Expo's in-app purchases (future integration)

16. **Profile screen** (`app/(tabs)/profile.tsx`)
    - Subscription status, upgrade button
    - Settings: units (metric/imperial), theme
    - Export all builds as JSON

17. **Onboarding flow**
    - First launch: 3-screen tutorial explaining drag-drop, compatibility checks, scanning
    - Sample build pre-loaded to demonstrate features

### Phase 6: Testing & Deployment (Day 8)

18. **Integration tests**
    - Test full user flow: create build → add components → validate → save
    - Test database queries under load (1000+ products)

19. **Accessibility audit**
    - Ensure all interactive elements have labels
    - Test with screen reader (TalkBack/VoiceOver)
    - Minimum touch target size 44x44pt

20. **Build for production**
    ```bash
    eas build --platform all
    ```

## How to verify it works

### Local development
```bash
npm install
npm test                    # All Jest tests must pass
npx expo start
```

### On device (Expo Go)
1. Scan QR code from `npx expo start`
2. **Test flow:**
   - Tap "New Build" on home screen
   - Tap "+" button → select "Turntable" from gear list
   - Add "Amplifier" → should show red warning ("Missing phono preamp")
   - Add "Phono Preamp" between turntable and amp → warning clears
   - Add "Speakers" → check impedance badge (should be green if matched)
   - Tap "Save Build" → verify it appears in Library tab
3. **Test scanner:**
   - Tap scanner icon → grant camera permission
   - Scan any barcode → should search database (will fail gracefully if not found)
4. **Test budget optimizer:**
   - Open saved build → tap "Optimize Budget"
   - Enter $1000 → should suggest balanced component allocation

### Success criteria
- ✅ All `npm test` suites pass
- ✅ Can create and save multiple builds
- ✅ Validation engine correctly flags incompatible components
- ✅ Signal chain visualization renders without crashes
- ✅ App works offline (database is local)
- ✅ No console errors or warnings in Expo Go