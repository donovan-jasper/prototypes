# GiftSwift

## One-line pitch
Send thoughtful gifts in seconds—from spa days to concert tickets—with zero stress and maximum impact.

## Expanded vision

### Who is this REALLY for?

**Primary audience (broadest reach):**
- **Anyone who forgot a birthday/anniversary** — The "oh crap it's today" crowd who needs to send something meaningful in under 5 minutes
- **Remote workers and distributed teams** — Managers sending appreciation gifts to team members across cities/countries
- **Long-distance relationships** — Partners, friends, and family who want to feel present despite physical distance
- **Corporate gifting at scale** — HR departments, sales teams, and client success managers who send 10-100+ gifts per quarter

**Adjacent use cases this enables:**
- **Apology gifts** — "I'm sorry" moments need fast, thoughtful solutions (flowers are cliché, this offers better)
- **Milestone celebrations** — Graduations, promotions, new babies where you can't be there in person
- **Thank-you economy** — Tipping service workers (hairdressers, dog walkers, tutors) with experiences instead of cash
- **Social currency** — Influencers/creators rewarding engaged followers with surprise gifts (builds loyalty)
- **Subscription gifting** — "Gift of the month" clubs for parents, partners, or clients (recurring revenue goldmine)

**Why non-technical people want this:**
- Eliminates decision paralysis (curated options vs endless browsing)
- No awkward "did they get it?" uncertainty (delivery tracking + recipient confirmation)
- Makes you look thoughtful without effort (pre-written messages, occasion templates)
- Works when you're broke on time, not money (premium convenience play)

**The real insight:** This isn't a gifting app—it's an **emotional labor outsourcing platform**. People don't want to shop for gifts; they want to feel like good friends/partners/managers without the mental overhead.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **Navigation:** Expo Router (file-based routing)
- **State management:** Zustand (lightweight, no boilerplate)
- **Payments:** Stripe SDK (expo-stripe)
- **Push notifications:** Expo Notifications
- **Analytics:** Expo Analytics (built-in)
- **Testing:** Jest + React Native Testing Library

**Key dependencies (minimal):**
```json
{
  "expo": "~52.0.0",
  "react-native": "0.76.0",
  "expo-sqlite": "~15.0.0",
  "expo-router": "~4.0.0",
  "zustand": "^5.0.0",
  "@stripe/stripe-react-native": "^0.40.0",
  "expo-notifications": "~0.29.0"
}
```

## Core features (MVP)

1. **Quick Send (30-second gifting)**
   - Browse curated gift categories (Spa & Wellness, Entertainment, Food & Drink, Experiences)
   - Select recipient (contacts integration or manual entry)
   - Add optional personal message (or use AI-generated templates)
   - Pay and send via SMS/email/WhatsApp link
   - Recipient claims gift with zero app download required (web redemption)

2. **Gift Vault (saved recipients + preferences)**
   - Store frequent recipients with gift history ("You sent Sarah a spa day 6 months ago")
   - Set reminders for birthdays/anniversaries (push notifications 3 days before)
   - Track delivery status and redemption

3. **Curated Collections (decision-making shortcut)**
   - Pre-packaged gift bundles by occasion ("New Parent Survival Kit", "Apology Deluxe", "Team MVP Award")
   - Price tiers: $25, $50, $100, $200
   - Partner with local businesses for exclusive experiences (differentiator vs Amazon gift cards)

4. **Instant Delivery (location-aware)**
   - Detect recipient's city/region for local experience options
   - Same-day digital delivery (vouchers, tickets)
   - Physical gifts ship within 24 hours (premium tier)

5. **Social Proof (virality engine)**
   - Share "I just sent [Friend] a gift!" to social media (with opt-in recipient consent)
   - Referral system: Give $10, get $10 credit
   - Public gift leaderboard (gamification for corporate teams)

## Monetization strategy

### Free tier (acquisition hook):
- Send up to 2 gifts per month under $30
- Basic gift categories (Food & Drink, Generic Gift Cards)
- Standard delivery (3-5 days for physical items)
- Manual recipient entry (no contact sync)

### Paid tier — **GiftSwift Pro ($9.99/month or $89/year)**

**What you get:**
- Unlimited gifts at any price point
- Premium categories (Spa, Concerts, Adventure Experiences)
- Same-day digital delivery + expedited shipping
- AI-powered message suggestions
- Gift Vault with unlimited recipients + reminders
- Bulk sending (up to 50 gifts at once with CSV upload)
- Priority customer support

**Price reasoning:**
- $9.99/month = cost of 1 Starbucks gift card, but saves 10+ hours of shopping time per year
- Annual discount (25% off) incentivizes long-term commitment
- Comparable to other "life admin" subscriptions (Calendly, Superhuman)

**Retention drivers (why people stay subscribed):**
- **Sunk cost fallacy:** Once you've built your Gift Vault with 20+ recipients, switching is painful
- **Habit formation:** Birthday reminders create monthly touchpoints
- **Corporate adoption:** Teams expense it as "employee engagement software" (B2B upsell opportunity)
- **Seasonal spikes:** Holidays, graduation season, wedding season = high usage periods that justify annual sub

### Additional revenue streams:
- **Transaction fees:** 8-12% commission on gift redemptions (paid by merchants, invisible to users)
- **Enterprise tier:** $299/month for companies (white-label gifting portal, analytics dashboard, bulk discounts)
- **Affiliate partnerships:** Earn 5-10% from Ticketmaster, SpaFinder, OpenTable integrations

## File structure

```
giftswift/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home (Browse Gifts)
│   │   ├── vault.tsx              # Gift Vault (Recipients)
│   │   ├── history.tsx            # Sent Gifts History
│   │   └── profile.tsx            # Settings & Subscription
│   ├── gift/
│   │   ├── [id].tsx               # Gift Detail View
│   │   └── send.tsx               # Send Gift Flow
│   ├── checkout.tsx               # Payment Screen
│   ├── _layout.tsx                # Root Layout
│   └── +not-found.tsx
├── components/
│   ├── GiftCard.tsx               # Gift preview card
│   ├── RecipientPicker.tsx        # Contact selector
│   ├── MessageComposer.tsx        # Gift message input
│   └── PaymentSheet.tsx           # Stripe payment UI
├── lib/
│   ├── database.ts                # SQLite setup & migrations
│   ├── gifts.ts                   # Gift CRUD operations
│   ├── recipients.ts              # Recipient management
│   ├── payments.ts                # Stripe integration
│   └── notifications.ts           # Push notification handlers
├── store/
│   └── useStore.ts                # Zustand global state
├── types/
│   └── index.ts                   # TypeScript interfaces
├── __tests__/
│   ├── gifts.test.ts
│   ├── recipients.test.ts
│   └── payments.test.ts
├── app.json
├── package.json
└── tsconfig.json
```

## Tests

### `__tests__/gifts.test.ts`
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { createGift, getGiftById, getGiftsByCategory } from '../lib/gifts';
import { initDatabase } from '../lib/database';

describe('Gift Management', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  it('should create a new gift', async () => {
    const gift = await createGift({
      title: 'Spa Day Package',
      category: 'wellness',
      price: 99.99,
      description: 'Relaxing spa experience',
    });
    expect(gift.id).toBeDefined();
    expect(gift.title).toBe('Spa Day Package');
  });

  it('should retrieve gift by ID', async () => {
    const created = await createGift({
      title: 'Concert Tickets',
      category: 'entertainment',
      price: 150.0,
    });
    const retrieved = await getGiftById(created.id);
    expect(retrieved?.title).toBe('Concert Tickets');
  });

  it('should filter gifts by category', async () => {
    await createGift({ title: 'Massage', category: 'wellness', price: 80 });
    await createGift({ title: 'Movie Tickets', category: 'entertainment', price: 30 });
    const wellness = await getGiftsByCategory('wellness');
    expect(wellness.length).toBe(1);
    expect(wellness[0].title).toBe('Massage');
  });
});
```

### `__tests__/recipients.test.ts`
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { addRecipient, getRecipients, updateRecipient } from '../lib/recipients';
import { initDatabase } from '../lib/database';

describe('Recipient Management', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  it('should add a new recipient', async () => {
    const recipient = await addRecipient({
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1234567890',
    });
    expect(recipient.id).toBeDefined();
    expect(recipient.name).toBe('Sarah Johnson');
  });

  it('should retrieve all recipients', async () => {
    await addRecipient({ name: 'John Doe', email: 'john@example.com' });
    await addRecipient({ name: 'Jane Smith', email: 'jane@example.com' });
    const recipients = await getRecipients();
    expect(recipients.length).toBe(2);
  });

  it('should update recipient preferences', async () => {
    const recipient = await addRecipient({ name: 'Bob', email: 'bob@example.com' });
    await updateRecipient(recipient.id, { preferences: { favoriteCategory: 'food' } });
    const updated = await getRecipients();
    expect(updated[0].preferences?.favoriteCategory).toBe('food');
  });
});
```

### `__tests__/payments.test.ts`
```typescript
import { describe, it, expect } from '@jest/globals';
import { calculateTotal, validatePaymentAmount } from '../lib/payments';

describe('Payment Processing', () => {
  it('should calculate total with fees', () => {
    const total = calculateTotal(100, 0.1); // 10% fee
    expect(total).toBe(110);
  });

  it('should validate minimum payment amount', () => {
    expect(validatePaymentAmount(5)).toBe(false);
    expect(validatePaymentAmount(25)).toBe(true);
  });

  it('should validate maximum payment amount', () => {
    expect(validatePaymentAmount(5000)).toBe(false);
    expect(validatePaymentAmount(500)).toBe(true);
  });
});
```

## Implementation steps

### Phase 1: Project Setup
1. Initialize Expo project:
   ```bash
   npx create-expo-app giftswift --template tabs
   cd giftswift
   ```

2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-router zustand @stripe/stripe-react-native expo-notifications
   npm install --save-dev @types/jest @testing-library/react-native
   ```

3. Configure TypeScript (`tsconfig.json`):
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

### Phase 2: Database Layer
4. Create `lib/database.ts`:
   - Initialize SQLite connection
   - Define schema migrations:
     - `gifts` table (id, title, category, price, description, image_url, created_at)
     - `recipients` table (id, name, email, phone, preferences, created_at)
     - `sent_gifts` table (id, gift_id, recipient_id, message, status, sent_at, redeemed_at)
   - Export `initDatabase()` function

5. Implement `lib/gifts.ts`:
   - `createGift(data)` — Insert new gift
   - `getGiftById(id)` — Fetch single gift
   - `getGiftsByCategory(category)` — Filter by category
   - `searchGifts(query)` — Full-text search

6. Implement `lib/recipients.ts`:
   - `addRecipient(data)` — Insert recipient
   - `getRecipients()` — Fetch all
   - `updateRecipient(id, data)` — Update preferences
   - `deleteRecipient(id)` — Soft delete

### Phase 3: State Management
7. Create `store/useStore.ts` with Zustand:
   ```typescript
   interface AppState {
     user: User | null;
     cart: CartItem[];
     addToCart: (gift: Gift, recipient: Recipient) => void;
     clearCart: () => void;
     setUser: (user: User) => void;
   }
   ```

8. Define TypeScript interfaces in `types/index.ts`:
   - `Gift`, `Recipient`, `SentGift`, `User`, `CartItem`

### Phase 4: Core Screens
9. Build `app/(tabs)/index.tsx` (Home):
   - Fetch gifts from database on mount
   - Display category filters (horizontal scroll)
   - Render gift grid with `GiftCard` component
   - Search bar with debounced input

10. Build `components/GiftCard.tsx`:
    - Display gift image, title, price
    - "Quick Send" button → navigate to `/gift/send?id={giftId}`
    - Favorite icon (save to wishlist)

11. Build `app/gift/[id].tsx` (Gift Detail):
    - Fetch gift by ID from route params
    - Show full description, reviews, redemption details
    - "Send This Gift" button → navigate to `/gift/send`

12. Build `app/gift/send.tsx` (Send Flow):
    - Step 1: Select recipient (use `RecipientPicker` component)
    - Step 2: Add message (use `MessageComposer` with AI templates)
    - Step 3: Review and confirm
    - "Proceed to Payment" → navigate to `/checkout`

### Phase 5: Recipient Management
13. Build `app/(tabs)/vault.tsx` (Gift Vault):
    - Fetch recipients from database
    - Display list with last gift sent date
    - "Add Recipient" button → modal form
    - Swipe actions: Edit, Delete

14. Build `components/RecipientPicker.tsx`:
    - Search existing recipients
    - "Add New" option
    - Display contact suggestions (if permissions granted)

### Phase 6: Payment Integration
15. Configure Stripe in `app.json`:
    ```json
    {
      "expo": {
        "plugins": [
          [
            "@stripe/stripe-react-native",
            {
              "merchantIdentifier": "merchant.com.giftswift"
            }
          ]
        ]
      }
    }
    ```

16. Implement `lib/payments.ts`:
    - `initStripe(publishableKey)` — Initialize SDK
    - `createPaymentIntent(amount)` — Backend API call (mock for MVP)
    - `confirmPayment(clientSecret)` — Process payment
    - `calculateTotal(price, fee)` — Helper function

17. Build `app/checkout.tsx`:
    - Display cart summary
    - Stripe payment sheet integration
    - Handle success → save to `sent_gifts` table
    - Navigate to confirmation screen

### Phase 7: History & Tracking
18. Build `app/(tabs)/history.tsx`:
    - Fetch sent gifts from database (join with recipients)
    - Display timeline view (grouped by month)
    - Status badges: Sent, Delivered, Redeemed
    - Tap to view details

### Phase 8: Notifications
19. Implement `lib/notifications.ts`:
    - Request permissions on app launch
    - Schedule birthday reminders (3 days before)
    - Handle delivery status updates
    - Deep link to gift detail on tap

20. Add notification handlers in `app/_layout.tsx`:
    - Listen for foreground notifications
    - Handle background notification taps

### Phase 9: Settings & Subscription
21. Build `app/(tabs)/profile.tsx`:
    - Display user info (name, email)
    - Subscription status (Free vs Pro)
    - "Upgrade to Pro" button → in-app purchase flow (mock for MVP)
    - Notification preferences toggle
    - Logout button

### Phase 10: Testing & Polish
22. Write tests (see Tests section above)

23. Add loading states and error handling:
    - Skeleton loaders for gift lists
    - Retry buttons for failed API calls
    - Toast notifications for success/error messages

24. Implement offline support:
    - Cache gift data in SQLite
    - Queue sent gifts for sync when online
    - Display "Offline Mode" banner

25. Add analytics tracking:
    - Screen views
    - Gift sends (by category)
    - Conversion funnel (browse → send → payment)

## How to verify it works

### Local Development
1. Start Expo dev server:
   ```bash
   npx expo start
   ```

2. Test on iOS Simulator:
   ```bash
   npx expo start --ios
   ```

3. Test on Android Emulator:
   ```bash
   npx expo start --android
   ```

4. Test on physical device:
   - Install Expo Go app
   - Scan QR code from terminal

### Functional Testing Checklist
- [ ] Browse gifts by category (Home screen)
- [ ] Search for specific gift (e.g., "spa")
- [ ] View gift details (tap on gift card)
- [ ] Add recipient to vault (Vault screen → Add button)
- [ ] Send gift flow (select gift → choose recipient → add message → checkout)
- [ ] Mock payment success (Stripe test mode)
- [ ] View sent gift in history (History screen)
- [ ] Receive birthday reminder notification (set test date 3 days out)
- [ ] Toggle notification preferences (Profile screen)
- [ ] Offline mode (disable network → browse cached gifts)

### Automated Testing
```bash
npm test
```

**Expected output:**
```
PASS  __tests__/gifts.test.ts
PASS  __tests__/recipients.test.ts
PASS  __tests__/payments.test.ts

Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
```

### Performance Benchmarks
- App launch: < 2 seconds (cold start)
- Gift list load: < 500ms (100 items)
- Search results: < 200ms (debounced)
- Payment processing: < 3 seconds (Stripe API)

### Pre-Launch Validation
1. Test on 3+ device sizes (iPhone SE, iPhone 15 Pro, iPad)
2. Verify accessibility (VoiceOver navigation)
3. Check App Store screenshots (5 required)
4. Prepare privacy policy (data collection disclosure)
5. Submit TestFlight build for beta testing