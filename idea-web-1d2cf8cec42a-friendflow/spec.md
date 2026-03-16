# ConnectCircle

## One-line pitch
Never lose touch with the people who matter — smart reminders and insights that turn good intentions into lasting friendships.

## Expanded vision

### Who is this REALLY for?

**Primary audience (broadest reach):**
- **Busy professionals** (25-45) juggling careers and social life
- **Parents** who've lost touch with pre-kid friends
- **Remote workers** lacking organic social touchpoints
- **Relocated adults** maintaining long-distance friendships
- **Introverts** who care deeply but struggle with social initiative

**Adjacent use cases:**
- **Family relationship maintenance** — not just friends, but siblings, cousins, aging parents
- **Professional networking** — keeping warm connections with former colleagues, mentors
- **Community builders** — small business owners, freelancers maintaining client relationships
- **Grief support** — people rebuilding social circles after loss or major life changes
- **Neurodivergent users** — those who benefit from structured social routines (ADHD, autism spectrum)

**Why non-technical people want this:**
This isn't a "productivity tool" — it's emotional insurance. Everyone has experienced the guilt of realizing they haven't talked to someone important in months. This app removes the mental load of tracking relationships and provides the nudge people need to act. It's like having a thoughtful assistant who remembers birthdays, suggests the perfect check-in moment, and celebrates your effort to stay connected.

**The killer insight:** Most relationship apps fail because they feel like work. ConnectCircle succeeds by making maintenance feel like care, not obligation. Gamification isn't about points — it's about visualizing impact (streaks, connection strength) and celebrating small wins.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **Local storage:** SQLite (expo-sqlite)
- **Notifications:** expo-notifications
- **State management:** Zustand (lightweight, minimal boilerplate)
- **UI:** React Native Paper (Material Design, accessible)
- **Date handling:** date-fns
- **Testing:** Jest + React Native Testing Library
- **Analytics:** Expo Analytics (privacy-first)

## Core features (MVP)

1. **Smart Contact Profiles**
   - Import contacts, add relationship context (how you know them, last interaction date)
   - Set custom check-in frequencies (weekly, monthly, quarterly)
   - Quick notes after each interaction to track conversation topics

2. **Intelligent Reminders**
   - Push notifications based on user-defined schedules
   - "Overdue" alerts for relationships falling behind
   - Contextual suggestions (e.g., "It's been 3 weeks since you talked to Sarah — maybe send a quick text?")

3. **Connection Streaks & Insights**
   - Visual streak tracking (days/weeks maintaining regular contact)
   - Monthly relationship health score
   - Simple analytics: most contacted, longest gaps, improvement trends

4. **Action Shortcuts**
   - One-tap actions: call, text, schedule coffee
   - Pre-written message templates (customizable)
   - Integration with calendar for scheduling meetups

5. **Reflection Prompts**
   - Weekly check-in: "Who haven't you talked to lately?"
   - Gratitude journaling tied to specific relationships
   - Milestone celebrations (1-year friendship anniversary, 50 check-ins)

## Monetization strategy

**Free tier (the hook):**
- Up to 10 contacts
- Basic reminders (weekly/monthly only)
- 3 action shortcuts
- Limited analytics (current month only)

**Premium ($4.99/month or $39.99/year — 33% savings):**
- Unlimited contacts
- Custom reminder frequencies (daily, bi-weekly, quarterly, custom)
- Unlimited action shortcuts + templates
- Full analytics history + trends
- AI-powered conversation starters (context-aware suggestions)
- Priority support
- Export data (CSV/JSON)

**Why this price?**
- Lower than typical productivity apps ($9.99) because this is emotional, not professional
- Comparable to a single coffee — easy impulse purchase
- Annual plan encourages long-term commitment (relationship building takes time)

**Retention drivers:**
- **Sunk cost fallacy:** Once users log interactions, they've invested effort
- **Habit formation:** Daily/weekly notifications create routine dependency
- **Emotional ROI:** Users see tangible improvement in relationships (guilt reduction, stronger bonds)
- **Data lock-in:** Historical interaction logs become valuable over time
- **Streak psychology:** Breaking a 90-day streak feels painful

**One-time purchase ($19.99 "Relationship Boost Pack"):**
- 50 premium AI conversation starters
- 10 custom reminder templates
- Lifetime access to advanced analytics
- Appeals to users hesitant about subscriptions

## File structure

```
connectcircle/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home (dashboard)
│   │   ├── contacts.tsx           # Contact list
│   │   ├── insights.tsx           # Analytics
│   │   └── settings.tsx           # Settings
│   ├── contact/
│   │   └── [id].tsx               # Contact detail
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── ContactCard.tsx
│   ├── ReminderBadge.tsx
│   ├── StreakDisplay.tsx
│   ├── ActionButton.tsx
│   └── InsightChart.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── notifications.ts           # Push notification logic
│   ├── analytics.ts               # Relationship scoring
│   └── storage.ts                 # Async storage helpers
├── store/
│   └── contactStore.ts            # Zustand store
├── types/
│   └── index.ts                   # TypeScript types
├── constants/
│   └── theme.ts                   # Colors, spacing
├── __tests__/
│   ├── analytics.test.ts
│   ├── notifications.test.ts
│   ├── contactStore.test.ts
│   └── database.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/analytics.test.ts`
```typescript
import { calculateRelationshipScore, getOverdueContacts } from '../lib/analytics';

describe('Analytics', () => {
  test('calculates relationship score correctly', () => {
    const contact = {
      id: '1',
      name: 'Alice',
      lastContact: new Date('2026-03-10'),
      frequency: 7, // days
    };
    const score = calculateRelationshipScore(contact, new Date('2026-03-16'));
    expect(score).toBeGreaterThan(0);
  });

  test('identifies overdue contacts', () => {
    const contacts = [
      { id: '1', name: 'Bob', lastContact: new Date('2026-02-01'), frequency: 30 },
      { id: '2', name: 'Carol', lastContact: new Date('2026-03-15'), frequency: 7 },
    ];
    const overdue = getOverdueContacts(contacts, new Date('2026-03-16'));
    expect(overdue).toHaveLength(1);
    expect(overdue[0].name).toBe('Bob');
  });
});
```

### `__tests__/notifications.test.ts`
```typescript
import { scheduleReminder, cancelReminder } from '../lib/notifications';

describe('Notifications', () => {
  test('schedules reminder with correct trigger', async () => {
    const contactId = '123';
    const triggerDate = new Date('2026-03-20T10:00:00');
    const notificationId = await scheduleReminder(contactId, 'Alice', triggerDate);
    expect(notificationId).toBeDefined();
  });

  test('cancels scheduled reminder', async () => {
    const notificationId = 'test-notification-id';
    await expect(cancelReminder(notificationId)).resolves.not.toThrow();
  });
});
```

### `__tests__/contactStore.test.ts`
```typescript
import { useContactStore } from '../store/contactStore';

describe('Contact Store', () => {
  beforeEach(() => {
    useContactStore.setState({ contacts: [] });
  });

  test('adds contact to store', () => {
    const { addContact, contacts } = useContactStore.getState();
    addContact({
      id: '1',
      name: 'Dave',
      frequency: 14,
      lastContact: new Date(),
    });
    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toBe('Dave');
  });

  test('updates last contact date', () => {
    const { addContact, updateLastContact, contacts } = useContactStore.getState();
    addContact({ id: '1', name: 'Eve', frequency: 7, lastContact: new Date('2026-03-01') });
    updateLastContact('1', new Date('2026-03-16'));
    expect(contacts[0].lastContact.getDate()).toBe(16);
  });
});
```

### `__tests__/database.test.ts`
```typescript
import { initDatabase, insertContact, getContacts } from '../lib/database';

describe('Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('inserts and retrieves contact', async () => {
    await insertContact({ name: 'Frank', frequency: 30, lastContact: new Date() });
    const contacts = await getContacts();
    expect(contacts.length).toBeGreaterThan(0);
    expect(contacts.some(c => c.name === 'Frank')).toBe(true);
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app connectcircle --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-notifications expo-router zustand react-native-paper date-fns
   npm install --save-dev jest @testing-library/react-native @types/jest
   ```
3. Configure `app.json`:
   - Set app name, slug, version
   - Add notification permissions (iOS/Android)
   - Configure splash screen and icon
4. Set up TypeScript types in `types/index.ts`:
   ```typescript
   export interface Contact {
     id: string;
     name: string;
     phone?: string;
     email?: string;
     frequency: number; // days between check-ins
     lastContact: Date;
     notes?: string;
     relationship?: string;
     createdAt: Date;
   }
   
   export interface Interaction {
     id: string;
     contactId: string;
     date: Date;
     type: 'call' | 'text' | 'meetup' | 'other';
     notes?: string;
   }
   ```

### Phase 2: Database layer
1. Create `lib/database.ts`:
   - Initialize SQLite database with tables: `contacts`, `interactions`
   - Implement CRUD functions: `insertContact`, `updateContact`, `deleteContact`, `getContacts`, `getContactById`
   - Add interaction logging: `logInteraction`, `getInteractionsByContact`
2. Create migration logic for schema updates
3. Add error handling and transaction support

### Phase 3: State management
1. Create `store/contactStore.ts` with Zustand:
   - State: `contacts`, `selectedContact`, `loading`
   - Actions: `addContact`, `updateContact`, `deleteContact`, `setSelectedContact`, `updateLastContact`
   - Persist state to AsyncStorage for offline support
2. Add computed values: `overdueContacts`, `upcomingReminders`

### Phase 4: Core UI components
1. `components/ContactCard.tsx`:
   - Display contact name, last interaction date, frequency
   - Show visual indicator (green/yellow/red) for relationship health
   - Tap to navigate to detail screen
2. `components/ReminderBadge.tsx`:
   - Show days until next check-in or days overdue
   - Color-coded urgency
3. `components/StreakDisplay.tsx`:
   - Animated streak counter
   - Celebration animation on milestone
4. `components/ActionButton.tsx`:
   - Quick action buttons (call, text, schedule)
   - Deep link to phone/messaging apps
5. `components/InsightChart.tsx`:
   - Simple bar chart showing check-in frequency over time
   - Use react-native-svg for custom charts

### Phase 5: Screens
1. **Home (`app/(tabs)/index.tsx`)**:
   - Dashboard with overdue contacts at top
   - Upcoming reminders section
   - Quick stats (total contacts, active streaks)
   - "Add Contact" FAB
2. **Contacts (`app/(tabs)/contacts.tsx`)**:
   - Searchable/filterable list of all contacts
   - Sort by: last contacted, frequency, name
   - Swipe actions: edit, delete, log interaction
3. **Contact Detail (`app/contact/[id].tsx`)**:
   - Full contact info
   - Interaction history timeline
   - Edit frequency, add notes
   - Action buttons (call, text, schedule)
   - Delete contact option
4. **Insights (`app/(tabs)/insights.tsx`)**:
   - Monthly summary (total check-ins, longest streak)
   - Relationship health distribution chart
   - Most/least contacted people
   - Premium upsell for advanced analytics
5. **Settings (`app/(tabs)/settings.tsx`)**:
   - Notification preferences
   - Default reminder frequency
   - Premium subscription management
   - Export data
   - Privacy policy, terms

### Phase 6: Notifications
1. Create `lib/notifications.ts`:
   - Request permissions on first launch
   - `scheduleReminder(contactId, name, triggerDate)`: schedule push notification
   - `cancelReminder(notificationId)`: cancel scheduled notification
   - Handle notification tap: navigate to contact detail
2. Implement background task to reschedule reminders daily
3. Add notification settings: quiet hours, frequency caps

### Phase 7: Analytics logic
1. Create `lib/analytics.ts`:
   - `calculateRelationshipScore(contact, currentDate)`: score 0-100 based on frequency adherence
   - `getOverdueContacts(contacts, currentDate)`: filter contacts past due date
   - `getStreakDays(contactId)`: calculate consecutive check-in streak
   - `getMonthlyStats(contacts, interactions)`: aggregate monthly data
2. Add caching for expensive calculations

### Phase 8: Premium features
1. Implement paywall screen with feature comparison
2. Add in-app purchase logic (Expo In-App Purchases):
   - Monthly subscription ($4.99)
   - Annual subscription ($39.99)
   - One-time purchase ($19.99)
3. Gate premium features:
   - Check subscription status before showing advanced analytics
   - Limit free tier to 10 contacts
   - Show upgrade prompts at natural friction points
4. Add restore purchases functionality

### Phase 9: Onboarding
1. Create first-launch tutorial:
   - Explain core concept (3 screens max)
   - Request notification permissions
   - Prompt to add first contact
2. Add empty states with helpful CTAs
3. Implement sample data for demo mode

### Phase 10: Polish
1. Add loading states and skeleton screens
2. Implement error boundaries
3. Add haptic feedback for key interactions
4. Optimize images and assets
5. Add accessibility labels (screen reader support)
6. Test on iOS and Android devices
7. Add app icon and splash screen
8. Write privacy policy and terms of service

### Phase 11: Testing
1. Write unit tests for all `lib/` functions
2. Write integration tests for store actions
3. Test notification scheduling edge cases
4. Test database migrations
5. Run `npm test` and ensure 100% pass rate
6. Manual testing checklist:
   - Add/edit/delete contacts
   - Log interactions
   - Receive notifications
   - View analytics
   - Purchase premium (test mode)
   - Export data

## How to verify it works

### Development testing
1. **Start Expo dev server:**
   ```bash
   npx expo start
   ```
2. **Test on iOS Simulator:**
   - Press `i` in terminal
   - Verify all tabs load
   - Add a contact, set frequency to 1 day
   - Log an interaction
   - Check that reminder is scheduled (use Expo Go notification inspector)
3. **Test on Android Emulator:**
   - Press `a` in terminal
   - Repeat iOS tests
   - Verify notification permissions prompt
4. **Test on physical device (Expo Go):**
   - Scan QR code
   - Test push notifications (must be on device, not simulator)
   - Verify deep linking from notification tap

### Automated testing
```bash
npm test
```
**Expected output:**
- All tests pass (4 test suites, 8+ tests)
- No console errors
- Coverage report shows >80% coverage for `lib/` and `store/`

### Feature checklist
- [ ] Add contact with custom frequency
- [ ] Edit contact details
- [ ] Delete contact
- [ ] Log interaction (updates last contact date)
- [ ] View overdue contacts on home screen
- [ ] Receive push notification at scheduled time
- [ ] Tap notification navigates to contact detail
- [ ] View streak counter
- [ ] View monthly insights
- [ ] Search/filter contacts
- [ ] Export data (premium)
- [ ] Purchase premium subscription (test mode)
- [ ] Restore purchases

### Performance benchmarks
- App launch: <2 seconds on mid-range device
- Contact list scroll: 60fps with 100+ contacts
- Database queries: <100ms for typical operations
- Notification scheduling: <500ms

### Pre-launch checklist
- [ ] Test on iOS 15+ and Android 11+
- [ ] Verify App Store/Play Store metadata
- [ ] Privacy policy and terms accessible in-app
- [ ] All premium features properly gated
- [ ] In-app purchases work in sandbox mode
- [ ] Analytics tracking respects user privacy settings
- [ ] Accessibility: VoiceOver/TalkBack compatible
- [ ] Localization ready (strings externalized)