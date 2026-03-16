# LootVault

## One-line pitch
Track, trade, and optimize your gaming inventory across every platform—never miss a limited drop or overpay for gear again.

## Expanded vision

**Core audience:** Mobile-first gamers (ages 16-35) who play 2+ live-service games and feel overwhelmed managing time-limited events, seasonal content, and in-game economies across multiple titles.

**Broader appeal:**
- **Casual collectors** who play Pokémon GO, Marvel Snap, or mobile gacha games and want to track what they own without opening each app
- **Parents managing kids' accounts** across Roblox, Minecraft, Fortnite—one dashboard to see what's been purchased and set spending limits
- **Trading card game players** (MTG Arena, Hearthstone) who need deck-building tools and collection trackers
- **Streamers and content creators** who showcase inventory across games and need quick access to stats/screenshots
- **Bargain hunters** who flip in-game items for profit and need price alerts + market trend data

**Adjacent use cases:**
- Subscription tracker for gaming services (Game Pass, PS Plus, Apple Arcade)
- Wishlist aggregator with price drop alerts across Steam, Epic, PlayStation Store
- Achievement/trophy tracker with completion percentages
- Social features: compare collections with friends, trade recommendations

**Why non-technical users want this:**
- Push notifications replace FOMO: "Your Fortnite Battle Pass expires in 3 days"
- Voice commands: "Show me my Genshin Impact characters" while cooking dinner
- One-tap access to loadouts before jumping into a match
- Automatic budget tracking: "You've spent $47 on Apex Legends this month"

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite) for offline-first inventory data
- **State management:** Zustand (lightweight, no boilerplate)
- **API layer:** Axios for game API integrations
- **Auth:** Expo AuthSession (OAuth for game platform logins)
- **Notifications:** Expo Notifications
- **Voice:** Expo Speech (text-to-speech for hands-free queries)
- **Charts:** Victory Native (inventory value trends)
- **Testing:** Jest + React Native Testing Library

## Core features (MVP)

1. **Universal Inventory Dashboard**
   - Connect 3+ game accounts (manual entry for games without APIs)
   - Grid view of all items across games with search/filter
   - Total portfolio value estimate based on community market data

2. **Smart Alerts**
   - Push notifications for: limited-time shop items, event deadlines, price drops on wishlisted items
   - Customizable alert rules (e.g., "Notify me when Legendary skins go on sale")

3. **Quick Loadout Manager**
   - Save and switch between equipment presets
   - Voice command: "Load my PvP setup for Destiny 2"
   - Offline mode: view cached loadouts without internet

4. **Price Tracker**
   - Historical price charts for tradeable items
   - "Buy now or wait?" recommendations based on 30-day trends
   - Watchlist with target price alerts

5. **Spending Insights**
   - Monthly breakdown by game
   - Budget warnings when approaching user-set limits
   - Export CSV for tax/expense tracking

## Monetization strategy

**Free tier (hook):**
- Connect up to 2 game accounts
- Basic inventory view (no price tracking)
- 5 alert rules max
- Ads on dashboard (non-intrusive banner)

**Premium ($4.99/month or $39.99/year):**
- Unlimited game accounts
- Real-time price tracking + trend analysis
- Unlimited alert rules
- Auto-sync every 15 minutes (vs 6 hours for free)
- Cloud backup (restore inventory if you switch devices)
- Ad-free experience
- Priority support

**Why people stay subscribed:**
- Sunk cost: "I've tracked $2,000 worth of items—can't lose that data"
- Habit formation: Daily check-ins become routine (like checking stocks)
- ROI: Premium users save money by timing purchases (pays for itself if you avoid one impulse buy)
- Social proof: Leaderboards for collection value (gamification)

**Price reasoning:**
- Lower than Netflix ($6.99) but higher than mobile game passes ($2.99)
- Annual discount (33% off) encourages long-term commitment
- Comparable to GamePass Ultimate ($9.99) but focused on inventory, not game access

## File structure

```
loot-vault/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Dashboard (inventory grid)
│   │   ├── alerts.tsx             # Alert rules management
│   │   ├── insights.tsx           # Spending analytics
│   │   └── profile.tsx            # Settings + account connections
│   ├── _layout.tsx                # Root navigation
│   ├── game/[id].tsx              # Single game detail view
│   └── loadout/[id].tsx           # Loadout editor
├── components/
│   ├── InventoryCard.tsx          # Item display component
│   ├── PriceChart.tsx             # Victory Native chart wrapper
│   ├── AlertRuleForm.tsx          # Create/edit alert UI
│   └── GameAccountCard.tsx        # Connected account tile
├── lib/
│   ├── db.ts                      # SQLite setup + migrations
│   ├── api/
│   │   ├── gameApis.ts            # Mock API clients for games
│   │   └── priceService.ts        # Price fetching logic
│   ├── stores/
│   │   ├── inventoryStore.ts      # Zustand store for items
│   │   └── alertStore.ts          # Alert rules state
│   └── utils/
│       ├── notifications.ts       # Push notification helpers
│       └── voice.ts               # Voice command parser
├── __tests__/
│   ├── inventoryStore.test.ts
│   ├── priceService.test.ts
│   ├── notifications.test.ts
│   └── components/
│       └── InventoryCard.test.tsx
├── app.json
├── package.json
└── tsconfig.json
```

## Tests

```typescript
// __tests__/inventoryStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useInventoryStore } from '../lib/stores/inventoryStore';

describe('inventoryStore', () => {
  it('adds item to inventory', () => {
    const { result } = renderHook(() => useInventoryStore());
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Legendary Sword',
        game: 'Fortnite',
        rarity: 'legendary',
        value: 1500
      });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Legendary Sword');
  });

  it('calculates total portfolio value', () => {
    const { result } = renderHook(() => useInventoryStore());
    act(() => {
      result.current.addItem({ id: '1', value: 100 });
      result.current.addItem({ id: '2', value: 250 });
    });
    expect(result.current.totalValue).toBe(350);
  });
});

// __tests__/priceService.test.ts
import { fetchItemPrice, shouldBuyNow } from '../lib/api/priceService';

describe('priceService', () => {
  it('fetches current price for item', async () => {
    const price = await fetchItemPrice('fortnite', 'item-123');
    expect(price).toBeGreaterThan(0);
  });

  it('recommends buying when price is below 30-day average', () => {
    const recommendation = shouldBuyNow(800, 1000);
    expect(recommendation).toBe(true);
  });
});

// __tests__/notifications.test.ts
import { scheduleAlertNotification } from '../lib/utils/notifications';

describe('notifications', () => {
  it('schedules notification for price drop alert', async () => {
    const result = await scheduleAlertNotification({
      title: 'Price Drop!',
      body: 'Legendary Sword now 20% off',
      trigger: { seconds: 60 }
    });
    expect(result).toBeTruthy();
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo app: `npx create-expo-app loot-vault --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite zustand axios victory-native expo-notifications expo-speech
   npm install --save-dev jest @testing-library/react-native @testing-library/react-hooks
   ```
3. Configure `app.json`:
   - Set app name to "LootVault"
   - Add notification permissions
   - Configure deep linking scheme

### Phase 2: Database layer
1. Create `lib/db.ts`:
   - Initialize SQLite database
   - Define schema: `games`, `items`, `alert_rules`, `price_history`
   - Write migration functions
2. Add seed data for 3 mock games (Fortnite, Genshin Impact, Destiny 2)
3. Write CRUD functions: `insertItem()`, `getItemsByGame()`, `updateItemValue()`

### Phase 3: State management
1. Create `lib/stores/inventoryStore.ts`:
   - State: `items[]`, `totalValue`, `selectedGame`
   - Actions: `addItem()`, `removeItem()`, `syncFromDB()`
2. Create `lib/stores/alertStore.ts`:
   - State: `rules[]`, `activeAlerts[]`
   - Actions: `createRule()`, `checkRules()`, `triggerAlert()`

### Phase 4: API integration (mocked)
1. Create `lib/api/gameApis.ts`:
   - Mock API clients for each game
   - Return hardcoded inventory data (10-15 items per game)
2. Create `lib/api/priceService.ts`:
   - `fetchItemPrice()`: Return random price ±20% of base value
   - `getPriceHistory()`: Generate 30-day mock data
   - `shouldBuyNow()`: Compare current price to 30-day average

### Phase 5: Core UI components
1. `components/InventoryCard.tsx`:
   - Display item image, name, rarity badge, current value
   - Tap to view price chart
2. `components/PriceChart.tsx`:
   - Victory Native line chart
   - Show 7-day, 30-day, 90-day views
3. `components/AlertRuleForm.tsx`:
   - Dropdown for game selection
   - Input for target price
   - Toggle for notification types

### Phase 6: Main screens
1. `app/(tabs)/index.tsx` (Dashboard):
   - Grid of InventoryCard components
   - Filter by game, rarity, value range
   - Pull-to-refresh to sync data
2. `app/(tabs)/alerts.tsx`:
   - List of active alert rules
   - FAB to create new rule
   - Swipe-to-delete
3. `app/(tabs)/insights.tsx`:
   - Victory Native pie chart (spending by game)
   - Monthly spending total
   - Budget progress bar
4. `app/game/[id].tsx`:
   - Filtered inventory for single game
   - Quick stats (total items, total value)

### Phase 7: Notifications
1. Create `lib/utils/notifications.ts`:
   - Request permissions on app launch
   - `scheduleAlertNotification()`: Schedule local notification
   - Background task to check alert rules every 15 minutes (premium) or 6 hours (free)
2. Integrate with `alertStore.checkRules()`:
   - Compare current prices to alert thresholds
   - Trigger notification if condition met

### Phase 8: Voice commands (basic)
1. Create `lib/utils/voice.ts`:
   - Parse simple commands: "show [game] inventory", "load [loadout name]"
   - Use Expo Speech for text-to-speech responses
2. Add microphone button to dashboard
3. Display voice command results in modal

### Phase 9: Testing
1. Write unit tests for stores (see Tests section)
2. Write integration tests for price service
3. Test notification scheduling
4. Run `npm test` to verify all pass

### Phase 10: Polish
1. Add loading states (skeleton screens)
2. Error handling for API failures
3. Onboarding flow (3 screens explaining core features)
4. Dark mode support
5. Haptic feedback on interactions

## How to verify it works

### Local testing
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Verify:
   - Dashboard loads with mock inventory items
   - Tapping item shows price chart
   - Creating alert rule saves to database
   - Pull-to-refresh updates item values
   - Insights screen shows spending breakdown
   - Voice command button responds to "show Fortnite inventory"

### Automated tests
1. Run test suite: `npm test`
2. Verify all tests pass:
   - inventoryStore adds/removes items correctly
   - priceService calculates recommendations
   - notifications schedule successfully

### Device-specific checks
- **iOS:** Test notification permissions prompt
- **Android:** Verify background sync works when app is closed
- **Both:** Confirm offline mode displays cached data

### Edge cases
- Disconnect internet → app should still show cached inventory
- Add 100+ items → scroll performance should remain smooth
- Set alert for item already below target price → notification triggers immediately