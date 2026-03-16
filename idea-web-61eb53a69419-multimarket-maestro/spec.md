# MultiMarket Maestro Spec

## 1. App Name

**SellSync**

## 2. One-line pitch

Sell everywhere, manage from anywhere — one tap syncs your products across every marketplace.

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Side hustlers juggling 2-5 selling platforms (Etsy, eBay, Depop, Poshmark, Facebook Marketplace)
- Small business owners who sell physical products but lack technical skills
- Resellers (thrift flippers, dropshippers) who need speed over sophistication
- Emerging market sellers with smartphone-only access to e-commerce

**Broadest audience:**
This serves anyone who sells physical goods online and feels overwhelmed by platform fragmentation. The real pain isn't just "syncing inventory" — it's the mental overhead of remembering which platform has what listing, which sold where, and whether you updated the price everywhere.

**Adjacent use cases:**
- Local pickup coordination (integrating with Google Maps for meetup spots)
- Bulk photo editing and watermarking for product images
- Sales analytics that show which platform converts best for specific product types
- Automated repricing based on competitor listings (scrape similar items, suggest price adjustments)
- Multi-currency support for cross-border sellers

**Why non-technical people want this:**
They're tired of opening 5 different apps every morning. They want one place to see "what sold overnight" and "what needs restocking." The app removes decision fatigue — it tells them what to do next (restock this, relist that, drop this price).

## 4. Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **State management:** Zustand (lightweight, no boilerplate)
- **Local storage:** Expo SQLite for offline-first inventory
- **API layer:** Axios for marketplace integrations
- **Auth:** Expo SecureStore for API tokens
- **UI:** React Native Paper (Material Design, accessible out of the box)
- **Push notifications:** Expo Notifications
- **Image handling:** Expo ImagePicker + ImageManipulator
- **Testing:** Jest + React Native Testing Library

## 5. Core features (MVP)

1. **Unified Inventory Dashboard**
   - Single list view of all products across platforms
   - Real-time sync status indicators (synced, pending, error)
   - Offline mode: queue changes, sync when online
   - Quick actions: edit price, mark as sold, duplicate listing

2. **One-Tap Cross-Post**
   - Create listing once, push to multiple platforms
   - Platform-specific field mapping (eBay requires shipping weight, Depop doesn't)
   - Bulk photo upload with auto-watermarking
   - Save as draft for later publishing

3. **Smart Sync Engine**
   - Auto-update inventory when item sells on any platform
   - Conflict resolution: if same item sells on two platforms simultaneously, alert user
   - Scheduled sync (every 15 min on free, real-time on paid)

4. **Sales Command Center**
   - Push notifications for new orders
   - Order fulfillment checklist (print label, mark shipped, request review)
   - Revenue dashboard: today/week/month breakdown by platform

5. **Platform Connectors (MVP: 3 platforms)**
   - eBay API integration
   - Etsy API integration
   - Depop API integration (or web scraping if no public API)
   - Extensible architecture for adding more platforms

## 6. Monetization strategy

**Free tier:**
- Connect up to 2 platforms
- Manual sync only (tap to refresh)
- 25 active listings max
- Basic sales notifications

**Paid tier: $9.99/month**
- Unlimited platforms
- Auto-sync every 15 minutes
- Unlimited listings
- Bulk editing tools
- Priority support
- Advanced analytics (best-selling items, platform performance)

**Power Pack: $99 one-time**
- Lifetime access to AI-powered repricing suggestions
- Competitor price tracking
- Custom watermark templates
- Export sales data to CSV

**Hook:** Free users get instant relief from opening multiple apps. They see the unified dashboard and feel organized.

**Paywall:** When they try to add a 3rd platform or hit 25 listings, they're already invested. The $9.99 feels cheap compared to lost sales from manual errors.

**Retention driver:** Auto-sync becomes a dependency. Once you trust the app to handle inventory, going back to manual updates feels like torture. Monthly revenue reports create habit loops (users check in to see growth).

## 7. Skip if saturated

**NOT SKIPPING.** While Shopify and eBay have mobile apps, they're platform-specific. Cross-platform tools like Sellbrite and ChannelAdvisor are desktop-first and enterprise-priced ($50-200/month). No mobile-native app targets the micro-seller segment with offline-first design and sub-$10 pricing.

## 8. File structure

```
sellsync/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard
│   │   ├── inventory.tsx          # Inventory list
│   │   ├── create.tsx             # Create listing
│   │   └── settings.tsx           # Settings & platform connections
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── InventoryCard.tsx
│   ├── PlatformBadge.tsx
│   ├── SyncStatusIndicator.tsx
│   └── QuickActionMenu.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── sync-engine.ts             # Core sync logic
│   ├── platform-adapters/
│   │   ├── base-adapter.ts
│   │   ├── ebay-adapter.ts
│   │   ├── etsy-adapter.ts
│   │   └── depop-adapter.ts
│   └── storage.ts                 # SecureStore wrapper
├── hooks/
│   ├── useInventory.ts
│   ├── usePlatforms.ts
│   └── useSync.ts
├── store/
│   └── app-store.ts               # Zustand store
├── types/
│   └── index.ts
├── __tests__/
│   ├── sync-engine.test.ts
│   ├── platform-adapters.test.ts
│   ├── database.test.ts
│   └── components/
│       └── InventoryCard.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### `__tests__/sync-engine.test.ts`
```typescript
import { SyncEngine } from '../lib/sync-engine';
import { EbayAdapter } from '../lib/platform-adapters/ebay-adapter';

describe('SyncEngine', () => {
  it('should detect inventory conflicts across platforms', async () => {
    const engine = new SyncEngine();
    const conflict = await engine.detectConflict('item-123');
    expect(conflict).toBeDefined();
  });

  it('should queue changes when offline', () => {
    const engine = new SyncEngine();
    engine.queueChange({ itemId: '123', quantity: 0 });
    expect(engine.getPendingChanges()).toHaveLength(1);
  });
});
```

### `__tests__/platform-adapters.test.ts`
```typescript
import { EbayAdapter } from '../lib/platform-adapters/ebay-adapter';

describe('EbayAdapter', () => {
  it('should map generic listing to eBay format', () => {
    const adapter = new EbayAdapter('fake-token');
    const mapped = adapter.mapListing({
      title: 'Test Item',
      price: 29.99,
      quantity: 1,
    });
    expect(mapped).toHaveProperty('Item.Title');
  });
});
```

### `__tests__/database.test.ts`
```typescript
import { initDatabase, addListing, getListings } from '../lib/database';

describe('Database', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  it('should store and retrieve listings', async () => {
    await addListing({ title: 'Test', price: 10, platforms: ['ebay'] });
    const listings = await getListings();
    expect(listings).toHaveLength(1);
  });
});
```

### `__tests__/components/InventoryCard.test.tsx`
```typescript
import { render } from '@testing-library/react-native';
import InventoryCard from '../../components/InventoryCard';

describe('InventoryCard', () => {
  it('renders listing title and price', () => {
    const { getByText } = render(
      <InventoryCard listing={{ title: 'Widget', price: 19.99 }} />
    );
    expect(getByText('Widget')).toBeTruthy();
    expect(getByText('$19.99')).toBeTruthy();
  });
});
```

## 10. Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app@latest sellsync --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-secure-store expo-notifications expo-image-picker expo-image-manipulator
   npm install zustand axios react-native-paper
   npm install -D jest @testing-library/react-native @types/jest
   ```
3. Configure `app.json`:
   - Set `name`, `slug`, `version`
   - Add `ios.bundleIdentifier` and `android.package`
   - Configure notification permissions
4. Set up Jest in `jest.config.js`

### Phase 2: Database layer
1. Create `lib/database.ts`:
   - Initialize SQLite with tables: `listings`, `platforms`, `sync_queue`
   - Schema: listings (id, title, description, price, quantity, images, created_at)
   - Schema: platforms (id, name, api_token, enabled)
   - Schema: sync_queue (id, listing_id, platform, action, status, created_at)
2. Implement CRUD functions: `addListing`, `updateListing`, `deleteListing`, `getListings`
3. Write tests for database operations

### Phase 3: Platform adapters
1. Create `lib/platform-adapters/base-adapter.ts`:
   - Abstract class with methods: `authenticate`, `createListing`, `updateListing`, `deleteListing`, `fetchOrders`
2. Implement `ebay-adapter.ts`:
   - Use eBay Trading API
   - Map generic listing format to eBay's XML/JSON schema
   - Handle OAuth token refresh
3. Implement `etsy-adapter.ts`:
   - Use Etsy Open API v3
   - Map to Etsy's listing format
4. Implement `depop-adapter.ts`:
   - If no public API, use web scraping with Cheerio (or skip for MVP)
5. Write tests for each adapter's mapping logic

### Phase 4: Sync engine
1. Create `lib/sync-engine.ts`:
   - `syncAll()`: iterate through enabled platforms, push queued changes
   - `detectConflict()`: check if same item sold on multiple platforms
   - `queueChange()`: add to sync_queue when offline
   - `processQueue()`: execute queued changes when online
2. Implement conflict resolution UI (alert user, let them choose which sale to keep)
3. Write tests for sync logic

### Phase 5: State management
1. Create `store/app-store.ts` with Zustand:
   - State: `listings`, `platforms`, `syncStatus`, `isOnline`
   - Actions: `addListing`, `updateListing`, `togglePlatform`, `triggerSync`
2. Create hooks:
   - `useInventory()`: fetch listings from DB, subscribe to changes
   - `usePlatforms()`: manage connected platforms
   - `useSync()`: trigger manual sync, show sync status

### Phase 6: UI components
1. Create `components/InventoryCard.tsx`:
   - Display listing title, price, thumbnail
   - Show platform badges (eBay, Etsy icons)
   - Sync status indicator (green checkmark, yellow pending, red error)
   - Quick action menu (edit, duplicate, delete)
2. Create `components/PlatformBadge.tsx`:
   - Small icon + label for each platform
3. Create `components/SyncStatusIndicator.tsx`:
   - Animated spinner during sync
   - Success/error states

### Phase 7: Screens
1. `app/(tabs)/index.tsx` (Dashboard):
   - Sales summary cards (today, week, month)
   - Recent orders list
   - Quick stats (total listings, active platforms)
2. `app/(tabs)/inventory.tsx`:
   - FlatList of InventoryCard components
   - Pull-to-refresh for manual sync
   - Search/filter bar
3. `app/(tabs)/create.tsx`:
   - Form: title, description, price, quantity
   - Image picker (multi-select)
   - Platform checkboxes (select where to post)
   - Save as draft or publish immediately
4. `app/(tabs)/settings.tsx`:
   - Platform connection cards (connect/disconnect)
   - Sync frequency toggle (manual vs auto)
   - Subscription status (free vs paid)

### Phase 8: Notifications
1. Set up Expo Notifications:
   - Request permissions on app launch
   - Register for push token
2. Create notification handler:
   - Listen for new orders from platform webhooks (or polling)
   - Show notification: "New sale on eBay: Widget sold for $19.99"
3. Handle notification tap: navigate to order details

### Phase 9: Offline support
1. Implement network detection:
   - Use `NetInfo` to track online/offline state
   - Update `isOnline` in Zustand store
2. Queue changes when offline:
   - All create/update/delete operations go to `sync_queue` table
   - Show "Pending sync" badge on affected listings
3. Auto-sync when back online:
   - Listen for network state change
   - Call `processQueue()` automatically

### Phase 10: Testing & polish
1. Run all Jest tests: `npm test`
2. Test on iOS simulator and Android emulator
3. Test offline mode: enable airplane mode, make changes, go online, verify sync
4. Test push notifications: trigger test notification
5. Add loading states and error handling to all API calls
6. Implement pull-to-refresh on inventory screen
7. Add empty states (no listings, no platforms connected)

### Phase 11: Monetization gates
1. Add subscription check in `useInventory()`:
   - Free tier: limit to 25 listings, show upgrade prompt
2. Add platform limit check in `usePlatforms()`:
   - Free tier: max 2 platforms
3. Implement paywall screen:
   - Show feature comparison table
   - "Upgrade to Pro" button (link to in-app purchase or Stripe checkout)
4. Add analytics tracking (Expo Analytics or Mixpanel):
   - Track: app opens, listings created, syncs triggered, paywall views

## 11. How to verify it works

### Local development
1. Start Expo dev server: `npx expo start`
2. Open Expo Go app on physical device or simulator
3. Scan QR code to load app

### Verification checklist
- [ ] App launches without errors
- [ ] Dashboard shows placeholder data (or empty state)
- [ ] Navigate to Inventory tab, see empty state
- [ ] Tap "Create Listing" button, form appears
- [ ] Fill out form, select platforms, tap "Publish"
- [ ] New listing appears in Inventory tab
- [ ] Tap listing card, quick action menu appears
- [ ] Edit listing, change price, save
- [ ] Pull down on Inventory screen to trigger manual sync
- [ ] Go to Settings, tap "Connect eBay", see OAuth flow (or mock)
- [ ] Enable airplane mode, edit listing, see "Pending sync" badge
- [ ] Disable airplane mode, verify listing syncs automatically
- [ ] Run `npm test`, all tests pass
- [ ] Trigger test push notification, verify it appears

### Production readiness
- [ ] Build iOS app: `eas build --platform ios`
- [ ] Build Android app: `eas build --platform android`
- [ ] Test on real devices (iPhone, Android phone)
- [ ] Submit to App Store and Google Play with screenshots and description