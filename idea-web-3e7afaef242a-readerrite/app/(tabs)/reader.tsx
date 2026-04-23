import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import EpubRenderer from '../../components/EpubRenderer';
import PdfRenderer from '../../components/PdfRenderer';
import ReaderControls from '../../components/ReaderControls';
import { useLibraryStore } from '../../store/useLibraryStore';
import { getBook } from '../../lib/database';

export default function ReaderScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [book, setBook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const { setCurrentBook } = useLibraryStore();

  useEffect(() => {
    const loadBook = async () => {
      try {
        setIsLoading(true);
        const id = parseInt(bookId as string);
        const loadedBook = await getBook(id);
        if (loadedBook) {
          setBook(loadedBook);
          setCurrentBook(loadedBook);
        }
      } catch (error) {
        console.error('Failed to load book:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();

    return () => {
      setCurrentBook(null);
    };
  }, [bookId]);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        {/* Error message */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {book.format === 'epub' ? (
        <EpubRenderer
          filePath={book.filePath}
          onToggleControls={toggleControls}
        />
      ) : (
        <PdfRenderer
          filePath={book.filePath}
          onToggleControls={toggleControls}
        />
      )}

      {showControls && (
        <ReaderControls
          onClose={() => setShowControls(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
