import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book } from '../lib/database';

interface LibraryState {
  books: Book[];
  currentBook: Book | null;
  isPremium: boolean;
  isLoading: boolean;
  searchQuery: string;
  fontSize: number;
  theme: 'light' | 'sepia' | 'dark';
  marginSize: number;

  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  removeBook: (id: number) => void;
  updateBook: (id: number, updates: Partial<Book>) => void;
  setCurrentBook: (book: Book | null) => void;
  setPremium: (isPremium: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: 'light' | 'sepia' | 'dark') => void;
  setMarginSize: (size: number) => void;
  loadPremiumStatus: () => Promise<void>;
  loadReaderSettings: () => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: [],
  currentBook: null,
  isPremium: false,
  isLoading: false,
  searchQuery: '',
  fontSize: 16,
  theme: 'light',
  marginSize: 16,

  setBooks: (books) => set({ books }),

  addBook: (book) => set((state) => ({
    books: [book, ...state.books]
  })),

  removeBook: (id) => set((state) => ({
    books: state.books.filter(b => b.id !== id)
  })),

  updateBook: (id, updates) => set((state) => ({
    books: state.books.map(b => b.id === id ? { ...b, ...updates } : b)
  })),

  setCurrentBook: (book) => set({ currentBook: book }),

  setPremium: async (isPremium) => {
    set({ isPremium });
    await AsyncStorage.setItem('isPremium', JSON.stringify(isPremium));
  },

  setLoading: (isLoading) => set({ isLoading }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFontSize: (size) => {
    set({ fontSize: size });
    AsyncStorage.setItem('readerFontSize', size.toString());
  },

  setTheme: (theme) => {
    set({ theme });
    AsyncStorage.setItem('readerTheme', theme);
  },

  setMarginSize: (size) => {
    set({ marginSize: size });
    AsyncStorage.setItem('readerMarginSize', size.toString());
  },

  loadPremiumStatus: async () => {
    try {
      const stored = await AsyncStorage.getItem('isPremium');
      if (stored) {
        set({ isPremium: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load premium status:', error);
    }
  },

  loadReaderSettings: async () => {
    try {
      const fontSize = await AsyncStorage.getItem('readerFontSize');
      const theme = await AsyncStorage.getItem('readerTheme');
      const marginSize = await AsyncStorage.getItem('readerMarginSize');

      if (fontSize) set({ fontSize: parseInt(fontSize) });
      if (theme) set({ theme: theme as 'light' | 'sepia' | 'dark' });
      if (marginSize) set({ marginSize: parseInt(marginSize) });
    } catch (error) {
      console.error('Failed to load reader settings:', error);
    }
  }
}));
