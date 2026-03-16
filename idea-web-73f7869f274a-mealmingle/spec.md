# MealMingle Spec

## 1. App Name

**FeastFlow**

## 2. One-line pitch

Coordinate group food orders, split costs instantly, and track delivery together—all in one tap.

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Office teams ordering lunch (5-50 people)
- Friend groups planning dinner parties or game nights
- College students coordinating dorm/apartment meals
- Families managing weekly takeout nights
- Event organizers handling catering for small gatherings

**Broadest audience:** Anyone who orders food with others more than once a month. This isn't just about splitting bills—it's about eliminating the friction of "who's ordering what," "did you Venmo me yet," and "where's the delivery driver?"

**Adjacent use cases:**
- Recurring office lunch clubs with rotating organizers
- Neighborhood potluck coordination (who's bringing what, who owes what)
- Sports team post-game meal coordination
- Book club or study group snack runs
- Corporate meeting catering with automatic expense reporting

**Why non-technical people want this:**
- No more awkward "you owe me $12.47" texts
- One person orders, everyone pays their share automatically
- See exactly what everyone ordered before checkout
- Track delivery as a group (no more "is it here yet?" spam)
- Reuse past group orders with one tap

**The gap:** Existing delivery apps treat group orders as an afterthought. You either share a cart link (clunky), manually collect money (awkward), or one person fronts the cost and chases payments. FeastFlow makes group ordering feel as natural as ordering solo.

## 4. Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **Local storage:** expo-sqlite for order history, group templates, and offline support
- **State management:** React Context + hooks (no Redux for MVP)
- **Payments:** Stripe SDK for React Native (split payments, card storage)
- **Real-time:** Expo push notifications for order updates
- **Maps/location:** react-native-maps for delivery tracking
- **UI:** React Native Paper (Material Design components)
- **Testing:** Jest + React Native Testing Library
- **API integration:** Mock delivery API for MVP (later integrate with real services)

## 5. Core features (MVP)

1. **Group Order Creation**
   - Create a group order with a restaurant/menu link
   - Invite friends via SMS/link (no account required to join)
   - Each person adds their items to the shared cart
   - Real-time cart updates visible to all participants
   - Set order deadline and auto-checkout

2. **Instant Cost Splitting**
   - Automatic per-person calculation (item + tax + tip + delivery fee split)
   - One-tap payment via stored card (Stripe)
   - Organizer pays upfront, gets reimbursed instantly
   - Optional: custom split rules (e.g., "I'll cover drinks")

3. **Live Delivery Tracking**
   - Shared map view showing driver location
   - Push notifications for order milestones (confirmed, picked up, arriving)
   - ETA countdown visible to all group members
   - "Driver is here" alert

4. **Group Templates**
   - Save frequent groups (e.g., "Office Lunch Crew," "Friday Night Squad")
   - One-tap reorder from past group orders
   - Recurring order scheduling (e.g., every Friday at noon)

5. **Payment History & Receipts**
   - Per-person itemized receipts
   - Export to CSV for expense reports
   - Payment status tracking (who paid, who's pending)

## 6. Monetization strategy

### Free tier (hook):
- Create/join up to 3 group orders per month
- Basic cost splitting (equal split only)
- Manual payment requests (Venmo/Cash App links)
- Standard delivery tracking
- 7-day order history

### Paid tier: **FeastFlow Pro - $4.99/month** (hook vs paywall)

**Why $4.99?**
- Lower than typical subscription apps ($9.99)
- Cheaper than one delivery fee
- Impulse-buy territory for frequent users
- Pays for itself if you organize 2+ group orders/month

**Pro features:**
- Unlimited group orders
- Smart cost splitting (custom rules, item-level splits)
- Instant payment processing (no manual Venmo requests)
- Group templates & recurring orders
- Priority support for order issues
- 90-day order history + expense export
- Early access to restaurant partnerships (exclusive discounts)

**What makes people STAY subscribed?**
- Habit formation: Once you organize 1-2 group orders via FeastFlow, going back to manual coordination feels painful
- Social lock-in: If you're the organizer, your group expects you to use FeastFlow
- Time savings: Automated splitting saves 10+ minutes per order
- Financial tracking: Expense export for work lunches justifies the cost
- Recurring orders: Set-and-forget weekly team lunches

**Additional revenue streams (post-MVP):**
- Restaurant partnerships (commission on orders placed through app)
- Corporate team plans ($49/month for 10+ users with admin dashboard)
- White-label for event planners

## 7. Skip if saturated

**NOT SKIPPING.** While Uber Eats and DoorDash have group ordering features, they're buried in the UX and don't handle payment splitting natively. Splitwise handles cost-splitting but isn't food-specific and requires manual entry. No incumbent owns the "group food coordination" niche end-to-end. The gap is real and underserved.

## 8. File structure

```
feastflow/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home: active orders
│   │   ├── groups.tsx             # Saved groups & templates
│   │   ├── history.tsx            # Order history
│   │   └── profile.tsx            # Settings & subscription
│   ├── order/
│   │   ├── [id].tsx               # Order detail & tracking
│   │   ├── create.tsx             # Create new group order
│   │   └── join.tsx               # Join via link
│   ├── payment/
│   │   ├── setup.tsx              # Add payment method
│   │   └── split.tsx              # Review & pay split
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── OrderCard.tsx
│   ├── GroupMemberList.tsx
│   ├── CartItemList.tsx
│   ├── DeliveryMap.tsx
│   ├── PaymentSplitView.tsx
│   └── SubscriptionPrompt.tsx
├── lib/
│   ├── database.ts                # SQLite setup & migrations
│   ├── stripe.ts                  # Payment processing
│   ├── notifications.ts           # Push notification handlers
│   └── api.ts                     # Mock delivery API
├── hooks/
│   ├── useOrder.ts
│   ├── useGroup.ts
│   ├── usePayment.ts
│   └── useSubscription.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── OrderContext.tsx
├── types/
│   └── index.ts
├── __tests__/
│   ├── lib/
│   │   ├── database.test.ts
│   │   └── stripe.test.ts
│   ├── hooks/
│   │   ├── useOrder.test.ts
│   │   └── usePayment.test.ts
│   └── components/
│       ├── OrderCard.test.tsx
│       └── PaymentSplitView.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### Core logic tests (Jest):

**`__tests__/lib/database.test.ts`**
- Test order creation and retrieval
- Test group template saving/loading
- Test payment history queries
- Test data migration

**`__tests__/lib/stripe.test.ts`**
- Test payment split calculation
- Test payment intent creation
- Test refund processing
- Test subscription status checks

**`__tests__/hooks/useOrder.test.ts`**
- Test order state management
- Test adding/removing items from cart
- Test order finalization logic
- Test delivery status updates

**`__tests__/hooks/usePayment.test.ts`**
- Test cost splitting algorithms (equal, custom, item-level)
- Test payment status tracking
- Test receipt generation

**`__tests__/components/OrderCard.test.tsx`**
- Test rendering order details
- Test status badge display
- Test navigation to order detail

**`__tests__/components/PaymentSplitView.test.tsx`**
- Test split calculation display
- Test payment button states
- Test custom split input validation

## 10. Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app feastflow --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-router react-native-paper react-native-maps
   npm install @stripe/stripe-react-native
   npm install -D jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json` with app name, bundle ID, permissions (location, notifications)
4. Set up TypeScript types in `types/index.ts` (Order, Group, Payment, User)
5. Configure Jest in `jest.config.js` with React Native preset

### Phase 2: Database layer
1. Create `lib/database.ts`:
   - Initialize SQLite database
   - Create tables: orders, groups, group_members, payments, cart_items
   - Write migration functions
   - Export CRUD functions for each entity
2. Write tests in `__tests__/lib/database.test.ts`
3. Run `npm test` to verify database logic

### Phase 3: Authentication & user setup
1. Create `contexts/AuthContext.tsx`:
   - Simple phone number + SMS verification (mock for MVP)
   - Store user ID in AsyncStorage
   - Provide auth state to app
2. Create `app/payment/setup.tsx`:
   - Stripe card input form
   - Save payment method to Stripe customer
   - Store customer ID in local DB
3. Update `app/(tabs)/profile.tsx` to show payment methods

### Phase 4: Order creation flow
1. Create `app/order/create.tsx`:
   - Form: restaurant name, menu link, order deadline
   - Generate shareable link (deep link with order ID)
   - Save order to DB with status "pending"
   - Navigate to order detail screen
2. Create `app/order/[id].tsx`:
   - Display order info (restaurant, deadline, participants)
   - Show shared cart with all items
   - "Add item" button (opens modal with item name, price, quantity)
   - Real-time updates (poll DB every 5s for MVP, WebSocket later)
   - "Finalize order" button (only for organizer)
3. Create `components/CartItemList.tsx`:
   - Render list of items with owner name
   - Show running total
4. Write tests for order creation logic

### Phase 5: Joining orders
1. Create `app/order/join.tsx`:
   - Parse order ID from deep link
   - Fetch order details from DB
   - Prompt for name if not logged in
   - Add user to group_members table
   - Navigate to order detail screen
2. Test deep linking in Expo Go

### Phase 6: Payment splitting
1. Create `lib/stripe.ts`:
   - Function: `calculateSplit(order, splitType)` - returns per-person amounts
   - Function: `createPaymentIntents(order, participants)` - creates Stripe payment intents
   - Function: `processPayments(order)` - charges all participants, pays organizer
2. Create `app/payment/split.tsx`:
   - Display itemized breakdown per person
   - Show total owed
   - "Pay now" button (triggers Stripe payment)
   - Payment status indicator
3. Create `components/PaymentSplitView.tsx`:
   - Reusable component for split display
   - Support equal split and custom split modes
4. Write tests in `__tests__/lib/stripe.test.ts` and `__tests__/hooks/usePayment.test.ts`

### Phase 7: Delivery tracking
1. Create `components/DeliveryMap.tsx`:
   - Render react-native-maps with delivery location
   - Mock driver location updates (move marker every 10s)
   - Show ETA countdown
2. Update `app/order/[id].tsx`:
   - Add map view when order status is "out_for_delivery"
   - Show status timeline (ordered → preparing → picked up → arriving → delivered)
3. Set up push notifications in `lib/notifications.ts`:
   - Request permissions
   - Send local notifications for status changes (mock for MVP)

### Phase 8: Group templates
1. Create `app/(tabs)/groups.tsx`:
   - List saved groups
   - "Create group" button (name + add members)
   - Tap group to see past orders
   - "Reorder" button (creates new order with same participants)
2. Update `lib/database.ts` with group template functions
3. Create `components/GroupMemberList.tsx` for displaying members

### Phase 9: Order history
1. Create `app/(tabs)/history.tsx`:
   - List past orders with date, restaurant, total
   - Filter by date range
   - Tap to view receipt
2. Add receipt export function (generate CSV from order data)
3. Create `components/OrderCard.tsx` for list items

### Phase 10: Subscription & paywall
1. Create `hooks/useSubscription.ts`:
   - Check subscription status (mock for MVP, Stripe Billing later)
   - Track free tier usage (order count this month)
   - Return `isPro` boolean
2. Create `components/SubscriptionPrompt.tsx`:
   - Modal showing Pro features
   - "Upgrade" button (navigate to payment setup)
   - Dismiss button
3. Add paywall checks:
   - In `app/order/create.tsx`: show prompt if free tier limit reached
   - In `app/payment/split.tsx`: disable instant payment for free users
4. Update `app/(tabs)/profile.tsx` with subscription management

### Phase 11: Polish & testing
1. Add loading states and error handling to all screens
2. Implement optimistic UI updates (show changes before DB write completes)
3. Add haptic feedback for key actions (order finalized, payment complete)
4. Write remaining component tests
5. Run full test suite: `npm test`
6. Test on iOS simulator and Android emulator
7. Test deep linking with `npx uri-scheme open feastflow://order/join/123 --ios`

### Phase 12: Pre-launch
1. Create app icon and splash screen
2. Add onboarding flow (3 screens explaining core features)
3. Set up error tracking (Sentry or similar)
4. Configure EAS Build for TestFlight/Play Store beta
5. Write App Store description and screenshots

## 11. How to verify it works

### Local development:
1. Start Expo dev server: `npx expo start`
2. Open in Expo Go on physical device or simulator
3. Test core flows:
   - Create account → add payment method
   - Create group order → add items → share link
   - Open link on second device → join order → add items
   - Finalize order → verify split calculation
   - View delivery tracking (mock driver movement)
   - Check order history and receipt export
4. Run test suite: `npm test` (all tests must pass)
5. Test deep linking: `npx uri-scheme open feastflow://order/join/[test-order-id] --ios`

### Acceptance criteria:
- [ ] User can create an order and invite others via link
- [ ] Multiple users can add items to shared cart in real-time
- [ ] Cost splitting calculates correctly (equal split + custom splits)
- [ ] Payment processing completes without errors (test mode)
- [ ] Delivery map shows mock driver location updates
- [ ] Push notifications trigger on status changes
- [ ] Order history displays past orders with receipts
- [ ] Free tier limits enforce correctly (3 orders/month)
- [ ] Subscription prompt appears when limit reached
- [ ] All Jest tests pass (`npm test` exits with code 0)
- [ ] App runs without crashes on iOS and Android

### Performance benchmarks:
- Order creation: < 2s from form submit to detail screen
- Cart updates: < 500ms latency between devices
- Payment processing: < 5s from button tap to confirmation
- App launch: < 3s cold start on mid-range device