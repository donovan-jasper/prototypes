```markdown
# App Spec: OfflineDoc Pro

## 1. App Name
**OfflineDoc Pro** (or **DocPocket** if "Pro" feels too corporate)

## 2. One-line pitch
"Edit, merge, and convert PDFs, images, and files offline—no internet required."

## 3. Expanded Vision
**Primary Audience:**
- Remote workers (traveling, remote offices)
- Field technicians (construction, healthcare, utilities)
- Students (classroom use, no Wi-Fi zones)
- Government employees (secure offline processing)
- Travelers (airports, trains, ships)
- Digital nomads (no cloud dependency)

**Adjacent Use Cases:**
- **Tourists** (offline travel guides, receipt storage)
- **Parents** (organizing school documents offline)
- **Journalists** (secure field reporting)
- **Freelancers** (client presentations without Wi-Fi)
- **Emergency responders** (offline forms, reports)

**Why Non-Technical Users Want This:**
- **Privacy:** No cloud uploads = no data leaks.
- **Reliability:** Works in dead zones or during outages.
- **Simplicity:** No ads, no paywalls—just tools.

## 4. Tech Stack
- **React Native (Expo)** – Cross-platform (iOS/Android)
- **SQLite** – Local file storage
- **WASM** – Offline PDF processing
- **Expo Camera** – Document scanning
- **Expo FileSystem** – Local file handling

## 5. Core Features (MVP)
1. **Offline PDF Editing** (annotate, fill forms)
2. **Image-to-PDF Conversion** (scan + convert)
3. **File Merger** (combine PDFs/images)
4. **Basic OCR** (text extraction, free tier)
5. **Cloud Sync** (optional, paid feature)

## 6. Monetization Strategy
- **Free Tier:**
  - Basic PDF editing
  - Image-to-PDF
  - File merging
  - Limited OCR (3 pages/month)
- **Paid Tier ($4.99 one-time or $2.99/month):**
  - Unlimited OCR
  - Batch processing
  - Cloud sync (Dropbox/Google Drive)
  - Priority support

**Hook:** Free tier is powerful enough to retain users.
**Paywall:** OCR and cloud sync are the biggest value drivers.

## 7. Skip if saturated?
No clear gap—existing apps (Adobe Scan, Smallpdf) exist but lack offline-first design. This fills a niche.

## 8. File Structure
```
offlinedoc-pro/
├── app/
│   ├── components/ (UI)
│   ├── utils/ (WASM, SQLite)
│   ├── screens/ (PDF Editor, Scanner, etc.)
├── assets/ (icons, WASM binaries)
├── tests/
│   ├── utils.test.js (PDF processing)
│   ├── storage.test.js (SQLite)
├── package.json
```

## 9. Tests
```javascript
// tests/utils.test.js
import { mergePDFs } from '../app/utils/pdfProcessor';

test('merges two PDFs correctly', () => {
  const result = mergePDFs([pdf1, pdf2]);
  expect(result.pageCount).toBe(4); // Assuming 2 pages each
});
```

## 10. Implementation Steps
1. **Setup Expo project** (`expo init OfflineDocPro`)
2. **Add WASM for PDF processing** (use `pdf-lib` or `pdf.js`)
3. **Implement SQLite storage** (Expo SQLite)
4. **Build core screens** (Scanner, Editor, Merger)
5. **Add OCR (Tesseract.js via WASM)**
6. **Test offline functionality** (disable network in simulator)

## 11. Verification
- Run `npm test` (Jest)
- Test in Expo Go (iOS/Android) with network disabled
- Verify SQLite storage persists after app restart
```