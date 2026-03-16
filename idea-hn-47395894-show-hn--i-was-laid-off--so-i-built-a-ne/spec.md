# EquityEdge

## One-line pitch
Turn your startup equity into cash on your terms—compare offers, track value, and negotiate as a group.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Startup employees (engineers, designers, marketers, ops) with unvested or vested equity
- Anyone who's received stock options or RSUs as part of compensation
- Gig economy workers and contractors who've taken equity in lieu of higher cash comp

**Broader audience beyond tech:**
- Small business employees with profit-sharing or equity stakes
- Freelancers who've been paid in equity by early-stage companies
- Family members who inherited startup shares and don't know what they're worth
- College grads evaluating job offers that include equity components

**Adjacent use cases:**
- **Equity education hub**: Most people don't understand ISOs vs NSOs, 409A valuations, or AMT implications. This becomes the Duolingo of equity literacy.
- **Job offer comparison**: Compare total comp packages across offers when equity is involved (not just salary).
- **Exit planning**: Model tax scenarios for different liquidity events (IPO, acquisition, secondary sale).
- **Community intelligence**: Anonymized data shows what others with similar equity profiles are doing.

**Why non-technical people want this:**
- Your spouse/partner can finally understand what your "equity" is actually worth
- Parents helping kids evaluate startup job offers
- Anyone who feels intimidated by financial jargon gets a simple, visual interface
- Social proof and collective bargaining make individuals feel less powerless

This isn't just a calculator—it's a movement to democratize access to liquidity that's historically been reserved for insiders and accredited investors.

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Language**: TypeScript
- **Local storage**: Expo SQLite
- **State management**: Zustand (lightweight, no boilerplate)
- **Navigation**: Expo Router (file-based routing)
- **UI**: React Native Paper (Material Design, accessible)
- **Charts**: Victory Native (for equity value visualization)
- **Forms**: React Hook Form
- **API client**: Axios
- **Testing**: Jest + React Native Testing Library
- **Linting**: ESLint + Prettier

## Core features (MVP)

1. **Equity Portfolio Tracker**
   - Add multiple equity positions (company name, shares, strike price, vesting schedule)
   - Real-time estimated valuation based on latest funding round or 409A
   - Visual timeline showing when shares vest
   - Tax impact calculator (AMT, capital gains)

2. **Liquidity Provider Marketplace**
   - Side-by-side comparison of 3-5 liquidity providers (EquityZen, Forge, SharesPost, etc.)
   - Key metrics: fees, minimum investment, payout timeline, reputation score
   - Filter by: company stage, industry, minimum shares
   - Direct contact links (email, schedule call)

3. **Collective Waitlist**
   - Join waitlists for specific companies or liquidity events
   - See how many others are waiting (social proof)
   - Get notified when critical mass is reached (e.g., "50 people ready to sell $2M in Company X")
   - Providers see aggregated demand and offer better terms

4. **Scenario Modeler** (Premium)
   - "What if" calculator: model IPO at different valuations, acquisition scenarios, secondary sale timing
   - Tax optimization: compare selling now vs waiting for long-term capital gains
   - Vesting acceleration scenarios (layoff, acquisition)

5. **Smart Alerts** (Premium)
   - Push notifications for: new liquidity provider offers, funding round announcements, waitlist milestones
   - Weekly equity value summary
   - Regulatory changes affecting equity (e.g., new SEC rules)

## Monetization strategy

**Free tier (the hook):**
- Add up to 2 equity positions
- Basic portfolio tracking (current value, vesting schedule)
- View liquidity provider directory (no detailed comparison)
- Join 1 collective waitlist
- Educational content (articles, glossary)

**Premium tier: $12.99/month or $99/year** (reasoning: higher than typical finance apps because this solves a high-stakes, infrequent problem with massive financial upside)

**Premium includes:**
- Unlimited equity positions
- Full provider comparison with fees, timelines, and reviews
- Scenario modeler with tax optimization
- Join unlimited waitlists with priority access
- Smart alerts and weekly reports
- Export data (CSV, PDF for accountant/advisor)
- Ad-free experience

**What makes people STAY subscribed:**
- Vesting schedules mean they need ongoing tracking for 4+ years
- Market volatility requires constant revaluation
- New liquidity providers and terms emerge regularly
- Tax planning is annual (need it every year)
- Waitlist notifications create FOMO (don't want to miss the next liquidity event)

**Additional revenue streams (future):**
- Referral fees from liquidity providers (disclosed transparently)
- White-label version for financial advisors ($49/month per advisor)
- Premium educational courses ($29 one-time)

## File structure

```
equity-edge/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Portfolio dashboard
│   │   ├── marketplace.tsx        # Liquidity providers
│   │   ├── waitlist.tsx           # Collective waitlists
│   │   └── profile.tsx            # Settings, subscription
│   ├── equity/
│   │   ├── add.tsx                # Add new equity position
│   │   └── [id].tsx               # Equity detail view
│   ├── modeler.tsx                # Scenario modeler (premium)
│   ├── provider/
│   │   └── [id].tsx               # Provider detail
│   └── _layout.tsx
├── components/
│   ├── EquityCard.tsx
│   ├── ProviderCard.tsx
│   ├── VestingTimeline.tsx
│   ├── TaxCalculator.tsx
│   ├── ScenarioChart.tsx
│   └── PremiumGate.tsx
├── lib/
│   ├── db.ts                      # SQLite setup
│   ├── calculations.ts            # Equity math, tax logic
│   ├── types.ts                   # TypeScript interfaces
│   └── constants.ts               # Provider data, tax rates
├── store/
│   ├── equityStore.ts             # Zustand store for equity
│   ├── userStore.ts               # User preferences, subscription
│   └── waitlistStore.ts           # Waitlist state
├── __tests__/
│   ├── calculations.test.ts
│   ├── equityStore.test.ts
│   └── components/
│       ├── EquityCard.test.tsx
│       └── TaxCalculator.test.tsx
├── assets/
│   └── images/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/calculations.test.ts`
```typescript
import {
  calculateEquityValue,
  calculateTaxImpact,
  calculateVestedShares,
  calculateAMT
} from '../lib/calculations';

describe('Equity Calculations', () => {
  test('calculates equity value correctly', () => {
    const result = calculateEquityValue(1000, 50, 100);
    expect(result).toBe(50000); // (100 - 50) * 1000
  });

  test('calculates vested shares over time', () => {
    const startDate = new Date('2023-01-01');
    const currentDate = new Date('2024-01-01');
    const result = calculateVestedShares(4000, startDate, currentDate, 4);
    expect(result).toBe(1000); // 1 year vested of 4-year schedule
  });

  test('calculates short-term capital gains tax', () => {
    const result = calculateTaxImpact(50000, 'short', 150000);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(50000);
  });

  test('calculates AMT for ISO exercise', () => {
    const result = calculateAMT(1000, 10, 50);
    expect(result).toBeGreaterThan(0);
  });
});
```

### `__tests__/equityStore.test.ts`
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useEquityStore } from '../store/equityStore';

describe('Equity Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useEquityStore());
    act(() => {
      result.current.clearAll();
    });
  });

  test('adds equity position', () => {
    const { result } = renderHook(() => useEquityStore());
    
    act(() => {
      result.current.addEquity({
        id: '1',
        companyName: 'TestCo',
        shares: 1000,
        strikePrice: 10,
        currentPrice: 50,
        grantDate: new Date('2023-01-01'),
        vestingYears: 4
      });
    });

    expect(result.current.equities).toHaveLength(1);
    expect(result.current.equities[0].companyName).toBe('TestCo');
  });

  test('calculates total portfolio value', () => {
    const { result } = renderHook(() => useEquityStore());
    
    act(() => {
      result.current.addEquity({
        id: '1',
        companyName: 'TestCo',
        shares: 1000,
        strikePrice: 10,
        currentPrice: 50,
        grantDate: new Date('2023-01-01'),
        vestingYears: 4
      });
    });

    expect(result.current.totalValue).toBe(40000);
  });
});
```

### `__tests__/components/EquityCard.test.tsx`
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import EquityCard from '../../components/EquityCard';

describe('EquityCard', () => {
  const mockEquity = {
    id: '1',
    companyName: 'TestCo',
    shares: 1000,
    strikePrice: 10,
    currentPrice: 50,
    grantDate: new Date('2023-01-01'),
    vestingYears: 4
  };

  test('renders company name', () => {
    const { getByText } = render(<EquityCard equity={mockEquity} />);
    expect(getByText('TestCo')).toBeTruthy();
  });

  test('displays current value', () => {
    const { getByText } = render(<EquityCard equity={mockEquity} />);
    expect(getByText(/\$40,000/)).toBeTruthy();
  });
});
```

### `__tests__/components/TaxCalculator.test.tsx`
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaxCalculator from '../../components/TaxCalculator';

describe('TaxCalculator', () => {
  test('calculates tax on input change', () => {
    const { getByPlaceholderText, getByText } = render(<TaxCalculator />);
    
    const input = getByPlaceholderText('Sale proceeds');
    fireEvent.changeText(input, '50000');
    
    expect(getByText(/Estimated tax/)).toBeTruthy();
  });
});
```

## Implementation steps

### Step 1: Project setup
```bash
npx create-expo-app equity-edge --template blank-typescript
cd equity-edge
npm install zustand expo-sqlite react-native-paper victory-native axios react-hook-form
npm install --save-dev jest @testing-library/react-native @testing-library/react-hooks @types/jest
```

### Step 2: Configure TypeScript and Jest
Create `tsconfig.json`:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
```

### Step 3: Database schema
Create `lib/db.ts`:
```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('equityedge.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS equities (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      shares INTEGER NOT NULL,
      strike_price REAL NOT NULL,
      current_price REAL NOT NULL,
      grant_date TEXT NOT NULL,
      vesting_years INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS waitlists (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      participant_count INTEGER DEFAULT 1,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      is_premium INTEGER DEFAULT 0,
      income_bracket TEXT,
      notification_enabled INTEGER DEFAULT 1
    );
  `);
};

export default db;
```

### Step 4: Core calculation logic
Create `lib/calculations.ts`:
```typescript
export const calculateEquityValue = (
  shares: number,
  strikePrice: number,
  currentPrice: number
): number => {
  return Math.max(0, (currentPrice - strikePrice) * shares);
};

export const calculateVestedShares = (
  totalShares: number,
  grantDate: Date,
  currentDate: Date,
  vestingYears: number
): number => {
  const monthsElapsed = 
    (currentDate.getTime() - grantDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const totalMonths = vestingYears * 12;
  const vestedPercentage = Math.min(monthsElapsed / totalMonths, 1);
  return Math.floor(totalShares * vestedPercentage);
};

export const calculateTaxImpact = (
  gain: number,
  holdingPeriod: 'short' | 'long',
  annualIncome: number
): number => {
  // Simplified tax calculation (US federal only)
  const rate = holdingPeriod === 'long' 
    ? (annualIncome > 500000 ? 0.20 : 0.15)
    : (annualIncome > 500000 ? 0.37 : 0.24);
  return gain * rate;
};

export const calculateAMT = (
  shares: number,
  strikePrice: number,
  fmv: number
): number => {
  const spread = (fmv - strikePrice) * shares;
  return spread * 0.28; // AMT rate
};
```

### Step 5: Type definitions
Create `lib/types.ts`:
```typescript
export interface Equity {
  id: string;
  companyName: string;
  shares: number;
  strikePrice: number;
  currentPrice: number;
  grantDate: Date;
  vestingYears: number;
}

export interface LiquidityProvider {
  id: string;
  name: string;
  logo: string;
  feePercentage: number;
  minimumShares: number;
  payoutDays: number;
  rating: number;
  description: string;
}

export interface Waitlist {
  id: string;
  companyName: string;
  participantCount: number;
  joinedAt: Date;
}

export interface UserSettings {
  isPremium: boolean;
  incomeBracket?: string;
  notificationEnabled: boolean;
}
```

### Step 6: Zustand stores
Create `store/equityStore.ts`:
```typescript
import { create } from 'zustand';
import { Equity } from '../lib/types';
import { calculateEquityValue, calculateVestedShares } from '../lib/calculations';
import db from '../lib/db';

interface EquityState {
  equities: Equity[];
  addEquity: (equity: Equity) => void;
  removeEquity: (id: string) => void;
  updateEquity: (id: string, updates: Partial<Equity>) => void;
  loadEquities: () => void;
  totalValue: number;
  clearAll: () => void;
}

export const useEquityStore = create<EquityState>((set, get) => ({
  equities: [],
  totalValue: 0,

  addEquity: (equity) => {
    db.runSync(
      'INSERT INTO equities (id, company_name, shares, strike_price, current_price, grant_date, vesting_years) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [equity.id, equity.companyName, equity.shares, equity.strikePrice, equity.currentPrice, equity.grantDate.toISOString(), equity.vestingYears]
    );
    set((state) => {
      const newEquities = [...state.equities, equity];
      return {
        equities: newEquities,
        totalValue: calculateTotalValue(newEquities)
      };
    });
  },

  removeEquity: (id) => {
    db.runSync('DELETE FROM equities WHERE id = ?', [id]);
    set((state) => {
      const newEquities = state.equities.filter((e) => e.id !== id);
      return {
        equities: newEquities,
        totalValue: calculateTotalValue(newEquities)
      };
    });
  },

  updateEquity: (id, updates) => {
    set((state) => {
      const newEquities = state.equities.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      );
      return {
        equities: newEquities,
        totalValue: calculateTotalValue(newEquities)
      };
    });
  },

  loadEquities: () => {
    const rows = db.getAllSync('SELECT * FROM equities');
    const equities = rows.map((row: any) => ({
      id: row.id,
      companyName: row.company_name,
      shares: row.shares,
      strikePrice: row.strike_price,
      currentPrice: row.current_price,
      grantDate: new Date(row.grant_date),
      vestingYears: row.vesting_years
    }));
    set({ equities, totalValue: calculateTotalValue(equities) });
  },

  clearAll: () => set({ equities: [], totalValue: 0 })
}));

const calculateTotalValue = (equities: Equity[]): number => {
  return equities.reduce((sum, equity) => {
    const vestedShares = calculateVestedShares(
      equity.shares,
      equity.grantDate,
      new Date(),
      equity.vestingYears
    );
    return sum + calculateEquityValue(vestedShares, equity.strikePrice, equity.currentPrice);
  }, 0);
};
```

Create `store/userStore.ts`:
```typescript
import { create } from 'zustand';
import { UserSettings } from '../lib/types';
import db from '../lib/db';

interface UserState extends UserSettings {
  setSettings: (settings: Partial<UserSettings>) => void;
  loadSettings: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isPremium: false,
  notificationEnabled: true,

  setSettings: (settings) => {
    db.runSync(
      'INSERT OR REPLACE INTO user_settings (id, is_premium, income_bracket, notification_enabled) VALUES (1, ?, ?, ?)',
      [settings.isPremium ? 1 : 0, settings.incomeBracket || null, settings.notificationEnabled ? 1 : 0]
    );
    set(settings);
  },

  loadSettings: () => {
    const row = db.getFirstSync('SELECT * FROM user_settings WHERE id = 1');
    if (row) {
      set({
        isPremium: row.is_premium === 1,
        incomeBracket: row.income_bracket,
        notificationEnabled: row.notification_enabled === 1
      });
    }
  }
}));
```

### Step 7: UI Components
Create `components/EquityCard.tsx`:
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Equity } from '../lib/types';
import { calculateEquityValue, calculateVestedShares } from '../lib/calculations';

interface Props {
  equity: Equity;
  onPress?: () => void;
}

export default function EquityCard({ equity, onPress }: Props) {
  const vestedShares = calculateVestedShares(
    equity.shares,
    equity.grantDate,
    new Date(),
    equity.vestingYears
  );
  const value = calculateEquityValue(vestedShares, equity.strikePrice, equity.currentPrice);

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text variant="titleLarge">{equity.companyName}</Text>
        <Text variant="bodyMedium">{vestedShares.toLocaleString()} shares vested</Text>
        <Text variant="headlineMedium" style={styles.value}>
          ${value.toLocaleString()}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16
  },
  value: {
    color: '#4CAF50',
    marginTop: 8
  }
});
```

Create `components/PremiumGate.tsx`:
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useUserStore } from '../store/userStore';

interface Props {
  children: React.ReactNode;
  feature: string;
}

export default function PremiumGate({ children, feature }: Props) {
  const isPremium = useUserStore((state) => state.isPremium);

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium">Premium Feature</Text>
      <Text variant="bodyMedium" style={styles.text}>
        {feature} is available with Premium
      </Text>
      <Button mode="contained" onPress={() => {}}>
        Upgrade to Premium
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center'
  },
  text: {
    marginVertical: 16,
    textAlign: 'center'
  }
});
```

### Step 8: Main screens
Create `app/(tabs)/index.tsx`:
```typescript
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEquityStore } from '../../store/equityStore';
import EquityCard from '../../components/EquityCard';

export default function Portfolio() {
  const router = useRouter();
  const { equities, totalValue, loadEquities } = useEquityStore();

  useEffect(() => {
    loadEquities();
  }, []);

  return (
    <>
      <ScrollView style={styles.container}>
        <Text variant="headlineLarge" style={styles.header}>
          Portfolio Value
        </Text>
        <Text variant="displaySmall" style={styles.total}>
          ${totalValue.toLocaleString()}
        </Text>
        {equities.map((equity) => (
          <EquityCard
            key={equity.id}
            equity={equity}
            onPress={() => router.push(`/equity/${equity.id}`)}
          />
        ))}
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/equity/add')}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    marginBottom: 8
  },
  total: {
    color: '#4CAF50',
    marginBottom: 24
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16
  }
});
```

Create `app/equity/add.tsx`:
```typescript
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useEquityStore } from '../../store/equityStore';

export default function AddEquity() {
  const router = useRouter();
  const addEquity = useEquityStore((state) => state.addEquity);
  const { control, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    addEquity({
      id: Date.now().toString(),
      companyName: data.companyName,
      shares: parseInt(data.shares),
      strikePrice: parseFloat(data.strikePrice),
      currentPrice: parseFloat(data.currentPrice),
      grantDate: new Date(data.grantDate),
      vestingYears: parseInt(data.vestingYears)
    });
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Controller
        control={control}
        name="companyName"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Company Name"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      <Controller
        control={control}
        name="shares"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Total Shares"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
      <Controller
        control={control}
        name="strikePrice"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Strike Price"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
      <Controller
        control={control}
        name="currentPrice"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Current Price (409A)"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
      <Controller
        control={control}
        name="vestingYears"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Vesting Period (years)"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
      <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>
        Add Equity
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  input: {
    marginBottom: 16
  },
  button: {
    marginTop: 16
  }
});
```

### Step 9: App initialization
Update `app/_layout.tsx`:
```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { initDatabase } from '../lib/db';
import { useUserStore } from '../store/userStore';

export default function RootLayout() {
  const loadSettings = useUserStore((state) => state.loadSettings);

  useEffect(() => {
    initDatabase();
    loadSettings();
  }, []);

  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="equity/add" options={{ title: 'Add Equity' }} />
      </Stack>
    </PaperProvider>
  );
}
```

### Step 10: Run tests
```bash
npm test
```

All tests should pass before proceeding.

### Step 11: Provider data
Create `lib/constants.ts`:
```typescript
import { LiquidityProvider } from './types';

export const LIQUIDITY_PROVIDERS: LiquidityProvider[] = [
  {
    id: '1',
    name: 'EquityZen',
    logo: 'https://via.placeholder.com/100',
    feePercentage: 5,
    minimumShares: 1000,
    payoutDays: 45,
    rating: 4.5,
    description: 'Marketplace for pre-IPO secondary transactions'
  },
  {
    id: '2',
    name: 'Forge Global',
    logo: 'https://via.placeholder.com/100',
    feePercentage: 4,
    minimumShares: 5000,
    payoutDays: 30,
    rating: 4.7,
    description: 'Private securities marketplace'
  },
  {
    id: '3',
    name: 'SharesPost',
    logo: 'https://via.placeholder.com/100',
    feePercentage: 6,
    minimumShares: 2000,
    payoutDays: 60,
    rating: 4.2,
    description: 'Private market solutions for shareholders'
  }
];

export const TAX_BRACKETS = [
  { min: 0, max: 44625, rate: 0.12 },
  { min: 44626, max: 95375, rate: 0.22 },
  { min: 95376, max: 182100, rate: 0.24 },
  { min: 182101, max: 231250, rate: 0.32 },
  { min: 231251, max: 578125, rate: 0.35 },
  { min: 578126, max: Infinity, rate: 0.37 }
];
```

## How to verify it works

### On device/simulator:
1. Install Expo Go on your iOS/Android device
2. Run `npx expo start`
3. Scan QR code with Expo Go (Android) or Camera app (iOS)
4. Test flow:
   - Tap "+" FAB to add equity position
   - Fill in: Company "TestCo", 1000 shares, $10