# Pano Mobile App Specification

## 1. App Name

**ShelfLife**

## 2. One-Line Pitch

Turn the chaos of saved links into beautiful, shareable collections you'll actually use.

## 3. Expanded Vision

### Who This Is Really For

**Primary Audience:**
- **Knowledge workers** drowning in browser tabs and scattered bookmarks across devices
- **Visual learners** who need to see their saved content organized spatially, not in endless lists
- **Curators and taste-makers** who want to share their discoveries without the noise of social media
- **Students and researchers** managing sources across multiple projects
- **Parents** organizing educational resources, recipes, gift ideas, and family planning content

**Broader Appeal:**
This isn't just another bookmarking tool—it's a personal knowledge management system that respects how humans actually think. People don't organize thoughts in folders; they organize them in contexts (work shelf, vacation planning shelf, gift ideas shelf). 

**Adjacent Use Cases:**
- **Gift planning:** A shelf for each person with gift ideas collected year-round
- **Travel research:** Separate shelves for different trip destinations
- **Career development:** Curated resources for learning new skills
- **Home projects:** Inspiration and how-to guides organized by room or project
- **Shopping research:** Products being considered, organized by category
- **Content creation:** Research materials for writers, YouTubers, podcasters

**Why Non-Technical People Want This:**
It solves the universal problem of "I saved that somewhere but can't find it." The shelf metaphor is instantly familiar—everyone understands a bookshelf. Unlike Notion (too complex) or Pinterest (too social/public), ShelfLife is your private library that you can selectively share.

## 4. Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **Local Database:** Expo SQLite for offline-first storage
- **State Management:** Zustand (lightweight, simple)
- **UI Components:** React Native Paper (Material Design)
- **Image Handling:** Expo Image with caching
- **Metadata Extraction:** Cheerio for web scraping (via API)
- **Cloud Sync:** Expo SQLite Cloud Sync (premium feature)
- **Authentication:** Expo AuthSession with JWT
- **Analytics:** Expo Application Services (EAS)

## 5. Core Features (MVP)

### 1. Quick Capture
- Share extension for iOS/Android to save links from any app
- Automatic metadata extraction (title, description, image, favicon)
- Offline queue—saves work even without internet
- Smart categorization suggestions based on content

### 2. Visual Shelf Organization
- Drag-and-drop items between shelves
- Cover image for each shelf (auto-generated from contents or custom)
- Grid and list view options
- Search across all shelves and items

### 3. Beautiful Sharing
- Generate shareable links for individual shelves
- Public view is clean, ad-free, and mobile-optimized
- Viewers can "clone" your shelf to their own library
- Track views and clones (premium)

### 4. Smart Collections
- Auto-shelves based on domains (all YouTube videos, all recipes, etc.)
- Recently added smart shelf
- Favorites shelf
- Tag-based filtering

### 5. Offline-First Experience
- All content cached locally
- Full-text search works offline
- Sync happens seamlessly in background
- Conflict resolution for multi-device edits

## 6. Monetization Strategy

### Free Tier (The Hook)
- 3 shelves
- 50 items per shelf (150 total)
- Basic sharing (public links)
- All core features
- Single device

**Why This Works:** Users get enough to solve their immediate problem and experience the value. The limits are generous enough to build habit, restrictive enough to hit pain points.

### Premium Tier: $4.99/month or $49.99/year (17% discount)

**Premium Features:**
- Unlimited shelves and items
- Multi-device sync via cloud
- Custom domains for shared shelves (yourname.shelflife.app)
- Collaboration—invite others to contribute to shelves
- Advanced analytics (views, clones, popular items)
- Priority metadata extraction
- Export to PDF, Notion, or CSV
- Custom shelf themes and layouts
- Archive mode (hide shelves without deleting)

**Price Reasoning:**
- Below Notion ($10/mo) and Evernote ($8/mo)
- Comparable to Pocket Premium ($4.99/mo)
- Impulse-buy territory for most professionals
- Annual option encourages commitment

**Retention Strategy:**
- **Data lock-in (ethical):** Users build valuable collections over time
- **Habit formation:** Daily use for saving content creates dependency
- **Social proof:** Shared shelves drive traffic back to app
- **Continuous value:** The more you save, the more valuable your library becomes
- **Cross-device necessity:** Once you use on multiple devices, sync becomes essential

**Conversion Triggers:**
- Hit shelf limit (3 shelves)
- Hit item limit (150 items)
- Try to access from second device
- Want to share with custom domain
- Need collaboration for work/school project

## 7. Market Position

**NOT SKIP—Clear Gap Exists**

While competitors exist, none nail the combination of:
- **Visual + Organized** (Pinterest is too social, Raindrop too utilitarian)
- **Mobile-first** (Notion is desktop-centric, Pocket is read-only)
- **Shareable + Private** (Pinterest is public-first, bookmarks are private-only)
- **Beautiful + Functional** (Diigo is ugly, Flipboard is read-only)

The "shelf" metaphor is unique and instantly understandable. This is a wedge into personal knowledge management that doesn't require learning a new system (unlike Notion) or changing behavior (unlike social bookmarking).

## 8. File Structure

```
shelflife/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx                 # Tab navigator
│   │   ├── index.tsx                   # Shelves list (home)
│   │   ├── search.tsx                  # Search across all items
│   │   ├── add.tsx                     # Quick add item
│   │   └── profile.tsx                 # Settings & account
│   ├── shelf/
│   │   └── [id].tsx                    # Individual shelf view
│   ├── item/
│   │   └── [id].tsx                    # Item detail view
│   ├── share/
│   │   └── [shelfId].tsx               # Public shelf view
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── onboarding.tsx
│   ├── paywall.tsx
│   └── _layout.tsx                     # Root layout
├── components/
│   ├── ShelfCard.tsx
│   ├── ItemCard.tsx
│   ├── AddItemSheet.tsx
│   ├── ShareSheet.tsx
│   ├── EmptyState.tsx
│   └── PremiumBadge.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts                   # SQLite schema
│   │   ├── migrations.ts
│   │   └── queries.ts                  # Database operations
│   ├── api/
│   │   ├── metadata.ts                 # URL metadata extraction
│   │   ├── sync.ts                     # Cloud sync logic
│   │   └── auth.ts                     # Authentication
│   ├── store/
│   │   ├── shelves.ts                  # Zustand store for shelves
│   │   ├── items.ts                    # Zustand store for items
│   │   └── user.ts                     # User state
│   └── utils/
│       ├── share.ts                    # Share functionality
│       ├── validation.ts
│       └── constants.ts
├── hooks/
│   ├── useDatabase.ts
│   ├── useShelves.ts
│   ├── useItems.ts
│   └── usePremium.ts
├── types/
│   └── index.ts                        # TypeScript types
├── __tests__/
│   ├── db/
│   │   ├── schema.test.ts
│   │   └── queries.test.ts
│   ├── store/
│   │   ├── shelves.test.ts
│   │   └── items.test.ts
│   ├── utils/
│   │   ├── validation.test.ts
│   │   └── share.test.ts
│   └── api/
│       └── metadata.test.ts
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 9. Tests

### Core Test Files

**`__tests__/db/schema.test.ts`**
- Test database initialization
- Test table creation
- Test migration logic
- Test foreign key constraints

**`__tests__/db/queries.test.ts`**
- Test CRUD operations for shelves
- Test CRUD operations for items
- Test search functionality
- Test shelf item count limits
- Test cascade deletes

**`__tests__/store/shelves.test.ts`**
- Test shelf creation
- Test shelf updates
- Test shelf deletion
- Test shelf reordering
- Test free tier limits (3 shelves max)

**`__tests__/store/items.test.ts`**
- Test item creation
- Test item updates
- Test item deletion
- Test moving items between shelves
- Test free tier limits (50 items per shelf)

**`__tests__/utils/validation.test.ts`**
- Test URL validation
- Test shelf name validation
- Test item metadata validation
- Test premium feature checks

**`__tests__/utils/share.test.ts`**
- Test share link generation
- Test public shelf access
- Test clone functionality

**`__tests__/api/metadata.test.ts`**
- Test URL metadata extraction
- Test fallback for failed extractions
- Test caching logic
- Test timeout handling

## 10. Implementation Steps

### Phase 1: Project Setup & Database

1. **Initialize Expo project**
   ```bash
   npx create-expo-app shelflife --template tabs
   cd shelflife
   ```

2. **Install core dependencies**
   ```bash
   npx expo install expo-sqlite expo-router expo-image
   npm install zustand react-native-paper cheerio
   npm install -D @types/react @types/react-native jest @testing-library/react-native
   ```

3. **Create database schema** (`lib/db/schema.ts`)
   - Define `shelves` table: id, name, description, cover_image, created_at, updated_at, order_index
   - Define `items` table: id, shelf_id, url, title, description, image_url, favicon_url, created_at, tags
   - Define `users` table: id, email, premium, premium_expires_at
   - Create indexes for performance

4. **Implement database queries** (`lib/db/queries.ts`)
   - `createShelf(name, description)`
   - `getShelves()` - ordered by order_index
   - `getShelf(id)` - with item count
   - `updateShelf(id, data)`
   - `deleteShelf(id)` - cascade delete items
   - `createItem(shelfId, url, metadata)`
   - `getItems(shelfId)`
   - `getItem(id)`
   - `updateItem(id, data)`
   - `deleteItem(id)`
   - `moveItem(itemId, newShelfId)`
   - `searchItems(query)` - full-text search
   - `getShelfItemCount(shelfId)`
   - `getTotalShelfCount()`

5. **Write database tests** (`__tests__/db/`)
   - Test all CRUD operations
   - Test constraints (shelf limits, item limits)
   - Test cascade deletes
   - Test search functionality

### Phase 2: State Management

6. **Create Zustand stores** (`lib/store/`)
   - `shelves.ts`: shelf state, actions (add, update, delete, reorder)
   - `items.ts`: item state, actions (add, update, delete, move)
   - `user.ts`: user state, premium status, limits

7. **Implement custom hooks** (`hooks/`)
   - `useDatabase()`: Initialize and access SQLite
   - `useShelves()`: Load shelves, handle CRUD
   - `useItems(shelfId)`: Load items for shelf, handle CRUD
   - `usePremium()`: Check premium status, enforce limits

8. **Write store tests** (`__tests__/store/`)
   - Test state updates
   - Test free tier limits
   - Test premium feature access

### Phase 3: Metadata Extraction

9. **Build metadata API** (`lib/api/metadata.ts`)
   - `extractMetadata(url)`: Fetch URL, parse HTML with Cheerio
   - Extract Open Graph tags (og:title, og:description, og:image)
   - Fallback to meta tags and title element
   - Extract favicon
   - Cache results in SQLite
   - Handle timeouts and errors gracefully

10. **Write metadata tests** (`__tests__/api/metadata.test.ts`)
    - Test successful extraction
    - Test fallback logic
    - Test error handling
    - Test caching

### Phase 4: Core UI Components

11. **Build reusable components** (`components/`)
    - `ShelfCard.tsx`: Display shelf with cover image, title, item count
    - `ItemCard.tsx`: Display item with image, title, domain
    - `AddItemSheet.tsx`: Bottom sheet for adding items (URL input)
    - `ShareSheet.tsx`: Bottom sheet for sharing shelves
    - `EmptyState.tsx`: Empty state illustrations
    - `PremiumBadge.tsx`: Premium feature indicator

12. **Style with React Native Paper**
    - Configure theme colors
    - Use Material Design components
    - Ensure dark mode support

### Phase 5: Main Screens

13. **Implement Shelves List** (`app/(tabs)/index.tsx`)
    - Display all shelves in grid
    - Show item count on each shelf
    - Add shelf button (check limits)
    - Long-press to edit/delete
    - Drag to reorder

14. **Implement Shelf Detail** (`app/shelf/[id].tsx`)
    - Display items in grid/list view
    - Add item button
    - Search within shelf
    - Share shelf button
    - Edit shelf button

15. **Implement Add Item** (`app/(tabs)/add.tsx`)
    - URL input field
    - Paste from clipboard button
    - Show metadata preview
    - Select shelf dropdown
    - Save button (check limits)

16. **Implement Search** (`app/(tabs)/search.tsx`)
    - Search input
    - Search across all items
    - Display results grouped by shelf
    - Tap to view item detail

17. **Implement Profile/Settings** (`app/(tabs)/profile.tsx`)
    - Display usage stats (shelves, items)
    - Premium status
    - Upgrade button
    - Export data
    - Logout

### Phase 6: Item Management

18. **Implement Item Detail** (`app/item/[id].tsx`)
    - Display full metadata
    - Open in browser button
    - Edit metadata
    - Move to different shelf
    - Delete item
    - Share item

19. **Implement item actions**
    - Edit: Update title, description, tags
    - Move: Select new shelf (with limits check)
    - Delete: Confirm and remove

### Phase 7: Sharing

20. **Build share functionality** (`lib/utils/share.ts`)
    - Generate unique share URLs
    - Create public shelf view (read-only)
    - Implement clone functionality
    - Track views (premium)

21. **Implement Public Shelf View** (`app/share/[shelfId].tsx`)
    - Display shelf items (read-only)
    - Show creator info
    - Clone to my library button
    - Open in app button

22. **Write share tests** (`__tests__/utils/share.test.ts`)
    - Test link generation
    - Test clone logic
    - Test access control

### Phase 8: Premium & Paywall

23. **Implement paywall** (`app/paywall.tsx`)
    - Display premium features
    - Pricing options (monthly/annual)
    - Purchase flow (mock for MVP)
    - Restore purchases

24. **Enforce limits** (`lib/utils/validation.ts`)
    - Check shelf count before creation
    - Check item count before adding
    - Check premium status for features
    - Show upgrade prompts

25. **Write validation tests** (`__tests__/utils/validation.test.ts`)
    - Test limit enforcement
    - Test premium checks

### Phase 9: Onboarding

26. **Build onboarding flow** (`app/onboarding.tsx`)
    - Welcome screen
    - Feature highlights (3 screens)
    - Create first shelf prompt
    - Add first item tutorial

27. **Implement first-run detection**
    - Check AsyncStorage for first launch
    - Show onboarding once
    - Skip button

### Phase 10: Polish & Testing

28. **Add loading states**
    - Skeleton screens for shelves
    - Loading indicators for metadata
    - Pull-to-refresh

29. **Add error handling**
    - Network error messages
    - Validation errors
    - Retry mechanisms

30. **Add animations**
    - Shelf card entrance
    - Item card entrance
    - Sheet transitions
    - Drag-and-drop feedback

31. **Run all tests**
    ```bash
    npm test
    ```

32. **Manual testing checklist**
    - Create shelf (free limit)
    - Add items (free limit)
    - Search items
    - Share shelf
    - Clone shelf
    - Edit/delete items
    - Offline functionality
    - Dark mode

### Phase 11: Deployment Prep

33. **Configure app.json**
    - Set app name, slug, version
    - Configure icons and splash screen
    - Set iOS bundle ID and Android package
    - Configure permissions (internet, storage)

34. **Build for testing**
    ```bash
    npx expo prebuild
    npx expo run:ios
    npx expo run:android
    ```

35. **Test on physical devices**
    - iOS device via Expo Go
    - Android device via Expo Go
    - Test share extension
    - Test offline mode

## 11. How to Verify It Works

### Development Testing

1. **Start development server**
   ```bash
   npx expo start
   ```

2. **Test on iOS Simulator**
   ```bash
   npx expo run:ios
   ```
   - Create 3 shelves (should succeed)
   - Try to create 4th shelf (should show paywall)
   - Add 50 items to a shelf (should succeed)
   - Try to add 51st item (should show paywall)
   - Search for items
   - Share a shelf
   - Test offline mode (disable network)

3. **Test on Android Emulator**
   ```bash
   npx expo run:android
   ```
   - Repeat iOS tests
   - Test back button behavior
   - Test share functionality

4. **Test on Physical Device (Expo Go)**
   - Scan QR code from `npx expo start`
   - Test share extension (share from Safari/Chrome)
   - Test clipboard paste
   - Test notifications (if implemented)

### Automated Testing

5. **Run unit tests**
   ```bash
   npm test
   ```
   - All tests must pass
   - Coverage should be >80% for core logic

6. **Run specific test suites**
   ```bash
   npm test -- db/queries.test.ts
   npm test -- store/shelves.test.ts
   npm test -- api/metadata.test.ts
   ```

### Acceptance Criteria

**Must Work:**
- ✅ Create up to 3 shelves (free tier)
- ✅ Add up to 50 items per shelf (free tier)
- ✅ Automatic metadata extraction from URLs
- ✅ Search across all items
- ✅ Share shelf via public link
- ✅ Clone shared shelf to own library
- ✅ Offline mode (view saved items)
- ✅ Dark mode support
- ✅ All tests pass

**Premium Features (Mock OK for MVP):**
- ✅ Paywall shows when limits hit
- ✅ Premium badge displays correctly
- ✅ Upgrade flow navigates properly

### Performance Benchmarks

- App launch: <2 seconds
- Shelf list load: <500ms
- Item list load: <500ms
- Metadata extraction: <3 seconds
- Search results: <200ms
- Database operations: <100ms

### Final Checklist

- [ ] App builds without errors
- [ ] All tests pass (`npm test`)
- [ ] Works on iOS simulator
- [ ] Works on Android emulator
- [ ] Works on physical device via Expo Go
- [ ] Offline mode functional
- [ ] Share functionality works
- [ ] Limits enforced correctly
- [ ] Paywall displays properly
- [ ] No console errors or warnings
- [ ] Dark mode works
- [ ] Onboarding shows on first launch