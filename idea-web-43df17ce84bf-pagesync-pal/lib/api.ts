import { Media } from '../types';
import { Alert } from 'react-native';

const API_KEYS = {
  openLibrary: 'YOUR_OPEN_LIBRARY_API_KEY',
  tmdb: 'YOUR_TMDB_API_KEY',
  itunes: 'YOUR_ITUNES_API_KEY',
};

export const searchBooks = async (query: string): Promise<Media[]> => {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`
    );
    const data = await response.json();

    return data.docs.map((item: any) => ({
      id: item.key.replace('/works/', ''),
      title: item.title,
      type: 'book',
      currentProgress: 0,
      totalProgress: item.number_of_pages_median || 0,
      unit: 'page',
      coverUrl: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : undefined,
      lastUpdated: new Date(),
    }));
  } catch (error) {
    console.error('Book search error:', error);
    Alert.alert('Error', 'Failed to search books. Please try again.');
    return [];
  }
};

export const searchMovies = async (query: string): Promise<Media[]> => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEYS.tmdb}&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    return data.results.map((item: any) => ({
      id: `movie-${item.id}`,
      title: item.title,
      type: 'movie',
      currentProgress: 0,
      totalProgress: 100, // Assuming percentage for movies
      unit: 'percentage',
      coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
      lastUpdated: new Date(),
    }));
  } catch (error) {
    console.error('Movie search error:', error);
    Alert.alert('Error', 'Failed to search movies. Please try again.');
    return [];
  }
};

export const searchAudiobooks = async (query: string): Promise<Media[]> => {
  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=audiobook&limit=10`
    );
    const data = await response.json();

    return data.results.map((item: any) => ({
      id: `audiobook-${item.trackId}`,
      title: item.trackName,
      type: 'audiobook',
      currentProgress: 0,
      totalProgress: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 60000) : 0, // Convert to minutes
      unit: 'timestamp',
      coverUrl: item.artworkUrl100,
      lastUpdated: new Date(),
    }));
  } catch (error) {
    console.error('Audiobook search error:', error);
    Alert.alert('Error', 'Failed to search audiobooks. Please try again.');
    return [];
  }
};

export const lookupBarcode = async (barcode: string): Promise<Media | null> => {
  try {
    // First try Open Library (books)
    const bookResponse = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${barcode}&format=json&jscmd=data`
    );
    const bookData = await bookResponse.json();

    if (bookData[`ISBN:${barcode}`]) {
      const bookInfo = bookData[`ISBN:${barcode}`];
      return {
        id: `book-${barcode}`,
        title: bookInfo.title,
        type: 'book',
        currentProgress: 0,
        totalProgress: bookInfo.number_of_pages || 0,
        unit: 'page',
        coverUrl: bookInfo.cover?.medium || undefined,
        lastUpdated: new Date(),
      };
    }

    // If not a book, try other APIs
    // (Implementation would depend on your barcode provider)

    return null;
  } catch (error) {
    console.error('Barcode lookup error:', error);
    Alert.alert('Error', 'Failed to lookup barcode. Please try again.');
    return null;
  }
};
