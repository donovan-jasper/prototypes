# ListLink Spec

## 1. App Name

**SellSync**

## 2. One-line pitch

Sell everywhere, manage from one place — the mobile hub for resellers who list across multiple marketplaces.

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Fashion resellers and vintage sellers (Depop, Vinted, Poshmark, Mercari)
- Collectibles dealers (eBay, Whatnot, StockX)
- Handmade/craft sellers (Etsy, Facebook Marketplace)
- Small business owners managing inventory across channels

**Broadest audience:**
Anyone selling physical goods on 2+ platforms who's tired of:
- Manually copying listings between apps
- Losing track of what sold where
- Missing price drops or relisting opportunities
- Not knowing their true profit margins across platforms

**Adjacent use cases:**
- **Inventory photographers:** Snap once, list everywhere with AI-generated descriptions
- **Thrift flippers:** Track sourcing costs vs. sale prices for ROI analysis
- **Estate sale managers:** Bulk list inherited items across platforms
- **College students:** Sell textbooks, furniture, clothes during moves
- **Parents:** Resell kids' outgrown clothes/toys across multiple apps

**Why non-technical people want this:**
Reselling is a side hustle economy. People want to make money without becoming spreadsheet experts or juggling 6 apps. SellSync turns "I have stuff to sell" into cash with minimal friction.

## 4. Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **State management:** Zustand (lightweight, simple)
- **Navigation:** Expo Router (file-based routing)
- **Image handling:** expo-image-picker, expo-image-manipulator
- **API calls:** Axios
- **Testing:** Jest + React Native Testing Library
- **UI:** React Native Paper (Material Design components)
- **Analytics:** Expo Analytics (privacy-first)

## 5. Core features (MVP)

1. **Universal Listing Creator**
   - Snap photos, add title/description/price once
   - Select target platforms (start with eBay, Poshmark, Mercari APIs)
   - Auto-format for each platform's requirements
   - Save as draft or publish immediately

2. **Unified Inventory Dashboard**
   - See all active listings across platforms in one feed
   - Filter by platform, status (active/sold/expired), category
   - Quick actions: edit price, mark as sold, relist

3. **Sales Tracker with Profit Calculator**
   - Log sourcing cost per item
   - Auto-calculate profit after platform fees
   - Weekly/monthly earnings summary
   - Export CSV for tax purposes

4. **Smart Notifications**
   - Push alerts for sales, messages, price drop suggestions
   - Relist reminders for expired items
   - Low inventory warnings

5. **Bulk Actions (Premium)**
   - Upload 10+ items at once via CSV
   - Apply price changes across platforms
   - Batch relist expired items

## 6. Monetization strategy

### Free tier (hook):
- Up to 25 active listings
- 2 connected platforms
- Basic sales tracking
- Manual listing creation

### Premium ($7.99/month or $69.99/year):
- Unlimited listings
- Connect 5+ platforms
- Bulk upload/editing
- Advanced analytics (best-selling categories, optimal pricing)
- Priority customer support
- Auto-relist expired items
- AI-generated listing descriptions (powered by on-device ML)

**Price reasoning:**
- Lower than Shopify ($29/mo) or dedicated reseller tools ($15-20/mo)
- Comparable to productivity apps (Notion $10/mo, Todoist $5/mo)
- Annual plan = 27% discount to encourage retention

**Retention drivers:**
- Inventory lock-in: Once you've cataloged 100+ items, switching is painful
- Cross-platform sync: The more platforms you connect, the more valuable it becomes
- Historical data: Sales trends and profit tracking become more valuable over time
- Time savings: Bulk actions save hours per week for active resellers

## 7. Market gap analysis

**NOT saturated.** Here's why:

- **eBay Mobile:** Single-platform only, no cross-listing
- **Poshmark/Depop apps:** Walled gardens, no multi-platform support
- **Resellr/List Perfectly:** Web-first, clunky mobile experience, expensive ($30+/mo)
- **Spreadsheets:** Manual, error-prone, no automation

**Clear gap:** No mobile-first, affordable, cross-platform inventory manager for individual resellers. Existing tools target high-volume businesses, not side hustlers.

## 8. File structure

```
sellsync/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard
│   │   ├── create.tsx             # New listing
│   │   ├── sales.tsx              # Sales tracker
│   │   └── settings.tsx           # Settings/account
│   ├── listing/
│   │   └── [id].tsx               # Listing detail
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── ListingCard.tsx
│   ├── PlatformBadge.tsx
│   ├── ProfitCalculator.tsx
│   ├── ImageUploader.tsx
│   └── FilterBar.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── api/
│   │   ├── ebay.ts
│   │   ├── poshmark.ts
│   │   └── mercari.ts
│   ├── stores/
│   │   ├── listingStore.ts        # Zustand store
│   │   └── settingsStore.ts
│   └── utils/
│       ├── calculations.ts
│       ├── formatting.ts
│       └── notifications.ts
├── __tests__/
│   ├── calculations.test.ts
│   ├── database.test.ts
│   ├── listingStore.test.ts
│   └── components/
│       ├── ListingCard.test.tsx
│       └── ProfitCalculator.test.tsx
├── assets/
│   ├── images/
│   └── icons/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### `__tests__/calculations.test.ts`
```typescript
import { calculateProfit, calculateFees } from '../lib/utils/calculations';

describe('Profit calculations', () => {
  test('calculates eBay profit correctly', () => {
    const result = calculateProfit({
      salePrice: 100,
      sourcingCost: 20,
      platform: 'ebay',
      shippingCost: 10
    });
    expect(result.profit).toBe(57); // 100 - 20 - 13 (13% fee) - 10
    expect(result.margin).toBeCloseTo(57);
  });

  test('handles zero sourcing cost', () => {
    const result = calculateProfit({
      salePrice: 50,
      sourcingCost: 0,
      platform: 'poshmark',
      shippingCost: 0
    });
    expect(result.profit).toBeGreaterThan(0);
  });
});
```

### `__tests__/database.test.ts`
```typescript
import { openDatabase, createListing, getListings } from '../lib/database';

describe('Database operations', () => {
  let db: any;

  beforeAll(async () => {
    db = await openDatabase(':memory:');
  });

  test('creates and retrieves listing', async () => {
    const listing = {
      title: 'Vintage Nike Jacket',
      price: 45,
      platform: 'depop',
      status: 'active'
    };
    
    const id = await createListing(db, listing);
    const retrieved = await getListings(db, { status: 'active' });
    
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].title).toBe(listing.title);
  });
});
```

### `__tests__/listingStore.test.ts`
```typescript
import { useListingStore } from '../lib/stores/listingStore';

describe('Listing store', () => {
  beforeEach(() => {
    useListingStore.setState({ listings: [] });
  });

  test('adds listing to store', () => {
    const { addListing, listings } = useListingStore.getState();
    
    addListing({
      id: '1',
      title: 'Test Item',
      price: 25,
      platform: 'ebay'
    });
    
    expect(listings).toHaveLength(1);
    expect(listings[0].title).toBe('Test Item');
  });

  test('filters listings by platform', () => {
    const { addListing, getListingsByPlatform } = useListingStore.getState();
    
    addListing({ id: '1', platform: 'ebay', title: 'Item 1', price: 10 });
    addListing({ id: '2', platform: 'poshmark', title: 'Item 2', price: 20 });
    
    const ebayListings = getListingsByPlatform('ebay');
    expect(ebayListings).toHaveLength(1);
  });
});
```

### `__tests__/components/ProfitCalculator.test.tsx`
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfitCalculator from '../../components/ProfitCalculator';

describe('ProfitCalculator component', () => {
  test('displays calculated profit', () => {
    const { getByText, getByPlaceholderText } = render(
      <ProfitCalculator platform="ebay" />
    );
    
    const salePriceInput = getByPlaceholderText('Sale price');
    const costInput = getByPlaceholderText('Sourcing cost');
    
    fireEvent.changeText(salePriceInput, '100');
    fireEvent.changeText(costInput, '30');
    
    expect(getByText(/Profit:/)).toBeTruthy();
  });
});
```

## 10. Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app sellsync --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-image-picker expo-image-manipulator
   npm install zustand axios react-native-paper
   npm install -D jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json`:
   - Set app name, slug, icon
   - Add permissions: camera, photo library, notifications
4. Set up Jest config with React Native preset

### Phase 2: Database layer
1. Create `lib/database.ts`:
   - Define schema: listings, sales, platforms tables
   - Write CRUD functions: createListing, updateListing, deleteListing, getListings
   - Add migration logic for schema updates
2. Write database tests
3. Initialize DB on app launch in `app/_layout.tsx`

### Phase 3: State management
1. Create `lib/stores/listingStore.ts`:
   - State: listings array, filters, loading states
   - Actions: addListing, updateListing, deleteListing, setFilter
   - Selectors: getListingsByPlatform, getActiveSales
2. Create `lib/stores/settingsStore.ts`:
   - User preferences, connected platforms, premium status
3. Write store tests

### Phase 4: Core utilities
1. Create `lib/utils/calculations.ts`:
   - calculateProfit(salePrice, cost, platform, shipping)
   - calculateFees(price, platform) — platform-specific fee structures
   - calculateMargin(profit, salePrice)
2. Create `lib/utils/formatting.ts`:
   - formatCurrency, formatDate, truncateText
3. Write calculation tests

### Phase 5: UI components
1. Create `components/ListingCard.tsx`:
   - Display listing image, title, price, platform badge
   - Quick actions: edit, mark sold, delete
2. Create `components/PlatformBadge.tsx`:
   - Color-coded badges for each platform
3. Create `components/ProfitCalculator.tsx`:
   - Input fields for sale price, cost, shipping
   - Real-time profit display
4. Create `components/ImageUploader.tsx`:
   - Camera/gallery picker
   - Image preview grid
   - Compression before upload
5. Write component tests

### Phase 6: Main screens
1. **Dashboard (`app/(tabs)/index.tsx`)**:
   - Fetch listings from DB on mount
   - Display in FlatList with ListingCard
   - Add FilterBar for platform/status filtering
   - Pull-to-refresh functionality

2. **Create Listing (`app/(tabs)/create.tsx`)**:
   - Form: title, description, price, category
   - ImageUploader component
   - Platform selector (multi-select)
   - Save draft or publish button
   - On submit: save to DB, show success toast

3. **Sales Tracker (`app/(tabs)/sales.tsx`)**:
   - List of sold items with profit calculations
   - Summary cards: total sales, total profit, avg margin
   - Date range filter (week/month/year)
   - Export CSV button (premium feature)

4. **Settings (`app/(tabs)/settings.tsx`)**:
   - Connected platforms list
   - Premium upgrade CTA
   - Notification preferences
   - About/support links

5. **Listing Detail (`app/listing/[id].tsx`)**:
   - Full listing view with all images
   - Edit form (pre-filled)
   - Platform-specific links
   - Delete confirmation dialog

### Phase 7: API integrations (mock for MVP)
1. Create `lib/api/ebay.ts`:
   - Mock functions: publishListing, updateListing, getListing
   - Return success/error responses
2. Repeat for poshmark.ts, mercari.ts
3. Add API call logic to create/update flows
4. Handle errors