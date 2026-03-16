# QuerySnap

**On-the-go database insights without writing a single line of code**

---

## Expanded Vision

QuerySnap isn't just for database professionals — it's for anyone who needs answers from data but doesn't speak SQL.

**Core audience:**
- Small business owners checking inventory, sales, or customer data from their phone
- Field service technicians accessing equipment logs, maintenance records, or client histories on-site
- Sales reps querying CRM data during client meetings
- Restaurant managers reviewing daily sales, staff schedules, or supplier orders
- Freelancers and consultants who manage client databases but aren't developers

**Adjacent use cases:**
- Personal finance tracking (connect to bank exports, budgeting apps)
- Home inventory management (insurance claims, moving, estate planning)
- Event planning (guest lists, vendor tracking, budget monitoring)
- Educational projects (students learning data analysis without SQL barriers)
- Nonprofit volunteer coordination (donor tracking, event attendance)

**Why non-technical users want this:**
Most people have data trapped in spreadsheets, CSVs, or simple databases but lack the skills to ask complex questions. QuerySnap turns natural language into insights — "Show me my top 5 customers this month" or "Which products are low in stock?" — without requiring SQL knowledge. Voice input makes it even faster for hands-free scenarios.

The real magic: it works offline. Field workers, travelers, and anyone without reliable connectivity can still query their data. The app becomes indispensable for mobile-first professionals who need instant answers.

---

## Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Database:** SQLite (expo-sqlite)
- **AI/NLP:** OpenAI API (GPT-4) for query generation, with local fallback patterns for offline mode
- **Voice:** Expo Speech (expo-speech for text-to-speech, expo-av for voice recording)
- **Storage:** Expo FileSystem for database imports/exports
- **State:** Zustand (lightweight, minimal boilerplate)
- **UI:** React Native Paper (Material Design components)
- **Testing:** Jest + React Native Testing Library

---

## Core Features (MVP)

1. **Natural Language to SQL**  
   Type or speak a question ("How many orders did I get last week?"), get instant results. AI translates to SQL, executes against your database, and displays results in a clean table or chart.

2. **Database Import & Schema Detection**  
   Import SQLite, CSV, or Excel files. App auto-detects schema, suggests common queries based on table structure, and creates a visual schema map.

3. **Offline Query Library**  
   Save frequently used queries as templates. Works offline by caching AI-generated SQL patterns. Sync across devices when online.

4. **Voice-First Interface**  
   Hands-free querying for field workers. Speak your question, hear results read back. Perfect for warehouse floors, construction sites, or driving.

5. **Export & Share Results**  
   Generate PDF reports, CSV exports, or shareable links. Send insights to clients or team members directly from the app.

---

## Monetization Strategy

**Free Tier:**
- Import up to 2 databases (max 1,000 rows each)
- 10 AI-powered queries per month
- Basic query templates (pre-built common queries)
- Export to CSV only

**Premium ($9.99/month or $79.99/year):**
- Unlimited databases and rows
- Unlimited AI queries
- Offline mode with cached AI patterns
- Voice-to-query (unlimited)
- Advanced exports (PDF, Excel, shareable links)
- Custom query templates and saved reports
- Priority support

**Why people stay subscribed:**
- Offline functionality becomes essential for field workers
- Saved query templates save hours of repetitive work
- Voice interface is addictive for hands-free scenarios
- The more databases they import, the more locked-in they become

**Pricing reasoning:**
$9.99 is impulse-buy territory for small business owners and freelancers. Annual discount (20% off) encourages long-term commitment. Lower than Airtable ($20/month) but positioned as a mobile-first, AI-powered alternative.

---

## File Structure

```
querysnap/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home: database list
│   │   ├── query.tsx              # Query interface
│   │   └── settings.tsx           # Settings & subscription
│   ├── database/[id].tsx          # Database detail view
│   ├── _layout.tsx                # Root layout
│   └── +not-found.tsx
├── components/
│   ├── DatabaseCard.tsx           # Database list item
│   ├── QueryInput.tsx             # Natural language input
│   ├── ResultsTable.tsx           # Query results display
│   ├── SchemaViewer.tsx           # Visual schema map
│   ├── VoiceButton.tsx            # Voice input trigger
│   └── ExportMenu.tsx             # Export options
├── lib/
│   ├── database.ts                # SQLite operations
│   ├── ai.ts                      # OpenAI query generation
│   ├── parser.ts                  # CSV/Excel import
│   ├── voice.ts                   # Voice recognition
│   ├── export.ts                  # PDF/CSV generation
│   └── store.ts                   # Zustand state management
├── hooks/
│   ├── useDatabase.ts             # Database CRUD
│   ├── useQuery.ts                # Query execution
│   └── useSubscription.ts         # Premium status
├── constants/
│   ├── queryTemplates.ts          # Offline query patterns
│   └── schemas.ts                 # Common schema types
├── __tests__/
│   ├── database.test.ts
│   ├── ai.test.ts
│   ├── parser.test.ts
│   └── export.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Tests

**`__tests__/database.test.ts`**
```typescript
import { createDatabase, executeQuery, getSchema } from '../lib/database';

describe('Database Operations', () => {
  it('creates a new SQLite database', async () => {
    const db = await createDatabase('test.db');
    expect(db).toBeDefined();
  });

  it('executes a SELECT query', async () => {
    const db = await createDatabase('test.db');
    await executeQuery(db, 'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
    await executeQuery(db, "INSERT INTO users (name) VALUES ('Alice')");
    const result = await executeQuery(db, 'SELECT * FROM users');
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toBe('Alice');
  });

  it('extracts schema from database', async () => {
    const db = await createDatabase('test.db');
    await executeQuery(db, 'CREATE TABLE products (id INTEGER, name TEXT, price REAL)');
    const schema = await getSchema(db);
    expect(schema.tables).toContain('products');
    expect(schema.columns.products).toEqual(['id', 'name', 'price']);
  });
});
```

**`__tests__/ai.test.ts`**
```typescript
import { generateSQL, validateQuery } from '../lib/ai';

describe('AI Query Generation', () => {
  it('converts natural language to SQL', async () => {
    const schema = { tables: ['orders'], columns: { orders: ['id', 'total', 'date'] } };
    const sql = await generateSQL('Show me orders over $100', schema);
    expect(sql).toContain('SELECT');
    expect(sql).toContain('orders');
    expect(sql).toContain('total > 100');
  });

  it('validates generated SQL syntax', () => {
    const validSQL = 'SELECT * FROM users WHERE age > 18';
    const invalidSQL = 'SELCT * FORM users';
    expect(validateQuery(validSQL)).toBe(true);
    expect(validateQuery(invalidSQL)).toBe(false);
  });
});
```

**`__tests__/parser.test.ts`**
```typescript
import { parseCSV, parseExcel, detectSchema } from '../lib/parser';

describe('File Parsing', () => {
  it('parses CSV into rows', () => {
    const csv = 'name,age\nAlice,30\nBob,25';
    const result = parseCSV(csv);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ name: 'Alice', age: '30' });
  });

  it('detects schema from parsed data', () => {
    const data = [
      { id: 1, name: 'Alice', price: 19.99 },
      { id: 2, name: 'Bob', price: 29.99 }
    ];
    const schema = detectSchema(data);
    expect(schema.columns).toEqual(['id', 'name', 'price']);
    expect(schema.types.id).toBe('INTEGER');
    expect(schema.types.price).toBe('REAL');
  });
});
```

**`__tests__/export.test.ts`**
```typescript
import { exportToCSV, exportToPDF } from '../lib/export';

describe('Export Functionality', () => {
  it('exports query results to CSV', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    const csv = exportToCSV(data);
    expect(csv).toContain('id,name');
    expect(csv).toContain('1,Alice');
  });

  it('generates PDF report', async () => {
    const data = [{ id: 1, name: 'Alice' }];
    const pdf = await exportToPDF(data, 'Test Report');
    expect(pdf).toBeDefined();
    expect(pdf.uri).toContain('.pdf');
  });
});
```

---

## Implementation Steps

### 1. Project Setup
```bash
npx create-expo-app querysnap --template tabs
cd querysnap
npm install expo-sqlite zustand react-native-paper expo-speech expo-av expo-file-system
npm install --save-dev jest @testing-library/react-native @types/jest
```

### 2. Configure Testing
Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
```

### 3. Database Layer (`lib/database.ts`)
- Implement `createDatabase()` using `expo-sqlite`
- Create `executeQuery()` wrapper with error handling
- Build `getSchema()` to extract table/column metadata
- Add `importDatabase()` for file uploads
- Implement `closeDatabase()` for cleanup

### 4. AI Integration (`lib/ai.ts`)
- Set up OpenAI API client with error handling
- Create `generateSQL()` that sends schema + natural language prompt
- Build `validateQuery()` using regex for basic SQL syntax checks
- Implement offline fallback with `queryTemplates.ts` pattern matching
- Add `explainQuery()` to translate SQL back to plain English

### 5. File Parser (`lib/parser.ts`)
- Implement `parseCSV()` using string splitting and header detection
- Create `parseExcel()` wrapper (use `xlsx` library)
- Build `detectSchema()` to infer column types from sample data
- Add `createTableFromData()` to generate CREATE TABLE statements
- Implement `importToSQLite()` to bulk insert parsed rows

### 6. Voice Interface (`lib/voice.ts`)
- Set up `expo-speech` for text-to-speech results
- Implement `startRecording()` using `expo-av`
- Create `transcribeAudio()` (use OpenAI Whisper API)
- Build `speakResults()` to read query results aloud
- Add permission checks for microphone access

### 7. Export Functionality (`lib/export.ts`)
- Implement `exportToCSV()` with proper escaping
- Create `exportToPDF()` using `react-native-html-to-pdf`
- Build `shareResults()` using Expo Sharing API
- Add `generateReport()` for formatted PDF with charts

### 8. State Management (`lib/store.ts`)
- Create Zustand store with slices for:
  - `databases`: list of imported databases
  - `queries`: query history and saved templates
  - `subscription`: premium status and limits
- Implement persistence using AsyncStorage
- Add actions for CRUD operations

### 9. UI Components
**`DatabaseCard.tsx`:**
- Display database name, row count, last accessed
- Show schema preview (table names)
- Add delete/export actions

**`QueryInput.tsx`:**
- Text input with autocomplete suggestions
- Voice button integration
- Loading state during AI processing

**`ResultsTable.tsx`:**
- Scrollable table with column headers
- Pagination for large result sets
- Tap row to see details

**`SchemaViewer.tsx`:**
- Visual tree of tables and columns
- Show data types and relationships
- Tap table to see sample data

**`VoiceButton.tsx`:**
- Animated microphone icon
- Recording indicator
- Error handling for permissions

**`ExportMenu.tsx`:**
- Bottom sheet with export options
- Preview before export
- Share directly to apps

### 10. Screens
**`app/(tabs)/index.tsx`:**
- List of imported databases
- FAB to import new database
- Empty state with onboarding

**`app/(tabs)/query.tsx`:**
- Query input (text or voice)
- Results display
- Query history sidebar

**`app/(tabs)/settings.tsx`:**
- Subscription status
- Usage limits (free tier)
- Export/import app data

**`app/database/[id].tsx`:**
- Schema viewer
- Sample data preview
- Quick query templates

### 11. Subscription Logic (`hooks/useSubscription.ts`)
- Check premium status from AsyncStorage
- Implement usage limits (query count, database count)
- Add paywall modal for premium features
- Integrate with Expo In-App Purchases (RevenueCat recommended)

### 12. Offline Mode
- Cache AI-generated SQL patterns in `queryTemplates.ts`
- Implement pattern matching for common queries
- Store query history locally
- Sync when online using background fetch

### 13. Testing
- Write unit tests for all `lib/` modules
- Add integration tests for query flow
- Test offline mode with network mocking
- Verify export functionality

### 14. Polish
- Add loading skeletons
- Implement error boundaries
- Create onboarding flow
- Add haptic feedback
- Optimize performance (lazy loading, memoization)

---

## How to Verify It Works

### Development
```bash
npm install
npm test                    # All tests must pass
npx expo start
```

### Testing on Device
1. Open Expo Go app on iOS/Android
2. Scan QR code from terminal
3. Test flow:
   - Import a sample CSV (create one with customer data)
   - Ask "Show me all customers" (should generate SELECT query)
   - Try voice input: tap mic, say "How many orders this month?"
   - Export results to CSV
   - Check offline mode (enable airplane mode, use saved query)

### Acceptance Criteria
- [ ] Import CSV creates SQLite database
- [ ] Natural language query returns correct results
- [ ] Voice input transcribes and executes query
- [ ] Export generates valid CSV/PDF
- [ ] Offline mode uses cached patterns
- [ ] Free tier limits enforced (10 queries/month)
- [ ] All Jest tests pass (`npm test`)
- [ ] App runs on both iOS and Android simulators
- [ ] No crashes during 5-minute stress test (rapid queries)

### Performance Benchmarks
- Database import (1,000 rows): < 2 seconds
- AI query generation: < 3 seconds
- Query execution: < 500ms for simple SELECT
- Voice transcription: < 2 seconds
- PDF export: < 5 seconds