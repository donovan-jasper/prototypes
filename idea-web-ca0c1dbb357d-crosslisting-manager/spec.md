# Crosslisting Manager Spec

## 1. App Name

**SyncSell**

## 2. One-line pitch

Sell everywhere, manage from one place — automate your social commerce across TikTok Shop, Instagram, and more.

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Micro-entrepreneurs selling handmade goods, vintage items, or dropshipped products
- Content creators monetizing their audience through product sales
- Side hustlers managing 2-5 social commerce storefronts
- Small business owners (1-3 employees) without dedicated e-commerce staff

**Broadest audience:**
- Anyone selling physical products on social platforms who wants to 3x their reach without 3x the work
- Creators who treat their social presence as a business but lack enterprise tools
- Non-technical sellers intimidated by Shopify's complexity or enterprise pricing

**Adjacent use cases:**
- Resellers (thrift flippers, sneaker resellers) who need rapid cross-posting
- Event vendors (craft fairs, pop-ups) syncing online inventory with physical stock
- Influencer agencies managing multiple client storefronts
- Print-on-demand sellers distributing designs across platforms

**Why non-technical people want this:**
- Takes 30 seconds to post a product everywhere instead of 10 minutes per platform
- No spreadsheets, no manual inventory tracking, no "oops I sold the same item twice"
- Push notifications when something sells (dopamine hit + immediate action)
- Camera-first workflow: snap photo → add price → publish everywhere
- Plain English analytics ("You made $247 this week, TikTok is your best platform")

## 4. Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **State management:** Zustand (lightweight, simple)
- **Navigation:** Expo Router (file-based routing)
- **Camera:** expo-camera + expo-image-picker
- **Notifications:** expo-notifications
- **HTTP client:** Axios
- **Forms:** React Hook Form
- **UI:** React Native Paper (Material Design components)
- **Testing:** Jest + React Native Testing Library
- **Date handling:** date-fns

## 5. Core features (MVP)

### 1. Quick Post
- Snap product photo with in-app camera
- Add title, price, description once
- Select platforms (TikTok Shop, Instagram Shopping, Facebook Marketplace)
- Tap "Post Everywhere" — app handles platform-specific formatting and API calls
- Saves draft locally if offline, auto-posts when connection restored

### 2. Inventory Sync
- Single source of truth for stock levels
- When item sells on any platform, auto-decrements inventory
- Push notification: "Vintage jacket sold on TikTok! 2 left in stock"
- Option to auto-delist from other platforms when inventory hits zero

### 3. Unified Inbox
- All messages from buyers across platforms in one feed
- Reply from app (routes to correct platform API)
- Mark as "potential sale," "shipped," or "issue" for tracking

### 4. Simple Analytics Dashboard
- Weekly earnings by platform (bar chart)
- Best-selling products (top 5 list)
- "Post at 7pm on Thursdays" — AI-suggested optimal posting times based on engagement
- Export CSV for tax purposes

### 5. Scheduled Posting
- Queue up to 10 posts in advance (free tier)
- Unlimited scheduling on premium
- Smart suggestions: "Post this hoodie now — hoodies sell 40% better in evening"

## 6. Monetization strategy

### Free tier (the hook):
- Connect 2 platforms
- Post up to 20 products/month
- Basic inventory tracking
- 7-day analytics history
- Manual posting only

### Premium tier: $12.99/month (the paywall):
- Unlimited platforms
- Unlimited products
- Automated inventory sync across all platforms
- Scheduled posting (unlimited queue)
- 90-day analytics history with trend insights
- Priority customer support
- Bulk import via CSV
- Custom branding (watermark removal on product photos)

### Pricing reasoning:
- $12.99 hits the sweet spot between "impulse subscribe" and "serious tool"
- Lower than Shopify Lite ($9/mo) but offers more social-specific value
- Higher than Buffer ($6/mo) because we're solving a revenue-generating problem, not just content scheduling
- Monthly only (no annual discount at launch) to maximize early revenue

### Retention hooks:
- **Inventory lock-in:** Once you've synced 50+ products, switching tools means re-entering everything
- **Notification addiction:** Sellers get dopamine from "You made a sale!" push notifications
- **Analytics FOMO:** Free users see "Upgrade to see which platform makes you the most money"
- **Scheduled post queue:** Canceling means losing your queued posts
- **Weekly email:** "You earned $X this week, up 12% from last week" (only for premium)

## 7. Market gap analysis

**NOT SKIP — Clear gap exists:**

- **Lightspeed Retail:** $69-189/month, built for brick-and-mortar with POS systems, overkill for solo sellers
- **Shopify Flow:** Requires Shopify subscription ($39+/month), automation is complex, not mobile-first
- **Later/Buffer:** Social media scheduling only, no e-commerce features, no inventory management
- **Existing gap:** No sub-$15/month mobile-first tool that treats social commerce as the primary sales channel (not an add-on to a website)

**Why we win:**
- Mobile-native (competitors are desktop-first with mobile apps bolted on)
- Social commerce specialist (not trying to be an all-in-one e-commerce platform)
- Non-technical UX (no "connect your webhook" or "configure your API key")
- Price point targets micro-sellers who can't justify $50+/month tools

## 8. File structure

```
syncsell/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard/Analytics
│   │   ├── post.tsx               # Quick Post screen
│   │   ├── inventory.tsx          # Inventory list
│   │   ├── inbox.tsx              # Unified messages
│   │   └── settings.tsx           # Account & platform connections
│   ├── product/
│   │   ├── [id].tsx               # Product detail/edit
│   │   └── new.tsx                # New product form
│   ├── onboarding/
│   │   ├── welcome.tsx
│   │   └── connect-platforms.tsx
│   └── _layout.tsx
├── components/
│   ├── ProductCard.tsx
│   ├── PlatformSelector.tsx
│   ├── AnalyticsChart.tsx
│   ├── MessageItem.tsx
│   └── CameraCapture.tsx
├── lib/
│   ├── db.ts                      # SQLite setup & queries
│   ├── api/
│   │   ├── tiktok.ts
│   │   ├── instagram.ts
│   │   └── facebook.ts
│   ├── store/
│   │   ├── useProductStore.ts
│   │   ├── useAuthStore.ts
│   │   └── usePlatformStore.ts
│   ├── utils/
│   │   ├── imageProcessor.ts
│   │   ├── analytics.ts
│   │   └── notifications.ts
│   └── types.ts
├── __tests__/
│   ├── db.test.ts
│   ├── productStore.test.ts
│   ├── imageProcessor.test.ts
│   ├── analytics.test.ts
│   └── components/
│       ├── ProductCard.test.tsx
│       └── PlatformSelector.test.tsx
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### Core logic tests (Jest):

**`__tests__/db.test.ts`**
- Test product CRUD operations
- Test inventory decrement on sale
- Test platform connection storage
- Test message storage and retrieval

**`__tests__/productStore.test.ts`**
- Test adding product to store
- Test updating inventory across platforms
- Test filtering products by platform
- Test draft product persistence

**`__tests__/imageProcessor.test.ts`**
- Test image compression
- Test platform-specific image formatting (TikTok square, Instagram portrait)
- Test watermark removal for premium users

**`__tests__/analytics.test.ts`**
- Test weekly earnings calculation
- Test best-selling product ranking
- Test optimal posting time suggestion algorithm

**`__tests__/components/ProductCard.test.tsx`**
- Test rendering product with image, title, price
- Test platform badges display
- Test "Out of Stock" state
- Test edit/delete actions

**`__tests__/components/PlatformSelector.test.tsx`**
- Test selecting/deselecting platforms
- Test free tier platform limit (2 max)
- Test premium tier unlimited selection

## 10. Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app syncsell --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-camera expo-image-picker expo-notifications
   npm install zustand axios react-hook-form date-fns react-native-paper
   npm install -D jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json` with camera/notification permissions
4. Set up Jest config with React Native preset
5. Create folder structure as specified above

### Phase 2: Database layer
1. Create `lib/db.ts` with SQLite initialization
2. Define schema:
   - `products` table (id, title, description, price, image_uri, inventory, created_at)
   - `platforms` table (id, name, api_key, connected_at)
   - `sales` table (id, product_id, platform_id, amount, sold_at)
   - `messages` table (id, platform_id, buyer_name, content, read, received_at)
3. Write migration functions for table creation
4. Implement CRUD functions for each table
5. Write tests in `__tests__/db.test.ts`

### Phase 3: State management
1. Create `lib/store/useProductStore.ts` with Zustand:
   - State: products array, loading, error
   - Actions: addProduct, updateProduct, deleteProduct, decrementInventory
2. Create `lib/store/useAuthStore.ts`:
   - State: user, isPremium, subscription status
   - Actions: login, logout, upgradeToPremium
3. Create `lib/store/usePlatformStore.ts`:
   - State: connected platforms array
   - Actions: connectPlatform, disconnectPlatform
4. Write tests in `__tests__/productStore.test.ts`

### Phase 4: Camera & image handling
1. Create `components/CameraCapture.tsx`:
   - Request camera permissions
   - Capture photo or select from library
   - Return image URI
2. Create `lib/utils/imageProcessor.ts`:
   - Compress image to <2MB
   - Format for platform requirements (aspect ratios)
   - Add/remove watermark based on premium status
3. Write tests in `__tests__/imageProcessor.test.ts`

### Phase 5: Quick Post feature
1. Create `app/(tabs)/post.tsx`:
   - Camera button to capture product photo
   - Form fields: title, price, description, inventory
   - Platform selector component
   - "Post Everywhere" button
2. Create `components/PlatformSelector.tsx`:
   - Checkboxes for TikTok, Instagram, Facebook
   - Show lock icon for 3+ platforms if free tier
   - "Upgrade to Premium" CTA
3. Implement post logic:
   - Save product to SQLite
   - Call platform APIs (mock for MVP)
   - Show success notification
4. Write tests in `__tests__/components/PlatformSelector.test.tsx`

### Phase 6: Inventory management
1. Create `app/(tabs)/inventory.tsx`:
   - FlatList of products with ProductCard components
   - Search/filter by platform
   - Pull-to-refresh
2. Create `components/ProductCard.tsx`:
   - Display image, title, price, inventory count
   - Platform badges (TikTok, Instagram icons)
   - Edit/Delete buttons
3. Create `app/product/[id].tsx`:
   - Edit product form (pre-filled)
   - Update inventory
   - View sales history for this product
4. Implement inventory sync:
   - When sale recorded, decrement inventory in DB
   - Push notification via expo-notifications
   - If inventory = 0, mark as "Out of Stock"
5. Write tests in `__tests__/components/ProductCard.test.tsx`

### Phase 7: Analytics dashboard
1. Create `app/(tabs)/index.tsx`:
   - Weekly earnings card (total $ + % change)
   - Bar chart by platform (use react-native-chart-kit or custom SVG)
   - Top 5 products list
   - "Optimal posting time" suggestion
2. Create `lib/utils/analytics.ts`:
   - calculateWeeklyEarnings(sales)
   - getTopProducts(sales, limit)
   - suggestPostingTime(sales) — analyze sold_at timestamps
3. Create `components/AnalyticsChart.tsx`:
   - Bar chart component
   - Platform color coding
4. Write tests in `__tests__/analytics.test.ts`

### Phase 8: Unified inbox (basic)
1. Create `app/(tabs)/inbox.tsx`:
   - FlatList of messages grouped by platform
   - Unread badge count
   - Tap to open message detail
2. Create `components/MessageItem.tsx`:
   - Buyer name, platform icon, message preview
   - Timestamp
   - Unread indicator
3. Implement message storage:
   - Mock API calls to fetch messages
   - Store in SQLite messages table
   - Mark as read on tap
4. Write basic component tests

### Phase 9: Platform API integration (mock)
1. Create `lib/api/tiktok.ts`:
   - postProduct(product) — mock API call
   - fetchMessages() — mock response
   - recordSale(productId) — mock webhook
2. Create `lib/api/instagram.ts` (same structure)
3. Create `lib/api/facebook.ts` (same structure)
4. Add error handling and retry logic
5. Store API keys securely (expo-secure-store for production)

### Phase 10: Notifications
1. Create `lib/utils/notifications.ts`:
   - setupNotifications() — request permissions
   - sendSaleNotification(product, platform, amount)
   - sendInventoryAlert(product) — when stock low
2. Integrate with inventory sync:
   - Trigger notification when sale recorded
3. Test on physical device (notifications don't work in simulator)

### Phase 11: Onboarding flow
1. Create `app/onboarding/welcome.tsx`:
   - App value proposition
   - "Get Started" button
2. Create `app/onboarding/connect-platforms.tsx`:
   - List of platforms with "Connect" buttons
   - Mock OAuth flow (show success message)
   - Skip option
3. Set AsyncStorage flag to show onboarding only once

### Phase 12: Settings & premium upgrade
1. Create `app/(tabs)/settings.tsx`:
   - Connected platforms list with disconnect option
   - Subscription status card
   - "Upgrade to Premium" button (if free tier)
   - Export data (CSV download)
2. Implement premium check:
   - useAuthStore.isPremium
   - Show upgrade modal when hitting free tier limits
3. Mock payment flow (Stripe/RevenueCat integration for production)

### Phase 13: Polish & testing
1. Add loading states to all screens
2. Add error boundaries
3. Implement offline support:
   - Queue posts when offline
   - Sync when connection restored
4. Run all Jest tests: `npm test`
5. Test on iOS simulator and Android emulator
6. Test on physical device via Expo Go
7. Fix any UI/UX issues

### Phase 14: Production prep
1. Add app icon and splash screen
2. Configure `app.json` for production:
   - Bundle identifier
   - Version number
   - Privacy descriptions
3. Set up EAS Build for app store deployment
4. Create privacy policy and terms of service
5. Prepare App Store/Play Store listings

## 11. How to verify it works

### Local development:
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Test core flows:
   - Complete onboarding
   - Connect mock platforms (TikTok, Instagram)
   - Capture product photo with camera
   - Fill out product form and post
   - Verify product appears in inventory list
   - Tap product to edit
   - Manually record a sale (mock button)
   - Check notification appears
   - View analytics dashboard (should show sale)
   - Check inbox for mock messages

### Automated tests:
```bash
npm test
```
All tests must pass:
- Database CRUD operations
- Product store state management
- Image processing functions
- Analytics calculations
- Component rendering and interactions

### Platform-specific checks:
- **iOS:** Test camera permissions prompt, notification permissions
- **Android:** Test back button navigation, notification channels
- **Offline:** Enable airplane mode, create product, verify it queues and posts when online

### Performance:
- Product list should scroll smoothly with 100+ items
- Image upload should complete in <3 seconds
- Analytics should load in <1 second

### Edge cases:
- Post product with 0 inventory (should warn)
- Try to connect 3rd platform on free tier (should show upgrade modal)
- Delete product with sales history (should confirm)
- Disconnect platform with active products (should warn)