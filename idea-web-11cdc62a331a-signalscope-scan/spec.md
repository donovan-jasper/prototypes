# SignalShift

## One-line pitch
Know before you go — see which carrier actually works where you're headed, backed by real user data.

## Expanded vision

**Who is this REALLY for?**

This isn't just for tech nerds checking signal bars. It's for:

- **Parents** who need reliable connectivity for emergencies when their kids are at school/practice
- **Small business owners** who can't afford dropped calls with clients
- **Anyone moving to a new city** who needs to pick a carrier before signing a 2-year contract
- **Travelers** who want to know if their carrier will work at their Airbnb before they arrive
- **Remote workers** who need backup connectivity options when their home internet fails
- **Real estate agents** who can answer "does Verizon work here?" for prospective buyers
- **Event organizers** checking if a venue has adequate coverage for attendees

**Adjacent use cases:**

- Crowdsourced dead zone mapping that helps carriers improve infrastructure
- Emergency preparedness — knowing which carrier works during disasters
- Travel planning — routing road trips through areas with good coverage
- Workplace productivity — finding the best spot in your office for calls
- Dating app users who want to verify their date's "bad signal" excuse

**Why non-technical people want this:**

Because "Can you hear me now?" shouldn't be a gamble. This turns an invisible, frustrating problem (bad cell service) into something you can see, predict, and fix before it ruins your day.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **Maps:** react-native-maps
- **Location:** expo-location
- **Network info:** @react-native-community/netinfo
- **Charts:** react-native-chart-kit
- **State:** React Context API (no Redux for MVP)
- **Testing:** Jest + React Native Testing Library
- **Backend (future):** Supabase for crowdsourced data sync

## Core features

1. **Live Signal Dashboard**
   - Real-time display of signal strength, network type (5G/LTE/3G), latency, and download/upload speeds
   - Color-coded health score (green/yellow/red)
   - Works offline with cached data

2. **Location History Map**
   - Pin-drop map showing signal quality at every location you've visited
   - Heat map overlay showing coverage patterns
   - Tap any pin to see historical performance at that spot

3. **Carrier Comparison Tool** (Premium)
   - Crowdsourced data showing which carriers perform best in your area
   - "Switch Savings Calculator" — see if switching carriers would improve your experience
   - Neighborhood rankings by carrier

4. **Smart Alerts**
   - Notify when entering a known dead zone
   - Alert when signal drops below usable threshold
   - Suggest nearby locations with better coverage

5. **Speed Test History**
   - One-tap speed tests with historical tracking
   - Compare your speeds to area averages
   - Export reports for carrier disputes

## Monetization strategy

**Free tier (the hook):**
- Live signal dashboard
- Basic location history (last 7 days, up to 50 locations)
- Manual speed tests (3 per day)
- Personal data only

**Premium ($3.99/month or $29.99/year — reasoning below):**
- Unlimited location history
- Carrier comparison with crowdsourced data
- Unlimited speed tests
- Smart alerts and notifications
- Export reports (PDF/CSV)
- Offline maps with cached coverage data
- Priority support

**Price reasoning:**
- Higher than $2.99 because this solves a $50-100/month problem (your phone bill)
- Annual plan offers 37% savings to encourage long-term retention
- Comparable to weather apps ($3-5/month) which solve a similar "environmental awareness" need

**Retention drivers:**
- Historical data becomes more valuable over time (sunk cost)
- Crowdsourced data improves with more users (network effect)
- Alerts become habit-forming ("I need to check before I drive there")
- Annual billing reduces churn friction

**Why people STAY subscribed:**
- You check it before traveling, moving, or switching carriers (quarterly use case)
- Alerts save you from frustration multiple times per month
- Historical data proves its value when disputing carrier bills
- Sharing coverage reports with friends/family creates social proof

## File structure

```
signalshift/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard
│   │   ├── map.tsx                # Location history map
│   │   ├── compare.tsx            # Carrier comparison (premium)
│   │   └── settings.tsx           # Settings & subscription
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── SignalMeter.tsx            # Live signal display
│   ├── SpeedTest.tsx              # Speed test component
│   ├── CoverageMap.tsx            # Map with pins
│   ├── CarrierCard.tsx            # Carrier comparison card
│   ├── AlertBanner.tsx            # Smart alert display
│   └── PremiumGate.tsx            # Paywall component
├── services/
│   ├── database.ts                # SQLite setup & queries
│   ├── location.ts                # Location tracking
│   ├── network.ts                 # Network info collection
│   ├── speedtest.ts               # Speed test logic
│   └── subscription.ts            # Premium status check
├── hooks/
│   ├── useSignalData.ts           # Real-time signal hook
│   ├── useLocationHistory.ts      # Location history hook
│   └── usePremium.ts              # Premium status hook
├── utils/
│   ├── signalCalculator.ts        # Signal strength algorithms
│   ├── carrierDetector.ts         # Carrier identification
│   └── constants.ts               # App constants
├── types/
│   └── index.ts                   # TypeScript types
├── __tests__/
│   ├── signalCalculator.test.ts
│   ├── carrierDetector.test.ts
│   ├── database.test.ts
│   └── components/
│       ├── SignalMeter.test.tsx
│       └── SpeedTest.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/signalCalculator.test.ts
// __tests__/carrierDetector.test.ts
// __tests__/database.test.ts
// __tests__/components/SignalMeter.test.tsx
// __tests__/components/SpeedTest.test.tsx
```

Each test file validates:
- Signal strength calculation accuracy
- Carrier detection from network info
- Database CRUD operations
- Component rendering and user interactions
- Speed test result parsing

## Implementation steps

### Phase 1: Project