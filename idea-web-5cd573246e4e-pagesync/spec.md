# PageBridge

## One-line pitch
Never lose your place again — seamlessly sync your reading progress between physical books and digital devices.

## Expanded vision

### Who is this REALLY for?
This isn't just for book lovers. It's for anyone who lives in a hybrid physical-digital world:

- **Students** who buy textbooks in both formats (physical for class, digital for late-night studying)
- **Professionals** who reference technical manuals, industry standards, and training materials across formats
- **Home cooks** who own physical cookbooks but want digital access while cooking
- **DIY enthusiasts** who follow repair manuals, craft books, and how-to guides
- **Parents** reading children's books (physical at bedtime, digital on the go)
- **Researchers and academics** who annotate physical copies but need digital searchability
- **Language learners** who practice with physical books but track progress digitally

### What adjacent use cases does this enable?
- **Progress tracking across any media**: magazines, comic books, sheet music, instruction manuals
- **Family sharing**: Multiple people reading the same physical book can each track their own progress
- **Reading analytics**: Understand your reading habits, speed, and patterns
- **Smart bookmarks**: Never lose your place, even if you forget to mark it
- **Cross-device continuity**: Start on your phone, continue on tablet, reference the physical copy

### Why would a non-technical person want this?
Because it solves a universal frustration: "Where was I?" It's the digital equivalent of a bookmark that works everywhere. No QR codes to scan, no manual entry — just point your camera at the page and the app knows where you are.

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Local storage**: SQLite (expo-sqlite)
- **Camera/OCR**: expo-camera + expo-image-picker + Tesseract.js (or Google ML Kit via expo-ml-kit)
- **Cloud sync**: Firebase (Firestore for data, Auth for users)
- **Navigation**: expo-router (file-based routing)
- **State management**: Zustand (lightweight, minimal boilerplate)
- **Testing**: Jest + React Native Testing Library

## Core features (MVP)

1. **Smart page detection**: Point camera at any page, OCR extracts page number and book identifier (title/ISBN from header/footer)
2. **Manual sync**: Tap to enter page number if OCR fails or for books without clear page markers
3. **Progress dashboard**: See all your books, current page, percentage complete, and last synced time
4. **Cross-device sync**: Cloud backup ensures progress syncs across all your devices instantly
5. **Offline-first**: Works without internet, syncs when connection returns

## Monetization strategy

### Free tier (hook)
- Track up to 3 books simultaneously
- Manual page entry (unlimited)
- Basic progress tracking
- 7-day sync history

### Premium ($3.99/month or $29.99/year)
**Why this price?** Lower than typical reading apps ($4.99-9.99/mo), positioned as a utility not a content platform. Annual discount encourages commitment.

**Premium features:**
- Unlimited books
- Smart OCR page detection (10 scans/day free, unlimited for premium)
- 90-day sync history with rollback
- Reading analytics and insights
- Family sharing (up to 5 members)
- Export data (CSV/JSON)

**What makes people STAY subscribed?**
- The more books you track, the more valuable it becomes (data lock-in)
- OCR becomes habit-forming — manual entry feels tedious after experiencing it
- Reading analytics provide ongoing value (streaks, goals, year-in-review)
- Family sharing creates network effects

## File structure

```
pagebridge/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Dashboard
│   │   ├── scan.tsx           # Camera/OCR
│   │   └── settings.tsx       # Settings & premium
│   ├── book/
│   │   └── [id].tsx           # Book detail view
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── BookCard.tsx
│   ├── ProgressBar.tsx
│   ├── ScanButton.tsx
│   └── PremiumGate.tsx
├── lib/
│   ├── db.ts                  # SQLite setup
│   ├── ocr.ts                 # OCR logic
│   ├── sync.ts                # Firebase sync
│   └── store.ts               # Zustand store
├── hooks/
│   ├── useBooks.ts
│   ├── useCamera.ts
│   └── usePremium.ts
├── constants/
│   └── Config.ts
├── __tests__/
│   ├── ocr.test.ts
│   ├── db.test.ts
│   ├── sync.test.ts
│   └── store.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/ocr.test.ts`
```typescript
import { extractPageNumber, extractBookInfo } from '../lib/ocr';

describe('OCR utilities', () => {
  test('extracts page number from text', () => {
    const text = 'Chapter 5\nPage 142\nSome content here';
    expect(extractPageNumber(text)).toBe(142);
  });

  test('handles missing page number', () => {
    const text = 'No page number here';
    expect(extractPageNumber(text)).toBeNull();
  });

  test('extracts book title from header', () => {
    const text = 'The Great Gatsby\nPage 42\nContent';
    expect(extractBookInfo(text)).toMatchObject({
      title: 'The Great Gatsby'
    });
  });
});
```

### `__tests__/db.test.ts`
```typescript
import { addBook, updateProgress, getBooks } from '../lib/db';

describe('Database operations', () => {
  test('adds a new book', async () => {
    const book = await addBook({
      title: 'Test Book',
      author: 'Test Author',
      totalPages: 300
    });
    expect(book.id).toBeDefined();
    expect(book.currentPage).toBe(0);
  });

  test('updates reading progress', async () => {
    const book = await addBook({ title: 'Test', totalPages: 100 });
    await updateProgress(book.id, 50);
    const updated = await getBooks();
    expect(updated[0].currentPage).toBe(50);
  });
});
```

### `__tests__/sync.test.ts`
```typescript
import { syncToCloud, syncFromCloud } from '../lib/sync';

describe('Cloud sync', () => {
  test('syncs local changes to cloud', async () => {
    const localData = { bookId: '1', currentPage: 100 };
    const result = await syncToCloud(localData);
    expect(result.success).toBe(true);
  });

  test('handles offline gracefully', async () => {
    // Mock offline state
    const result = await syncToCloud({}, { offline: true });
    expect(result.queued).toBe(true);
  });
});
```

### `__tests__/store.test.ts`
```typescript
import { useBookStore } from '../lib/store';

describe('Zustand store', () => {
  test('adds book to store', () => {
    const { addBook, books } = useBookStore.getState();
    addBook({ id: '1', title: 'Test', currentPage: 0 });
    expect(books).toHaveLength(1);
  });

  test('updates book progress', () => {
    const { updateBookProgress, books } = useBookStore.getState();
    updateBookProgress('1', 50);
    expect(books[0].currentPage).toBe(50);
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest pagebridge --template tabs
cd pagebridge
npm install expo-sqlite expo-camera expo-image-picker zustand firebase tesseract.js
npm install -D jest @testing-library/react-native @types/jest
```

### 2. Configure Firebase
- Create Firebase project at console.firebase.google.com
- Enable Firestore and Authentication (Email/Anonymous)
- Add Firebase config to `constants/Config.ts`:
```typescript
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

export const PREMIUM_PRICE = {
  monthly: 3.99,
  yearly: 29.99
};

export const FREE_TIER_LIMITS = {
  maxBooks: 3,
  maxScansPerDay: 10
};
```

### 3. Database setup (`lib/db.ts`)
```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('pagebridge.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      isbn TEXT,
      totalPages INTEGER,
      currentPage INTEGER DEFAULT 0,
      lastSynced INTEGER,
      createdAt INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId TEXT,
      action TEXT,
      data TEXT,
      createdAt INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);
};

export const addBook = async (book: {
  title: string;
  author?: string;
  isbn?: string;
  totalPages?: number;
}) => {
  const id = `book_${Date.now()}`;
  await db.runAsync(
    'INSERT INTO books (id, title, author, isbn, totalPages) VALUES (?, ?, ?, ?, ?)',
    [id, book.title, book.author || '', book.isbn || '', book.totalPages || 0]
  );
  return { id, ...book, currentPage: 0 };
};

export const updateProgress = async (bookId: string, page: number) => {
  await db.runAsync(
    'UPDATE books SET currentPage = ?, lastSynced = ? WHERE id = ?',
    [page, Date.now(), bookId]
  );
};

export const getBooks = async () => {
  return await db.getAllAsync('SELECT * FROM books ORDER BY lastSynced DESC');
};

export const getBook = async (id: string) => {
  return await db.getFirstAsync('SELECT * FROM books WHERE id = ?', [id]);
};
```

### 4. OCR logic (`lib/ocr.ts`)
```typescript
import { createWorker } from 'tesseract.js';

let worker: Tesseract.Worker | null = null;

export const initOCR = async () => {
  if (!worker) {
    worker = await createWorker('eng');
  }
};

export const extractPageNumber = (text: string): number | null => {
  // Match patterns like "Page 142", "p. 142", "142", etc.
  const patterns = [
    /page\s+(\d+)/i,
    /p\.\s*(\d+)/i,
    /^(\d+)$/m,
    /\[(\d+)\]/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1], 10);
  }
  
  return null;
};

export const extractBookInfo = (text: string) => {
  // Extract title from first line (common in headers)
  const lines = text.split('\n').filter(l => l.trim());
  const title = lines[0]?.trim() || null;
  
  // Look for ISBN pattern
  const isbnMatch = text.match(/ISBN[:\s-]*(\d{10}|\d{13})/i);
  const isbn = isbnMatch ? isbnMatch[1] : null;
  
  return { title, isbn };
};

export const scanPage = async (imageUri: string) => {
  await initOCR();
  if (!worker) throw new Error('OCR not initialized');
  
  const { data: { text } } = await worker.recognize(imageUri);
  const pageNumber = extractPageNumber(text);
  const bookInfo = extractBookInfo(text);
  
  return { pageNumber, bookInfo, rawText: text };
};
```

### 5. Zustand store (`lib/store.ts`)
```typescript
import { create } from 'zustand';

interface Book {
  id: string;
  title: string;
  author?: string;
  currentPage: number;
  totalPages?: number;
  lastSynced?: number;
}

interface BookStore {
  books: Book[];
  isPremium: boolean;
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBookProgress: (id: string, page: number) => void;
  setPremium: (premium: boolean) => void;
}

export const useBookStore = create<BookStore>((set) => ({
  books: [],
  isPremium: false,
  setBooks: (books) => set({ books }),
  addBook: (book) => set((state) => ({ books: [...state.books, book] })),
  updateBookProgress: (id, page) =>
    set((state) => ({
      books: state.books.map((b) =>
        b.id === id ? { ...b, currentPage: page, lastSynced: Date.now() } : b
      ),
    })),
  setPremium: (premium) => set({ isPremium: premium }),
}));
```

### 6. Firebase sync (`lib/sync.ts`)
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { FIREBASE_CONFIG } from '../constants/Config';

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);

export const initAuth = async () => {
  try {
    await signInAnonymously(auth);
  } catch (error) {
    console.error('Auth failed:', error);
  }
};

export const syncToCloud = async (bookData: any, options = {}) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const bookRef = doc(db, `users/${user.uid}/books`, bookData.id);
    await setDoc(bookRef, { ...bookData, syncedAt: Date.now() }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, queued: true };
  }
};

export const syncFromCloud = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const booksRef = collection(db, `users/${user.uid}/books`);
    const snapshot = await getDocs(booksRef);
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Sync from cloud failed:', error);
    return [];
  }
};
```

### 7. Dashboard screen (`app/(tabs)/index.tsx`)
```typescript
import { View, FlatList, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useBookStore } from '../../lib/store';
import { getBooks, initDB } from '../../lib/db';
import BookCard from '../../components/BookCard';

export default function DashboardScreen() {
  const { books, setBooks } = useBookStore();

  useEffect(() => {
    initDB();
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const data = await getBooks();
    setBooks(data);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
```

### 8. Scan screen (`app/(tabs)/scan.tsx`)
```typescript
import { View, Button, Image, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { scanPage } from '../../lib/ocr';
import { updateProgress } from '../../lib/db';
import { useBookStore } from '../../lib/store';

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { updateBookProgress } = useBookStore();

  const handleScan = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    setScanning(true);
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      const scanResult = await scanPage(result.assets[0].uri);
      setResult(scanResult);
      
      if (scanResult.pageNumber) {
        // For demo, update first book
        // In production, match book by title/ISBN
        await updateProgress('book_id', scanResult.pageNumber);
        updateBookProgress('book_id', scanResult.pageNumber);
      }
    }
    setScanning(false);
  };

  return (
    <View style={styles.container}>
      <Button title="Scan Page" onPress={handleScan} disabled={scanning} />
      {result && (
        <View style={styles.result}>
          <Text>Page: {result.pageNumber || 'Not found'}</Text>
          <Text>Book: {result.bookInfo.title || 'Unknown'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  result: { marginTop: 20, padding: 16, backgroundColor: '#f0f0f0' },
});
```

### 9. Book card component (`components/BookCard.tsx`)
```typescript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ProgressBar from './ProgressBar';

export default function BookCard({ book }: { book: any }) {
  const router = useRouter();
  const progress = book.totalPages ? (book.currentPage / book.totalPages) * 100 : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/book/${book.id}`)}
    >
      <Text style={styles.title}>{book.title}</Text>
      {book.author && <Text style={styles.author}>{book.author}</Text>}
      <ProgressBar progress={progress} />
      <Text style={styles.page}>
        Page {book.currentPage} {book.totalPages ? `of ${book.totalPages}` : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold' },
  author: { fontSize: 14, color: '#666', marginTop: 4 },
  page: { fontSize: 12, color: '#999', marginTop: 8 },
});
```

### 10. Progress bar component (`components/ProgressBar.tsx`)
```typescript
import { View, StyleSheet } from 'react-native';

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${progress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#4CAF50' },
});
```

### 11. Configure Jest (`jest.config.js`)
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

### 12. Add test scripts to `package.json`
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## How to verify it works

### 1. Run tests
```bash
npm test
```
All tests in `__tests__/` must pass.

### 2. Start Expo development server
```bash
npx expo start
```

### 3. Test on device/simulator
- Scan QR code with Expo Go app (iOS/Android)
- Or press `i` for iOS simulator, `a` for Android emulator

### 4. Verify core flows
- **Add book**: Tap "+" button, enter book details, verify it appears on dashboard
- **Scan page**: Tap scan tab, take photo of book page, verify page number extracted
- **Update progress**: Manually enter page number, verify progress bar updates
- **Sync**: Toggle airplane mode, make changes, reconnect, verify sync indicator
- **Premium gate**: Try to add 4th book on free tier, verify paywall appears

### 5. Check database
```bash
npx expo start
# In another terminal:
adb shell  # Android
# or
xcrun simctl  # iOS
# Navigate to app data directory and inspect pagebridge.db
```