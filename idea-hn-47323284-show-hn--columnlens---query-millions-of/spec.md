# DataDeck

## One-line pitch
Run SQL queries and build charts from CSV files instantly on your phone — no cloud, no limits, no waiting.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Field researchers collecting survey data in remote areas without internet
- Healthcare workers analyzing patient data that can't leave the device (HIPAA compliance)
- Financial auditors reviewing transaction logs on-site at client locations
- Sales teams analyzing customer data during flights or in areas with poor connectivity
- Students learning SQL and data analysis without expensive cloud credits
- Privacy advocates who refuse to upload sensitive data to third-party servers

**Broadest audience:**
Anyone who works with spreadsheets and wants to ask questions of their data without Excel formulas or Google Sheets limitations. This is "SQL for people who don't know they need SQL."

**Adjacent use cases:**
- Personal finance tracking (import bank CSVs, query spending patterns)
- Fitness data analysis (export from Apple Health, analyze trends)
- Small business inventory management (offline-first, no monthly SaaS fees)
- Event organizers analyzing attendee lists and ticket sales
- Teachers grading and analyzing student performance data
- Journalists analyzing leaked datasets securely

**Why non-technical people want this:**
- Pre-built query templates ("Show me my top 10 expenses this month")
- Natural language query builder (tap options instead of writing SQL)
- One-tap chart generation from any query result
- Share results as images or PDFs, not raw data files
- Works on a plane, in a hospital, or in the field — no internet required

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Database:** `expo-sqlite` with DuckDB WASM fallback for complex analytics
- **Charting:** `react-native-chart-kit` (lightweight, no native dependencies)
- **File handling:** `expo-document-picker` + `expo-file-system`
- **CSV parsing:** `papaparse` (fast, streaming support)
- **State management:** Zustand (minimal, no boilerplate)
- **Testing:** Jest + React Native Testing Library
- **Type safety:** TypeScript

## Core features (MVP)

1. **Import & Query**
   - Import CSV files up to 100MB (free) / 1GB (pro)
   - Auto-detect column types and create indexed tables
   - Visual query builder with drag-and-drop filters
   - SQL editor with syntax highlighting for power users

2. **Instant Visualizations**
   - One-tap chart generation (bar, line, pie, scatter)
   - Export charts as PNG or share directly
   - Interactive legends and data point tooltips

3. **Query Templates**
   - Pre-built queries for common tasks ("Top 10", "Group by month", "Find duplicates")
   - Save custom queries as templates
   - Share templates with team members via QR code

4. **Offline-First Architecture**
   - All data stays on device (encrypted at rest)
   - No account required for basic use
   - Optional iCloud sync for Pro users (end-to-end encrypted)

5. **Export & Share**
   - Export query results as CSV, JSON, or formatted PDF reports
   - Share charts and summaries via any app
   - Generate shareable links to query templates (no data included)

## Monetization strategy

**Free tier (hook):**
- Import files up to 100MB
- Unlimited queries and basic charts
- 5 saved query templates
- Export results as CSV

**Pro tier ($7.99/month or $49.99/year):**
- Files up to 1GB
- Advanced charts (3D scatter, heatmaps, custom themes)
- Unlimited saved templates
- PDF report generation with branding
- iCloud sync across devices
- JavaScript scripting for custom transformations
- Priority support

**Why people stay subscribed:**
- They build a library of custom query templates for their workflow
- iCloud sync makes it their "data analysis hub" across devices
- Scripting enables automation they can't replicate elsewhere
- Annual plan is cheaper than 2 months of competing cloud tools

**One-time purchase option ($79.99):**
- Perpetual Pro license (no subscription)
- Appeals to privacy advocates and one-time buyers
- Excludes future "Pro+" features (e.g., AI query assistant)

## File structure

```
datadeck/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home: file import + recent queries
│   │   ├── queries.tsx            # Saved queries and templates
│   │   ├── charts.tsx             # Saved visualizations
│   │   └── settings.tsx           # Settings and Pro upgrade
│   ├── query/[id].tsx             # Query editor and results
│   ├── chart/[id].tsx             # Chart viewer and export
│   └── _layout.tsx                # Root layout with navigation
├── components/
│   ├── FileImporter.tsx           # CSV import with progress
│   ├── QueryBuilder.tsx           # Visual query builder
│   ├── SQLEditor.tsx              # Code editor with syntax highlighting
│   ├── ChartRenderer.tsx          # Chart display component
│   ├── TemplateLibrary.tsx        # Pre-built query templates
│   └── ExportMenu.tsx             # Export options modal
├── lib/
│   ├── database.ts                # SQLite wrapper with DuckDB fallback
│   ├── csv-parser.ts              # Streaming CSV parser
│   ├── query-engine.ts            # Query execution and optimization
│   ├── chart-generator.ts         # Chart config from query results
│   ├── encryption.ts              # At-rest encryption utilities
│   └── storage.ts                 # File system and cache management
├── store/
│   ├── queries.ts                 # Query history and templates
│   ├── files.ts                   # Imported files metadata
│   └── settings.ts                # App settings and Pro status
├── constants/
│   ├── query-templates.ts         # Pre-built query library
│   └── chart-themes.ts            # Chart color schemes
├── __tests__/
│   ├── csv-parser.test.ts
│   ├── query-engine.test.ts
│   ├── chart-generator.test.ts
│   └── database.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/csv-parser.test.ts
import { parseCSV, detectColumnTypes } from '../lib/csv-parser';

describe('CSV Parser', () => {
  it('parses valid CSV with headers', async () => {
    const csv = 'name,age,city\nAlice,30,NYC\nBob,25,LA';
    const result = await parseCSV(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.columns).toEqual(['name', 'age', 'city']);
  });

  it('detects column types correctly', () => {
    const rows = [
      { age: '30', price: '19.99', active: 'true' },
      { age: '25', price: '29.99', active: 'false' }
    ];
    const types = detectColumnTypes(rows);
    expect(types.age).toBe('INTEGER');
    expect(types.price).toBe('REAL');
    expect(types.active).toBe('BOOLEAN');
  });
});

// __tests__/query-engine.test.ts
import { executeQuery, optimizeQuery } from '../lib/query-engine';

describe('Query Engine', () => {
  it('executes SELECT query and returns results', async () => {
    const result = await executeQuery('SELECT * FROM test LIMIT 10');
    expect(result.rows).toBeDefined();
    expect(result.columns).toBeDefined();
  });

  it('optimizes query with indexes', () => {
    const query = 'SELECT * FROM users WHERE email = "test@example.com"';
    const optimized = optimizeQuery(query);
    expect(optimized).toContain('INDEX');
  });
});

// __tests__/chart-generator.test.ts
import { generateChartConfig } from '../lib/chart-generator';

describe('Chart Generator', () => {
  it('generates bar chart config from query results', () => {
    const data = {
      columns: ['category', 'count'],
      rows: [['A', 10], ['B', 20], ['C', 15]]
    };
    const config = generateChartConfig(data, 'bar');
    expect(config.type).toBe('bar');
    expect(config.data.labels).toEqual(['A', 'B', 'C']);
    expect(config.data.datasets[0].data).toEqual([10, 20, 15]);
  });
});

// __tests__/database.test.ts
import { createTable, insertRows, query } from '../lib/database';

describe('Database', () => {
  it('creates table with correct schema', async () => {
    const schema = { name: 'TEXT', age: 'INTEGER' };
    await createTable('users', schema);
    const result = await query('SELECT sql FROM sqlite_master WHERE name="users"');
    expect(result.rows[0].sql).toContain('name TEXT');
  });

  it('inserts and retrieves rows', async () => {
    await insertRows('users', [{ name: 'Alice', age: 30 }]);
    const result = await query('SELECT * FROM users WHERE name="Alice"');
    expect(result.rows[0].age).toBe(30);
  });
});
```

## Implementation steps

### Phase 1: Project setup and database foundation

1. **Initialize Expo project**
   ```bash
   npx create-expo-app datadeck --template tabs
   cd datadeck
   npx expo install expo-sqlite expo-file-system expo-document-picker
   npm install papaparse zustand react-native-chart-kit
   npm install -D @types/papaparse jest @testing-library/react-native
   ```

2. **Create database wrapper (`lib/database.ts`)**
   - Initialize SQLite connection with `expo-sqlite`
   - Implement `createTable(name, schema)` to dynamically create tables from CSV columns
   - Implement `insertRows(table, rows)` with batch inserts (1000 rows at a time)
   - Implement `query(sql)` with error handling and result formatting
   - Add `dropTable(name)` for cleanup
   - Enable WAL mode for better concurrency: `PRAGMA journal_mode=WAL`

3. **Build CSV parser (`lib/csv-parser.ts`)**
   - Use `papaparse` with streaming for large files
   - Implement `detectColumnTypes(rows)` by sampling first 100 rows
   - Map types: numbers → INTEGER/REAL, dates → TEXT (ISO format), booleans → INTEGER
   - Handle edge cases: empty cells, mixed types (default to TEXT), special characters in column names
   - Return `{ columns, rows, types }` object

4. **Write and run database tests**
   - Create `__tests__/database.test.ts` with table creation and query tests
   - Create `__tests__/csv-parser.test.ts` with type detection tests
   - Run `npm test` to verify core logic works

### Phase 2: File import and storage

5. **Build FileImporter component (`components/FileImporter.tsx`)**
   - Use `expo-document-picker` to select CSV files
   - Show file size and estimated row count before import
   - Display progress bar during parsing (update every 10% of rows processed)
   - On completion, call `createTable` and `insertRows` from database module
   - Store file metadata in Zustand store: `{ id, name, size, rowCount, importedAt }`

6. **Create file storage manager (`lib/storage.ts`)**
   - Copy imported files to app's document directory
   - Generate unique IDs for each file (UUID)
   - Implement `getFileMetadata(id)` to retrieve file info
   - Implement `deleteFile(id)` to remove file and associated table
   - Track total storage used (enforce 100MB limit for free tier)

7. **Build home screen (`app/(tabs)/index.tsx`)**
   - Show "Import CSV" button at top
   - List recently imported files with name, size, row count
   - Tap file to navigate to query editor
   - Swipe to delete file (with confirmation)
   - Show storage usage bar at bottom (e.g., "45 MB / 100 MB used")

### Phase 3: Query builder and execution

8. **Create query engine (`lib/query-engine.ts`)**
   - Implement `executeQuery(sql, params)` wrapper around database.query
   - Add query validation (prevent DROP, DELETE without WHERE clause)
   - Implement `optimizeQuery(sql)` to add indexes for common WHERE clauses
   - Cache query results for 5 minutes (LRU cache, max 10 queries)
   - Return `{ columns, rows, executionTime }` object

9. **Build visual QueryBuilder component (`components/QueryBuilder.tsx`)**
   - Show table selector dropdown (list all imported tables)
   - Column selector with checkboxes (SELECT clause)
   - Filter builder: column dropdown + operator (=, >, <, LIKE) + value input
   - Sort selector: column + ASC/DESC
   - Limit input (default 100)
   - "Generate SQL" button that constructs query string
   - Display generated SQL in read-only text area

10. **Build SQLEditor component (`components/SQLEditor.tsx`)**
    - Use `TextInput` with monospace font
    - Basic syntax highlighting: keywords (SELECT, FROM, WHERE) in blue, strings in green
    - "Run Query" button that calls `executeQuery`
    - Show results in scrollable table (max 1000 rows, paginate if more)
    - Display execution time below results

11. **Create query screen (`app/query/[id].tsx`)**
    - Tab switcher: "Visual Builder" vs "SQL Editor"
    - Show QueryBuilder or SQLEditor based on active tab
    - Results table below with horizontal scroll
    - "Save Query" button to store in Zustand
    - "Create Chart" button (navigate to chart screen with query results)

### Phase 4: Visualizations

12. **Build chart generator (`lib/chart-generator.ts`)**
    - Implement `generateChartConfig(data, type)` for bar, line, pie charts
    - Auto-select X/Y axes: first column = labels, second column = values
    - For multi-column data, create multiple datasets
    - Return config compatible with `react-native-chart-kit`
    - Handle edge cases: empty data, non-numeric values, too many data points (aggregate)

13. **Create ChartRenderer component (`components/ChartRenderer.tsx`)**
    - Accept `data` and `type` props
    - Render `BarChart`, `LineChart`, or `PieChart` from `react-native-chart-kit`
    - Add interactive tooltips (show value on tap)
    - Implement zoom/pan for large datasets (use `react-native-gesture-handler`)
    - "Export as PNG" button using `react-native-view-shot`

14. **Build chart screen (`app/chart/[id].tsx`)**
    - Show ChartRenderer with query results
    - Chart type selector (bar, line, pie) at top
    - "Save Chart" button to store in Zustand
    - "Share" button to export as image and open share sheet
    - Back button to return to query screen

15. **Create charts tab (`app/(tabs)/charts.tsx`)**
    - List all saved charts with thumbnails
    - Tap to open full chart screen
    - Swipe to delete chart

### Phase 5: Templates and settings

16. **Build query templates (`constants/query-templates.ts`)**
    - Define 10 common templates as objects: `{ name, description, sql }`
    - Examples: "Top 10 by value", "Group by month", "Find duplicates", "Summary statistics"
    - Use placeholders like `{TABLE}` and `{COLUMN}` for dynamic substitution

17. **Create TemplateLibrary component (`components/TemplateLibrary.tsx`)**
    - Display templates as cards with name and description
    - Tap to open modal with table/column selectors
    - Substitute placeholders and navigate to query screen with pre-filled SQL

18. **Build queries tab (`app/(tabs)/queries.tsx`)**
    - Section 1: "Templates" with TemplateLibrary component
    - Section 2: "Saved Queries" list with name, SQL preview, last run time
    - Tap saved query to open in query screen
    - Swipe to delete saved query

19. **Create settings screen (`app/(tabs)/settings.tsx`)**
    - Storage usage display with breakdown by file
    - "Clear Cache" button to delete cached query results
    - "Upgrade to Pro" button (navigate to paywall screen)
    - About section with version number and links

### Phase 6: Pro features and monetization

20. **Implement encryption (`lib/encryption.ts`)**
    - Use `expo-crypto` for AES-256 encryption
    - Encrypt files at rest (optional, enabled in settings)
    - Generate encryption key from device ID + user passcode
    - Decrypt on read, encrypt on write

21. **Add iCloud sync (Pro only)**
    - Use `expo-file-system` to sync to iCloud Drive folder
    - Upload file metadata and encrypted files
    - Poll for changes every 5 minutes when app is active
    - Show sync status indicator in settings

22. **Build paywall screen**
    - Show feature comparison table (Free vs Pro)
    - "Start Free Trial" button (7 days)
    - "Subscribe" button with monthly/annual options
    - "Restore Purchases" button
    - Use `expo-in-app-purchases` for payment processing

23. **Implement Pro checks throughout app**
    - File size limit: check before import, show upgrade prompt if exceeded
    - Advanced charts: disable in free tier, show "Pro" badge
    - Saved templates: limit to 5 in free tier
    - PDF export: Pro only feature

### Phase 7: Polish and testing

24. **Add loading states and error handling**
    - Show spinner during file import, query execution, chart generation
    - Display user-friendly error messages (e.g., "Invalid SQL syntax" instead of raw error)
    - Implement retry logic for failed operations
    - Add empty states for all lists (e.g., "No files imported yet")

25. **Optimize performance**
    - Lazy load query results (render 50 rows at a time)
    - Debounce SQL editor input (don't validate on every keystroke)
    - Use `React.memo` for expensive components (ChartRenderer, QueryBuilder)
    - Profile with React DevTools and optimize re-renders

26. **Write integration tests**
    - Test full flow: import CSV → run query → generate chart → export
    - Test Pro upgrade flow (mock in-app purchase)
    - Test error scenarios: invalid CSV, SQL syntax error, file too large

27. **Create onboarding flow**
    - Show 3-screen tutorial on first launch: "Import data" → "Run queries" → "Create charts"
    - Include sample CSV file in app bundle for demo
    - "Skip" button to bypass tutorial

## How to verify it works

### Local development
1. **Start Expo dev server:**
   ```bash
   npx expo start
   ```

2. **Test on iOS Simulator:**
   - Press `i` in terminal to open iOS Simulator
   - Import sample CSV file (create one with 1000+ rows for testing)
   - Run a query and verify results appear in < 1 second
   - Generate a chart and verify it renders correctly
   - Test export functionality (save chart as PNG)

3. **Test on Android Emulator:**
   - Press `a` in terminal to open Android Emulator
   - Repeat all iOS tests
   - Verify file picker works on Android

4. **Test on physical device with Expo Go:**
   - Scan QR code with Expo Go app
   - Test with real CSV files from device storage
   - Verify performance with large files (50MB+)
   - Test offline functionality (enable airplane mode)

### Automated tests
```bash
npm test
```

**All tests must pass:**
- CSV parser correctly detects types
- Query engine executes SQL and returns results
- Chart generator creates valid configs
- Database operations (create, insert, query) work correctly

### Manual verification checklist
- [ ] Import CSV file and see it in home screen
- [ ] Tap file and navigate to query screen
- [ ] Use visual query builder to create a query
- [ ] Switch to SQL editor and modify query
- [ ] Run query and see results in < 2 seconds
- [ ] Tap "Create Chart" and see chart render
- [ ] Change chart type (bar → line → pie)
- [ ] Export chart as PNG and verify image quality
- [ ] Save query and see it in "Saved Queries" tab
- [ ] Use a query template and verify placeholders are replaced
- [ ] Delete a file and verify table is removed
- [ ] Check storage usage updates correctly
- [ ] Test Pro upgrade flow (use test mode in expo-in-app-purchases)
- [ ] Verify free tier limits are enforced (file size, saved queries)

### Performance benchmarks
- Import 100MB CSV: < 30 seconds
- Query 1M rows with WHERE clause: < 2 seconds
- Generate chart from 10K rows: < 1 second
- App launch time: < 3 seconds