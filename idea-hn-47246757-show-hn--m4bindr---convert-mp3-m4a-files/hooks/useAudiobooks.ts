import { useState, useEffect } from 'react';
import { getAudiobooks } from '@/lib/db/audiobooks';

export const useAudiobooks = () => {
  const [audiobooks, setAudiobooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAudiobooks = async () => {
      try {
        const books = await getAudiobooks();
        setAudiobooks(books);
      } catch (error) {
        console.error('Error loading audiobooks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAudiobooks();
  }, []);

  return { audiobooks, loading };
};
