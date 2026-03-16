import { Media } from '../types';

export const searchBooks = async (query: string): Promise<Media[]> => {
  // In a real app, you would call the Open Library API here
  return [
    {
      id: 'book1',
      title: 'Dune',
      type: 'book',
      currentProgress: 0,
      totalProgress: 412,
      unit: 'page',
      lastUpdated: new Date(),
    },
  ];
};

export const searchMovies = async (query: string): Promise<Media[]> => {
  // In a real app, you would call the TMDB API here
  return [
    {
      id: 'movie1',
      title: 'Inception',
      type: 'movie',
      currentProgress: 0,
      totalProgress: 148,
      unit: 'timestamp',
      lastUpdated: new Date(),
    },
  ];
};

export const searchAudiobooks = async (query: string): Promise<Media[]> => {
  // In a real app, you would call the iTunes API here
  return [
    {
      id: 'audiobook1',
      title: 'Dune',
      type: 'audiobook',
      currentProgress: 0,
      totalProgress: 1200,
      unit: 'timestamp',
      lastUpdated: new Date(),
    },
  ];
};

export const lookupBarcode = async (code: string): Promise<Media | null> => {
  // In a real app, you would call a barcode lookup API here
  if (code === '1234567890') {
    return {
      id: 'book2',
      title: 'The Hobbit',
      type: 'book',
      currentProgress: 0,
      totalProgress: 310,
      unit: 'page',
      lastUpdated: new Date(),
    };
  }
  return null;
};
