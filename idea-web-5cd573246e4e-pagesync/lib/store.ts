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
