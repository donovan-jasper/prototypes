# DataPal

## One-line pitch
Turn messy spreadsheets into smart databases with your voice — no coding required.

## Expanded vision

**Core audience:** Small business owners, field workers, event organizers, and solo entrepreneurs who currently abuse Excel/Sheets for things that need a real database (inventory tracking, customer lists, project management, field inspections).

**Broader appeal:**
- **Freelancers & consultants** who need client databases but can't afford enterprise tools
- **Teachers & researchers** collecting survey data or managing student records offline
- **Real estate agents** tracking properties and clients on-the-go
- **Restaurant/retail managers** doing inventory counts in the field
- **Hobbyists** (collectors, genealogists, home organizers) who outgrow spreadsheets

**Adjacent use cases:**
- Voice-driven data entry while driving or hands-free
- Offline-first field data collection (construction sites, rural areas, events)
- Quick prototyping for developers before building production systems
- Teaching database concepts without SQL syntax barriers

**Why non-technical users want this:**
- Spreadsheets break when you need relationships (customers → orders → products)
- Airtable requires internet and costs $20/user/month
- They're already thinking in database terms ("I need to link customers to their orders") but don't know SQL
- Voice input makes data entry 3x faster than typing on mobile

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Database:** expo-sqlite (built-in, no external deps)
- **AI:** Expo's built-in ML Kit for on-device voice-to-text + local LLM for query generation (fallback to OpenAI API for complex queries)
- **State:** Zustand (lightweight, <1kb)
- **UI:** React Native Paper (Material Design, accessible)
- **Voice:** expo-speech for text-to-speech feedback
- **Testing:** Jest + React Native Testing Library

## Core features

1. **Voice-to-Database Creation**
   - Say "Create a customer database with name, email, and phone number" → instant table
   - AI suggests field types (text, number, date) based on context
   - Preview before confirming

2. **Natural Language Queries**
   - "Show me customers who haven't ordered in 30 days"
   - "How many products are low on stock?"
   - Results display as cards (mobile-friendly) with export to CSV

3. **Smart Templates**
   - Pre-built databases: Inventory, Contacts, Projects, Events, Collections
   - One-tap clone and customize
   - Community template sharing (paid tier)

4. **Offline-First Sync**
   - Everything works without internet
   - Optional cloud backup (paid tier) via Expo's FileSystem + S3-compatible storage

5. **Quick Add Widget**
   - iOS/Android home screen widget for instant voice data entry
   - "Add customer: John Doe, john@example.com, 555-1234" → saved

## Monetization strategy

**Free tier (hook):**
- 3 databases, 500 rows per database
- Voice creation + basic queries
- 5 templates
- Local storage only

**Pro tier ($4.99/month or $49/year):**
- Unlimited databases and rows
- Advanced queries (joins, aggregations)
- Cloud backup + sync across devices
- Custom templates + community library
- Export to SQL/CSV/JSON
- Priority AI query processing (faster, more accurate)

**Why they stay subscribed:**
- Cloud backup becomes essential once they have real data
- Advanced queries unlock insights they can't get elsewhere
- Annual plan saves $10 (20% discount) — most convert after 3 months

**Revenue reasoning:**
- $4.99 is impulse-buy territory (cheaper than Airtable's $20, Notion's $10)
- Target 10K users in year 1 → 15% conversion = 1,500 paid = $7,500 MRR
- Upsell annual plans (40% take rate) = $90K ARR by month 18

## Skip if saturated?

**NOT SATURATED.** Gap is clear:
- Airtable: Requires internet, $20/user, overkill for solo users
- Notion: Clunky on mobile, not voice-first, limited offline
- SQLite Browser: Desktop-only, requires SQL knowledge
- Google Sheets: No relationships, breaks at scale, not database-native

DataPal is the only **offline-first, voice-native, mobile database** for non-technical users.

## File structure

```
datapal/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home: database list
│   │   ├── create.tsx             # Voice-driven creation
│   │   ├── query.tsx              # Natural language search
│   │   └── settings.tsx           # Sync, export, subscription
│   ├── database/
│   │   └── [id].tsx               # Single database view
│   └── _layout.tsx
├── components/
│   ├── DatabaseCard.tsx           # List item for databases
│   ├── VoiceInput.tsx             # Mic button + transcription
│   ├── QueryResults.tsx           # Card-based results display
│   ├── TemplateSelector.tsx       # Pre-built database picker
│   └── FieldEditor.tsx            # Add/edit table columns
├── lib/
│   ├── database.ts                # SQLite operations
│   ├── ai.ts                      # Query parsing + generation
│   ├── voice.ts                   # Speech-to-text wrapper
│   ├── templates.ts               # Pre-built schemas
│   └── store.ts                   # Zustand state
├── __tests__/
│   ├── database.test.ts
│   ├── ai.test.ts
│   ├── voice.test.ts
│   └── templates.test.ts
├── app.json
├── package.json
└── tsconfig.json
```

## Tests

```typescript
// __tests__/database.test.ts
import { createDatabase, insertRow, queryDatabase } from '../lib/database';

describe('Database operations', () => {
  it('creates a table with specified fields', async () => {
    const db = await createDatabase('customers', [
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' }
    ]);
    expect(db).toBeDefined();
  });

  it('inserts and retrieves rows', async () => {
    await insertRow('customers', { name: 'John', email: 'john@test.com' });
    const rows = await queryDatabase('customers', 'SELECT * FROM customers');
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('John');
  });
});

// __tests__/ai.test.ts
import { parseVoiceCommand, generateSQL } from '../lib/ai';

describe('AI query generation', () => {
  it('parses voice command to create table', () => {
    const result = parseVoiceCommand('create customer database with name and email');
    expect(result.action).toBe('create');
    expect(result.fields).toContain('name');
    expect(result.fields).toContain('email');
  });

  it('generates SQL from natural language', () => {
    const sql = generateSQL('show customers who joined this month');
    expect(sql).toContain('SELECT');
    expect(sql).toContain('WHERE');
  });
});

// __tests__/templates.test.ts
import { getTemplate, listTemplates } from '../lib/templates';

describe('Database templates', () => {
  it('returns inventory template schema', () => {
    const template = getTemplate('inventory');
    expect(template.fields).toContainEqual({ name: 'product_name', type: 'TEXT' });
    expect(template.fields).toContainEqual({ name: 'quantity', type: 'INTEGER' });
  });

  it('lists all available templates', () => {
    const templates = listTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty('name');
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest datapal --template blank-typescript
cd datapal
npx expo install expo-sqlite expo-speech expo-file-system
npm install zustand react-native-paper
npm install -D jest @testing-library/react-native
```

### 2. Database layer (`lib/database.ts`)
- Initialize SQLite connection with `expo-sqlite`
- Create `createDatabase(name, fields)` function that generates CREATE TABLE SQL
- Implement `insertRow(table, data)` with prepared statements
- Build `queryDatabase(table, sql)` with error handling
- Add `deleteDatabase(name)` and `listDatabases()` helpers

### 3. AI query parser (`lib/ai.ts`)
- Create `parseVoiceCommand(text)` using regex patterns for common intents:
  - "create [name] database with [fields]" → extract table name and field list
  - "show/find [conditions]" → map to SELECT queries
  - "add [data]" → map to INSERT
- Implement `generateSQL(naturalLanguage, schema)` that:
  - Matches keywords to SQL clauses (WHERE, ORDER BY, LIMIT)
  - Uses table schema to validate field names
  - Returns executable SQL string
- Add fallback to mock OpenAI API call for complex queries (stub for now)

### 4. Voice input (`lib/voice.ts`)
- Wrap expo-speech's recognition API in `startListening()` function
- Return promise that resolves with transcribed text
- Handle permissions and errors gracefully
- Add `speak(text)` helper for audio feedback

### 5. Templates (`lib/templates.ts`)
- Define 5 pre-built schemas as JSON objects:
  ```typescript
  {
    name: 'Inventory',
    fields: [
      { name: 'product_name', type: 'TEXT' },
      { name: 'quantity', type: 'INTEGER' },
      { name: 'reorder_level', type: 'INTEGER' }
    ]
  }
  ```
- Export `getTemplate(name)` and `listTemplates()` functions

### 6. State management (`lib/store.ts`)
- Create Zustand store with:
  - `databases: Database[]` (list of user's databases)
  - `currentDatabase: string | null`
  - `addDatabase()`, `removeDatabase()`, `setCurrentDatabase()` actions
- Persist to AsyncStorage

### 7. Home screen (`app/(tabs)/index.tsx`)
- Display list of databases using FlatList
- Each item shows name, row count, last modified
- Floating action button to create new database
- Pull-to-refresh to reload list

### 8. Create screen (`app/(tabs)/create.tsx`)
- Large mic button that triggers voice input
- Display transcribed text in real-time
- Show parsed fields with type suggestions (editable)
- "Create Database" button that calls `createDatabase()`
- Alternative: "Use Template" button that opens template picker

### 9. Database detail screen (`app/database/[id].tsx`)
- Show table schema at top (field names and types)
- List rows as cards (not table view — better for mobile)
- FAB with "Add Row" (opens voice input or form)
- Search bar that triggers natural language query

### 10. Query screen (`app/(tabs)/query.tsx`)
- Voice input for natural language queries
- Display results as scrollable cards
- Export button (CSV download via FileSystem)
- Query history (last 10 queries)

### 11. Settings screen (`app/(tabs)/settings.tsx`)
- Subscription status (free/pro)
- "Upgrade to Pro" button (links to in-app purchase)
- Cloud backup toggle (disabled for free tier)
- Export all databases button
- Delete all data (with confirmation)

### 12. Components
- **DatabaseCard**: Pressable card with name, icon, row count
- **VoiceInput**: Animated mic button with transcription display
- **QueryResults**: FlatList of result cards with field highlighting
- **TemplateSelector**: Modal with template grid
- **FieldEditor**: Form to add/edit table columns

### 13. Testing
- Run `npm test` to execute all Jest tests
- Verify database CRUD operations work
- Test AI parser with sample voice commands
- Validate template loading

### 14. Polish
- Add loading states (ActivityIndicator) for async operations
- Implement error boundaries for database failures
- Add haptic feedback on voice input start/stop
- Create app icon and splash screen

## How to verify it works

### On device/simulator:
1. `npx expo start` and scan QR code with Expo Go
2. Grant microphone permissions when prompted
3. Tap "Create Database" → say "Create inventory database with product name and quantity"
4. Verify table appears on home screen
5. Open database → tap FAB → say "Add product: Laptop, quantity 5"
6. Verify row appears in list
7. Go to Query tab → say "Show products with quantity less than 10"
8. Verify results display correctly

### Automated tests:
```bash
npm test
```
All tests in `__tests__/` must pass (database CRUD, AI parsing, template loading).

### Edge cases to test:
- Create database with no internet (should work)
- Add 100+ rows and verify performance
- Try invalid SQL generation (should show friendly error)
- Delete database and confirm it's removed from list