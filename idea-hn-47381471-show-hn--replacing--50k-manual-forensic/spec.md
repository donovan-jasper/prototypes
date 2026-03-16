# TraceGuard

## One-line pitch
Your financial paper trail, camera-ready — turn receipts and statements into court-admissible proof in seconds.

## Expanded vision

**Core audience expansion:**

This isn't just for divorce lawyers and forensic accountants. This is for:

- **Freelancers and gig workers** who need to prove income/expenses for tax audits, loan applications, or unemployment claims
- **Renters** documenting security deposit deductions, rent payment history, and landlord disputes
- **Small claims plaintiffs** building evidence for unpaid invoices, contractor disputes, or refund claims
- **Parents** tracking child support payments, shared custody expenses, or college fund contributions
- **Caregivers** documenting elder care expenses for Medicaid applications or estate reimbursement
- **Immigrants** maintaining financial history for visa applications, citizenship proof, or remittance tracking
- **Students** proving financial independence for FAFSA, scholarship applications, or loan forgiveness
- **Insurance claimants** documenting losses for theft, fire, or fraud claims

**The real insight:** Everyone needs to prove money moved at some point in their life. Current solutions are either too expensive (lawyers/accountants) or too casual (screenshots that courts reject). This is the middle ground — consumer-grade forensic documentation.

**Why non-technical people want this:**
- Takes a photo, gets a timeline. No spreadsheets, no manual entry.
- "Show the judge" button that exports a PDF with timestamps, sources, and chain of custody
- Peace of mind that if something goes wrong (dispute, audit, claim), they have receipts

**Adjacent use cases:**
- Warranty tracking (prove purchase date for returns)
- Subscription auditing (catch duplicate charges, prove cancellation)
- Expense reimbursement (corporate travelers, medical claims)
- Estate planning (document asset transfers before death)

## Tech stack

- **React Native (Expo SDK 52+)** — Camera, document scanner, file system access
- **SQLite (expo-sqlite)** — Local-first storage, no cloud dependency for sensitive data
- **expo-document-picker** + **expo-image-picker** — Multi-source document ingestion
- **react-native-vision-camera** + **vision-camera-ocr** — On-device OCR (privacy-first)
- **@react-native-pdf/pdf-lib** — Generate court-ready PDF exports
- **date-fns** — Deterministic date parsing and timeline construction
- **crypto-js** — Hash documents for tamper-proof chain of custody
- **react-native-fs** — Secure local file storage
- **Jest + @testing-library/react-native** — Unit and integration tests

## Core features (MVP)

1. **Snap & Extract** — Camera capture of bank statements, receipts, invoices. OCR extracts date, amount, payee, account number. Manual correction UI for errors.

2. **Money Timeline** — Chronological view of all transactions with source documents attached. Filter by date range, amount, or keyword. Visual flow chart showing money movement between accounts.

3. **Deterministic Trace** — Input: starting balance, ending balance, date range. Output: every transaction that explains the delta, with source documents linked. Flags gaps or inconsistencies (missing receipts, unexplained deposits).

4. **Export Audit Trail** — Generate timestamped PDF with: cover page (date range, accounts), transaction ledger, scanned source documents, SHA-256 hashes for each document, chain of custody log. Formatted for legal submission.

5. **Secure Vault** — Biometric lock, local encryption, no cloud sync by default. Optional encrypted backup to user's iCloud/Google Drive.

## Monetization strategy

**Free tier (the hook):**
- Up to 50 documents per month
- Basic timeline view
- Manual transaction entry
- Single account tracking
- Watermarked PDF exports

**Premium ($19.99/month or $149/year):**
- Unlimited documents
- Multi-account tracking (personal + business)
- Deterministic trace engine (gap detection)
- Unwatermarked, court-ready PDFs
- Priority OCR accuracy (manual review queue)
- Export to Excel/CSV for accountants

**One-time "Event Pack" ($99):**
- For major financial events (divorce filing, audit notice, lawsuit)
- Includes: 1-hour onboarding call with financial documentation specialist
- Custom report generation (tailored to specific legal requirements)
- 90-day premium access
- Upsell from free users facing immediate crisis

**Retention drivers:**
- Sunk cost: users have months/years of documents stored
- Habit: weekly "scan your receipts" push notifications
- Fear: "Your audit trail is incomplete" warnings for gaps
- Network effect: accountants/lawyers recommend to clients (B2B2C)

**Why this pricing works:**
- $19.99 is impulse-buy territory for peace of mind
- Cheaper than one hour of lawyer time ($200-500)
- Annual plan = 25% discount = predictable revenue
- Event Pack targets high-intent, high-willingness-to-pay moments

## File structure

```
traceguard/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Timeline view
│   │   ├── capture.tsx            # Camera/document picker
│   │   ├── trace.tsx              # Deterministic trace engine
│   │   └── vault.tsx              # Secure document storage
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── DocumentCard.tsx           # Single document preview
│   ├── TransactionRow.tsx         # Timeline entry
│   ├── TraceResult.tsx            # Gap detection UI
│   ├── ExportButton.tsx           # PDF generation trigger
│   └── BiometricLock.tsx          # Auth wrapper
├── lib/
│   ├── database.ts                # SQLite setup and queries
│   ├── ocr.ts                     # Vision Camera OCR wrapper
│   ├── parser.ts                  # Extract amount/date/payee from text
│   ├── trace.ts                   # Deterministic trace algorithm
│   ├── export.ts                  # PDF generation logic
│   ├── crypto.ts                  # Document hashing
│   └── types.ts                   # TypeScript interfaces
├── __tests__/
│   ├── parser.test.ts
│   ├── trace.test.ts
│   ├── export.test.ts
│   └── database.test.ts
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

**`__tests__/parser.test.ts`**
```typescript
import { extractTransaction } from '../lib/parser';

describe('Transaction Parser', () => {
  it('extracts date, amount, and payee from receipt text', () => {
    const ocrText = 'WALMART\n01/15/2026\nTotal: $47.32';
    const result = extractTransaction(ocrText);
    expect(result.payee).toBe('WALMART');
    expect(result.amount).toBe(47.32);
    expect(result.date).toEqual(new Date('2026-01-15'));
  });

  it('handles multiple date formats', () => {
    const text1 = 'Date: 03/16/2026 Amount: $100.00';
    const text2 = 'March 16, 2026 - $100.00';
    expect(extractTransaction(text1).date).toEqual(extractTransaction(text2).date);
  });

  it('returns null for unparseable text', () => {
    expect(extractTransaction('random noise')).toBeNull();
  });
});
```

**`__tests__/trace.test.ts`**
```typescript
import { traceMoney } from '../lib/trace';

describe('Deterministic Trace Engine', () => {
  it('identifies all transactions between two balances', () => {
    const transactions = [
      { date: new Date('2026-01-01'), amount: 1000, type: 'deposit' },
      { date: new Date('2026-01-05'), amount: -200, type: 'withdrawal' },
      { date: new Date('2026-01-10'), amount: -300, type: 'withdrawal' },
    ];
    const result = traceMoney(0, 500, transactions);
    expect(result.explained).toBe(true);
    expect(result.endingBalance).toBe(500);
  });

  it('flags unexplained balance changes', () => {
    const transactions = [
      { date: new Date('2026-01-01'), amount: 1000, type: 'deposit' },
    ];
    const result = traceMoney(0, 1500, transactions);
    expect(result.explained).toBe(false);
    expect(result.gap).toBe(500);
  });
});
```

**`__tests__/export.test.ts`**
```typescript
import { generateAuditPDF } from '../lib/export';

describe('PDF Export', () => {
  it('generates PDF with transaction ledger', async () => {
    const transactions = [
      { id: '1', date: new Date('2026-01-01'), amount: 100, payee: 'Test' },
    ];
    const pdf = await generateAuditPDF(transactions, new Date('2026-01-01'), new Date('2026-01-31'));
    expect(pdf).toBeDefined();
    expect(pdf.byteLength).toBeGreaterThan(0);
  });
});
```

**`__tests__/database.test.ts`**
```typescript
import { initDatabase, addTransaction, getTransactions } from '../lib/database';

describe('SQLite Database', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  it('stores and retrieves transactions', async () => {
    await addTransaction({
      date: new Date('2026-01-01'),
      amount: 100,
      payee: 'Test Store',
      documentHash: 'abc123',
    });
    const transactions = await getTransactions();
    expect(transactions.length).toBe(1);
    expect(transactions[0].payee).toBe('Test Store');
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app traceguard --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-image-picker expo-document-picker expo-file-system expo-local-authentication
   npm install react-native-vision-camera vision-camera-ocr @react-native-pdf/pdf-lib date-fns crypto-js
   npm install -D jest @testing-library/react-native @types/jest
   ```
3. Configure `app.json`:
   - Add camera permissions (iOS: `NSCameraUsageDescription`, Android: `CAMERA`)
   - Add photo library permissions
   - Add biometric permissions (`NSFaceIDUsageDescription`)
4. Set up TypeScript strict mode in `tsconfig.json`

### Phase 2: Database layer
1. Create `lib/types.ts`:
   - Define `Transaction` interface (id, date, amount, payee, type, documentId, documentHash)
   - Define `Document` interface (id, uri, hash, uploadDate, ocrText)
2. Create `lib/database.ts`:
   - `initDatabase()`: Create `transactions` and `documents` tables
   - `addTransaction(tx: Transaction)`: Insert with timestamp
   - `getTransactions(startDate?, endDate?)`: Query with filters
   - `addDocument(doc: Document)`: Store document metadata
   - `getDocument(id: string)`: Retrieve by ID
3. Write `__tests__/database.test.ts` (see Tests section)

### Phase 3: OCR and parsing
1. Create `lib/ocr.ts`:
   - `scanDocument(uri: string)`: Use vision-camera-ocr to extract text
   - Return raw OCR text string
2. Create `lib/parser.ts`:
   - `extractTransaction(ocrText: string)`: Parse date, amount, payee using regex
   - Handle formats: MM/DD/YYYY, DD/MM/YYYY, "Month DD, YYYY"
   - Extract dollar amounts: $X.XX, X.XX, (X.XX) for negatives
   - Return `{ date, amount, payee }` or null if unparseable
3. Write `__tests__/parser.test.ts` (see Tests section)

### Phase 4: Capture flow
1. Create `app/(tabs)/capture.tsx`:
   - Two buttons: "Take Photo" (camera) and "Upload Document" (file picker)
   - On capture: save to file system, generate SHA-256 hash
   - Call `scanDocument()` to extract text
   - Show OCR result in editable form (date, amount, payee fields)
   - "Save" button: call `addDocument()` and `addTransaction()`
2. Create `components/DocumentCard.tsx`:
   - Display thumbnail, date, amount, payee
   - Tap to view full image
   - Long-press to delete

### Phase 5: Timeline view
1. Create `app/(tabs)/index.tsx`:
   - Fetch all transactions with `getTransactions()`
   - Sort by date descending
   - Render list with `TransactionRow` components
   - Pull-to-refresh to reload
   - Filter bar: date range picker, search by payee
2. Create `components/TransactionRow.tsx`:
   - Show date, payee, amount (green for deposits, red for withdrawals)
   - Thumbnail of source document
   - Tap to view document details

### Phase 6: Deterministic trace engine
1. Create `lib/trace.ts`:
   - `traceMoney(startBalance: number, endBalance: number, transactions: Transaction[])`:
     - Sort transactions by date
     - Calculate running balance
     - Compare final balance to `endBalance`
     - Return `{ explained: boolean, gap: number, timeline: Transaction[] }`
2. Create `app/(tabs)/trace.tsx`:
   - Input form: starting balance, ending balance, date range
   - "Trace" button: call `traceMoney()`
   - Display result with `TraceResult` component
3. Create `components/TraceResult.tsx`:
   - Show timeline with running balance
   - Highlight gaps in red
   - "Export" button if explained
4. Write `__tests__/trace.test.ts` (see Tests section)

### Phase 7: PDF export
1. Create `lib/crypto.ts`:
   - `hashDocument(uri: string)`: Read file, compute SHA-256, return hex string
2. Create `lib/export.ts`:
   - `generateAuditPDF(transactions: Transaction[], startDate: Date, endDate: Date)`:
     - Use pdf-lib to create PDF
     - Add cover page with date range, account summary
     - Add transaction ledger table
     - Embed source document images
     - Add footer with document hashes
     - Return PDF as base64 or file URI
3. Create `components/ExportButton.tsx`:
   - "Export Audit Trail" button
   - Show loading spinner during generation
   - Share sheet to save/email PDF
4. Write `__tests__/export.test.ts` (see Tests section)

### Phase 8: Security and vault
1. Create `components/BiometricLock.tsx`:
   - Use `expo-local-authentication` to require Face ID/Touch ID on app launch
   - Fallback to PIN if biometric unavailable
2. Create `app/(tabs)/vault.tsx`:
   - List all documents with `DocumentCard` components
   - Search/filter by date or payee
   - Tap to view full-screen image
   - Delete with confirmation dialog
3. Add encryption to `lib/database.ts`:
   - Use `crypto-js` to encrypt document URIs before storing
   - Decrypt on retrieval

### Phase 9: Monetization gates
1. Add `lib/subscription.ts`:
   - `isFreeTier()`: Check document count < 50
   - `canExportPDF()`: Check premium status
   - `showPaywall()`: Navigate to subscription screen
2. Create `app/paywall.tsx`:
   - Display pricing tiers
   - "Upgrade to Premium" button (link to App Store subscription)
   - "Restore Purchases" button
3. Add checks in capture flow:
   - Before saving document, call `isFreeTier()` and show paywall if limit reached
4. Add watermark to free PDF exports:
   - In `generateAuditPDF()`, add "Generated with TraceGuard Free" footer

### Phase 10: Polish and testing
1. Add loading states to all async operations
2. Add error handling with user-friendly messages
3. Add empty states ("No documents yet — tap + to get started")
4. Add onboarding flow (3 screens explaining core features)
5. Run `npm test` to verify all tests pass
6. Test on iOS simulator and Android emulator
7. Test camera capture on physical device
8. Test PDF generation and sharing

## How to verify it works

### Local development
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Grant camera and photo library permissions when prompted

### Feature verification
1. **Capture**: Tap "Capture" tab → "Take Photo" → capture receipt → verify OCR extracts date/amount
2. **Timeline**: Tap "Timeline" tab → verify transaction appears with correct details
3. **Trace**: Tap "Trace" tab → enter starting balance 0, ending balance = sum of transactions → verify "Explained" result
4. **Export**: Tap "Export Audit Trail" → verify PDF generates and opens in share sheet
5. **Vault**: Tap "Vault" tab → verify all documents listed → tap one → verify full-screen view

### Test suite
```bash
npm test
```
All tests in `__tests__/` must pass:
- `parser.test.ts`: 3 tests
- `trace.test.ts`: 2 tests
- `export.test.ts`: 1 test
- `database.test.ts`: 1 test

### Production readiness checklist
- [ ] Biometric lock works on device
- [ ] Camera captures and saves images
- [ ] OCR extracts text from real receipts (test with 10+ different formats)
- [ ] Timeline updates in real-time after capture
- [ ] Trace engine correctly identifies gaps
- [ ] PDF exports are readable and formatted correctly
- [ ] Free tier limits enforced (50 documents)
- [ ] Paywall appears when limit reached
- [ ] App works offline (no network required)
- [ ] All tests pass with `npm test`