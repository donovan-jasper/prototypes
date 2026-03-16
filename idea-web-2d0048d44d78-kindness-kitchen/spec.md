# Kindness Kitchen Spec

## 1. App Name

**GiftGrub**

## 2. One-Line Pitch

Send food, flowers, and experiences to anyone, anywhere—because the best gifts arrive when they're needed most.

## 3. Expanded Vision

### Who is this REALLY for?

**Primary Audience:**
- **Busy professionals** who want to show they care but lack time for traditional gift shopping
- **Long-distance friends and family** who can't be physically present for birthdays, tough days, or celebrations
- **Corporate HR teams** managing employee appreciation, onboarding gifts, and milestone recognition
- **Community organizers** coordinating meal trains for new parents, illness recovery, or grief support
- **Event planners** handling wedding favors, party catering, and guest experiences

**Broader Use Cases:**
- **Apology economy**: Send a peace offering after a fight or missed event
- **Micro-celebrations**: Congratulate a friend's promotion, new job, or small win
- **Wellness support**: Send comfort food to someone going through a breakup, loss, or hard time
- **Corporate gifting at scale**: Bulk orders for client appreciation, team lunches, or conference swag
- **Subscription gifting**: Monthly surprise deliveries for loved ones (like a care package service)
- **Charity integration**: "Gift it forward" feature where users can sponsor meals for shelters or hospitals

### Why non-technical people want this:

Traditional gifting is **friction-heavy**: you need to know someone's address, pick a gift, arrange delivery, and hope it arrives on time. GiftGrub removes all that—just pick a restaurant or florist near them, add a message, and send. It's **emotional logistics solved**.

The app also taps into **social currency**: users can share their gifts on social media ("Just sent my mom her favorite tacos for her birthday 🌮❤️"), creating organic growth through feel-good content.

## 4. Tech Stack

- **Framework**: React Native (Expo) for iOS + Android
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand (lightweight, minimal boilerplate)
- **Local Storage**: SQLite (via expo-sqlite) for gift history, drafts, and favorites
- **API Integration**: REST APIs for restaurant/florist data (mock initially, integrate with DoorDash/Uber Direct API later)
- **Push Notifications**: Expo Notifications for delivery tracking and reminders
- **Payments**: Stripe SDK for React Native
- **Maps**: React Native Maps for delivery tracking
- **Testing**: Jest + React Native Testing Library

**Key Dependencies:**
```json
{
  "expo": "~52.0.0",
  "react-native": "0.76.x",
  "expo-router": "~4.0.0",
  "zustand": "^5.0.0",
  "expo-sqlite": "~15.0.0",
  "stripe-react-native": "^0.40.0",
  "react-native-maps": "1.18.0",
  "expo-notifications": "~0.29.0"
}
```

## 5. Core Features (MVP)

### 1. **Quick Send Flow**
- Search for recipient by name or location
- Browse nearby restaurants, florists, or experiences (curated list)
- Add a personalized message (text + optional voice note)
- Schedule delivery (now, later today, or future date)
- One-tap checkout with saved payment methods

### 2. **Gift Tracking & Notifications**
- Real-time delivery status (preparing → en route → delivered)
- Push notifications for sender and recipient
- Photo confirmation when delivered
- Recipient can send a thank-you message back through the app

### 3. **Gift History & Favorites**
- Save favorite restaurants/florists for repeat gifting
- View past gifts sent and received
- "Send Again" button for recurring gifts (birthdays, anniversaries)

### 4. **Social Sharing**
- Share gift on social media with custom card design
- "Gift Wall" feed showing recent community gifts (opt-in, anonymized)
- Referral system: "Send your first gift free when a friend uses your code"

### 5. **Bulk Gifting for Teams**
- Upload CSV of recipients (name, location, dietary preferences)
- Select a budget per person
- Auto-assign nearby restaurants
- Track all deliveries in one dashboard

## 6. Monetization Strategy

### Free Tier (Hook):
- Send up to **2 gifts per month** for free (user pays only for food/delivery)
- Basic message templates
- Standard delivery tracking
- Access to "Gift Wall" community feed

### Paid Tier: **GiftGrub Plus** ($9.99/month or $89/year)
- **Unlimited gifts** (no monthly cap)
- **Premium features**:
  - Custom voice messages (up to 60 seconds)
  - Scheduled recurring gifts (auto-send on birthdays, anniversaries)
  - Priority delivery (30-min guarantee or refund)
  - Bulk gifting dashboard (upload CSV, manage 10+ recipients)
  - Advanced analytics (who opened, who thanked, delivery success rate)
- **Discounted delivery fees** (15% off all orders)
- **Exclusive partnerships** (access to premium florists, bakeries, experiences)

### Additional Revenue Streams:
- **Delivery markup**: 10-15% commission on restaurant orders (standard marketplace model)
- **Corporate plans**: $49/month for teams (5+ users, shared billing, admin dashboard)
- **Gift cards**: Sell prepaid GiftGrub credits (great for holidays, corporate gifts)
- **Sponsored listings**: Restaurants pay to be featured in "Top Picks" or "Trending Now"

### Why people STAY subscribed:
- **Habit formation**: Once you send a gift and see the recipient's reaction, you'll want to do it again
- **Recurring use cases**: Birthdays, anniversaries, apologies, celebrations happen year-round
- **Social proof**: Seeing others' gifts on the feed creates FOMO and inspiration
- **Convenience tax**: Paying $10/month to never worry about gifting logistics is a no-brainer for busy professionals

### Price Reasoning:
- $9.99/month is the **sweet spot** for utility apps (comparable to Spotify, Netflix, Notion)
- Annual plan ($89) offers 25% savings, encouraging long-term commitment
- Free tier is generous enough to hook users but limited enough to drive conversions

## 7. Market Gap Analysis

**NOT SKIPPING** — Here's why:

While DoorDash, Uber Eats, and Grubhub dominate food delivery, **none are optimized for gifting**:
- No personalized messaging UI
- No recipient-first UX (you need their address upfront)
- No social sharing or emotional design
- No bulk/corporate gifting tools

Existing gifting apps (Giftly, SendMePickups) are **clunky and limited**:
- Giftly is just a digital gift card (no actual delivery)
- SendMePickups is US-only and lacks restaurant variety
- No app combines **food delivery + emotional UX + social features**

**Our edge**: We're building the **Venmo of gifting**—fast, social, and delightful. The market is ripe for a mobile-first, design-led player.

## 8. File Structure

```
giftgrub/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home: Quick send flow
│   │   ├── history.tsx            # Gift history & favorites
│   │   ├── feed.tsx               # Social gift wall
│   │   └── profile.tsx            # Settings, subscription, referrals
│   ├── gift/
│   │   ├── [id].tsx               # Gift detail & tracking
│   │   └── send.tsx               # Multi-step send flow
│   ├── _layout.tsx                # Root layout with navigation
│   └── +not-found.tsx
├── components/
│   ├── GiftCard.tsx               # Reusable gift preview card
│   ├── RestaurantPicker.tsx       # Search & select restaurant
│   ├── MessageComposer.tsx        # Text + voice message input
│   ├── DeliveryTracker.tsx        # Real-time map & status
│   └── SubscriptionModal.tsx      # Paywall for premium features
├── store/
│   ├── giftStore.ts               # Zustand store for gifts
│   ├── userStore.ts               # User profile & subscription
│   └── favoritesStore.ts          # Saved restaurants/recipients
├── services/
│   ├── database.ts                # SQLite setup & queries
│   ├── api.ts                     # Mock API for restaurants/delivery
│   ├── notifications.ts           # Push notification handlers
│   └── payments.ts                # Stripe integration
├── utils/
│   ├── validation.ts              # Input validation helpers
│   └── formatting.ts              # Date, currency, text formatting
├── __tests__/
│   ├── giftStore.test.ts
│   ├── database.test.ts
│   ├── validation.test.ts
│   └── components/
│       ├── GiftCard.test.tsx
│       └── MessageComposer.test.tsx
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### Core Logic Tests

**`__tests__/giftStore.test.ts`**
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useGiftStore } from '../store/giftStore';

describe('Gift Store', () => {
  it('should add a new gift', () => {
    const { result } = renderHook(() => useGiftStore());
    
    act(() => {
      result.current.addGift({
        recipientName: 'Alice',
        restaurant: 'Pizza Palace',
        message: 'Happy Birthday!',
        scheduledFor: new Date('2026-03-20'),
      });
    });

    expect(result.current.gifts).toHaveLength(1);
    expect(result.current.gifts[0].recipientName).toBe('Alice');
  });

  it('should update gift status', () => {
    const { result } = renderHook(() => useGiftStore());
    
    act(() => {
      result.current.addGift({
        recipientName: 'Bob',
        restaurant: 'Taco Town',
        message: 'Get well soon!',
      });
    });

    const giftId = result.current.gifts[0].id;

    act(() => {
      result.current.updateGiftStatus(giftId, 'delivered');
    });

    expect(result.current.gifts[0].status).toBe('delivered');
  });
});
```

**`__tests__/database.test.ts`**
```typescript
import { initDatabase, saveGift, getGiftHistory } from '../services/database';

describe('Database Service', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('should save and retrieve gift history', async () => {
    const gift = {
      recipientName: 'Charlie',
      restaurant: 'Burger Barn',
      message: 'Congrats on the promotion!',
      amount: 25.50,
      createdAt: new Date().toISOString(),
    };

    await saveGift(gift);
    const history = await getGiftHistory();

    expect(history.length).toBeGreaterThan(0);
    expect(history[0].recipientName).toBe('Charlie');
  });
});
```

**`__tests__/validation.test.ts`**
```typescript
import { validateRecipient, validateMessage, validateAmount } from '../utils/validation';

describe('Validation Utils', () => {
  it('should validate recipient name', () => {
    expect(validateRecipient('Alice')).toBe(true);
    expect(validateRecipient('')).toBe(false);
    expect(validateRecipient('A')).toBe(false); // Too short
  });

  it('should validate message length', () => {
    expect(validateMessage('Happy Birthday!')).toBe(true);
    expect(validateMessage('')).toBe(false);
    expect(validateMessage('a'.repeat(501))).toBe(false); // Too long
  });

  it('should validate gift amount', () => {
    expect(validateAmount(10)).toBe(true);
    expect(validateAmount(0)).toBe(false);
    expect(validateAmount(-5)).toBe(false);
    expect(validateAmount(1001)).toBe(false); // Over max
  });
});
```

**`__tests__/components/GiftCard.test.tsx`**
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import GiftCard from '../../components/GiftCard';

describe('GiftCard Component', () => {
  it('should render gift details correctly', () => {
    const gift = {
      id: '1',
      recipientName: 'Alice',
      restaurant: 'Pizza Palace',
      message: 'Happy Birthday!',
      status: 'delivered',
      amount: 30,
    };

    const { getByText } = render(<GiftCard gift={gift} />);

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Pizza Palace')).toBeTruthy();
    expect(getByText('Happy Birthday!')).toBeTruthy();
  });
});
```

**`__tests__/components/MessageComposer.test.tsx`**
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MessageComposer from '../../components/MessageComposer';

describe('MessageComposer Component', () => {
  it('should update message on text input', () => {
    const onMessageChange = jest.fn();
    const { getByPlaceholderText } = render(
      <MessageComposer onMessageChange={onMessageChange} />
    );

    const input = getByPlaceholderText('Write your message...');
    fireEvent.changeText(input, 'Thinking of you!');

    expect(onMessageChange).toHaveBeenCalledWith('Thinking of you!');
  });

  it('should show character count', () => {
    const { getByText, getByPlaceholderText } = render(
      <MessageComposer onMessageChange={() => {}} maxLength={500} />
    );

    const input = getByPlaceholderText('Write your message...');
    fireEvent.changeText(input, 'Hello');

    expect(getByText('5 / 500')).toBeTruthy();
  });
});
```

## 10. Implementation Steps

### Phase 1: Project Setup

1. **Initialize Expo project**
   ```bash
   npx create-expo-app giftgrub --template tabs
   cd giftgrub
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-router expo-sqlite expo-notifications react-native-maps
   npm install zustand @stripe/stripe-react-native
   npm install -D jest @testing-library/react-native @testing-library/react-hooks
   ```

3. **Configure TypeScript**
   - Update `tsconfig.json` with strict mode
   - Add path aliases for `@/components`, `@/store`, `@/services`

4. **Setup Jest**
   - Create `jest.config.js` with React Native preset
   - Add test scripts to `package.json`

### Phase 2: Database & State Management

5. **Create SQLite database schema**
   - `services/database.ts`: Define tables for gifts, favorites, users
   - Tables: `gifts` (id, recipientName, restaurant, message, amount, status, createdAt), `favorites` (id, type, name, details)
   - Write init, insert, update, query functions

6. **Setup Zustand stores**
   - `store/giftStore.ts`: Manage gift creation, tracking, history
   - `store/userStore.ts`: User profile, subscription status, free gift count
   - `store/favoritesStore.ts`: Saved restaurants and recipients

7. **Write validation utilities**
   - `utils/validation.ts`: Input validators for recipient, message, amount
   - `utils/formatting.ts`: Date, currency, text formatters

### Phase 3: Core UI Components

8. **Build reusable components**
   - `GiftCard.tsx`: Display gift preview with status badge
   - `RestaurantPicker.tsx`: Search/filter restaurants with location
   - `MessageComposer.tsx`: Text input with character count, voice note button
   - `DeliveryTracker.tsx`: Map view with delivery status timeline
   - `SubscriptionModal.tsx`: Paywall with feature comparison

9. **Create navigation structure**
   - `app/_layout.tsx`: Tab navigator with 4 tabs (Home, History, Feed, Profile)
   - `app/(tabs)/index.tsx`: Home screen with quick send CTA
   - `app/gift/send.tsx`: Multi-step gift creation flow
   - `app/gift/[id].tsx`: Gift detail with tracking

### Phase 4: Gift Sending Flow

10. **Implement quick send flow**
    - Step 1: Enter recipient name or select from contacts
    - Step 2: Choose restaurant (search by cuisine, location)
    - Step 3: Compose message (text + optional voice)
    - Step 4: Schedule delivery (now, later, recurring)
    - Step 5: Review & checkout (Stripe payment)

11. **Integrate mock API**
    - `services/api.ts`: Mock restaurant data, delivery simulation
    - Return sample restaurants with name, cuisine, rating, delivery time
    - Simulate delivery status updates (preparing → en route → delivered)

12. **Add payment integration**
    - `services/payments.ts`: Stripe SDK setup
    - Create payment intent, handle card input
    - Store payment methods for future use

### Phase 5: Tracking & Notifications

13. **Build delivery tracking**
    - `DeliveryTracker.tsx`: Real-time map with driver location (simulated)
    - Status timeline: Order placed → Preparing → Out for delivery → Delivered
    - Photo confirmation on delivery

14. **Setup push notifications**
    - `services/notifications.ts`: Expo Notifications config
    - Send notifications on status changes
    - Request permissions on first launch

15. **Implement gift history**
    - `app/(tabs)/history.tsx`: List of sent/received gifts
    - Filter by status (pending, delivered, scheduled)
    - "Send Again" quick action

### Phase 6: Social Features

16. **Create gift wall feed**
    - `app/(tabs)/feed.tsx`: Scrollable feed of recent gifts (opt-in)
    - Anonymized display: "Someone sent tacos to a friend in Brooklyn 🌮"
    - Like/react to gifts, share to social media

17. **Add social sharing**
    - Generate shareable gift card image
    - Share to Instagram, Twitter, Facebook with deep link
    - Track referrals from shared links

18. **Build referral system**
    - Generate unique referral codes per user
    - Track sign-ups from referrals
    - Award free gift credits to both referrer and referee

### Phase 7: Premium Features

19. **Implement subscription paywall**
    - `SubscriptionModal.tsx`: Show when user hits free tier limit
    - Display feature comparison (free vs Plus)
    - Stripe subscription checkout

20. **Add bulk gifting dashboard**
    - CSV upload for recipient list
    - Auto-assign restaurants based on location
    - Track all deliveries in one view
    - Export delivery report

21. **Build recurring gift scheduler**
    - Set up auto-send on specific dates (birthdays, anniversaries)
    - Reminder notifications 1 day before
    - Edit/cancel recurring gifts

### Phase 8: Polish & Testing

22. **Write all tests**
    - Unit tests for stores, database, validation
    - Component tests for UI elements
    - Integration tests for gift flow
    - Ensure `npm test` passes with >80% coverage

23. **Add error handling**
    - Network error states (retry, offline mode)
    - Payment failures (clear messaging, retry)
    - Delivery issues (refund flow, support contact)

24. **Optimize performance**
    - Lazy load images, use cached data
    - Debounce search inputs
    - Paginate gift history

25. **Design polish**
    - Consistent color scheme (warm, friendly tones)
    - Smooth animations (gift card flip, delivery tracker)
    - Accessibility: VoiceOver support, high contrast mode

### Phase 9: Pre-Launch

26. **Setup analytics**
    - Track key events: gift sent, subscription purchased, referral used
    - Monitor conversion funnel: view → start send → complete

27. **Create onboarding flow**
    - 3-screen intro: "Send gifts instantly", "Track deliveries", "Share the love"
    - Request location, notification permissions
    - Offer first gift free with promo code

28. **Prepare App Store assets**
    - Screenshots for iPhone, iPad
    - App icon (warm, friendly, food-related)
    - Description highlighting key benefits

## 11. How to Verify It Works

### Local Development

1. **Start Expo dev server**
   ```bash
   npx expo start
   ```

2. **Test on iOS Simulator**
   ```bash
   npx expo start --ios
   ```

3. **Test on Android Emulator**
   ```bash
   npx expo start --android
   ```

4. **Test on physical device**
   - Install Expo Go app
   - Scan QR code from terminal
   - Test push notifications (requires physical device)

### Functional Testing Checklist

- [ ] **Quick send flow**: Create a gift from home screen to checkout
- [ ] **Gift tracking**: View delivery status, see map updates
- [ ] **Gift history**: View past gifts, use "Send Again"
- [ ] **Social feed**: See recent gifts, share to social media
- [ ] **Subscription**: Hit free tier limit, upgrade to Plus
- [ ] **Bulk gifting**: Upload CSV, track multiple deliveries
- [ ] **Recurring gifts**: Schedule auto-send, receive reminder
- [ ] **Referral**: Generate code, share with friend, earn credit
- [ ] **Offline mode**: Create draft gift, sync when online
- [ ] **Error handling**: Test payment failure, delivery issue

### Automated Testing

```bash
npm test
```

**Expected output:**
- All tests pass (green checkmarks)
- Coverage >80% for core logic
- No console errors or warnings

### Performance Benchmarks

- App launch: <2 seconds
- Gift send flow: <30 seconds (including payment)
- Gift history load: <1 second (100 gifts)
- Feed scroll: 60fps, no jank

### Pre-Launch Validation

- [ ] Test on iOS 15+ and Android 11+
- [ ] Verify Stripe test mode payments work
- [ ] Confirm push notifications arrive on time
- [ ] Check accessibility with VoiceOver/TalkBack
- [ ] Review App Store guidelines compliance
- [ ] Get 5 beta testers to complete full flow