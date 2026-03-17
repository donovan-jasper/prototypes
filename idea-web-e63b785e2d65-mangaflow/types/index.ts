export interface Manga {
  id: string;
  title: string;
  coverUri: string;
  totalPages: number;
  currentPage: number;
  readingMode: 'ltr' | 'rtl' | 'vertical';
  lastRead: number;
  isFavorite: boolean;
}

export interface Page {
  id: string;
  mangaId: string;
  pageNumber: number;
  uri: string;
}
