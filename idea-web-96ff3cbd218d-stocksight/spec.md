# MarketPulse

## One-line pitch
Your pocket analyst — get personalized market insights, smart alerts, and social sentiment analysis before the crowd reacts.

## Expanded vision

**Core audience:** Anyone who wants to make smarter money decisions without becoming a full-time trader.

**Broadest reach:**
- **Casual investors** who check their portfolio once a week and want to know "should I be worried?"
- **Side hustlers** tracking stocks related to their industry (e.g., freelance designers watching Adobe, Figma valuations)
- **Parents** managing 529 college funds or retirement accounts who need plain-English explanations
- **Small business owners** monitoring competitor stock performance and industry trends
- **Students** learning to invest with paper trading and educational content
- **Crypto-curious** folks who want traditional + digital asset tracking in one place

**Adjacent use cases:**
- Social proof investing — see what your network is watching (anonymized sentiment, not positions)
- News-to-action pipeline — "Tesla dropped 5%, here's why and what similar stocks are doing"
- Earnings calendar with plain-language summaries — no more parsing dense reports
- Sector rotation alerts — "Tech is cooling, healthcare is heating up"
- Macro event tracking — Fed meetings, inflation reports, geopolitical events with impact scores

**Why non-technical people want this:**
Most finance apps assume you know what P/E ratios and RSI mean. MarketPulse translates Wall Street into human language, shows you what matters for YOUR goals, and gives you confidence to act (or not act) based on real data, not FOMO.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **State management:** Zustand (lightweight, no boilerplate)
- **API client:** Axios
- **Charts:** react-native-gifted-charts (native performance)
- **Notifications:** expo-notifications
- **Auth:** expo-auth-session (OAuth for social features)
- **Testing:** Jest + React Native Testing Library

**External APIs:**
- Alpha Vantage (free tier: 25 calls/day, premium: $50/mo for real-time)
- News API (free tier: 100 calls/day)
- Sentiment analysis: Custom lightweight model or Hugging Face Inference API

## Core features (MVP)

1. **Smart Watchlist**
   - Add stocks/ETFs with one tap
   - AI-generated daily summary: "Your watchlist is up 2.3% today. AAPL drove most gains."
   - Price alerts with context (not just "TSLA hit $200" but "TSLA hit $200, down 15% this month")

2. **Personalized News Feed**
   - Onboarding quiz: risk tolerance, interests, goals
   - Feed shows only news relevant to YOUR watchlist + sector trends
   - Sentiment badges (bullish/bearish/neutral) on every headline
   - Swipe to dismiss, long-press to "explain like I'm 5"

3. **Social Sentiment Pulse**
   - Anonymized heatmap: "32% of MarketPulse users are watching NVDA this week"
   - Trending tickers in your network (opt-in feature)
   - No positions shared, just interest levels

4. **Plain-English Insights**
   - Daily market summary in 3 sentences
   - "Why did X happen?" explainer cards
   - Glossary tooltips on financial terms

5. **Portfolio Sync (Premium)**
   - Connect brokerage via Plaid
   - Real-time P&L tracking
   - Tax-loss harvesting suggestions
   - Rebalancing alerts

## Monetization strategy

**Free tier (hook):**
- 5-stock watchlist
- Daily market summary
- Basic news feed (24-hour delay)
- Social sentiment for top 50 stocks only
- Ads (non-intrusive banner at bottom)

**Premium tier: $7.99/month or $69.99/year** (cheaper than Bloomberg, more valuable than Yahoo Finance)

**Paywall triggers:**
- Unlimited watchlist
- Real-time news (no delay)
- Portfolio sync with live P&L
- Advanced alerts (e.g., "unusual volume detected")
- Sector rotation insights
- Ad-free experience
- Export reports (PDF summaries for tax season)

**Why people stay subscribed:**
- Habit formation: daily push notification with personalized insight becomes part of morning routine
- FOMO prevention: "I saved $500 by selling before earnings miss" stories in community
- Tax season value: one-click export of gains/losses pays for itself
- Social proof: seeing what's trending in your network creates stickiness

**Pricing reasoning:**
- Below $10/month psychological barrier
- Annual plan = 27% discount (industry standard)
- Cheaper than one bad trade from lack of information

## File structure

```
marketpulse/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Watchlist screen
│   │   ├── feed.tsx               # News feed
│   │   ├── pulse.tsx              # Social sentiment
│   │   ├── insights.tsx           # Daily insights
│   │   └── profile.tsx            # Settings/premium
│   ├── _layout.tsx                # Root layout with tabs
│   ├── onboarding.tsx             # First-run experience
│   ├── stock/[symbol].tsx         # Stock detail screen
│   └── paywall.tsx                # Premium upsell
├── components/
│   ├── StockCard.tsx              # Watchlist item
│   ├── NewsCard.tsx               # News article card
│   ├── SentimentBadge.tsx         # Bullish/bearish indicator
│   ├── InsightCard.tsx            # Daily insight component
│   ├── PriceChart.tsx             # Mini chart component
│   └── PremiumBanner.tsx          # Upsell component
├── services/
│   ├── api.ts                     # API client setup
│   ├── stocks.ts                  # Stock data fetching
│   ├── news.ts                    # News fetching
│   ├── sentiment.ts               # Sentiment analysis
│   └── notifications.ts           # Push notification logic
├── store/
│   ├── watchlistStore.ts          # Zustand store for watchlist
│   ├── userStore.ts               # User preferences/premium status
│   └── feedStore.ts               # News feed state
├── utils/
│   ├── database.ts                # SQLite setup
│   ├── formatters.ts              # Price/date formatting
│   └── explainers.ts              # Plain-English generators
├── constants/
│   └── config.ts                  # API keys, limits
├── __tests__/
│   ├── services/
│   │   ├── stocks.test.ts
│   │   ├── sentiment.test.ts
│   │   └── news.test.ts
│   ├── store/
│   │   └── watchlistStore.test.ts
│   └── utils/
│       ├── formatters.test.ts
│       └── explainers.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**Core test coverage:**

1. **Stock service tests** (`__tests__/services/stocks.test.ts`)
   - Fetch stock price
   - Handle API errors
   - Cache responses

2. **Sentiment analysis tests** (`__tests__/services/sentiment.test.ts`)
   - Parse news headlines
   - Calculate sentiment score
   - Handle edge cases (neutral, mixed signals)

3. **Watchlist store tests** (`__tests__/store/watchlistStore.test.ts`)
   - Add/remove stocks
   - Persist to SQLite
   - Enforce free tier limits

4. **Formatter tests** (`__tests__/utils/formatters.test.ts`)
   - Format currency (handle negatives, large numbers)
   - Format percentages
   - Relative time ("2 hours ago")

5. **Explainer tests** (`__tests__/utils/explainers.test.ts`)
   - Generate plain-English summaries
   - Handle missing data gracefully

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app marketpulse --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-notifications expo-auth-session zustand axios
   npm install react-native-gifted-charts react-native-svg
   npm install -D jest @testing-library/react-native @types/jest
   ```
3. Configure `app.json` with app name, bundle ID, notification permissions
4. Set up TypeScript strict mode in `tsconfig.json`
5. Create `jest.config.js` for React Native

### Phase 2: Database layer
1. Create `utils/database.ts`:
   - Initialize SQLite database
   - Create tables: `watchlist`, `user_preferences`, `cached_prices`
   - Export CRUD functions
2. Write tests for database operations
3. Add migration logic for schema updates

### Phase 3: API services
1. Create `services/api.ts`:
   - Axios instance with base config
   - Request/response interceptors
   - Error handling
2. Create `services/stocks.ts`:
   - `fetchStockPrice(symbol)` using Alpha Vantage
   - `fetchStockDetails(symbol)` for company info
   - Cache responses in SQLite (5-minute TTL)
3. Create `services/news.ts`:
   - `fetchNewsForSymbol(symbol)` using News API
   - Filter by relevance score
4. Create `services/sentiment.ts`:
   - `analyzeSentiment(headline)` using keyword matching (MVP: simple positive/negative word lists)
   - Return score -1 to 1
5. Write tests for all service functions

### Phase 4: State management
1. Create `store/watchlistStore.ts`:
   - `stocks` array
   - `addStock(symbol)`, `removeStock(symbol)`
   - `loadFromDB()`, `saveToDB()`
   - Free tier: max 5 stocks
2. Create `store/userStore.ts`:
   - `isPremium` boolean
   - `preferences` object (risk tolerance, interests)
   - `setPreferences()`
3. Create `store/feedStore.ts`:
   - `articles` array
   - `fetchFeed()`, `dismissArticle(id)`
4. Write tests for store logic

### Phase 5: UI components
1. Create `components/StockCard.tsx`:
   - Display symbol, price, change %
   - Color-coded (green/red)
   - Tap to navigate to detail screen
2. Create `components/NewsCard.tsx`:
   - Headline, source, timestamp
   - Sentiment badge
   - Swipe-to-dismiss gesture
3. Create `components/SentimentBadge.tsx`:
   - Pill-shaped badge (bullish=green, bearish=red, neutral=gray)
4. Create `components/InsightCard.tsx`:
   - Card with icon, title, body text
   - "Explain more" button
5. Create `components/PriceChart.tsx`:
   - Line chart using react-native-gifted-charts
   - 1D/1W/1M/1Y toggles

### Phase 6: Screens
1. Update `app/(tabs)/index.tsx` (Watchlist):
   - Load watchlist from store on mount
   - FlatList of StockCard components
   - "Add stock" button (search modal)
   - Pull-to-refresh
2. Create `app/(tabs)/feed.tsx` (News Feed):
   - Load news for watchlist stocks
   - FlatList of NewsCard components
   - Filter by sentiment (tabs: All/Bullish/Bearish)
3. Create `app/(tabs)/pulse.tsx` (Social Sentiment):
   - Heatmap of trending stocks
   - "X% of users watching" labels
   - Tap to add to watchlist
4. Create `app/(tabs)/insights.tsx` (Daily Insights):
   - Daily summary card at top
   - List of InsightCard components
   - "Why did this happen?" explainers
5. Create `app/(tabs)/profile.tsx` (Settings):
   - Premium status banner
   - Preferences form
   - Logout button
6. Create `app/onboarding.tsx`:
   - 3-screen flow: Welcome → Preferences → Add first stock
   - Skip button
7. Create `app/stock/[symbol].tsx` (Stock Detail):
   - Price chart
   - Company info
   - Related news
   - Add/remove from watchlist button
8. Create `app/paywall.tsx`:
   - Feature comparison table
   - "Upgrade to Premium" button
   - Restore purchases button

### Phase 7: Notifications
1. Create `services/notifications.ts`:
   - Request permissions on first launch
   - `scheduleAlert(symbol, targetPrice)`
   - `sendDailySummary()` (scheduled for 8am local time)
2. Add notification handlers in `app/_layout.tsx`
3. Test on device (notifications don't work in simulator)

### Phase 8: Premium features
1. Add Plaid integration (mock for MVP):
   - `services/plaid.ts` with stub functions
   - Portfolio sync screen (premium only)
2. Add paywall checks:
   - Wrap premium features with `userStore.isPremium` check
   - Show `PremiumBanner` when limit reached
3. Add in-app purchase logic (Expo's expo-in-app-purchases):
   - Product IDs for monthly/annual
   - Purchase flow
   - Receipt validation

### Phase 9: Polish
1. Add loading states (skeletons)
2. Add error boundaries
3. Add empty states ("Add your first stock")
4. Add haptic feedback on interactions
5. Optimize images (use WebP)
6. Add app icon and splash screen
7. Test on both iOS and Android

### Phase 10: Testing & QA
1. Run `npm test` — all tests must pass
2. Test on Expo Go (iOS + Android)
3. Test offline behavior (cached data)
4. Test free tier limits (try adding 6th stock)
5. Test notifications (price alerts, daily summary)
6. Test deep linking (stock detail from notification)

## How to verify it works

### Local development
1. Install dependencies: `npm install`
2. Start Expo: `npx expo start`
3. Scan QR code with Expo Go app (iOS/Android)
4. Verify:
   - Onboarding flow completes
   - Can add stocks to watchlist (up to 5 on free tier)
   - News feed loads articles
   - Sentiment badges appear
   - Daily insight card shows summary
   - Stock detail screen shows chart
   - Notifications permission requested
   - Premium banner appears when trying to add 6th stock

### Automated tests
1. Run tests: `npm test`
2. All test suites must pass:
   - Stock service fetches data
   - Sentiment analysis returns scores
   - Watchlist store enforces limits
   - Formatters handle edge cases
   - Explainers generate text

### Device testing
1. Test on physical device (notifications require real device)
2. Enable push notifications
3. Add a stock with price alert
4. Wait for alert to trigger (or manually trigger via dev tools)
5. Verify notification appears with correct content

### Production readiness checklist
- [ ] All tests passing
- [ ] No console errors in Expo Go
- [ ] App works offline (shows cached data)
- [ ] Free tier limits enforced
- [ ] Premium paywall appears correctly
- [ ] Notifications work on device
- [ ] App icon and splash screen configured
- [ ] Privacy policy and terms of service added (required for App Store)