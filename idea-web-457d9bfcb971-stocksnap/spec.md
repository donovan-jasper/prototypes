# FinchApp

## One-line pitch
Learn investing through bite-sized lessons and real-time market insights—no jargon, just confidence.

## Expanded vision

### Who is this REALLY for?
This isn't just for retirees and beginners. It's for:
- **Parents teaching teens about money** — gamified lessons make financial literacy a family activity
- **Side hustlers and gig workers** — people with irregular income who want to invest small amounts consistently
- **International users in emerging markets** — simplified English + visual learning transcends language barriers
- **People intimidated by "finance bros"** — a judgment-free space to ask basic questions
- **Casual savers ready to graduate from savings accounts** — the bridge between banking apps and trading platforms

### Adjacent use cases
- **Personal finance education hub** — not just stocks, but ETFs, bonds, crypto basics, retirement accounts
- **Social learning** — anonymous Q&A where beginners help each other without embarrassment
- **Micro-investing integration** — partner with platforms like Acorns or Stash for one-tap investing after learning
- **Company culture research** — HR professionals and job seekers researching employer stability through stock performance

### Why non-technical people want this
Because every other app assumes you know what P/E ratio means. FinchApp explains it like a friend would, with analogies, visuals, and zero condescension. It's Duolingo for investing—progress feels like a game, not homework.

## Tech stack
- **React Native (Expo SDK 52+)** — cross-platform iOS/Android
- **TypeScript** — type safety for financial data
- **SQLite (expo-sqlite)** — local storage for watchlists, lesson progress, offline access
- **React Navigation** — tab + stack navigation
- **Zustand** — lightweight state management
- **Axios** — API calls to financial data providers
- **Jest + React Native Testing Library** — unit and integration tests
- **Expo Notifications** — push alerts for price changes
- **Victory Native** — charts for stock performance visualization

## Core features (MVP)

1. **Learn Mode** — 5-minute interactive lessons on investing basics (stocks, dividends, risk). Progress tracked locally. Unlock badges for completing modules.

2. **Stock Lookup** — Search any ticker, see simplified metrics (price, 52-week range, what the company does in plain English). Save to watchlist.

3. **Plain English Insights** — AI-generated summaries of earnings reports, news, and analyst ratings translated into beginner-friendly language.

4. **Price Alerts** — Set custom notifications for stocks in your watchlist (e.g., "Tell me if Apple drops below $150").

5. **Daily Digest** — Morning push notification with 3 market highlights explained simply (e.g., "Why tech stocks fell yesterday").

## Monetization strategy

### Free tier (the hook)
- 10 Learn Mode lessons
- Search up to 5 stocks per day
- Basic price alerts (1 per stock)
- Daily digest (text only)

### Premium ($7.99/month or $59.99/year)
**Why this price?** Lower than Robinhood Gold ($5/mo) but positioned as educational, not trading. Annual discount encourages commitment to learning.

**Premium unlocks:**
- Unlimited stock searches
- Full Learn Mode library (50+ lessons)
- Advanced alerts (% change, volume spikes, earnings dates)
- Audio summaries of daily digest (listen while commuting)
- Compare up to 5 stocks side-by-side
- Export watchlist data to CSV
- Ad-free experience

**Retention drivers:**
- Streak tracking for daily logins (gamification)
- Personalized lesson recommendations based on watchlist
- Early access to new features
- Monthly "office hours" webinar with financial educators

### Additional revenue (future)
- Affiliate partnerships with brokerages (earn commission when users open accounts)
- Sponsored educational content from ETF providers

## File structure

```
finch-app/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Learn Mode
│   │   ├── search.tsx             # Stock Lookup
│   │   ├── watchlist.tsx          # Saved stocks
│   │   └── profile.tsx            # Settings, subscription
│   ├── stock/[symbol].tsx         # Stock detail screen
│   ├── lesson/[id].tsx            # Individual lesson
│   └── _layout.tsx
├── components/
│   ├── StockCard.tsx
│   ├── LessonCard.tsx
│   ├── PriceChart.tsx
│   ├── AlertSetup.tsx
│   └── SubscriptionPrompt.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── api.ts                     # Financial data API client
│   ├── notifications.ts           # Push notification logic
│   └── storage.ts                 # AsyncStorage helpers
├── store/
│   ├── useUserStore.ts            # User state (subscription, progress)
│   ├── useWatchlistStore.ts       # Watchlist management
│   └── useLessonsStore.ts         # Lesson progress
├── types/
│   ├── stock.ts
│   ├── lesson.ts
│   └── user.ts
├── constants/
│   ├── lessons.ts                 # Hardcoded lesson content
│   └── Colors.ts
├── __tests__/
│   ├── database.test.ts
│   ├── api.test.ts
│   ├── useWatchlistStore.test.ts
│   ├── StockCard.test.tsx
│   └── notifications.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/database.test.ts`
```typescript
import { openDatabase, addToWatchlist, getWatchlist, removeFromWatchlist } from '../lib/database';

describe('Database operations', () => {
  beforeEach(async () => {
    const db = await openDatabase();
    await db.execAsync('DELETE FROM watchlist');
  });

  it('should add stock to watchlist', async () => {
    await addToWatchlist('AAPL', 'Apple Inc.');
    const watchlist = await getWatchlist();
    expect(watchlist).toHaveLength(1);
    expect(watchlist[0].symbol).toBe('AAPL');
  });

  it('should remove stock from watchlist', async () => {
    await addToWatchlist('AAPL', 'Apple Inc.');
    await removeFromWatchlist('AAPL');
    const watchlist = await getWatchlist();
    expect(watchlist).toHaveLength(0);
  });
});
```

### `__tests__/api.test.ts`
```typescript
import { fetchStockData, searchStocks } from '../lib/api';

describe('API client', () => {
  it('should fetch stock data for valid symbol', async () => {
    const data = await fetchStockData('AAPL');
    expect(data).toHaveProperty('symbol');
    expect(data).toHaveProperty('price');
    expect(data).toHaveProperty('companyName');
  });

  it('should return search results', async () => {
    const results = await searchStocks('Apple');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });
});
```

### `__tests__/useWatchlistStore.test.ts`
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useWatchlistStore } from '../store/useWatchlistStore';

describe('Watchlist store', () => {
  it('should add and remove stocks', () => {
    const { result } = renderHook(() => useWatchlistStore());

    act(() => {
      result.current.addStock({ symbol: 'AAPL', name: 'Apple Inc.', price: 150 });
    });

    expect(result.current.stocks).toHaveLength(1);

    act(() => {
      result.current.removeStock('AAPL');
    });

    expect(result.current.stocks).toHaveLength(0);
  });
});
```

### `__tests__/StockCard.test.tsx`
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import StockCard from '../components/StockCard';

describe('StockCard component', () => {
  it('should render stock information', () => {
    const { getByText } = render(
      <StockCard symbol="AAPL" name="Apple Inc." price={150.25} change={2.5} />
    );

    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('$150.25')).toBeTruthy();
  });
});
```

### `__tests__/notifications.test.ts`
```typescript
import { scheduleAlert, cancelAlert } from '../lib/notifications';

describe('Notification system', () => {
  it('should schedule price alert', async () => {
    const notificationId = await scheduleAlert('AAPL', 150, 'below');
    expect(notificationId).toBeDefined();
  });

  it('should cancel scheduled alert', async () => {
    const notificationId = await scheduleAlert('AAPL', 150, 'below');
    await cancelAlert(notificationId);
    // Verify cancellation (implementation-specific)
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest finch-app --template tabs
cd finch-app
npm install zustand axios expo-sqlite victory-native @react-navigation/native
npm install -D jest @testing-library/react-native @testing-library/react-hooks @types/jest
```

### 2. Configure TypeScript and Jest
- Update `tsconfig.json` with strict mode
- Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
```

### 3. Database setup (`lib/database.ts`)
- Initialize SQLite with `expo-sqlite`
- Create tables: `watchlist` (symbol, name, added_at), `lesson_progress` (lesson_id, completed, score), `alerts` (id, symbol, target_price, condition)
- Export functions: `openDatabase()`, `addToWatchlist()`, `getWatchlist()`, `removeFromWatchlist()`, `saveLessonProgress()`, `getLessonProgress()`

### 4. API client (`lib/api.ts`)
- Use free tier of Alpha Vantage or Finnhub API for stock data
- Implement `fetchStockData(symbol)` — returns price, change, company name, description
- Implement `searchStocks(query)` — returns array of matching symbols
- Implement `fetchNews(symbol)` — returns recent news articles
- Add error handling and rate limiting logic

### 5. State management (Zustand stores)
- `useUserStore.ts` — subscription status, free tier limits (searches remaining), lesson streak
- `useWatchlistStore.ts` — syncs with SQLite, manages in-memory watchlist
- `useLessonsStore.ts` — tracks completed lessons, current module

### 6. Lesson content (`constants/lessons.ts`)
- Hardcode 10 free lessons as JSON objects: `{ id, title, content, quiz: [{ question, options, correctAnswer }] }`
- Topics: What is a stock?, Reading stock prices, Dividends explained, Risk vs reward, ETFs vs individual stocks
- Each lesson 300-500 words, 3 quiz questions

### 7. Core screens

**`app/(tabs)/index.tsx` (Learn Mode)**
- Display lesson cards with progress indicators
- Lock premium lessons with `<SubscriptionPrompt />`
- Track completion in SQLite

**`app/(tabs)/search.tsx` (Stock Lookup)**
- Search bar with debounced API calls
- Show free tier limit (5/5 searches today)
- Display results as `<StockCard />` components
- Navigate to `app/stock/[symbol].tsx` on tap

**`app/(tabs)/watchlist.tsx`**
- Load from SQLite on mount
- Swipe-to-delete functionality
- Pull-to-refresh for price updates
- Empty state: "Add stocks from Search"

**`app/(tabs)/profile.tsx`**
- Show subscription status
- Manage alerts
- Settings: notification preferences, theme toggle
- Subscription upgrade CTA

**`app/stock/[symbol].tsx`**
- Fetch detailed data via API
- Display `<PriceChart />` (Victory Native line chart)
- Plain English summary section
- "Add to Watchlist" button
- `<AlertSetup />` component for premium users

**`app/lesson/[id].tsx`**
- Render lesson content with scroll view
- Quiz at the end (multiple choice)
- Save progress to SQLite on completion
- Unlock next lesson

### 8. Components

**`StockCard.tsx`**
- Props: symbol, name, price, change (%)
- Color-coded change (green/red)
- Tap navigates to detail screen

**`LessonCard.tsx`**
- Props: lesson object, isLocked
- Show lock icon for premium lessons
- Progress bar for completed lessons

**`PriceChart.tsx`**
- Use Victory Native `<VictoryLine />`
- Props: historical data array
- 1D, 1W, 1M, 1Y toggle buttons

**`AlertSetup.tsx`**
- Input for target price
- Dropdown: "above" or "below"
- Save to SQLite, schedule notification

**`SubscriptionPrompt.tsx`**
- Modal with benefits list
- "Start Free Trial" button (links to in-app purchase)
- "Maybe Later" dismiss option

### 9. Notifications (`lib/notifications.ts`)
- Request permissions on app launch
- `scheduleAlert(symbol, targetPrice, condition)` — creates notification trigger
- `cancelAlert(id)` — removes scheduled notification
- Background task to check prices every 15 minutes (Expo TaskManager)

### 10. Subscription logic
- Use Expo's `expo-in-app-purchases` (or RevenueCat for easier management)
- Store subscription status in `useUserStore`
- Check status on app launch
- Gate premium features with conditional rendering

### 11. Styling
- Use Expo's default theme system
- Create `constants/Colors.ts` with light/dark mode palettes
- Consistent spacing (8px grid system)
- Accessible font sizes (minimum 16px body text)

### 12. Testing
- Write tests for each store (Zustand)
- Test database CRUD operations
- Mock API responses in tests
- Test component rendering with React Native Testing Library
- Run `npm test` to verify all pass

### 13. Polish
- Add loading states (skeletons for stock cards)
- Error boundaries for API failures
- Offline mode messaging
- Haptic feedback on interactions
- Smooth animations (LayoutAnimation for list updates)

### 14. App Store prep
- Update `app.json`: name, slug, icon, splash screen
- Generate app icons (1024x1024 source)
- Write App Store description emphasizing simplicity
- Screenshots showing Learn Mode and Stock Lookup
- Privacy policy (required for financial apps)

## How to verify it works

### Local development
```bash
npm install
npm test  # All Jest tests must pass
npx expo start
```

### On device (Expo Go)
1. Scan QR code with Expo Go app
2. Test Learn Mode: Complete a lesson, verify progress saves after app restart
3. Test Stock Lookup: Search "Apple", tap result, verify detail screen loads
4. Test Watchlist: Add 3 stocks, close app, reopen, verify they persist
5. Test Alerts: Set price alert (premium feature), verify notification appears when condition met
6. Test free tier limits: Perform 6 searches, verify paywall appears on 6th

### Simulator testing
```bash
npx expo run:ios  # or run:android
```

### Acceptance criteria
- [ ] All `npm test` suites pass
- [ ] App launches without crashes on iOS and Android
- [ ] Lesson progress persists across sessions
- [ ] Stock search returns results within 2 seconds
- [ ] Watchlist updates reflect in UI immediately
- [ ] Price alerts trigger notifications correctly
- [ ] Subscription prompt appears when accessing premium features
- [ ] Offline mode shows cached watchlist data
- [ ] No console errors or warnings in production build