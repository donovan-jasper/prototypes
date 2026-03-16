# Support Sentinel

## One-line pitch
Never miss a response again — get instant alerts when your support tickets are stuck, with smart follow-ups that get you answers faster.

## Expanded vision

**Core audience:** Anyone who's ever submitted a support ticket and wondered "did they forget about me?"

This isn't just for Shopify merchants or business owners. This is for:

- **Everyday consumers** dealing with delayed refunds, shipping issues, account problems (Amazon, PayPal, banks, utilities)
- **Freelancers and gig workers** waiting on platform support (Uber, DoorDash, Upwork, Fiverr)
- **SaaS users** stuck in support limbo (Adobe, Microsoft, Google Workspace)
- **Students** waiting on university IT, financial aid, or housing support
- **Patients** tracking medical billing inquiries or insurance claims
- **Renters** following up on maintenance requests or deposit returns

**The real problem:** Support tickets disappear into black holes. You don't know if your issue is being worked on, forgotten, or lost. You waste mental energy remembering to check back. You miss responses because they arrive at 2am or get buried in email.

**Why this wins:** It's a universal pain point with no dedicated solution. Everyone has 3-10 open support tickets at any given time across different services. This becomes your single dashboard for "things people owe me answers on."

**Adjacent use cases:**
- Track job applications (same pattern: submit, wait, wonder)
- Monitor government requests (permits, licenses, benefits)
- Follow up on insurance claims
- Chase down vendor quotes or proposals

**Non-technical appeal:** It's like having a personal assistant who remembers to bug people for you. Set it and forget it — the app does the nagging.

## Tech stack

- **Framework:** React Native (Expo) for iOS + Android
- **Local storage:** SQLite (expo-sqlite) for ticket data
- **Push notifications:** Expo Notifications
- **Background tasks:** expo-task-manager for periodic checks
- **HTTP client:** axios for API calls
- **State management:** React Context (keep it simple)
- **Date handling:** date-fns
- **Testing:** Jest + React Native Testing Library

**Key dependencies:**
```json
{
  "expo": "~52.0.0",
  "expo-sqlite": "~15.0.0",
  "expo-notifications": "~0.29.0",
  "expo-task-manager": "~12.0.0",
  "axios": "^1.7.0",
  "date-fns": "^3.0.0"
}
```

## Core features (MVP)

1. **Manual ticket tracking**
   - Add any support ticket with: company name, ticket ID, submission date, description
   - Set expected response time (24h, 48h, 1 week)
   - Get push notification when deadline passes with no update

2. **Smart status detection**
   - Paste email confirmation or support page URL
   - App extracts ticket number, company, and date automatically
   - Suggests response time based on company (learns over time)

3. **One-tap follow-ups**
   - When ticket is overdue, tap to generate follow-up message
   - Copy to clipboard or open email/support portal directly
   - Templates adapt to how long it's been delayed

4. **Timeline view**
   - See all tickets in one feed: active, overdue, resolved
   - Color-coded urgency (green = on track, yellow = due soon, red = overdue)
   - Quick actions: mark resolved, snooze, escalate

5. **Delay insights**
   - Track which companies are fastest/slowest
   - See your average resolution time
   - Export history for disputes or records

## Monetization strategy

**Free tier (hook):**
- Track up to 3 active tickets at once
- Basic push notifications when tickets are overdue
- Manual entry only
- 30-day history

**Pro ($4.99/month or $39.99/year):**
- Unlimited active tickets
- Smart extraction from emails/screenshots
- Custom response time expectations
- Follow-up message templates
- Full history and export
- Priority support (ironic but effective)

**Why this price:** Lower than typical productivity apps ($9.99) because the pain point is episodic, not daily. But high enough to signal value. Annual discount encourages commitment.

**Retention drivers:**
- Historical data (switching cost)
- Learned company response times (gets smarter over time)
- Peace of mind (insurance model — you hope you don't need it, but glad it's there)
- Seasonal spikes (holiday shopping, tax season, back-to-school) remind people why they subscribed

**Future revenue:**
- Business tier ($29/month): Team dashboard, shared ticket tracking, SLA monitoring
- API integrations (Zendesk, Intercom, etc.) as premium add-on

## File structure

```
support-sentinel/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Active tickets feed
│   │   ├── insights.tsx              # Stats and company performance
│   │   └── settings.tsx              # Preferences and subscription
│   ├── ticket/
│   │   ├── [id].tsx                  # Ticket detail view
│   │   └── add.tsx                   # Add new ticket
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── TicketCard.tsx                # Ticket list item
│   ├── StatusBadge.tsx               # Visual status indicator
│   ├── FollowUpButton.tsx            # Generate follow-up action
│   ├── CompanyLogo.tsx               # Company icon/avatar
│   └── EmptyState.tsx                # No tickets placeholder
├── lib/
│   ├── database.ts                   # SQLite setup and queries
│   ├── notifications.ts              # Push notification logic
│   ├── ticketParser.ts               # Extract ticket info from text
│   ├── followUpGenerator.ts          # Template messages
│   ├── backgroundTasks.ts            # Check for overdue tickets
│   └── types.ts                      # TypeScript interfaces
├── hooks/
│   ├── useTickets.ts                 # Ticket CRUD operations
│   ├── useNotifications.ts           # Notification permissions
│   └── useSubscription.ts            # Pro status check
├── constants/
│   ├── Companies.ts                  # Known companies and defaults
│   └── Colors.ts                     # Theme colors
├── __tests__/
│   ├── database.test.ts
│   ├── ticketParser.test.ts
│   ├── followUpGenerator.test.ts
│   └── components/
│       ├── TicketCard.test.tsx
│       └── StatusBadge.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

**lib/__tests__/database.test.ts**
```typescript
import { openDatabase, createTicket, getTickets, updateTicket, deleteTicket } from '../database';

describe('Database operations', () => {
  beforeEach(async () => {
    // Reset database before each test
  });

  test('creates ticket successfully', async () => {
    const ticket = await createTicket({
      company: 'Amazon',
      ticketId: 'AMZ-12345',
      description: 'Refund request',
      submittedAt: new Date(),
      expectedResponseHours: 48
    });
    expect(ticket.id).toBeDefined();
  });

  test('retrieves active tickets', async () => {
    await createTicket({ /* ... */ });
    const tickets = await getTickets('active');
    expect(tickets.length).toBeGreaterThan(0);
  });
});
```

**lib/__tests__/ticketParser.test.ts**
```typescript
import { parseTicketFromText } from '../ticketParser';

describe('Ticket parser', () => {
  test('extracts ticket ID from email', () => {
    const text = 'Your support request #12345 has been received';
    const result = parseTicketFromText(text);
    expect(result.ticketId).toBe('12345');
  });

  test('identifies company from domain', () => {
    const text = 'support@amazon.com - Case #AMZ-67890';
    const result = parseTicketFromText(text);
    expect(result.company).toBe('Amazon');
  });

  test('extracts date from confirmation', () => {
    const text = 'Submitted on March 15, 2026 at 2:30 PM';
    const result = parseTicketFromText(text);
    expect(result.submittedAt).toBeDefined();
  });
});
```

**lib/__tests__/followUpGenerator.test.ts**
```typescript
import { generateFollowUp } from '../followUpGenerator';

describe('Follow-up generator', () => {
  test('generates polite message for 1-day delay', () => {
    const message = generateFollowUp({
      company: 'Shopify',
      ticketId: 'SHOP-123',
      daysOverdue: 1
    });
    expect(message).toContain('checking in');
    expect(message).not.toContain('urgent');
  });

  test('generates urgent message for 7-day delay', () => {
    const message = generateFollowUp({
      company: 'PayPal',
      ticketId: 'PP-456',
      daysOverdue: 7
    });
    expect(message).toContain('urgent');
  });
});
```

**components/__tests__/TicketCard.test.tsx**
```typescript
import { render } from '@testing-library/react-native';
import TicketCard from '../TicketCard';

describe('TicketCard', () => {
  test('renders ticket information', () => {
    const ticket = {
      id: 1,
      company: 'Amazon',
      ticketId: 'AMZ-123',
      description: 'Refund',
      status: 'active',
      submittedAt: new Date(),
      expectedResponseHours: 48
    };
    const { getByText } = render(<TicketCard ticket={ticket} />);
    expect(getByText('Amazon')).toBeTruthy();
    expect(getByText('AMZ-123')).toBeTruthy();
  });

  test('shows overdue badge when delayed', () => {
    const ticket = {
      /* ... */
      submittedAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
      expectedResponseHours: 48
    };
    const { getByText } = render(<TicketCard ticket={ticket} />);
    expect(getByText(/overdue/i)).toBeTruthy();
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest support-sentinel --template blank-typescript
cd support-sentinel
npx expo install expo-sqlite expo-notifications expo-task-manager axios date-fns
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

### 2. Database layer (lib/database.ts)
- Initialize SQLite database with tickets table
- Schema: id, company, ticketId, description, status (active/resolved/snoozed), submittedAt, expectedResponseHours, resolvedAt, notes
- Implement CRUD functions: createTicket, getTickets, updateTicket, deleteTicket
- Add migration logic for future schema changes

### 3. Type definitions (lib/types.ts)
```typescript
export interface Ticket {
  id: number;
  company: string;
  ticketId: string;
  description: string;
  status: 'active' | 'resolved' | 'snoozed';
  submittedAt: Date;
  expectedResponseHours: number;
  resolvedAt?: Date;
  notes?: string;
}

export interface ParsedTicket {
  company?: string;
  ticketId?: string;
  submittedAt?: Date;
}
```

### 4. Ticket parser (lib/ticketParser.ts)
- Regex patterns for common ticket ID formats (#12345, CASE-123, etc.)
- Email domain to company name mapping
- Date extraction from various formats
- Return ParsedTicket with confidence scores

### 5. Follow-up generator (lib/followUpGenerator.ts)
- Templates based on days overdue (1-2 days: polite, 3-5: firm, 6+: urgent)
- Personalize with company name and ticket ID
- Include original submission date for context
- Return plain text suitable for email or copy-paste

### 6. Notification setup (lib/notifications.ts)
- Request permissions on first launch
- Schedule local notifications for ticket deadlines
- Handle notification tap to open specific ticket
- Background task to check overdue tickets every 6 hours

### 7. Background tasks (lib/backgroundTasks.ts)
- Register task with expo-task-manager
- Query database for tickets past expectedResponseHours
- Trigger notifications for newly overdue tickets
- Update ticket status if needed

### 8. Custom hooks (hooks/)
- useTickets: wraps database operations with React state
- useNotifications: manages permission status and scheduling
- useSubscription: checks Pro status (mock for MVP, integrate RevenueCat later)

### 9. UI components (components/)
- TicketCard: displays ticket with status badge, company logo, time remaining
- StatusBadge: color-coded pill (green/yellow/red)
- FollowUpButton: generates message and opens share sheet
- CompanyLogo: shows icon for known companies, initials for others
- EmptyState: friendly message when no tickets exist

### 10. Main feed (app/(tabs)/index.tsx)
- FlatList of active tickets sorted by urgency
- Pull-to-refresh
- Floating action button to add ticket
- Filter tabs: All, Overdue, On Track

### 11. Add ticket screen (app/ticket/add.tsx)
- Form with company name, ticket ID, description
- Date picker for submission date (defaults to now)
- Expected response time picker (24h, 48h, 1 week, custom)
- "Smart paste" button to parse from clipboard
- Save button creates ticket and schedules notification

### 12. Ticket detail (app/ticket/[id].tsx)
- Full ticket information
- Timeline of events (created, followed up, resolved)
- Notes field for user comments
- Actions: Mark resolved, Snooze, Generate follow-up, Delete
- Edit mode to update details

### 13. Insights tab (app/(tabs)/insights.tsx)
- Stats: total tickets, average resolution time, overdue count
- Company leaderboard: fastest to slowest responders
- Chart of tickets over time (last 30 days)
- Export button (CSV of all tickets)

### 14. Settings tab (app/(tabs)/settings.tsx)
- Notification preferences (enable/disable, quiet hours)
- Default expected response time
- Subscription status and upgrade button
- About, privacy policy, contact support

### 15. Navigation setup (app/_layout.tsx)
- Tab navigator with icons for Feed, Insights, Settings
- Stack navigator for ticket detail and add screens
- Configure header styles and transitions

### 16. Known companies (constants/Companies.ts)
- Array of popular companies with default response times
- Logo URLs or icon names
- Support portal URLs for quick access

### 17. Write tests
- Run through all test files in __tests__/
- Ensure 80%+ code coverage for lib/ functions
- Test edge cases (invalid dates, missing fields, etc.)

### 18. Polish
- Add loading states and error handling
- Implement haptic feedback on actions
- Add animations for status changes
- Optimize FlatList performance with memo
- Test on both iOS and Android simulators

### 19. Subscription flow (future)
- Integrate expo-in-app-purchases or RevenueCat
- Paywall screen after 3 tickets
- Restore purchases button
- Handle subscription status across app

## How to verify it works

### Local development
```bash
npm install
npm test                    # All tests must pass
npx expo start
```

### On device/simulator
1. Press 'i' for iOS simulator or 'a' for Android
2. Grant notification permissions when prompted
3. Add a test ticket:
   - Company: "Amazon"
   - Ticket ID: "AMZ-12345"
   - Expected response: 24 hours
   - Set submission date to 2 days ago
4. Verify ticket shows as "overdue" with red badge
5. Tap "Generate follow-up" and confirm message appears
6. Mark ticket as resolved and verify it moves to resolved list
7. Add 2 more tickets to test free tier limit
8. Attempt to add 4th ticket and verify paywall appears
9. Background: lock device for 10 minutes, verify notification appears for overdue ticket

### Test checklist
- [ ] `npm test` passes all tests
- [ ] Can add ticket manually
- [ ] Can paste text and extract ticket info
- [ ] Overdue tickets show red badge
- [ ] Notifications appear for overdue tickets
- [ ] Follow-up messages generate correctly
- [ ] Can mark tickets resolved
- [ ] Insights show accurate stats
- [ ] Free tier limits to 3 tickets
- [ ] App works offline (local data persists)
- [ ] Pull-to-refresh updates ticket list
- [ ] Deleting ticket removes notification