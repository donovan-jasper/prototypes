# FinFlow

## One-line pitch
Your money, unified — track spending, investments, and net worth in one beautiful, privacy-first dashboard.

## Expanded vision

**Core audience:** Young professionals (25-40) who manage multiple income streams, investments, and want financial clarity without sacrificing privacy.

**Broader appeal:**
- **Freelancers and gig workers** who need to track irregular income across platforms (Upwork, Uber, Etsy) and separate business vs personal expenses
- **Couples managing shared finances** who want transparency without linking bank accounts — manual entry keeps control local
- **Recent grads** starting their financial journey who want to build good habits before complexity sets in
- **Privacy-conscious users** burned by data breaches at Mint/Credit Karma who refuse to link bank credentials
- **International users** managing multi-currency finances (expats, remote workers, digital nomads)

**Adjacent use cases:**
- Tax prep — export categorized transactions for accountants
- Financial goal tracking — save for a house, pay off debt, build emergency fund
- Investment performance analysis — compare portfolio returns across asset classes
- Expense splitting — track shared costs with roommates/partners

**Non-technical appeal:** No jargon, no spreadsheets. Just open the app, add a transaction in 3 taps, and see your financial picture instantly. The privacy angle resonates with anyone who's heard horror stories about identity theft.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **Charts:** react-native-chart-kit
- **Navigation:** expo-router (file-based routing)
- **State:** React Context + AsyncStorage for settings
- **Camera:** expo-camera (receipt scanning)
- **Notifications:** expo-notifications
- **Testing:** Jest + React Native Testing Library
- **Type safety:** TypeScript

## Core features

1. **Unified dashboard** — Net worth at a glance (assets - liabilities), spending trends, investment performance. One screen shows everything.

2. **Quick transaction entry** — Add expenses in 3 taps: amount, category, done. Optional receipt photo via camera. No bank sync required.

3. **Portfolio tracking** — Manually add stocks, crypto, real estate. App fetches current prices (free tier: daily updates; premium: real-time). See total portfolio value and gains/losses.

4. **Smart insights** — "You spent 40% more on dining this month" or "Your portfolio is up 12% YTD." Actionable, not overwhelming.

5. **Privacy-first export** — Export all data as CSV/JSON. No cloud sync unless user opts in (premium feature). Data stays on device.

## Monetization strategy

**Free tier (hook):**
- Unlimited manual transactions
- Basic budgeting (5 categories)
- Portfolio tracking (up to 10 holdings)
- Daily price updates
- 30-day transaction history

**Premium ($7.99/month or $59.99/year — 37% savings):**
- Unlimited categories and budgets
- Unlimited portfolio holdings
- Real-time price updates
- Multi-currency support
- 5-year transaction history
- Advanced reports (spending by merchant, tax summaries)
- Cloud backup (encrypted, optional)
- Priority support

**Why this price?** Lower than YNAB ($14.99/mo) and Personal Capital's advisor fees, but premium enough to signal quality. Annual plan incentivizes commitment.

**Retention drivers:**
- Historical data lock-in (switching means losing years of financial history)
- Habit formation (daily check-ins become routine)
- Tax season value (export categorized transactions saves hours)
- Portfolio tracking becomes more valuable as holdings grow

## File structure

```
finflow/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard
│   │   ├── transactions.tsx       # Transaction list
│   │   ├── portfolio.tsx          # Investment tracking
│   │   └── insights.tsx           # Reports & insights
│   ├── add-transaction.tsx        # Modal for adding transactions
│   ├── add-holding.tsx            # Modal for adding investments
│   └── _layout.tsx
├── components/
│   ├── NetWorthCard.tsx
│   ├── SpendingChart.tsx
│   ├── PortfolioSummary.tsx
│   ├── TransactionItem.tsx
│   ├── CategoryPicker.tsx
│   └── InsightCard.tsx
├── lib/
│   ├── database.ts                # SQLite setup & queries
│   ├── types.ts                   # TypeScript interfaces
│   ├── calculations.ts            # Net worth, portfolio math
│   └── priceService.ts            # Fetch asset prices (mock for MVP)
├── hooks/
│   ├── useTransactions.ts
│   ├── usePortfolio.ts
│   └── useNetWorth.ts
├── constants/
│   └── Categories.ts              # Predefined expense categories
├── __tests__/
│   ├── calculations.test.ts
│   ├── database.test.ts
│   └── priceService.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

**__tests__/calculations.test.ts**
```typescript
import { calculateNetWorth, calculatePortfolioGains } from '../lib/calculations';

describe('Financial calculations', () => {
  test('calculates net worth correctly', () => {
    const assets = [
      { value: 10000, type: 'cash' },
      { value: 50000, type: 'investment' }
    ];
    const liabilities = [{ value: 20000, type: 'loan' }];
    expect(calculateNetWorth(assets, liabilities)).toBe(40000);
  });

  test('calculates portfolio gains', () => {
    const holdings = [
      { symbol: 'AAPL', shares: 10, costBasis: 150, currentPrice: 180 }
    ];
    const result = calculatePortfolioGains(holdings);
    expect(result.totalGain).toBe(300);
    expect(result.percentGain).toBeCloseTo(20, 1);
  });
});
```

**__tests__/database.test.ts**
```typescript
import { initDatabase, addTransaction, getTransactions } from '../lib/database';

describe('Database operations', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  test('adds and retrieves transactions', async () => {
    const transaction = {
      amount: 50.00,
      category: 'Food',
      date: new Date().toISOString(),
      type: 'expense'
    };
    
    await addTransaction(transaction);
    const transactions = await getTransactions();
    
    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions[0].amount).toBe(50.00);
  });
});
```

**__tests__/priceService.test.ts**
```typescript
import { fetchAssetPrice } from '../lib/priceService';

describe('Price service', () => {
  test('returns mock price for known symbol', async () => {
    const price = await fetchAssetPrice('AAPL');
    expect(price).toBeGreaterThan(0);
  });

  test('throws error for unknown symbol', async () => {
    await expect(fetchAssetPrice('INVALID')).rejects.toThrow();
  });
});
```

## Implementation steps

1. **Initialize Expo project**
   ```bash
   npx create-expo-app finflow --template tabs
   cd finflow
   npx expo install expo-sqlite expo-camera expo-notifications react-native-chart-kit
   npm install --save-dev jest @testing-library/react-native @types/jest
   ```

2. **Set up TypeScript types** (`lib/types.ts`)
   - Define interfaces: `Transaction`, `Holding`, `Asset`, `Liability`, `Category`
   - Export enums for transaction types and asset classes

3. **Initialize SQLite database** (`lib/database.ts`)
   - Create tables: `transactions`, `holdings`, `assets`, `liabilities`
   - Write CRUD functions: `addTransaction`, `getTransactions`, `updateTransaction`, `deleteTransaction`
   - Similar functions for holdings, assets, liabilities
   - Add indexes on `date` and `category` columns for performance

4. **Build calculation utilities** (`lib/calculations.ts`)
   - `calculateNetWorth(assets, liabilities)` → total net worth
   - `calculatePortfolioGains(holdings)` → total gain/loss and percentage
   - `calculateMonthlySpending(transactions, month)` → spending by category
   - `calculateBudgetProgress(transactions, budgets)` → % of budget used

5. **Create mock price service** (`lib/priceService.ts`)
   - `fetchAssetPrice(symbol)` → returns hardcoded prices for MVP (AAPL: 180, BTC: 65000, etc.)
   - Add comment: "Replace with real API (Alpha Vantage, CoinGecko) in production"

6. **Build dashboard screen** (`app/(tabs)/index.tsx`)
   - Display `NetWorthCard` at top (total assets - liabilities)
   - Show `SpendingChart` (last 30 days, grouped by category)
   - Show `PortfolioSummary` (total value, today's gain/loss)
   - Add FAB (floating action button) to open `add-transaction` modal

7. **Build transaction list** (`app/(tabs)/transactions.tsx`)
   - FlatList of `TransactionItem` components
   - Group by date, show category icon and amount
   - Swipe to delete (use react-native-gesture-handler)
   - Pull to refresh

8. **Build add transaction modal** (`app/add-transaction.tsx`)
   - Amount input (numeric keyboard)
   - `CategoryPicker` component (grid of icons)
   - Optional note field
   - Optional camera button to attach receipt photo
   - Save button calls `addTransaction` and dismisses modal

9. **Build portfolio screen** (`app/(tabs)/portfolio.tsx`)
   - List of holdings with current value and gain/loss
   - Total portfolio value at top
   - FAB to open `add-holding` modal
   - Tap holding to see details (shares, cost basis, current price)

10. **Build add holding modal** (`app/add-holding.tsx`)
    - Symbol input (text, uppercase)
    - Shares input (numeric)
    - Cost basis input (price per share)
    - Asset type picker (stock, crypto, real estate, other)
    - Save button calls `addHolding`, fetches current price, dismisses modal

11. **Build insights screen** (`app/(tabs)/insights.tsx`)
    - Show 3-5 `InsightCard` components with key metrics:
      - "You spent $X this month (Y% more than last month)"
      - "Your top spending category is Z"
      - "Your portfolio is up X% this year"
    - Add "Upgrade to Premium" card if free tier

12. **Implement custom hooks**
    - `useTransactions()` → loads transactions from DB, provides add/update/delete functions
    - `usePortfolio()` → loads holdings, fetches prices, calculates totals
    - `useNetWorth()` → combines assets and liabilities, returns net worth

13. **Add chart components** (`components/SpendingChart.tsx`)
    - Use `react-native-chart-kit` BarChart
    - X-axis: last 7 days
    - Y-axis: total spending per day
    - Color code by category

14. **Implement category system** (`constants/Categories.ts`)
    - Export array of categories with name, icon (emoji), and color
    - Default categories: Food, Transport, Shopping, Bills, Entertainment, Health, Other

15. **Add notifications** (optional for MVP, but easy win)
    - Daily reminder at 9 PM: "Don't forget to log today's expenses"
    - Budget alert: "You've spent 80% of your Food budget this month"

16. **Write tests** (see Tests section above)
    - Run `npm test` to verify all tests pass

17. **Polish UI**
    - Use consistent spacing (8px grid)
    - Add loading states (ActivityIndicator while fetching prices)
    - Add empty states ("No transactions yet — tap + to add one")
    - Ensure dark mode support (use Expo's `useColorScheme`)

18. **Add premium paywall** (mock for MVP)
    - Create `PremiumModal.tsx` component
    - Show when user tries to access premium features (multi-currency, advanced reports)
    - Display pricing, benefits, and "Upgrade" button (no actual payment for MVP)

## How to verify it works

1. **Start Expo dev server:**
   ```bash
   npx expo start
   ```

2. **Test on device/simulator:**
   - Scan QR code with Expo Go (iOS/Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

3. **Verify core flows:**
   - Dashboard loads with $0 net worth (empty state)
   - Tap + button, add a transaction (e.g., $50 for Food)
   - Transaction appears in list, dashboard updates
   - Go to Portfolio tab, add a holding (e.g., 10 shares of AAPL at $150)
   - Portfolio shows current value (10 × $180 = $1,800) and gain ($300)
   - Dashboard net worth updates to include portfolio value
   - Go to Insights tab, see spending summary

4. **Run tests:**
   ```bash
   npm test
   ```
   All tests must pass (calculations, database CRUD, price service).

5. **Test edge cases:**
   - Add transaction with $0 amount (should be rejected)
   - Add holding with invalid symbol (should show error)
   - Delete transaction (swipe left on transaction item)
   - Rotate device (UI should adapt)

6. **Performance check:**
   - Add 100+ transactions (use loop in dev tools)
   - Scroll transaction list (should be smooth, 60fps)
   - Dashboard should load in <500ms