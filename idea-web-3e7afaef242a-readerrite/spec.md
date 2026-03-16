# BookNest

## One-line pitch
Your entire library, your way — no subscriptions, no cloud lock-in, just pure reading freedom.

## Expanded vision

**Core audience:** Anyone who's tired of being nickel-and-dimed by reading apps. This isn't just for tech nerds with 10,000 EPUBs — it's for:

- **Students** drowning in textbook PDFs who need highlights, notes, and quick search across dozens of files
- **Parents** managing kids' ebook collections without handing over credit cards to Amazon
- **Privacy-conscious readers** who don't want their reading habits tracked and monetized
- **International users** in regions where Kindle/Apple Books have limited catalogs or require VPNs
- **Library power users** who borrow DRM-free ebooks and want a better experience than clunky library apps
- **Professionals** reading industry reports, whitepapers, and technical docs who need annotation tools that actually work offline

**Adjacent use cases:**
- Comic/manga readers (CBZ/CBR support)
- Academic researchers managing paper collections
- Language learners reading bilingual texts with built-in dictionary
- Audiobook listeners (future: sync text + audio)

**Why non-technical people want this:** It's the anti-Kindle. Buy once, own forever. No "your book was removed from the store" nightmares. No internet required. No ads. No upsells. Just books.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Storage:** SQLite (expo-sqlite) for metadata, local filesystem for book files
- **Rendering:** react-native-webview for EPUB rendering with custom CSS injection
- **File handling:** expo-document-picker, expo-file-system
- **Sync (optional):** expo-file-system + user's own cloud (Dropbox/iCloud) via standard file picker
- **Payments:** expo-in-app-purchases (one-time unlock)
- **Minimal deps:** react-navigation, zustand (state), react-native-reanimated (gestures)

## Core features (MVP)

1. **Universal import** — Drag/drop or pick EPUB, PDF, MOBI, TXT files. Auto-extract metadata (title, author, cover). Works 100% offline.

2. **Smart library** — Grid/list views, sort by author/title/recent, search across titles and full-text content. Collections/tags for organization.

3. **Distraction-free reader** — Customizable fonts, sizes, themes (sepia/dark/light), adjustable margins. Tap zones for page turns. Progress tracking.

4. **Annotations that stick** — Highlight, bookmark, notes. Exportable as markdown. Survives file moves/renames.

5. **One-time unlock** — Free tier: 10 books max. $29.99 unlocks unlimited library + advanced features (custom fonts, export notes, collections).

## Monetization strategy

**Free tier (the hook):**
- Import up to 10 books
- Basic reader with 3 themes
- Highlights and bookmarks (no export)
- No ads, no tracking, no bullshit

**Paid unlock ($29.99 one-time):**
- Unlimited books
- Custom fonts and advanced typography controls
- Export highlights/notes as markdown or plain text
- Unlimited collections and tags
- Priority support

**Why this price:** Lower than a year of Kindle Unlimited ($120), higher than impulse-buy territory. Signals quality and permanence. Comparable to premium PDF readers (PDF Expert, GoodReader).

**Retention strategy:** This isn't subscription-based, but users stay because:
- Their library lives here (switching cost = re-importing everything)
- Regular updates add features (reading stats, better PDF support, audiobook sync)
- No competitor offers this exact combo of ownership + simplicity

## File structure

```
booknest/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx             # Library screen
│   │   ├── reader.tsx            # Reader screen
│   │   └── settings.tsx          # Settings screen
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx
├── components/
│   ├── BookCard.tsx              # Grid/list item for library
│   ├── BookImporter.tsx          # File picker + import logic
│   ├── EpubRenderer.tsx          # WebView-based EPUB display
│   ├── PdfRenderer.tsx           # PDF display component
│   ├── ReaderControls.tsx        # Font/theme/progress controls
│   ├── AnnotationPanel.tsx       # Highlights/notes UI
│   └── PaywallModal.tsx          # Upgrade prompt
├── lib/
│   ├── database.ts               # SQLite setup and queries
│   ├── bookParser.ts             # Extract metadata from files
│   ├── epubParser.ts             # EPUB-specific parsing
│   ├── fileManager.ts            # Save/load book files
│   ├── annotationManager.ts      # Highlight/bookmark logic
│   ├── searchEngine.ts           # Full-text search
│   └── purchaseManager.ts        # In-app purchase handling
├── store/
│   └── useLibraryStore.ts        # Zustand store for app state
├── constants/
│   └── Config.ts                 # Free tier limits, pricing
├── __tests__/
│   ├── bookParser.test.ts
│   ├── database.test.ts
│   ├── annotationManager.test.ts
│   ├── searchEngine.test.ts
│   └── fileManager.test.ts
├── assets/
│   ├── fonts/
│   └── images/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/bookParser.test.ts
import { extractMetadata, parseEpub } from '../lib/bookParser';

describe('Book Parser', () => {
  it('extracts title and author from EPUB metadata', async () => {
    const mockEpubData = '<dc:title>Test Book</dc:title><dc:creator>Jane Doe</dc:creator>';
    const result = await extractMetadata(mockEpubData, 'epub');
    expect(result.title).toBe('Test Book');
    expect(result.author).toBe('Jane Doe');
  });

  it('handles missing metadata gracefully', async () => {
    const result = await extractMetadata('', 'epub');
    expect(result.title).toBe('Unknown Title');
    expect(result.author).toBe('Unknown Author');
  });
});

// __tests__/database.test.ts
import { initDatabase, addBook, getBooks, deleteBook } from '../lib/database';

describe('Database Operations', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  it('adds and retrieves a book', async () => {
    const book = { title: 'Test', author: 'Author', filePath: '/path', format: 'epub' };
    const id = await addBook(book);
    const books = await getBooks();
    expect(books).toHaveLength(1);
    expect(books[0].id).toBe(id);
  });

  it('deletes a book', async () => {
    const id = await addBook({ title: 'Test', author: 'A', filePath: '/p', format: 'epub' });
    await deleteBook(id);
    const books = await getBooks();
    expect(books).toHaveLength(0);
  });
});

// __tests__/annotationManager.test.ts
import { addHighlight, getHighlights, exportAnnotations } from '../lib/annotationManager';

describe('Annotation Manager', () => {
  it('adds and retrieves highlights for a book', async () => {
    await addHighlight(1, 'Chapter 1', 'Important text', '#ffff00');
    const highlights = await getHighlights(1);
    expect(highlights).toHaveLength(1);
    expect(highlights[0].text).toBe('Important text');
  });

  it('exports annotations as markdown', async () => {
    await addHighlight(1, 'Ch1', 'Text 1', '#ffff00');
    await addHighlight(1, 'Ch2', 'Text 2', '#00ff00');
    const markdown = await exportAnnotations(1);
    expect(markdown).toContain('# Annotations');
    expect(markdown).toContain('Text 1');
    expect(markdown).toContain('Text 2');
  });
});

// __tests__/searchEngine.test.ts
import { indexBook, searchBooks } from '../lib/searchEngine';

describe('Search Engine', () => {
  it('indexes and searches book content', async () => {
    await indexBook(1, 'The quick brown fox jumps over the lazy dog');
    const results = await searchBooks('fox');
    expect(results).toHaveLength(1);
    expect(results[0].bookId).toBe(1);
  });

  it('returns empty array for no matches', async () => {
    await indexBook(1, 'Some content');
    const results = await searchBooks('nonexistent');
    expect(results).toHaveLength(0);
  });
});

// __tests__/fileManager.test.ts
import { saveBookFile, loadBookFile, deleteBookFile } from '../lib/fileManager';

describe('File Manager', () => {
  it('saves and loads a book file', async () => {
    const content = 'Book content here';
    const path = await saveBookFile('test.epub', content);
    const loaded = await loadBookFile(path);
    expect(loaded).toBe(content);
  });

  it('deletes a book file', async () => {
    const path = await saveBookFile('test.epub', 'content');
    await deleteBookFile(path);
    await expect(loadBookFile(path)).rejects.toThrow();
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest booknest --template tabs
cd booknest
npm install expo-sqlite expo-document-picker expo-file-system zustand react-native-webview expo-in-app-purchases
npm install -D jest @testing-library/react-native @types/jest
```

### 2. Configure Jest
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

### 3. Database layer (`lib/database.ts`)
- Initialize SQLite with tables: `books` (id, title, author, filePath, format, coverPath, dateAdded, lastOpened, currentPage), `annotations` (id, bookId, type, location, text, color, note, createdAt), `collections` (id, name), `book_collections` (bookId, collectionId)
- Implement CRUD functions: `addBook`, `getBooks`, `updateBook`, `deleteBook`, `addAnnotation`, `getAnnotations`, `searchFullText`
- Use prepared statements to prevent SQL injection
- Add indexes on `books.title`, `books.author`, `annotations.bookId`

### 4. File management (`lib/fileManager.ts`)
- Use `expo-file-system` to create app-specific directory: `FileSystem.documentDirectory + 'books/'`
- `saveBookFile(filename, content)`: Write file to books directory, return path
- `loadBookFile(path)`: Read file as base64 or text depending on format
- `deleteBookFile(path)`: Remove file from filesystem
- Handle errors gracefully (disk full, permissions)

### 5. Book parser (`lib/bookParser.ts`)
- `extractMetadata(fileContent, format)`: Parse EPUB (XML), PDF (metadata), TXT (filename-based)
- For EPUB: Use regex or simple XML parsing to extract `<dc:title>`, `<dc:creator>`, cover image
- For PDF: Use basic metadata extraction (title from filename if metadata unavailable)
- Return standardized object: `{ title, author, coverPath, format }`
- Handle malformed files with fallback values

### 6. EPUB parser (`lib/epubParser.ts`)
- Unzip EPUB (it's a ZIP file) using `expo-file-system` and JSZip (add dependency)
- Parse `content.opf` for metadata and spine (reading order)
- Extract HTML chapters and CSS
- Return structured data: `{ metadata, chapters: [{ id, href, content }], css }`

### 7. Annotation manager (`lib/annotationManager.ts`)
- `addHighlight(bookId, location, text, color)`: Insert into annotations table
- `getHighlights(bookId)`: Query annotations by bookId, order by location
- `exportAnnotations(bookId, format)`: Generate markdown or plain text export
- `deleteAnnotation(id)`: Remove annotation
- Location format: `chapter-X-offset-Y` for EPUB, `page-X` for PDF

### 8. Search engine (`lib/searchEngine.ts`)
- `indexBook(bookId, fullText)`: Store searchable text in separate FTS table (SQLite FTS5)
- `searchBooks(query)`: Full-text search across all books, return matches with context
- Highlight search terms in results
- Limit results to 50 for performance

### 9. Purchase manager (`lib/purchaseManager.ts`)
- Initialize `expo-in-app-purchases` with product IDs
- `checkPurchaseStatus()`: Query if user has unlocked premium
- `purchaseUnlock()`: Trigger IAP flow, validate receipt
- Store unlock status in AsyncStorage (with server validation in production)
- `isPremium()`: Check unlock status before gated features

### 10. Zustand store (`store/useLibraryStore.ts`)
- State: `books: Book[]`, `currentBook: Book | null`, `isPremium: boolean`, `searchQuery: string`
- Actions: `loadLibrary()`, `addBook()`, `deleteBook()`, `setCurrentBook()`, `setPremium()`
- Persist `isPremium` to AsyncStorage
- Load books from database on app start

### 11. Book importer component (`components/BookImporter.tsx`)
- Button triggers `expo-document-picker` for EPUB/PDF/MOBI/TXT
- On file select: parse metadata, save file, add to database, update store
- Show progress indicator during import
- Check free tier limit (10 books) before allowing import
- Display error toast if import fails

### 12. Library screen (`app/(tabs)/index.tsx`)
- Grid view of books (cover thumbnails, title, author)
- Search bar at top (filters by title/author)
- Sort dropdown (recent, title, author)
- Floating action button for import
- Tap book to open reader
- Long-press for context menu (delete, add to collection)
- Show paywall modal if free tier limit reached

### 13. EPUB renderer (`components/EpubRenderer.tsx`)
- Use `react-native-webview` to display HTML chapters
- Inject custom CSS for font size, theme, margins
- Handle tap zones: left 1/3 = previous page, right 1/3 = next page, center = show controls
- Track scroll position, save to database on page change
- Support swipe gestures for page turns

### 14. PDF renderer (`components/PdfRenderer.tsx`)
- Use `react-native-pdf` (add dependency) or WebView with PDF.js
- Pinch-to-zoom, scroll navigation
- Page number indicator
- Save current page to database

### 15. Reader controls (`components/ReaderControls.tsx`)
- Bottom sheet with font size slider, theme picker (light/sepia/dark), margin controls
- Progress bar showing reading position
- Bookmark button (saves current location)
- Annotation button (opens highlight/note panel)
- Settings button (back to library, table of contents)

### 16. Annotation panel (`components/AnnotationPanel.tsx`)
- List of highlights and bookmarks for current book
- Tap to jump to location
- Swipe to delete
- Export button (premium feature)
- Color picker for highlights

### 17. Paywall modal (`components/PaywallModal.tsx`)
- Show when user hits free tier limit or tries premium feature
- List premium benefits
- "Unlock for $29.99" button triggers IAP
- "Restore Purchase" button for existing customers
- Dismissible with X button

### 18. Settings screen (`app/(tabs)/settings.tsx`)
- Display premium status
- "Restore Purchase" button
- Import/export library (premium)
- Theme preference (app-wide)
- About/support links
- Clear cache button

### 19. Reader screen (`app/(tabs)/reader.tsx`)
- Render EPUB or PDF based on book format
- Show reader controls on tap
- Auto-hide controls after 3 seconds
- Save reading progress every 30 seconds
- Handle back button (return to library, save progress)

### 20. Styling and themes
- Define color schemes in `constants/Colors.ts`: light, dark, sepia
- Use `useColorScheme()` for system theme detection
- Apply theme to reader background, text color, UI elements
- Smooth transitions between themes

### 21. Testing
- Write tests for all `lib/` modules (see Tests section)
- Run `npm test` to verify all tests pass
- Test edge cases: empty library, malformed files, network errors (IAP)

### 22. Polish
- Add loading states (skeleton screens)
- Error boundaries for crash recovery
- Haptic feedback on interactions
- Smooth animations (page turns, modal transitions)
- Accessibility: VoiceOver labels, dynamic type support

## How to verify it works

### On device/simulator:
1. Run `npx expo start` and scan QR code with Expo Go
2. Import a sample EPUB file (download from Project Gutenberg)
3. Verify book appears in library with correct metadata
4. Tap book to open reader
5. Test page turns (tap zones, swipe)
6. Add a highlight, verify it saves
7. Close and reopen app, verify reading position persists
8. Try importing 11th book (should show paywall)
9. Test search (type author name, verify results)
10. Switch themes (light/dark/sepia), verify reader updates

### Automated tests:
```bash
npm test
```
All tests in `__tests__/` must pass. Coverage should be >80% for `lib/` modules.

### Production readiness:
- Test IAP in sandbox mode (requires Apple/Google developer accounts)
- Verify receipt validation (server-side in production)
- Test on low-end devices (performance with large libraries)
- Validate EPUB rendering across different file structures
- Ensure offline functionality (airplane mode test)