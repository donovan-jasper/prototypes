# ListSync

## One-line pitch
Sell everywhere, manage from anywhere — one tap to list products across Amazon, eBay, Shopify, and more.

## Expanded vision

**Core audience:** Small-scale sellers who treat e-commerce as a side hustle or primary income but lack enterprise resources. This includes:
- Resellers (thrift flippers, garage sale arbitrage, liquidation buyers)
- Handmade/craft sellers (Etsy → Amazon handmade expansion)
- Local retailers testing online channels
- Dropshippers managing 10-500 SKUs
- Parents selling kids' outgrown items in bulk
- College students flipping sneakers/electronics

**Broader appeal:** Anyone who's ever thought "I should sell this online" but got overwhelmed by platform-specific listing requirements. The app becomes a **universal product publisher** — take a photo, describe it once, and ListSync adapts it for each marketplace's format, category structure, and SEO requirements.

**Adjacent use cases:**
- Inventory tracking for small retail shops (sync online + physical stock)
- Price monitoring (get alerts when competitors undercut you)
- Multi-channel analytics (which platform drives your sales?)
- Bulk relisting for seasonal sellers (Halloween costumes, Christmas decor)

**Non-technical hook:** You don't need to understand APIs, CSV imports, or "SKU mapping." Just answer simple questions about your product and the app handles the rest. It's like having a virtual assistant who knows every marketplace's rules.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **State management:** Zustand (lightweight, no boilerplate)
- **API client:** Axios with retry logic
- **Image handling:** expo-image-picker + expo-image-manipulator
- **Background sync:** expo-task-manager + expo-background-fetch
- **Push notifications:** expo-notifications
- **Auth:** expo-secure-store for API tokens
- **Testing:** Jest + React Native Testing Library

## Core features (MVP)

1. **Smart Product Creator**
   - Take/upload photos, add title/description/price once
   - AI suggests category mappings for each platform
   - One-tap publish to connected marketplaces
   - Saves as draft for review before posting

2. **Unified Inventory Dashboard**
   - See all listings across platforms in one feed
   - Real-time stock sync (sell on eBay → auto-updates Amazon quantity)
   - Low stock alerts via push notification
   - Quick edit: change price/quantity across all platforms simultaneously

3. **Platform Connectors**
   - OAuth flows for Amazon, eBay, Shopify
   - Secure token storage (no passwords saved)
   - Connection health monitoring (alerts if API access breaks)

4. **Price Optimizer (Premium)**
   - Scans competitor prices for similar items
   - Suggests optimal price range based on demand/competition
   - Auto-adjust pricing rules (e.g., "always 5% below lowest competitor")

5. **Bulk Actions (Premium)**
   - Import CSV of products
   - Mass update prices/quantities
   - Duplicate listings to new platforms

## Monetization strategy

**Free tier (hook):**
- Connect 1 marketplace
- Create up to 10 active listings
- Manual inventory sync
- Basic analytics (total sales, views)

**Premium ($14.99/month or $119/year):**
- Unlimited marketplaces
- Unlimited listings
- Auto inventory sync every 15 minutes
- AI price optimizer
- Bulk import/export
- Priority support

**Why this price?** Higher than typical productivity apps ($9.99) because this directly generates revenue for users. A seller making $500/month can justify $15 if it saves 3+ hours of manual work. Annual plan offers 33% savings to lock in committed users.

**Retention drivers:**
- Inventory sync becomes mission-critical once adopted (can't go back to manual updates)
- Historical pricing data and analytics build over time
- Switching cost: re-entering products elsewhere is painful

**Alternative:** One-time $199 "Lifetime Pro" for early adopters (limited to first 500 users) to bootstrap cash flow and create evangelists.

## File structure

```
listsync/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Dashboard (inventory feed)
│   │   ├── create.tsx                # New product form
│   │   ├── platforms.tsx             # Connected marketplaces
│   │   └── settings.tsx              # Account, subscription, logout
│   ├── product/[id].tsx              # Product detail/edit
│   ├── connect/[platform].tsx        # OAuth flow handler
│   └── _layout.tsx                   # Root navigation
├── components/
│   ├── ProductCard.tsx               # Listing preview card
│   ├── PlatformBadge.tsx             # Marketplace icon/status
│   ├── InventorySync.tsx             # Sync status indicator
│   ├── PriceOptimizer.tsx            # AI pricing suggestions
│   └── ImagePicker.tsx               # Photo upload component
├── lib/
│   ├── db.ts                         # SQLite setup and queries
│   ├── api/
│   │   ├── amazon.ts                 # Amazon SP-API client
│   │   ├── ebay.ts                   # eBay Trading API client
│   │   ├── shopify.ts                # Shopify Admin API client
│   │   └── base.ts                   # Shared API utilities
│   ├── sync.ts                       # Background inventory sync logic
│   ├── pricing.ts                    # Price optimization algorithms
│   └── storage.ts                    # Secure token management
├── store/
│   ├── products.ts                   # Zustand store for products
│   ├── platforms.ts                  # Connected platform state
│   └── user.ts                       # User/subscription state
├── types/
│   ├── product.ts                    # Product data models
│   ├── platform.ts                   # Platform connection types
│   └── api.ts                        # API response types
├── __tests__/
│   ├── db.test.ts                    # Database operations
│   ├── sync.test.ts                  # Sync logic
│   ├── pricing.test.ts               # Price optimizer
│   ├── api/
│   │   ├── amazon.test.ts
│   │   ├── ebay.test.ts
│   │   └── shopify.test.ts
│   └── components/
│       ├── ProductCard.test.tsx
│       └── PriceOptimizer.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**lib/__tests__/db.test.ts**
```typescript
import { openDatabase, createProduct, getProducts, updateInventory } from '../db';

describe('Database operations', () => {
  beforeEach(async () => {
    const db = await openDatabase();
    await db.execAsync('DELETE FROM products');
  });

  test('creates product with correct schema', async () => {
    const product = await createProduct({
      title: 'Test Widget',
      description: 'A test product',
      price: 29.99,
      quantity: 10,
      images: ['image1.jpg']
    });

    expect(product.id).toBeDefined();
    expect(product.title).toBe('Test Widget');
  });

  test('syncs inventory across platforms', async () => {
    const product = await createProduct({ title: 'Widget', quantity: 10 });
    await updateInventory(product.id, 5);

    const updated = await getProducts();
    expect(updated[0].quantity).toBe(5);
  });
});
```

**lib/__tests__/sync.test.ts**
```typescript
import { syncInventory, detectStockChanges } from '../sync';

describe('Inventory sync', () => {
  test('detects quantity changes from external sales', () => {
    const local = { id: '1', quantity: 10 };
    const remote = { id: '1', quantity: 8 };

    const changes = detectStockChanges(local, remote);
    expect(changes.quantityDelta).toBe(-2);
  });

  test('handles sync conflicts with last-write-wins', async () => {
    const result = await syncInventory({
      localQuantity: 5,
      remoteQuantity: 7,
      lastSyncTime: Date.now() - 60000
    });

    expect(result.resolvedQuantity).toBe(7); // Remote is newer
  });
});
```

**lib/__tests__/pricing.test.ts**
```typescript
import { suggestPrice, analyzeCompetitors } from '../pricing';

describe('Price optimizer', () => {
  test('suggests competitive price based on market data', () => {
    const competitors = [19.99, 24.99, 22.50, 21.00];
    const suggestion = suggestPrice(competitors, { strategy: 'competitive' });

    expect(suggestion.price).toBeGreaterThan(19.99);
    expect(suggestion.price).toBeLessThan(21.00);
  });

  test('applies minimum margin constraints', () => {
    const cost = 15.00;
    const suggestion = suggestPrice([18.00, 19.00], { 
      cost, 
      minMargin: 0.25 
    });

    expect(suggestion.price).toBeGreaterThanOrEqual(18.75); // 25% margin
  });
});
```

**components/__tests__/ProductCard.test.tsx**
```typescript
import { render, fireEvent } from '@testing-library/