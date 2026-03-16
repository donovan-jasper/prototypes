# PairPurse

**Privacy-first expense sharing that never leaves your phone**

---

## Expanded Vision

This isn't just for privacy nerds — it's for anyone who's ever felt uneasy about their bank transactions living in someone else's cloud.

**Broadest audience:**
- **Couples managing shared expenses** without merging bank accounts or trusting a third party with their spending habits
- **Roommates splitting rent, utilities, and groceries** who want instant settlement without awkward conversations
- **Parents teaching teens financial responsibility** through a shared expense view that doesn't require linking real bank accounts
- **Freelancers and contractors** tracking project expenses with clients in real-time, no paper trails or email chains
- **Travel groups** splitting costs on trips without internet dependency (works fully offline, syncs when devices meet)
- **Small business co-owners** who want financial transparency without paying for enterprise accounting software
- **Anyone in regions with unreliable internet** or data privacy concerns (GDPR-conscious Europeans, privacy-focused markets)

**Adjacent use cases:**
- Shared shopping lists with cost tracking (grocery runs, home improvement projects)
- Gift fund coordination (group gifts, crowdfunding among friends)
- Allowance tracking for kids (parents can see spending without cloud exposure)
- Expense reports for reimbursement (contractor → client, employee → employer)

**Why non-technical people want this:**
- "My partner and I can see who paid for what without giving our data to some company"
- "Works even when camping or traveling abroad with no data plan"
- "No sign-up, no email, no password to remember — just scan a QR code and start"
- "I know exactly where my financial data lives: on MY phone, nowhere else"

---

## Tech Stack

- **React Native (Expo SDK 52+)** — cross-platform iOS + Android
- **Expo SQLite** — local-first database, zero cloud dependency
- **Expo Crypto** — end-to-end encryption for peer-to-peer sync
- **WebRTC (via expo-webrtc or react-native-webrtc)** — direct device-to-device communication
- **Expo Speech** — voice-to-expense input (premium feature)
- **Expo Camera** — QR code pairing and receipt scanning
- **Expo SecureStore** — encrypted key storage
- **React Navigation** — tab + stack navigation
- **Zustand** — lightweight state management
- **date-fns** — date manipulation
- **Jest + React Native Testing Library** — unit and integration tests

---

## Core Features (MVP)

1. **QR Code Pairing** — Scan a code to instantly connect two devices via WebRTC, no accounts or servers
2. **Offline-First Expense Entry** — Add expenses with amount, category, payer, and split ratio; works 100% offline
3. **Real-Time Peer Sync** — When devices are nearby, changes sync instantly via encrypted WebRTC connection
4. **Balance Dashboard** — See who owes whom at a glance, with settlement suggestions
5. **Voice-to-Expense (Premium)** — Say "Coffee, $4.50, split evenly" and it creates the entry automatically

---

## Monetization Strategy

**Free Tier (Hook):**
- Unlimited expenses between 2 devices
- Basic categories (Food, Transport, Shopping, Bills, Other)
- Manual expense entry
- QR code pairing
- Local data export (CSV)

**Premium Tier ($4.99/month or $39.99/year):**
- **Multi-device sync** (connect 3+ devices, e.g., couple + shared tablet)
- **Voice-to-expense** with natural language processing
- **Receipt scanning** with OCR (auto-fill amount and merchant)
- **Conflict resolution history** (see how disputes were resolved)
- **Custom categories and tags**
- **Recurring expenses** (rent, subscriptions)
- **Advanced analytics** (spending trends, category breakdowns)

**Why people stay subscribed:**
- Voice input becomes a habit (faster than typing)
- Multi-device sync is essential for families with shared tablets or backup phones
- Receipt scanning saves time and reduces manual errors
- The longer they use it, the more valuable their historical data becomes

**Price reasoning:**
- Lower than Splitwise Premium ($2.99/month but limited features) and YNAB ($14.99/month)
- Comparable to 1Password ($2.99/month) but with more tangible daily value
- Annual discount (33% off) encourages long-term commitment

---

## File Structure

```
pairpurse/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard (balances)
│   │   ├── expenses.tsx           # Expense list
│   │   ├── add.tsx                # Add expense form
│   │   └── settings.tsx           # Pairing, sync, premium
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── ExpenseCard.tsx
│   ├── BalanceSummary.tsx
│   ├── QRPairingModal.tsx
│   ├── VoiceInput.tsx
│   └── SyncIndicator.tsx
├── lib/
│   ├── database.ts                # SQLite setup and queries
│   ├── sync.ts                    # WebRTC peer-to-peer sync
│   ├── encryption.ts              # E2E encryption helpers
│   ├── voice.ts                   # Speech-to-text processing
│   ├── types.ts                   # TypeScript interfaces
│   └── store.ts                   # Zustand state management
├── __tests__/
│   ├── database.test.ts
│   ├── sync.test.ts
│   ├── encryption.test.ts
│   └── voice.test.ts
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Tests

**`__tests__/database.test.ts`**
```typescript
import { openDatabase, addExpense, getExpenses, getBalance } from '../lib/database';

describe('Database Operations', () => {
  beforeEach(async () => {
    await openDatabase(':memory:');
  });

  test('adds expense and retrieves it', async () => {
    const expense = {
      amount: 50,
      description: 'Groceries',
      category: 'Food',
      paidBy: 'user1',
      splitWith: ['user1', 'user2'],
      date: new Date().toISOString(),
    };
    
    const id = await addExpense(expense);
    const expenses = await getExpenses();
    
    expect(expenses).toHaveLength(1);
    expect(expenses[0].description).toBe('Groceries');
  });

  test('calculates balance correctly', async () => {
    await addExpense({ amount: 100, paidBy: 'user1', splitWith: ['user1', 'user2'] });
    await addExpense({ amount: 60, paidBy: 'user2', splitWith: ['user1', 'user2'] });
    
    const balance = await getBalance('user1', 'user2');
    expect(balance).toBe(20); // user1 paid 100, owes 50; user2 paid 60, owes 50 → user2 owes user1 20
  });
});
```

**`__tests__/sync.test.ts`**
```typescript
import { encryptMessage, decryptMessage } from '../lib/encryption';
import { createSyncPayload, applySyncPayload } from '../lib/sync';

describe('Peer Sync', () => {
  test('encrypts and decrypts sync payload', () => {
    const key = 'test-encryption-key-32-characters';
    const payload = { expenses: [{ id: 1, amount: 50 }] };
    
    const encrypted = encryptMessage(JSON.stringify(payload), key);
    const decrypted = decryptMessage(encrypted, key);
    
    expect(JSON.parse(decrypted)).toEqual(payload);
  });

  test('creates valid sync payload', async () => {
    const payload = await createSyncPayload();
    
    expect(payload).toHaveProperty('expenses');
    expect(payload).toHaveProperty('timestamp');
    expect(Array.isArray(payload.expenses)).toBe(true);
  });
});
```

**`__tests__/encryption.test.ts`**
```typescript
import { generateKeyPair, encryptMessage, decryptMessage } from '../lib/encryption';

describe('Encryption', () => {
  test('generates valid key pair', () => {
    const keys = generateKeyPair();
    
    expect(keys).toHaveProperty('publicKey');
    expect(keys).toHaveProperty('privateKey');
    expect(keys.publicKey.length).toBeGreaterThan(0);
  });

  test('encrypts and decrypts message', () => {
    const message = 'Sensitive expense data';
    const key = 'test-key-must-be-32-chars-long!';
    
    const encrypted = encryptMessage(message, key);
    const decrypted = decryptMessage(encrypted, key);
    
    expect(decrypted).toBe(message);
    expect(encrypted).not.toBe(message);
  });
});
```

**`__tests__/voice.test.ts`**
```typescript
import { parseVoiceInput } from '../lib/voice';

describe('Voice Input Parsing', () => {
  test('parses simple expense command', () => {
    const result = parseVoiceInput('Coffee 4 dollars 50 split evenly');
    
    expect(result.description).toBe('Coffee');
    expect(result.amount).toBe(4.5);
    expect(result.splitType).toBe('even');
  });

  test('handles various currency formats', () => {
    expect(parseVoiceInput('Lunch $12.50').amount).toBe(12.5);
    expect(parseVoiceInput('Taxi 15 dollars').amount).toBe(15);
    expect(parseVoiceInput('Snack 3.25').amount).toBe(3.25);
  });

  test('extracts category from context', () => {
    expect(parseVoiceInput('Uber to airport 25 dollars').category).toBe('Transport');
    expect(parseVoiceInput('Dinner at restaurant 60').category).toBe('Food');
  });
});
```

---

## Implementation Steps

### 1. Project Setup
```bash
npx create-expo-app@latest pairpurse --template tabs
cd pairpurse
npx expo install expo-sqlite expo-crypto expo-speech expo-camera expo-secure-store
npm install zustand date-fns
npm install -D jest @testing-library/react-native @types/jest
```

### 2. Database Layer (`lib/database.ts`)
- Initialize SQLite with tables: `expenses`, `users`, `sync_log`
- Implement CRUD operations: `addExpense`, `updateExpense`, `deleteExpense`, `getExpenses`
- Add balance calculation: `getBalance(user1, user2)` → returns net amount owed
- Create indexes on `date` and `paidBy` for performance

### 3. Encryption Module (`lib/encryption.ts`)
- Use `expo-crypto` to generate AES-256 keys
- Implement `encryptMessage(data, key)` and `decryptMessage(encrypted, key)`
- Store encryption keys in `expo-secure-store`
- Generate unique device ID on first launch

### 4. Sync Engine (`lib/sync.ts`)
- Set up WebRTC peer connection using `react-native-webrtc` or `expo-webrtc`
- Implement conflict resolution: last-write-wins with timestamp comparison
- Create `createSyncPayload()` → serializes local changes since last sync
- Create `applySyncPayload(payload)` → merges remote changes into local DB
- Add sync status indicator (connected, syncing, offline)

### 5. QR Code Pairing (`components/QRPairingModal.tsx`)
- Generate QR code containing: device ID, public key, WebRTC signaling data
- Use `expo-camera` to scan peer's QR code
- Establish WebRTC connection and exchange encryption keys
- Store paired device info in SQLite `users` table

### 6. Dashboard UI (`app/(tabs)/index.tsx`)
- Display balance summary: "You owe $X" or "You're owed $X"
- Show recent expenses (last 5)
- Add "Settle Up" button (marks expenses as settled)
- Include sync status indicator

### 7. Expense List (`app/(tabs)/expenses.tsx`)
- FlatList of all expenses, sorted by date (newest first)
- Each item shows: description, amount, payer, date, split ratio
- Swipe actions: edit, delete
- Filter by date range and category

### 8. Add Expense Form (`app/(tabs)/add.tsx`)
- Input fields: description, amount, category (picker), payer (picker)
- Split options: "Split evenly", "I paid", "They paid", "Custom split"
- Date picker (defaults to today)
- Voice input button (premium) → calls `parseVoiceInput()`

### 9. Voice Input (`lib/voice.ts`)
- Use `expo-speech` for speech-to-text
- Parse natural language: "Coffee $4.50 split evenly" → `{ description: 'Coffee', amount: 4.5, splitType: 'even' }`
- Handle variations: "I paid 20 dollars for gas", "Dinner 45 split with roommate"
- Pre-fill form fields with parsed data

### 10. Settings (`app/(tabs)/settings.tsx`)
- Pairing section: "Pair New Device" button → opens QR modal
- Sync section: manual sync trigger, last sync timestamp
- Premium upsell: feature comparison table, "Upgrade" button
- Export data: CSV download of all expenses
- Clear data: confirmation dialog before wiping DB

### 11. State Management (`lib/store.ts`)
- Zustand store with slices: `expenses`, `users`, `syncStatus`, `premium`
- Actions: `addExpense`, `updateExpense`, `deleteExpense`, `setPairedUser`, `setSyncStatus`
- Persist premium status to `expo-secure-store`

### 12. Premium Features
- Add feature flags in store: `isPremium`, `canUseVoice`, `canSyncMultiDevice`
- Gate voice input behind `isPremium` check
- Show paywall modal when accessing premium features
- Integrate with Expo's in-app purchases (RevenueCat recommended)

### 13. Testing
- Run `npm test` to execute all Jest tests
- Ensure database operations pass
- Verify encryption/decryption works
- Test voice parsing with sample inputs
- Mock WebRTC for sync tests

### 14. Polish
- Add loading states for async operations
- Implement error handling (DB failures, sync errors)
- Add haptic feedback on expense add/delete
- Create onboarding flow (3 screens: intro, pairing, first expense)
- Design app icon and splash screen

---

## How to Verify It Works

### On Device/Simulator
1. **Install and run:**
   ```bash
   npx expo start
   ```
   Scan QR code with Expo Go (iOS/Android) or press `i` for iOS simulator, `a` for Android emulator

2. **Test pairing:**
   - Open app on two devices (or simulator + physical device)
   - On Device A: Settings → Pair New Device → shows QR code
   - On Device B: Settings → Pair New Device → Scan QR code
   - Verify "Connected" status appears on both

3. **Test expense sync:**
   - On Device A: Add expense "Lunch $15 split evenly"
   - On Device B: Wait 2-3 seconds, expense should appear automatically
   - Verify balance updates on both devices

4. **Test offline mode:**
   - Turn off WiFi/data on Device A
   - Add expense "Coffee $5"
   - Turn WiFi back on
   - Verify expense syncs to Device B

5. **Test voice input (if premium):**
   - Tap microphone icon on Add Expense screen
   - Say "Dinner 40 dollars split evenly"
   - Verify form auto-fills correctly

### Automated Tests
```bash
npm test
```
All tests in `__tests__/` must pass:
- ✓ Database operations (add, retrieve, balance calculation)
- ✓ Encryption (key generation, encrypt/decrypt)
- ✓ Sync payload creation and application
- ✓ Voice input parsing

### Manual Checklist
- [ ] Can add expense with all fields
- [ ] Balance calculates correctly after multiple expenses
- [ ] Expenses persist after app restart
- [ ] QR pairing works between two devices
- [ ] Sync happens automatically when devices are connected
- [ ] Voice input parses common phrases correctly
- [ ] Premium paywall blocks voice input for free users
- [ ] Export CSV contains all expenses
- [ ] App works fully offline (no network errors)