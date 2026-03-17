import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { initDatabase, getBooks, deleteBook, searchBooks } from '../../lib/database';
import { deleteBookFile } from '../../lib/fileManager';
import { useLibraryStore } from '../../store/useLibraryStore';
import BookCard from '../../components/BookCard';
import BookImporter from '../../components/BookImporter';

export default function LibraryScreen() {
  const router = useRouter();
  const {
    books,
    setBooks,
    removeBook,
    setLoading,
    isLoading,
    searchQuery,
    setSearchQuery,
    loadPremiumStatus
  } = useLibraryStore();
  
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'author'>('recent');

  useEffect(() => {
    loadLibrary();
    loadPremiumStatus();
  }, []);

  const loadLibrary = async () => {
    try {
      setLoading(true);
      await initDatabase();
      const loadedBooks = await getBooks();
      setBooks(loadedBooks);
    } catch (error) {
      console.error('Failed to load library:', error);
      Alert.alert('Error', 'Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      const allBooks = await getBooks();
      setBooks(allBooks);
    } else {
      const results = await searchBooks(query);
      setBooks(results);
    }
  };

  const handleDeleteBook = async (bookId: number, filePath: string) => {
    Alert.alert(
      'Delete Book',
      'Are you sure you want to delete this book?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBook(bookId);
              await deleteBookFile(filePath);
              removeBook(bookId);
            } catch (error) {
              console.error('Failed to delete book:', error);
              Alert.alert('Error', 'Failed to delete book');
            }
          }
        }
      ]
    );
  };

  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'recent':
      default:
        return b.dateAdded - a.dateAdded;
    }
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.controls}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
              onPress={() => setSortBy('recent')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'recent' && styles.sortButtonTextActive]}>
                Recent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'title' && styles.sortButtonActive]}
              onPress={() => setSortBy('title')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'title' && styles.sortButtonTextActive]}>
                Title
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'author' && styles.sortButtonActive]}
              onPress={() => setSortBy('author')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'author' && styles.sortButtonTextActive]}>
                Author
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {sortedBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No books in your library</Text>
          <Text style={styles.emptySubtext}>Tap the + button to import your first book</Text>
        </View>
      ) : (
        <FlatList
          data={sortedBooks}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onPress={() => router.push(`/(tabs)/reader?id=${item.id}`)}
              onLongPress={() => handleDeleteBook(item.id, item.filePath)}
            />
          )}
        />
      )}

      <BookImporter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  controls: {
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  }
});
