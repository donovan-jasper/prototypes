import { View, FlatList, StyleSheet, TouchableOpacity, Text, Modal, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useBookStore } from '../../lib/store';
import { getBooks, initDB, addBook } from '../../lib/db';
import BookCard from '../../components/BookCard';

export default function DashboardScreen() {
  const { books, setBooks, addBook: addBookToStore } = useBookStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');

  useEffect(() => {
    initDB();
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const data = await getBooks();
    setBooks(data);
  };

  const handleAddBook = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a book title');
      return;
    }

    const pages = totalPages ? parseInt(totalPages, 10) : undefined;
    if (totalPages && (isNaN(pages!) || pages! <= 0)) {
      Alert.alert('Error', 'Please enter a valid number of pages');
      return;
    }

    try {
      const newBook = await addBook({
        title: title.trim(),
        author: author.trim() || undefined,
        totalPages: pages,
      });
      addBookToStore(newBook);
      setModalVisible(false);
      setTitle('');
      setAuthor('');
      setTotalPages('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add book');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} />}
        contentContainerStyle={books.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No books yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first book</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Book</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Book Title *"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            
            <TextInput
              style={styles.input}
              placeholder="Author (optional)"
              value={author}
              onChangeText={setAuthor}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Total Pages (optional)"
              value={totalPages}
              onChangeText={setTotalPages}
              keyboardType="number-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false
