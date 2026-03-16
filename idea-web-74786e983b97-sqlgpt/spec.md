```markdown
# **SQLGPT Evolution: App Spec**

## 1. App Name
**QueryMentor** *(or "QMentor" for short)*

## 2. One-line pitch
*"Turn your data questions into SQL queries instantly—no coding required."*

## 3. Expanded vision
**Primary Audience:**
- **Business Analysts** (non-technical) who need quick SQL insights
- **Marketers** (campaign tracking, A/B testing)
- **Field Workers** (offline SQL queries for inventory, logistics)
- **Students** (learning SQL without setup)

**Adjacent Use Cases:**
- **Citizen Data Scientists** (self-serve analytics)
- **Small Business Owners** (local SQLite database management)
- **Educators** (SQL teaching tool for students)

**Why Non-Technical Users Want This:**
- **Speed:** Generate queries in seconds (e.g., "Show me sales last quarter").
- **Confidence:** AI suggests optimizations, catches errors.
- **Portability:** Works offline—no need for a laptop.

## 4. Tech Stack
- **Frontend:** React Native (Expo) + TypeScript
- **Local DB:** SQLite (via `expo-sqlite`)
- **AI:** Custom API (or fine-tuned GPT-4 via OpenAI)
- **Voice:** `expo-speech` + `expo-av` for voice-to-SQL

## 5. Core Features (MVP)
1. **Voice-to-SQL** – Speak your query, get SQL back.
2. **Query Builder** – Drag-and-drop tables/columns to auto-generate SQL.
3. **Real-Time Testing** – Run queries on local SQLite and see results.
4. **Error Detection** – AI highlights syntax/optimization issues.
5. **Template Library** – Pre-made queries for common tasks (e.g., "Monthly Revenue").

## 6. Monetization Strategy
- **Free Tier:**
  - Basic voice-to-SQL + query builder
  - Limited offline storage (5MB)
  - Ad-supported (non-intrusive banners)

- **Premium ($4.99/month):**
  - **Advanced Optimization** (AI suggests faster queries)
  - **Cloud Sync** (save queries to a private cloud DB)
  - **No Ads**
  - **Priority Support**

**Why Subscribers Stay:**
- **Value Lock-In:** Cloud sync prevents switching.
- **Usage Hook:** Premium users generate more queries → more data for AI.

## 7. Skip if saturated?
**NO SKIP:** No major player offers a mobile-first SQL assistant for non-technical users.

## 8. File Structure
```
querymentor/
├── app/
│   ├── components/ (VoiceInput, QueryBuilder, etc.)
│   ├── hooks/ (useSQLParser, useVoiceRecognition)
│   ├── screens/ (Home, QueryEditor, Settings)
│   └── utils/ (sqlValidator.ts, apiClient.ts)
├── assets/ (icons, sounds)
├── tests/
│   ├── unit/ (sqlParser.test.ts, voiceInput.test.ts)
│   └── e2e/ (queryFlow.test.ts)
└── package.json
```

## 9. Tests (Example)
```typescript
// tests/unit/sqlParser.test.ts
import { parseNaturalQuery } from '../../app/utils/sqlParser';

test('converts natural query to SQL', () => {
  const input = "Show me sales last quarter";
  const expected = "SELECT * FROM sales WHERE date BETWEEN '2023-10-01' AND '2023-12-31';";
  expect(parseNaturalQuery(input)).toBe(expected);
});
```

## 10. Implementation Steps
1. **Setup:**
   ```bash
   npx create-expo-app -t expo-template-blank-typescript
   npm install expo-sqlite expo-speech expo-av
   ```
2. **Core Flow:**
   - Build `VoiceInput` component (uses `expo-speech`).
   - Implement `SQLParser` (converts natural language to SQL).
   - Add `QueryRunner` (executes SQL on local SQLite).
3. **AI Integration:**
   - Mock API first, then connect to OpenAI.
   - Fine-tune model on SQL datasets (e.g., Stack Overflow queries).
4. **Monetization:**
   - Add `RevenueCat` for subscriptions.
   - Gate premium features behind a flag.

## 11. Verification
- **Run on device:** `npx expo start --ios` or `--android`.
- **Test suite:** `npm test` (Jest).
- **Manual test:** Record a voice query → verify SQL output → run query.
```