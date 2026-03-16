# SchemaSync AI Mobile Spec

## 1. App Name

**QueryPal**

## 2. One-line pitch

Your database's AI copilot — understand any schema, write queries, and get instant answers, all from your phone.

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:**
- **Developers on-call** who need to debug production issues from anywhere
- **Freelance developers** managing multiple client databases without desktop access
- **Junior developers** learning database design and SQL patterns
- **Data analysts** who need quick schema reference without SQL expertise

**Broader audience (the unlock):**
- **Product managers** who want to understand data models without bothering engineers
- **Customer support teams** who need to look up user data structures to answer tickets
- **Startup founders** managing their own databases pre-technical hire
- **Students and bootcamp grads** learning databases with an AI tutor in their pocket

### Adjacent use cases

- **Schema documentation generator** — auto-generate ERD diagrams and relationship docs
- **Query builder for non-technical users** — natural language to SQL translation
- **Database health monitoring** — get alerts for missing indexes, slow queries, or schema drift
- **Team knowledge base** — share annotated schemas with comments and best practices
- **Migration assistant** — AI suggests schema changes and generates migration scripts

### Why non-technical people want this

Most database tools assume you know SQL. QueryPal assumes you don't. It's like having a database expert in your pocket who explains everything in plain English, suggests queries you can run, and helps you understand what data you have without writing a single line of code.

## 4. Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **AI integration:** OpenAI API (GPT-4) or Anthropic Claude
- **Database connectors:** 
  - PostgreSQL (pg library)
  - MySQL (mysql2)
  - Supabase (supabase-js)
- **State management:** Zustand (lightweight, minimal boilerplate)
- **UI components:** React Native Paper (Material Design)
- **Testing:** Jest + React Native Testing Library
- **Code quality:** ESLint + Prettier

**Keep minimal:** No Redux, no heavy animation libraries, no unnecessary abstractions.

## 5. Core features (MVP)

### 1. **One-tap database connection**
Connect to PostgreSQL, MySQL, or Supabase with a connection string. Save multiple databases. Encrypted credential storage.

### 2. **AI schema explorer**
View all tables, columns, relationships, and indexes. Ask questions like "What tables store user data?" or "Show me all foreign keys." AI explains each table's purpose in plain English.

### 3. **Natural language query builder**
Type "Show me all users who signed up last week" and get the SQL query + results. Edit and re-run queries. Save favorites.

### 4. **Smart documentation generator**
Auto-generate markdown docs for your schema with AI-written descriptions, relationship diagrams (text-based ERD), and usage examples.

### 5. **Offline mode with cached schemas**
Download schema metadata for offline access. View table structures, relationships, and saved queries without internet.

## 6. Monetization strategy

### Free tier (the hook)
- Connect to 1 database
- 10 AI queries per day
- Basic schema viewing
- Manual schema refresh

**Goal:** Let users experience the AI magic without friction. 10 queries/day is enough to see value but not enough for daily use.

### Pro tier — $7.99/month (the paywall)
- Unlimited databases
- Unlimited AI queries
- Offline mode with auto-sync
- Query history and favorites
- Schema change notifications (push alerts)
- Export documentation as markdown/PDF
- Priority support

**Price reasoning:** Lower than typical dev tools ($9.99) to capture freelancers and students. Higher than consumer apps to signal professional value.

### What makes people STAY subscribed?

- **Habit formation:** Once you rely on AI query assistance, going back to manual SQL feels painful
- **Multi-database management:** Freelancers and consultants need this for every client
- **Offline access:** Critical for remote work and travel
- **Schema change alerts:** Prevents production surprises (high retention driver)

### Enterprise tier — $49/month per team (5+ users)
- Team workspaces with shared databases
- Role-based access control
- Audit logs
- Custom AI training on internal docs
- SSO integration

## 7. Market gap analysis

**NOT SKIP — Clear gap exists:**

- **DBeaver Mobile:** Desktop-first, clunky mobile experience, no AI
- **TablePlus:** iOS-only, no AI, expensive ($99 lifetime)
- **ChatGPT + database plugins:** Not mobile-native, requires manual schema pasting, no persistent connections
- **Supabase Studio:** Web-only, Supabase-specific, no AI query assistance

**Our advantage:** First mobile-native database tool with AI-first UX designed for both technical and non-technical users. Existing tools treat mobile as an afterthought.

## 8. File structure

```
querypal/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home: database list
│   │   ├── explore.tsx               # Schema explorer
│   │   ├── query.tsx                 # Query builder
│   │   └── settings.tsx              # Settings & subscription
│   ├── database/
│   │   ├── [id].tsx                  # Database detail view
│   │   └── add.tsx                   # Add new database
│   ├── _layout.tsx                   # Root layout
│   └── +not-found.tsx
├── components/
│   ├── DatabaseCard.tsx
│   ├── SchemaTree.tsx
│   ├── QueryInput.tsx
│   ├── ResultsTable.tsx
│   └── AIChat.tsx
├── lib/
│   ├── database/
│   │   ├── connectors.ts             # DB connection logic
│   │   ├── schema-parser.ts          # Parse schema metadata
│   │   └── query-executor.ts         # Execute queries safely
│   ├── ai/
│   │   ├── openai-client.ts          # AI API wrapper
│   │   ├── prompts.ts                # System prompts
│   │   └── query-generator.ts        # Natural language → SQL
│   ├── storage/
│   │   ├── sqlite.ts                 # Local SQLite setup
│   │   ├── credentials.ts            # Encrypted credential storage
│   │   └── cache.ts                  # Offline schema cache
│   └── utils/
│       ├── encryption.ts             # Credential encryption
│       └── validation.ts             # Input validation
├── store/
│   ├── database-store.ts             # Zustand store for databases
│   └── query-store.ts                # Query history & favorites
├── types/
│   ├── database.ts
│   ├── schema.ts
│   └── query.ts
├── __tests__/
│   ├── lib/
│   │   ├── schema-parser.test.ts
│   │   ├── query-generator.test.ts
│   │   └── encryption.test.ts
│   └── components/
│       ├── DatabaseCard.test.tsx
│       └── QueryInput.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## 9. Tests

### Core logic tests (Jest)

**`__tests__/lib/schema-parser.test.ts`**
```typescript
import { parsePostgresSchema, parseTableRelationships } from '@/lib/database/schema-parser';

describe('Schema Parser', () => {
  test('parses PostgreSQL table metadata', () => {
    const mockSchema = [
      { table_name: 'users', column_name: 'id', data_type: 'integer' },
      { table_name: 'users', column_name: 'email', data_type: 'varchar' }
    ];
    const result = parsePostgresSchema(mockSchema);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('users');
    expect(result[0].columns).toHaveLength(2);
  });

  test('identifies foreign key relationships', () => {
    const mockConstraints = [
      { table: 'posts', column: 'user_id', foreign_table: 'users', foreign_column: 'id' }
    ];
    const relationships = parseTableRelationships(mockConstraints);
    expect(relationships).toHaveLength(1);
    expect(relationships[0].type).toBe('one-to-many');
  });
});
```

**`__tests__/lib/query-generator.test.ts`**
```typescript
import { generateSQLFromNaturalLanguage } from '@/lib/ai/query-generator';

describe('Query Generator', () => {
  test('converts natural language to SQL', async () => {
    const schema = { tables: [{ name: 'users', columns: ['id', 'email', 'created_at'] }] };
    const query = await generateSQLFromNaturalLanguage(
      'Show me all users created last week',
      schema
    );
    expect(query).toContain('SELECT');
    expect(query).toContain('users');
    expect(query).toContain('created_at');
  });

  test('handles invalid queries gracefully', async () => {
    const schema = { tables: [] };
    await expect(
      generateSQLFromNaturalLanguage('Delete all data', schema)
    ).rejects.toThrow('Destructive queries not allowed');
  });
});
```

**`__tests__/lib/encryption.test.ts`**
```typescript
import { encryptCredentials, decryptCredentials } from '@/lib/utils/encryption';

describe('Credential Encryption', () => {
  test('encrypts and decrypts connection strings', () => {
    const original = 'postgresql://user:pass@localhost:5432/db';
    const encrypted = encryptCredentials(original);
    expect(encrypted).not.toBe(original);
    
    const decrypted = decryptCredentials(encrypted);
    expect(decrypted).toBe(original);
  });
});
```

**`__tests__/components/DatabaseCard.test.tsx`**
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import DatabaseCard from '@/components/DatabaseCard';

describe('DatabaseCard', () => {
  test('renders database info correctly', () => {
    const db = { id: '1', name: 'Production', type: 'postgresql', lastSync: new Date() };
    const { getByText } = render(<DatabaseCard database={db} onPress={() => {}} />);
    expect(getByText('Production')).toBeTruthy();
    expect(getByText('postgresql')).toBeTruthy();
  });

  test('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const db = { id: '1', name: 'Test', type: 'mysql', lastSync: new Date() };
    const { getByTestId } = render(<DatabaseCard database={db} onPress={onPress} />);
    fireEvent.press(getByTestId('database-card'));
    expect(onPress).toHaveBeenCalledWith('1');
  });
});
```

## 10. Implementation steps

### Phase 1: Project setup (Day 1)

1. **Initialize Expo project**
   ```bash
   npx create-expo-app querypal --template tabs
   cd querypal
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-sqlite expo-secure-store expo-crypto
   npm install zustand react-native-paper pg mysql2 @supabase/supabase-js
   npm install -D @types/pg @types/mysql jest @testing-library/react-native
   ```

3. **Configure TypeScript**
   - Update `tsconfig.json` with strict mode and path aliases
   - Add `@/` alias pointing to root directory

4. **Set up testing**
   - Configure Jest in `package.json`
   - Add test scripts: `"test": "jest"`, `"test:watch": "jest --watch"`

### Phase 2: Core database layer (Days 2-3)

5. **Implement local SQLite storage** (`lib/storage/sqlite.ts`)
   - Create tables: `databases`, `cached_schemas`, `query_history`
   - Write CRUD operations for database connections
   - Add migration system for schema updates

6. **Build credential encryption** (`lib/utils/encryption.ts`)
   - Use `expo-crypto` for AES-256 encryption
   - Store encryption key in `expo-secure-store`
   - Implement `encryptCredentials()` and `decryptCredentials()`

7. **Create database connectors** (`lib/database/connectors.ts`)
   - PostgreSQL connector using `pg` library
   - MySQL connector using `mysql2`
   - Supabase connector using `@supabase/supabase-js`
   - Unified interface: `connect()`, `disconnect()`, `testConnection()`

8. **Write schema parser** (`lib/database/schema-parser.ts`)
   - Query `information_schema` for table metadata
   - Parse columns, data types, constraints, indexes
   - Identify foreign key relationships
   - Generate text-based ERD representation

### Phase 3: AI integration (Days 4-5)

9. **Set up OpenAI client** (`lib/ai/openai-client.ts`)
   - Create API wrapper with error handling
   - Implement streaming responses for chat
   - Add rate limiting and retry logic

10. **Build query generator** (`lib/ai/query-generator.ts`)
    - System prompt: "You are a SQL expert. Convert natural language to safe SELECT queries."
    - Pass schema context to AI
    - Validate generated SQL (block DELETE, DROP, TRUNCATE)
    - Return query + explanation

11. **Create schema explainer** (`lib/ai/prompts.ts`)
    - Prompt: "Explain this database table in simple terms for non-technical users"
    - Generate table descriptions, relationship explanations
    - Suggest common queries for each table

### Phase 4: UI components (Days 6-8)

12. **Build DatabaseCard component** (`components/DatabaseCard.tsx`)
    - Display database name, type, last sync time
    - Show connection status indicator
    - Handle tap to navigate to detail view

13. **Create SchemaTree component** (`components/SchemaTree.tsx`)
    - Collapsible tree view of tables
    - Show columns with data types
    - Display foreign key relationships
    - Tap table to see AI explanation

14. **Implement QueryInput component** (`components/QueryInput.tsx`)
    - Text input for natural language queries
    - "Generate SQL" button
    - Show loading state during AI processing
    - Display generated SQL with syntax highlighting

15. **Build ResultsTable component** (`components/ResultsTable.tsx`)
    - Scrollable table for query results
    - Handle large datasets with pagination
    - Export results as CSV

16. **Create AIChat component** (`components/AIChat.tsx`)
    - Chat interface for asking questions about schema
    - Message bubbles for user/AI
    - Streaming responses

### Phase 5: Screens and navigation (Days 9-10)

17. **Home screen** (`app/(tabs)/index.tsx`)
    - List of saved databases
    - "Add Database" button
    - Pull to refresh
    - Swipe to delete

18. **Add database screen** (`app/database/add.tsx`)
    - Form for connection details (host, port, username, password, database name)
    - Database type selector (PostgreSQL, MySQL, Supabase)
    - "Test Connection" button
    - Save encrypted credentials

19. **Schema explorer screen** (`app/(tabs)/explore.tsx`)
    - SchemaTree component
    - Search bar to filter tables
    - AI chat button for questions

20. **Query builder screen** (`app/(tabs)/query.tsx`)
    - QueryInput component
    - ResultsTable component
    - Query history list
    - Save to favorites

21. **Settings screen** (`app/(tabs)/settings.tsx`)
    - Subscription status
    - Offline mode toggle
    - Clear cache button
    - About/support links

### Phase 6: State management (Day 11)

22. **Create database store** (`store/database-store.ts`)
    - Zustand store for database list
    - Actions: `addDatabase()`, `removeDatabase()`, `updateSchema()`
    - Persist to SQLite

23. **Create query store** (`store/query-store.ts`)
    - Store query history and favorites
    - Actions: `addQuery()`, `toggleFavorite()`, `clearHistory()`

### Phase 7: Offline mode (Day 12)

24. **Implement schema caching** (`lib/storage/cache.ts`)
    - Download full schema metadata on connect
    - Store in SQLite with timestamp
    - Sync in background when online
    - Serve cached data when offline

25. **Add offline indicator**
    - Show banner when offline
    - Disable query execution (show cached results only)
    - Queue schema refresh for when online

### Phase 8: Testing and polish (Days 13-14)

26. **Write all tests**
    - Run `npm test` and ensure 100% pass rate
    - Add integration tests for database connections
    - Test offline mode behavior

27. **Add error handling**
    - Connection failures
    - Invalid SQL queries
    - AI API errors
    - Network timeouts

28. **Polish UI**
    - Add loading skeletons
    - Smooth animations
    - Haptic feedback on interactions
    - Dark mode support

29. **Optimize performance**
    - Lazy load schema data
    - Debounce search inputs
    - Cache AI responses

### Phase 9: Monetization (Day 15)

30. **Integrate RevenueCat or Expo In-App Purchases**
    - Set up subscription products
    - Implement paywall screen
    - Gate Pro features (unlimited databases, unlimited AI queries)
    - Add "Upgrade to Pro" prompts

31. **Add usage tracking**
    - Count AI queries per day
    - Show usage meter in free tier
    - Prompt upgrade at limit

## 11. How to verify it works

### Local development

1. **Start Expo dev server**
   ```bash
   npx expo start
   ```

2. **Test on iOS Simulator**
   - Press `i` in terminal
   - Or scan QR code with Expo Go app on physical device

3. **Test on Android Emulator**
   - Press `a` in terminal
   - Or scan QR code with Expo Go app on physical device

### Verification checklist

- [ ] **Database connection works**
  - Add a PostgreSQL/MySQL/Supabase database
  - See "Connected" status indicator
  - View schema tree with tables and columns

- [ ] **AI query generation works**
  - Type "Show me all users"
  - See generated SQL query
  - Execute query and see results

- [ ] **Schema explanation works**
  - Tap on a table in schema tree
  - See AI-generated plain English description
  - Ask follow-up questions in chat

- [ ] **Offline mode works**
  - Connect to database and load schema
  - Turn off WiFi/cellular
  - Still see cached schema
  - Query execution disabled with helpful message

- [ ] **Credential encryption works**
  - Add database with password
  - Close app completely
  - Reopen app
  - Database still connects (credentials decrypted)

- [ ] **All tests pass**
   ```bash
   npm test
   ```
   - All Jest tests green
   - No console errors or warnings

### Production readiness

- [ ] Test on real databases (not just localhost)
- [ ] Verify AI responses are accurate and safe
- [ ] Test with large schemas (100+ tables)
- [ ] Ensure no credentials logged or exposed
- [ ] Test subscription flow end-to-end
- [ ] Submit to App Store and Google Play