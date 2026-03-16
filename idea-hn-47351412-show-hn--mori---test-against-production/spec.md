# DataMirror

## One-line pitch
Test your code against real production data locally—no cloud, no risk, no internet required.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Mobile and full-stack developers who need production-like data for local testing
- Solo developers and small teams without dedicated staging environments
- AI-assisted coders (Cursor, GitHub Copilot users) who need realistic data to validate AI-generated code
- QA engineers testing edge cases that only exist in production data

**Broader audience:**
- Freelance developers working on client projects who can't access production servers directly
- Bootcamp students and junior developers learning with realistic datasets
- Data analysts who need to prototype queries against production schemas without write access
- Technical founders building MVPs who want to test against real user data patterns

**Adjacent use cases:**
- Database schema exploration and documentation
- Query performance testing with production-scale data
- Data migration dry-runs before touching production
- Onboarding new developers with realistic local environments
- Creating reproducible bug reports with actual data snapshots

**Why non-technical people want this:**
- Product managers can explore actual user data to inform decisions without bothering engineers
- Customer support teams can investigate user issues by querying sanitized production snapshots
- Business analysts can prototype reports against real data structures

**The gap:** Every existing solution requires either cloud access (Heroku Review Apps, AWS RDS snapshots), manual database dumps, or lacks mobile-first design. DataMirror is the first tool that treats your phone as a first-class development environment with offline-first, production-safe testing.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local database:** expo-sqlite for local shadow databases
- **Data sync:** expo-file-system for snapshot management
- **State management:** Zustand (lightweight, <1KB)
- **UI:** React Native Paper (Material Design)
- **Testing:** Jest + React Native Testing Library
- **Type safety:** TypeScript
- **Database adapters:** pg (PostgreSQL), mysql2 (MySQL), better-sqlite3 (SQLite) for connection handling

**Minimal dependencies philosophy:** No heavy ORMs, no unnecessary abstractions. Direct database drivers + SQLite for local storage.

## Core features (MVP)

1. **One-tap snapshot creation**
   - Connect to production database (read-only credentials)
   - Pull schema + configurable data subset (last 1000 rows, specific tables, date ranges)
   - Store as local SQLite database
   - Automatic PII sanitization (emails, phone numbers, addresses)

2. **Local query playground**
   - Write and execute SQL queries against local snapshot
   - Syntax highlighting and autocomplete
   - Query history and favorites
   - Export results as JSON/CSV

3. **Schema diff viewer**
   - Compare local snapshot schema with current production
   - Highlight added/removed tables and columns
   - Alert when local snapshot is stale (>7 days old)

4. **Safe sync mode**
   - Pull incremental updates from production (new rows only)
   - Never write back to production
   - Offline-first: all queries run locally, no internet required after initial snapshot

5. **Multi-environment support** (Paid tier)
   - Manage snapshots for staging, production, and local dev databases
   - Quick-switch between environments
   - Compare query results across environments

## Monetization strategy

**Free tier (hook):**
- 1 database connection
- 1 active snapshot at a time
- Up to 10,000 rows per snapshot
- Basic query playground
- 7-day snapshot retention

**Pro tier - $12/month or $99/year (20% savings):**
- Unlimited database connections
- Up to 5 active snapshots simultaneously
- Up to 100,000 rows per snapshot
- AI-assisted query optimization (suggest indexes, rewrite slow queries)
- 30-day snapshot retention
- Schema change notifications
- Export query results (unlimited)
- Priority support

**Why this price point:**
- $12/month positions it between Postman ($14/month) and database GUI tools ($19-29/month)
- Targets individual developers with expense budgets, not enterprise procurement
- Annual plan encourages long-term commitment

**What makes people STAY subscribed:**
- Snapshot history becomes valuable over time (track schema evolution)
- Query library grows into personal knowledge base
- Switching cost: losing access to saved snapshots and query history
- Time saved vs manual database dumps (10+ minutes → 30 seconds)

**Conversion triggers:**
- Hit row limit during critical debugging session
- Need to compare staging vs production data
- Want to keep snapshots older than 7 days for regression testing

## File structure

```
datamirror/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Snapshots list
│   │   ├── query.tsx              # Query playground
│   │   └── settings.tsx           # Connections & settings
│   ├── snapshot/[id].tsx          # Snapshot detail view
│   └── _layout.tsx
├── components/
│   ├── SnapshotCard.tsx
│   ├── QueryEditor.tsx
│   ├── ResultsTable.tsx
│   ├── ConnectionForm.tsx
│   └── SchemaViewer.tsx
├── lib/
│   ├── database/
│   │   ├── snapshot.ts            # Snapshot creation & management
│   │   ├── query.ts               # Query execution
│   │   ├── adapters/
│   │   │   ├── postgres.ts
│   │   │   ├── mysql.ts
│   │   │   └── sqlite.ts
│   │   └── sanitizer.ts           # PII sanitization
│   ├── storage/
│   │   ├── sqlite.ts              # Local SQLite operations
│   │   └── fileSystem.ts          # Snapshot file management
│   └── store/
│       ├── snapshots.ts           # Zustand store for snapshots
│       ├── connections.ts         # Database connections
│       └── queries.ts             # Query history
├── types/
│   ├── database.ts
│   ├── snapshot.ts
│   └── query.ts
├── __tests__/
│   ├── snapshot.test.ts
│   ├── query.test.ts
│   ├── sanitizer.test.ts
│   └── components/
│       ├── SnapshotCard.test.tsx
│       └── QueryEditor.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**Core logic tests:**

```typescript
// __tests__/snapshot.test.ts
describe('Snapshot creation', () => {
  test('creates snapshot from PostgreSQL connection', async () => {
    const connection = { type: 'postgres', host: 'localhost', database: 'test' };
    const snapshot = await createSnapshot(connection, { limit: 100 });
    expect(snapshot.id).toBeDefined();
    expect(snapshot.rowCount).toBeLessThanOrEqual(100);
  });

  test('sanitizes PII in snapshot data', async () => {
    const data = [{ email: 'user@example.com', name: 'John' }];
    const sanitized = await sanitizeData(data);
    expect(sanitized[0].email).toMatch(/^[a-z0-9]+@example\.com$/);
  });
});

// __tests__/query.test.ts
describe('Query execution', () => {
  test('executes SELECT query against local snapshot', async () => {
    const result = await executeQuery(snapshotId, 'SELECT * FROM users LIMIT 5');
    expect(result.rows).toHaveLength(5);
  });

  test('blocks DELETE queries', async () => {
    await expect(
      executeQuery(snapshotId, 'DELETE FROM users')
    ).rejects.toThrow('Write operations not allowed');
  });
});

// __tests__/sanitizer.test.ts
describe('PII sanitization', () => {
  test('masks email addresses', () => {
    expect(sanitizeEmail('john.doe@company.com')).toMatch(/^[a-z0-9]+@company\.com$/);
  });

  test('masks phone numbers', () => {
    expect(sanitizePhone('+1-555-123-4567')).toBe('+1-555-XXX-XXXX');
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app datamirror --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-file-system
   npm install zustand react-native-paper pg mysql2 better-sqlite3
   npm install -D @types/pg @types/better-sqlite3 jest @testing-library/react-native
   ```
3. Configure TypeScript with strict mode in `tsconfig.json`
4. Set up Jest with React Native preset in `jest.config.js`

### Phase 2: Local storage layer
1. Create `lib/storage/sqlite.ts`:
   - Initialize local SQLite database for metadata (snapshots, connections, queries)
   - Schema: `snapshots` table (id, name, source_connection, created_at, row_count, file_path)
   - Schema: `connections` table (id, name, type, host, port, database, username, encrypted_password)
   - Schema: `query_history` table (id, snapshot_id, query, executed_at, duration_ms)

2. Create `lib/storage/fileSystem.ts`:
   - Functions to save/load snapshot SQLite files in `FileSystem.documentDirectory`
   - Implement snapshot compression (gzip) to save space
   - Cleanup old snapshots based on retention policy

### Phase 3: Database adapters
1. Create `lib/database/adapters/postgres.ts`:
   - Connect to PostgreSQL with read-only credentials
   - Fetch schema (tables, columns, types, constraints)
   - Stream data in batches (1000 rows at a time) to avoid memory issues
   - Handle connection pooling and timeouts

2. Create `lib/database/adapters/mysql.ts` and `sqlite.ts` with same interface

3. Create `lib/database/sanitizer.ts`:
   - Detect PII columns by name patterns (email, phone, ssn, address, etc.)
   - Implement sanitization strategies:
     - Emails: preserve domain, randomize local part
     - Phones: mask last 4 digits
     - Names: use faker-like random names
     - Addresses: use generic placeholders

### Phase 4: Snapshot management
1. Create `lib/database/snapshot.ts`:
   - `createSnapshot(connection, options)`: Pull data from source, sanitize, save as local SQLite
   - `loadSnapshot(id)`: Open local SQLite file for querying
   - `deleteSnapshot(id)`: Remove from metadata and file system
   - `syncSnapshot(id)`: Pull incremental updates (rows with updated_at > last_sync)

2. Create Zustand store `lib/store/snapshots.ts`:
   - State: list of snapshots, active snapshot, loading states
   - Actions: create, load, delete, sync snapshots

### Phase 5: Query playground
1. Create `lib/database/query.ts`:
   - `executeQuery(snapshotId, sql)`: Run query against local snapshot
   - Validate query (block INSERT/UPDATE/DELETE/DROP)
   - Return results with metadata (row count, execution time)
   - Handle errors gracefully

2. Create `components/QueryEditor.tsx`:
   - Multiline text input with syntax highlighting (use `react-native-syntax-highlighter`)
   - Execute button with loading state
   - Query history dropdown

3. Create `components/ResultsTable.tsx`:
   - Render query results in scrollable table
   - Handle large result sets (virtualized list)
   - Export to JSON/CSV (paid feature)

### Phase 6: UI screens
1. Create `app/(tabs)/index.tsx` (Snapshots list):
   - Display all snapshots as cards (name, source, row count, age)
   - Pull-to-refresh to check for stale snapshots
   - FAB button to create new snapshot

2. Create `app/(tabs)/query.tsx` (Query playground):
   - Snapshot selector dropdown
   - QueryEditor component
   - ResultsTable component
   - Save query to favorites

3. Create `app/(tabs)/settings.tsx`:
   - Manage database connections (add/edit/delete)
   - Subscription status and upgrade prompt
   - Snapshot retention settings

4. Create `app/snapshot/[id].tsx` (Snapshot detail):
   - Schema viewer (tables, columns, types)
   - Snapshot metadata (size, row count, last synced)
   - Actions: sync, delete, export schema

### Phase 7: Schema diff viewer
1. Create `lib/database/schemaDiff.ts`:
   - Compare local snapshot schema with current production schema
   - Detect added/removed tables and columns
   - Generate human-readable diff report

2. Add diff view to snapshot detail screen with color-coded changes

### Phase 8: Monetization & paywalls
1. Implement row limit check in `createSnapshot`:
   - Free tier: 10,000 rows
   - Pro tier: 100,000 rows
   - Show upgrade prompt when limit reached

2. Add subscription check to premium features:
   - Multi-snapshot support
   - Export results
   - Extended retention

3. Integrate RevenueCat or Expo In-App Purchases for subscription management

### Phase 9: Testing & polish
1. Write unit tests for all core functions (snapshot, query, sanitizer)
2. Write component tests for UI elements
3. Test on iOS and Android simulators
4. Add error boundaries and loading states
5. Implement analytics (Expo Analytics or PostHog)

### Phase 10: Launch prep
1. Create App Store screenshots showing:
   - Snapshot creation flow
   - Query playground with results
   - Schema diff viewer
2. Write App Store description emphasizing safety and offline-first
3. Set up landing page with demo video
4. Prepare launch post for Show HN, Product Hunt, r/reactnative

## How to verify it works

### Local development
1. Start Expo dev server: `npx expo start`
2. Open in Expo Go on iOS/Android device or simulator
3. Test snapshot creation:
   - Add a database connection (use local PostgreSQL/MySQL for testing)
   - Create snapshot and verify data appears in local SQLite
   - Check that PII is sanitized (emails masked, etc.)
4. Test query playground:
   - Execute SELECT queries and verify results display
   - Try blocked operations (DELETE, UPDATE) and verify error messages
5. Test schema diff:
   - Modify production schema (add column)
   - Sync snapshot and verify diff appears

### Automated tests
1. Run test suite: `npm test`
2. Verify all tests pass:
   - Snapshot creation and sanitization
   - Query execution and validation
   - Component rendering
3. Check test coverage: `npm test -- --coverage` (aim for >80%)

### Production readiness checklist
- [ ] All tests passing
- [ ] App runs on iOS simulator without crashes
- [ ] App runs on Android emulator without crashes
- [ ] Snapshot creation completes in <30 seconds for 10k rows
- [ ] Query execution returns results in <1 second
- [ ] PII sanitization verified manually on sample data
- [ ] Subscription paywall triggers correctly
- [ ] Offline mode works (queries run without internet)
- [ ] App size <50MB (check with `eas build`)