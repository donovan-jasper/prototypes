```markdown
# App Spec: **DataSift**

## 1. App Name
**DataSift** – A mobile-first, AI-powered workspace for turning unstructured data into actionable insights.

## 2. One-line pitch
"Turn notes, calls, and files into structured data—no coding required."

## 3. Expanded vision
**Primary audience:**
- **Small business owners** (analyze customer feedback, invoices, field notes)
- **Customer support teams** (transcribe calls, summarize tickets)
- **Researchers** (process interviews, literature reviews)
- **Freelancers** (organize client communications, project notes)

**Adjacent use cases:**
- **Field workers** (transcribe audio notes, extract data from receipts)
- **Journalists** (summarize interviews, organize research)
- **Paralegals** (parse contracts, extract key details)
- **Parents** (organize school notes, doctor visits)

**Why non-technical users need this:**
- No SQL or coding knowledge required
- Works offline (avoids data privacy concerns)
- Instant insights from text, audio, or images

## 4. Tech stack
- **Frontend:** React Native (Expo) + TypeScript
- **Local storage:** SQLite (encrypted)
- **LLM integration:** Cloud API (OpenAI/Anthropic) with caching
- **Audio processing:** React Native Audio (expo-av)
- **Image OCR:** Tesseract.js (local fallback)

## 5. Core features (MVP)
1. **AI-Powered Extraction**
   - Paste text, record audio, or scan documents → LLM extracts structured data (tables, entities).
   - Supports 5+ languages.

2. **SQL-Like Filtering**
   - Query data with simple syntax (e.g., `WHERE sentiment="negative"`).

3. **Cost Optimization**
   - Track LLM API usage (tokens, cost) with visual breakdowns.

## 6. Monetization strategy
- **Free tier:**
  - 100 files/month, basic LLM operations (summarization, extraction).
  - Watermarked exports, limited history.

- **Paid tiers:**
  - **Pro ($9.99/month):**
    - Unlimited files, advanced filters, team collaboration (2 users).
  - **Enterprise ($99/year):**
    - Custom LLM fine-tuning, API access, priority support.

**Hook:** Free tier lets users try before paying.
**Paywall:** Pro unlocks offline processing and team features.

## 7. Skip if saturated
**NO SKIP:** No direct competitor offers local-first LLM data extraction + SQL-like querying for non-technical users.

## 8. File structure
```
datasift/
├── app/
│   ├── components/ (UI)
│   ├── hooks/ (logic)
│   ├── screens/ (views)
│   └── utils/ (helpers)
├── assets/ (icons, fonts)
├── db/ (SQLite schema)
├── tests/
│   ├── unit/ (Jest tests)
│   └── e2e/ (Detox tests)
└── api/ (LLM, OCR endpoints)
```

## 9. Tests
```typescript
// tests/unit/extraction.test.ts
import { extractData } from '../../app/utils/extraction';

test('extracts entities from text', () => {
  const text = "Contact John at john@example.com by Friday.";
  const result = extractData(text);
  expect(result.entities).toContainEqual({ type: 'email', value: 'john@example.com' });
});
```

## 10. Implementation steps
1. **Setup:**
   ```bash
   expo init datasift --template expo-template-blank-typescript
   cd datasift
   npm install expo-sqlite expo-av react-native-paper
   ```

2. **Core flow:**
   - Build `TextInputScreen` (paste/record/scan).
   - Add `ExtractionService` (LLM API call + SQLite save).
   - Implement `QueryBuilder` (SQL-like syntax).

3. **Testing:**
   ```bash
   npm test
   npx detox test
   ```

## 11. Verification
- Run `expo start` → test on iOS/Android simulator.
- Run `npm test` → all unit tests pass.
- Test offline mode: disable network → confirm local queries work.
```