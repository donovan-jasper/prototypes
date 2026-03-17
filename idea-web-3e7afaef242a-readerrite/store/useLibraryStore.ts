import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book } from '../lib/database';

interface LibraryState {
  books: Book[];
  currentBook: Book | null;
  isPremium: boolean;
  isLoading: boolean;
  searchQuery: string;
  
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  removeBook: (id: number) => void;
  updateBook: (id: number, updates: Partial<Book>) => void;
  setCurrentBook: (book: Book | null) => void;
  setPremium: (isPremium: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setSearchQuery: (query: string) => void;
  loadPremiumStatus: () => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: [],
  currentBook: null,
  isPremium: false,
  isLoading: false,
  searchQuery: '',
  
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
  
  loadPremiumStatus: async () => {
    try {
      const stored = await AsyncStorage.getItem('isPremium');
      if (stored) {
        set({ isPremium: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load premium status:', error);
    }
  }
}));
