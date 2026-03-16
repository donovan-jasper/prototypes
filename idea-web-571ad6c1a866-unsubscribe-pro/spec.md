# Unsubscribe Pro Spec

## 1. App Name

**InboxZen**

## 2. One-line pitch

"Reclaim your inbox in seconds — swipe away spam, unsubscribe instantly, and breathe easier with AI-powered email cleanup."

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Busy professionals (25-45) drowning in promotional emails, newsletters, and subscription spam
- Parents managing multiple email accounts (personal, work, kids' schools)
- Job seekers overwhelmed by recruiter spam and application confirmations
- Small business owners juggling client emails and marketing noise
- Students dealing with university announcements and promotional clutter

**Broadest audience:**
Anyone with an email address who feels anxious opening their inbox. This isn't just about unsubscribing — it's about digital wellness and taking back control of your attention.

**Adjacent use cases:**
- Privacy audit tool: Shows which companies have your email and what they're sending
- Email spending tracker: Identifies subscription services you're paying for via email receipts
- Relationship manager: Surfaces important personal emails buried under promotional noise
- Digital declutter coach: Gamifies inbox cleanup with streaks and achievements
- GDPR/privacy compliance helper: Bulk data deletion requests to companies

**Why non-technical people want this:**
Email anxiety is universal. People don't want to "manage email settings" — they want to feel calm when they open their phone. InboxZen makes that happen with one swipe, no technical knowledge required. It's the Marie Kondo for your digital life.

## 4. Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **Email integration:** IMAP/OAuth2 (Gmail API, Outlook Graph API)
- **State management:** Zustand
- **Navigation:** Expo Router (file-based)
- **UI:** React Native Paper + custom components
- **Testing:** Jest + React Native Testing Library
- **Analytics:** Expo Analytics (privacy-first)
- **Payments:** RevenueCat (cross-platform subscriptions)

## 5. Core features (MVP)

1. **Smart Scan & Categorize**
   - Connects via OAuth (read-only initially)
   - Scans inbox for subscription/promotional emails
   - Groups by sender with frequency stats
   - Shows "last 30 days" volume per sender

2. **One-Swipe Unsubscribe**
   - Swipe right to unsubscribe instantly
   - Finds unsubscribe links automatically
   - Confirms action, then archives/deletes email
   - Works offline (queues actions)

3. **Inbox Health Score**
   - Visual dashboard showing clutter reduction
   - Weekly summary: "You saved 2.3 hours this week"
   - Streak counter for daily cleanup habits

4. **Privacy Shield**
   - Shows which senders track email opens
   - Flags suspicious/phishing emails
   - One-tap "Request Data Deletion" for GDPR compliance

5. **Quick Actions Widget**
   - iOS/Android home screen widget
   - Shows top 3 clutter sources
   - Tap to unsubscribe without opening app

## 6. Monetization strategy

**Free tier (hook):**
- 10 unsubscribes per month
- Basic inbox scan (shows clutter sources)
- Health score dashboard
- Manual unsubscribe only

**Paid tier — InboxZen Pro ($3.99/month or $29.99/year):**
- Unlimited unsubscribes
- Auto-unsubscribe rules (e.g., "auto-remove anything from retailers I haven't opened in 60 days")
- Bulk actions (unsubscribe from 50+ senders at once)
- Email spending tracker (finds subscription charges)
- Priority support + early access to features
- Privacy monitoring alerts

**Price reasoning:**
$3.99/month positions between basic utilities ($0.99) and productivity tools ($9.99). Annual plan offers 37% savings to encourage commitment. Users pay because:
- Time saved is worth $4/month (avg person spends 28 min/day on email)
- Reduces subscription waste (users often find $10-30/month in forgotten subscriptions)
- Peace of mind is priceless (inbox anxiety is real)

**Retention drivers:**
- Weekly "You saved X hours" notifications
- Gamification (streaks, achievements)
- Continuous value (new clutter appears daily)
- Sunk cost (once inbox is clean, don't want to lose progress)

## 7. Market viability

**NOT SKIP** — Clear gap exists:

- Clean Email: Desktop-first, clunky mobile UX, expensive ($9.99/mo)
- Unroll.me: Privacy scandal (sold user data), trust issues
- SaneBox: Email forwarding (scary for users), complex setup
- Native tools: Limited to single provider (Gmail/Outlook), no cross-platform intelligence

InboxZen differentiates with:
- Mobile-native swipe UX (feels like Tinder for email)
- Privacy-first (OAuth read-only, no data selling)
- Cross-platform (works with any email provider)
- Wellness angle (reduces digital anxiety, not just "productivity")

## 8. File structure

```
inboxzen/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home/Dashboard
│   │   ├── scan.tsx               # Email scan results
│   │   ├── insights.tsx           # Health score & analytics
│   │   └── settings.tsx           # Account & preferences
│   ├── _layout.tsx                # Root layout with navigation
│   ├── auth.tsx                   # Email OAuth flow
│   └── onboarding.tsx             # First-time user flow
├── components/
│   ├── EmailCard.tsx              # Swipeable email sender card
│   ├── HealthScore.tsx            # Circular progress indicator
│   ├── UnsubscribeButton.tsx      # Action button with loading state
│   └── PrivacyBadge.tsx           # Tracker detection indicator
├── lib/
│   ├── database.ts                # SQLite setup & queries
│   ├── email-parser.ts            # Extract unsubscribe links
│   ├── email-client.ts            # IMAP/API wrapper
│   ├── analytics.ts               # Calculate health metrics
│   └── subscription-detector.ts   # Identify promotional emails
├── store/
│   ├── email-store.ts             # Zustand store for email data
│   └── user-store.ts              # User preferences & auth
├── hooks/
│   ├── useEmailScan.ts            # Scan inbox logic
│   ├── useUnsubscribe.ts          # Unsubscribe action handler
│   └── useHealthScore.ts          # Calculate metrics
├── constants/
│   ├── Colors.ts                  # Theme colors
│   └── Config.ts                  # API keys, limits
├── __tests__/
│   ├── email-parser.test.ts
│   ├── subscription-detector.test.ts
│   ├── analytics.test.ts
│   └── components/
│       ├── EmailCard.test.tsx
│       └── HealthScore.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## 9. Tests

### Core logic tests

**`__tests__/email-parser.test.ts`**
- Extract unsubscribe links from email HTML
- Handle missing unsubscribe links gracefully
- Parse List-Unsubscribe headers
- Detect one-click unsubscribe (RFC 8058)

**`__tests__/subscription-detector.test.ts`**
- Identify promotional emails by headers
- Detect marketing keywords in subject lines
- Classify sender types (newsletter, retail, service)
- Handle edge cases (transactional vs promotional)

**`__tests__/analytics.test.ts`**
- Calculate inbox health score (0-100)
- Compute time saved based on email volume
- Track unsubscribe streaks
- Generate weekly summary stats

**`__tests__/components/EmailCard.test.tsx`**
- Render sender info correctly
- Swipe gesture triggers unsubscribe
- Loading state during action
- Success/error feedback

**`__tests__/components/HealthScore.test.tsx`**
- Display score as circular progress
- Animate score changes
- Show contextual messages ("Great job!", "Keep going")

## 10. Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app inboxzen --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-auth-session expo-web-browser
   npm install zustand react-native-paper react-native-gesture-handler
   npm install --save-dev @testing-library/react-native jest
   ```
3. Configure TypeScript strict mode in `tsconfig.json`
4. Set up file-based routing with Expo Router
5. Configure app.json with proper bundle ID and permissions

### Phase 2: Database layer
1. Create `lib/database.ts`:
   - Initialize SQLite database
   - Create tables: `emails`, `senders`, `unsubscribe_queue`, `user_settings`
   - Write CRUD functions for each table
2. Add migration system for schema updates
3. Write tests for database operations

### Phase 3: Email integration
1. Create `lib/email-client.ts`:
   - Implement OAuth2 flow for Gmail (use expo-auth-session)
   - Add IMAP connection fallback for other providers
   - Fetch inbox messages (last 30 days)
   - Parse email headers and body
2. Create `lib/email-parser.ts`:
   - Extract unsubscribe links from HTML
   - Parse List-Unsubscribe headers
   - Detect one-click unsubscribe support
3. Create `lib/subscription-detector.ts`:
   - Classify emails as promotional/transactional
   - Group by sender domain
   - Calculate frequency stats
4. Write comprehensive tests for all email logic

### Phase 4: Core UI components
1. Build `components/EmailCard.tsx`:
   - Display sender name, logo, email count
   - Implement swipe-to-unsubscribe with react-native-gesture-handler
   - Show loading spinner during action
   - Success/error toast notifications
2. Build `components/HealthScore.tsx`:
   - Circular progress indicator (use react-native-svg)
   - Animate score changes
   - Display contextual messages
3. Build `components/UnsubscribeButton.tsx`:
   - Primary action button
   - Loading and disabled states
   - Haptic feedback on press
4. Write component tests

### Phase 5: State management
1. Create `store/email-store.ts`:
   - Zustand store for scanned emails
   - Actions: scanInbox, unsubscribe, markAsProcessed
   - Persist to SQLite
2. Create `store/user-store.ts`:
   - User auth state
   - Preferences (auto-delete, notification settings)
   - Subscription tier (free/pro)
3. Create hooks:
   - `useEmailScan`: Trigger inbox scan, handle loading/error
   - `useUnsubscribe`: Execute unsubscribe action, update UI
   - `useHealthScore`: Calculate and return metrics

### Phase 6: Screens
1. Build `app/auth.tsx`:
   - OAuth login flow
   - Email provider selection
   - Permission explanation
2. Build `app/onboarding.tsx`:
   - 3-screen intro (problem → solution → value)
   - Request notification permissions
   - Trigger first scan
3. Build `app/(tabs)/index.tsx`:
   - Health score dashboard
   - Quick stats (emails cleaned, time saved)
   - CTA to scan inbox
4. Build `app/(tabs)/scan.tsx`:
   - List of sender cards (FlatList)
   - Swipe actions
   - Filter/sort options
5. Build `app/(tabs)/insights.tsx`:
   - Weekly summary
   - Charts (emails over time, top senders)
   - Achievements/streaks
6. Build `app/(tabs)/settings.tsx`:
   - Account management
   - Subscription upgrade
   - Privacy policy, support links

### Phase 7: Background processing
1. Implement unsubscribe queue:
   - Store actions in SQLite when offline
   - Process queue when online
   - Retry failed attempts
2. Add background fetch (expo-background-fetch):
   - Periodic inbox scan (daily)
   - Push notification for new clutter
3. Handle edge cases:
   - Network errors
   - Invalid unsubscribe links
   - Rate limiting

### Phase 8: Monetization
1. Integrate RevenueCat:
   - Configure products (monthly/annual)
   - Implement paywall screen
   - Check entitlements before premium features
2. Add usage limits for free tier:
   - Track unsubscribe count in SQLite
   - Show upgrade prompt at limit
3. Implement trial period (7 days free Pro)

### Phase 9: Polish
1. Add animations (react-native-reanimated):
   - Card swipe feedback
   - Score counter animation
   - Screen transitions
2. Implement haptic feedback (expo-haptics)
3. Add empty states and error screens
4. Optimize performance (memoization, lazy loading)
5. Test on physical devices (iOS + Android)

### Phase 10: Testing & launch prep
1. Run full test suite: `npm test`
2. Manual testing checklist:
   - OAuth flow for Gmail, Outlook
   - Scan 100+ emails
   - Unsubscribe from 10+ senders
   - Verify offline queue works
   - Test subscription purchase flow
3. Prepare App Store assets:
   - Screenshots (5.5" and 6.5" iPhone)
   - App icon (1024x1024)
   - Privacy policy URL
   - App description with keywords
4. Submit to TestFlight and Google Play beta

## 11. How to verify it works

### Development testing
1. Start Expo dev server: `npx expo start`
2. Open in Expo Go on physical device (iOS or Android)
3. Test OAuth flow:
   - Tap "Connect Email"
   - Authorize with Gmail test account
   - Verify redirect back to app
4. Test email scan:
   - Tap "Scan Inbox"
   - Wait for scan to complete (should show 10+ senders)
   - Verify sender cards display correctly
5. Test unsubscribe:
   - Swipe right on a sender card
   - Confirm unsubscribe action
   - Verify success toast appears
   - Check email was archived/deleted
6. Test health score:
   - Navigate to Insights tab
   - Verify score updates after unsubscribe
   - Check weekly summary displays

### Automated testing
```bash
npm test
```

All tests must pass:
- Email parser extracts unsubscribe links correctly
- Subscription detector classifies emails accurately
- Analytics calculates health score properly
- Components render without errors
- Swipe gestures trigger correct actions

### Production readiness checklist
- [ ] OAuth works for Gmail and Outlook
- [ ] Scans 100+ emails in <10 seconds
- [ ] Unsubscribe success rate >90%
- [ ] App doesn't crash on low-end devices
- [ ] Offline mode queues actions correctly
- [ ] Subscription purchase flow completes
- [ ] Push notifications deliver
- [ ] All tests pass (`npm test`)
- [ ] No console errors in production build
- [ ] Privacy policy and terms of service linked