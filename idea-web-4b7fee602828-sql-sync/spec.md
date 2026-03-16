# DataPal

## One-line pitch
Turn messy notes into organized databases using your voice — no spreadsheets, no SQL, just talk.

## Expanded vision

**Core audience:** Anyone who collects information repeatedly but hates spreadsheets.

This isn't just for small business owners tracking inventory. It's for:
- **Parents** organizing kids' activities, medical records, and school contacts
- **Hobbyists** cataloging collections (books, plants, recipes, gear)
- **Freelancers** tracking clients, invoices, and project notes without accounting software
- **Event planners** managing guest lists, vendors, and budgets
- **Teachers** recording student progress and parent contact info
- **Renters/landlords** documenting maintenance requests and expenses

**The real insight:** People don't want databases. They want their scattered notes to magically become searchable, filterable, and shareable. They're currently using Notes app, photos of receipts, or random spreadsheets they never update.

**Why mobile-first wins:**
- Capture data the moment it happens (photo receipt → auto-extract to database)
- Voice input while driving, cooking, or hands-free
- Offline-first means it works in basements, planes, and rural areas
- Share a specific "view" via link (like a filtered list) without exposing the whole database

**Adjacent use cases unlocked:**
- Voice-to-structured-data (say "add client John Smith, email john@example.com, project website redesign" and it populates fields)
- Photo-to-database (snap a business card, receipt, or product label)
- Templates marketplace (community-shared structures for common needs)

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Database:** SQLite (expo-sqlite) for local storage
- **AI:** OpenAI API (GPT-4o-mini for cost efficiency) for natural language → SQL and auto-documentation
- **Sync:** Custom REST API (Node.js + PostgreSQL) for cloud backup
- **Voice:** Expo Speech for voice input
- **Auth:** Expo AuthSession with JWT
- **State:** Zustand (lightweight, no boilerplate)
- **Testing:** Jest + React Native Testing Library

## Core features (MVP)

1. **Voice-to-database creation**
   - Say "Create a client tracker with name, email, and project status"
   - AI generates table structure, suggests field types
   - Instant preview with sample data

2. **Smart data entry**
   - Voice input: "Add John Smith, john@example.com, in progress"
   - Photo capture: Snap business card → auto-extract fields
   - Manual form with autocomplete from previous entries

3. **Natural language queries**
   - Ask "Show me all clients from last month" or "Who hasn't paid yet?"
   - AI translates to SQL, displays results in cards/list view
   - Save frequent queries as "Quick Views"

4. **Offline-first with smart sync**
   - All data stored locally in SQLite
   - Changes queue when offline, sync when connected
   - Conflict resolution with "yours vs theirs" preview

5. **One-tap sharing**
   - Generate read-only link to a filtered view
   - Recipient sees live data without installing app (web view)
   - Revoke access anytime

## Monetization strategy

**Free tier (hook):**
- 3 databases, 100 rows per database
- Voice input (limited to 10 queries/day)
- Local storage only (no cloud sync)
- Basic templates

**Paid tier — $4.99/month or $39.99/year (17% discount):**
- Unlimited databases and rows
- Unlimited voice queries
- Cloud sync across devices
- Photo-to-data extraction (10/day)
- Advanced AI features (auto-categorization, duplicate detection)
- Priority support

**Why this price?**
- Lower than Airtable ($10/mo) and Notion ($8/mo)
- Comparable to note-taking apps (Bear, Craft)
- Annual plan encourages commitment (better LTV)

**Retention drivers:**
- Data lock-in (their organized info lives here)
- Habit formation (daily voice entries)
- Shared databases with family/team (network effect)
- Templates marketplace (community content)

**One-time purchases:**
- Premium template packs ($2.99 each): "Small Business Starter", "Home Management", "Freelancer Kit"
- Export to Excel/CSV ($4.99 one-time unlock)

## File structure

```
datapal/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home: list of databases
│   │   ├── create.tsx             # Voice/manual database creation
│   │   ├── query.tsx              # Natural language search
│   │   └── settings.tsx           # Account, sync, subscription
│   ├── database/[id].tsx          # Single database view (rows)
│   ├── row/[id].tsx               # Edit single row
│   └── _layout.tsx                # Root layout with auth
├── components/
│   ├── VoiceInput.tsx             # Microphone button + transcription
│   ├── DatabaseCard.tsx           # Preview card for home screen
│   ├── RowList.tsx                # Virtualized list of rows
│   ├── FieldInput.tsx             # Smart input (text, number, date, etc.)
│   └── SyncIndicator.tsx          # Online/offline status
├── lib/
│   ├── db.ts                      # SQLite operations (CRUD)
│   ├── ai.ts                      # OpenAI API calls (schema generation, NL queries)
│   ├── sync.ts                    # Cloud sync queue and conflict resolution
│   ├── voice.ts                   # Speech-to-text wrapper
│   └── schema.ts                  # TypeScript types for database structures
├── store/
│   └── useStore.ts                # Zustand store (databases, sync state, user)
├── __tests__/
│   ├── db.test.ts                 # SQLite CRUD operations
│   ├── ai.test.ts                 # AI schema generation (mocked API)
│   ├── sync.test.ts               # Sync queue logic
│   └── voice.test.ts              # Voice input parsing
├── app.json                       # Expo config
├── package.json
└── tsconfig.json
```

## Tests

```typescript
// __tests__/db.test.ts
import { createDatabase, addRow, queryRows, deleteDatabase } from '../lib/db';

describe('Database operations', () => {
  test('creates database with schema', async () => {
    const db = await createDatabase('Clients', [
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' }
    ]);
    expect(db.id).toBeDefined();
    expect(db.name).toBe('Clients');
  });

  test('adds and retrieves rows', async () => {
    const dbId = 'test-db';
    await addRow(dbId, { name: 'John', email: 'john@example.com' });
    const rows = await queryRows(dbId, 'SELECT * FROM rows');
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('John');
  });

  test('deletes database and all rows', async () => {
    const dbId = 'test-db';
    await deleteDatabase(dbId);
    const rows = await queryRows(dbId, 'SELECT * FROM rows');
    expect(rows.length).toBe(0);
  });
});

// __tests__/ai.test.ts
import { generateSchema, naturalLanguageQuery } from '../lib/ai';

jest.mock('../lib/ai', () => ({
  generateSchema: jest.fn(),
  naturalLanguageQuery: jest.fn()
}));

describe('AI features', () => {
  test('generates schema from voice input', async () => {
    (generateSchema as jest.Mock).mockResolvedValue([
      { name: 'client_name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' }
    ]);
    const schema = await generateSchema('client tracker with name and email');
    expect(schema.length).toBe(2);
    expect(schema[0].name).toBe('client_name');
  });

  test('converts natural language to SQL', async () => {
    (naturalLanguageQuery as jest.Mock).mockResolvedValue('SELECT * FROM rows WHERE status = "pending"');
    const sql = await naturalLanguageQuery('show pending clients');
    expect(sql).toContain('pending');
  });
});

// __tests__/sync.test.ts
import { queueChange, processSyncQueue } from '../lib/sync';

describe('Sync queue', () => {
  test('queues changes when offline', () => {
    queueChange({ type: 'INSERT', table: 'rows', data: { name: 'Test' } });
    const queue = getSyncQueue();
    expect(queue.length).toBe(1);
  });

  test('processes queue when online', async () => {
    queueChange({ type: 'INSERT', table: 'rows', data: { name: 'Test' } });
    await processSyncQueue();
    const queue = getSyncQueue();
    expect(queue.length).toBe(0);
  });
});

// __tests__/voice.test.ts
import { parseVoiceCommand } from '../lib/voice';

describe('Voice input', () => {
  test('parses add command', () => {
    const result = parseVoiceCommand('add John Smith john@example.com in progress');
    expect(result.action).toBe('add');
    expect(result.fields).toContain('John Smith');
  });

  test('parses query command', () => {
    const result = parseVoiceCommand('show all clients from last month');
    expect(result.action).toBe('query');
    expect(result.query).toContain('last month');
  });
});
```

## Implementation steps

### Phase 1: Core database engine (Days 1-3)

1. **Initialize Expo project**
   ```bash
   npx create-expo-app@latest datapal --template tabs
   cd datapal
   npx expo install expo-sqlite expo-speech expo-auth-session
   npm install zustand @react-native-async-storage/async-storage
   npm install -D jest @testing-library/react-native
   ```

2. **Set up SQLite wrapper (`lib/db.ts`)**
   - Create `openDatabase()` helper
   - Implement `createDatabase(name, schema)` → creates table with dynamic columns
   - Implement `addRow(dbId, data)` → INSERT with validation
   - Implement `queryRows(dbId, sql)` → SELECT with error handling
   - Implement `updateRow(dbId, rowId, data)` → UPDATE
   - Implement `deleteRow(dbId, rowId)` → DELETE
   - Add migration system for schema changes

3. **Build Zustand store (`store/useStore.ts`)**
   - State: `databases[]`, `currentDb`, `syncQueue[]`, `user`, `isOnline`
   - Actions: `addDatabase()`, `removeDatabase()`, `setCurrentDb()`, `queueSync()`
   - Persist to AsyncStorage

4. **Create database list screen (`app/(tabs)/index.tsx`)**
   - FlatList of DatabaseCard components
   - Pull-to-refresh
   - Floating action button → navigate to create screen
   - Empty state with "Create your first database" CTA

### Phase 2: Voice-powered creation (Days 4-6)

5. **Build voice input component (`components/VoiceInput.tsx`)**
   - Microphone button with recording animation
   - Use `expo-speech` for speech-to-text
   - Display transcription in real-time
   - Error handling for permissions

6. **Implement AI schema generation (`lib/ai.ts`)**
   - `generateSchema(voiceInput: string)` → calls OpenAI API
   - Prompt: "Convert this to database schema: {input}. Return JSON array of {name, type, description}"
   - Parse response into SQLite-compatible types (TEXT, INTEGER, REAL, BLOB)
   - Fallback to manual entry if API fails

7. **Create database creation screen (`app/(tabs)/create.tsx`)**
   - Voice input at top
   - Preview of generated schema (editable)
   - "Create Database" button
   - Manual mode toggle (add fields one by one)

### Phase 3: Smart data entry (Days 7-9)

8. **Build row list view (`app/database/[id].tsx`)**
   - Header with database name and row count
   - Virtualized list (FlashList) for performance
   - Swipe actions: Edit, Delete
   - Filter/sort controls
   - FAB to add new row

9. **Create row editor (`app/row/[id].tsx`)**
   - Dynamic form based on schema
   - FieldInput component with type-specific inputs:
     - TEXT → TextInput with autocomplete
     - INTEGER/REAL → NumericInput
     - DATE → DatePicker
     - BOOLEAN → Switch
   - Voice input for quick entry
   - Save button with validation

10. **Implement voice-to-row (`lib/voice.ts`)**
    - `parseVoiceCommand(transcript)` → extracts action and fields
    - Match transcript words to schema fields (fuzzy matching)
    - Auto-populate form fields
    - Confirm before saving

### Phase 4: Natural language queries (Days 10-12)

11. **Build query screen (`app/(tabs)/query.tsx`)**
    - Voice input for questions
    - Text input fallback
    - Display results in cards or table view
    - "Save as Quick View" button

12. **Implement NL-to-SQL (`lib/ai.ts`)**
    - `naturalLanguageQuery(question, schema)` → calls OpenAI
    - Prompt: "Convert to SQLite query for schema {schema}: {question}"
    - Validate generated SQL (prevent DROP, DELETE without WHERE)
    - Execute and return results

13. **Add Quick Views**
    - Save frequent queries with custom names
    - Display as chips on database screen
    - One-tap to re-run

### Phase 5: Sync and sharing (Days 13-15)

14. **Build sync queue (`lib/sync.ts`)**
    - `queueChange(operation)` → adds to AsyncStorage queue
    - `processSyncQueue()` → batch upload to API
    - Conflict resolution: timestamp-based (last write wins)
    - Retry logic with exponential backoff

15. **Create sync indicator (`components/SyncIndicator.tsx`)**
    - Green dot: synced
    - Yellow dot: syncing
    - Red dot: offline/error
    - Tap to view sync status details

16. **Implement sharing**
    - Generate shareable link (UUID-based)
    - Create read-only web view (simple Next.js page)
    - Revoke access from settings

### Phase 6: Polish and monetization (Days 16-18)

17. **Add authentication (`app/_layout.tsx`)**
    - Expo AuthSession with email/password
    - JWT stored in SecureStore
    - Guest mode (local-only, no sync)

18. **Implement subscription paywall**
    - Use RevenueCat or Expo In-App Purchases
    - Show paywall when hitting free tier limits
    - "Upgrade" button in settings

19. **Create onboarding flow**
    - 3-screen tutorial with animations
    - Sample database (pre-populated "Recipe Tracker")
    - Skip button

20. **Add analytics**
    - Track: database created, voice query used, subscription started
    - Use Expo Analytics or PostHog

### Phase 7: Testing and deployment (Days 19-20)

21. **Write tests**
    - Run `npm test` to verify all tests pass
    - Add integration tests for critical flows

22. **Test on devices**
    - iOS simulator and Android emulator
    - Real device via Expo Go
    - Test offline mode (airplane mode)

23. **Build and submit**
    - `eas build --platform all`
    - Submit to App Store and Google Play
    - Create marketing screenshots

## How to verify it works

### Local development
```bash
npm install
npm test                    # All tests must pass
npx expo start
```

### On device (Expo Go)
1. Scan QR code with Expo Go app
2. Grant microphone and storage permissions
3. Create a database using voice: "Create a book tracker with title, author, and rating"
4. Verify schema appears correctly
5. Add a row using voice: "Add The Great Gatsby, F. Scott Fitzgerald, 5 stars"
6. Query using voice: "Show me all 5-star books"
7. Toggle airplane mode and add another row
8. Turn on internet and verify sync indicator shows syncing

### Production testing
1. Install from TestFlight (iOS) or internal testing (Android)
2. Create account and verify cloud sync
3. Test on second device (data should appear)
4. Test subscription flow (sandbox mode)
5. Verify analytics events fire