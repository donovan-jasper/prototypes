import { View, Button, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { scanPage } from '../../lib/ocr';
import { updateProgress, searchBooksByTitle, addBook } from '../../lib/db';
import { useBookStore } from '../../lib/store';

interface ScanResult {
  pageNumber: number | null;
  bookInfo: {
    title: string | null;
    isbn: string | null;
  };
  rawText: string;
}

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [matchedBooks, setMatchedBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualPage, setManualPage] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookPages, setNewBookPages] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { updateBookProgress, addBook: addBookToStore, books } = useBookStore();

  const handleScan = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to scan pages');
      return;
    }

    setScanning(true);
    setSuccessMessage(null);

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled) {
        const ocrResult = await scanPage(result.assets[0].uri);
        setScanResult(ocrResult);

        if (!ocrResult.pageNumber) {
          setManualEntry(true);
          setModalVisible(true);
          setScanning(false);
          return;
        }

        if (ocrResult.bookInfo.title) {
          const matches = await searchBooksByTitle(ocrResult.bookInfo.title);
          setMatchedBooks(matches);
        } else {
          setMatchedBooks(books);
        }

        setModalVisible(true);
      }
    } catch (error) {
      console.error('Scan failed:', error);
      Alert.alert('Scan Failed', 'Could not process the image. Please try again or enter manually.');
      setManualEntry(true);
      setModalVisible(true);
    }

    setScanning(false);
  };

  const handleSelectBook = async (bookId: string) => {
    setSelectedBookId(bookId);
  };

  const handleConfirm = async () => {
    if (!selectedBookId) {
      Alert.alert('Error', 'Please select a book');
      return;
    }

    const pageNum = manualEntry ? parseInt(manualPage, 10) : scanResult?.pageNumber;

    if (!pageNum || pageNum <= 0) {
      Alert.alert('Error', 'Invalid page number');
      return;
    }

    try {
      await updateProgress(selectedBookId, pageNum);
      updateBookProgress(selectedBookId, pageNum);

      const book = books.find(b => b.id === selectedBookId);
      setSuccessMessage(`Updated "${book?.title}" to page ${pageNum}`);

      resetModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress');
      console.error(error);
    }
  };

  const handleCreateNewBook = async () => {
    if (!newBookTitle.trim()) {
      Alert.alert('Error', 'Please enter a book title');
      return;
    }

    const pageNum = manualEntry ? parseInt(manualPage, 10) : scanResult?.pageNumber;

    if (!pageNum || pageNum <= 0) {
      Alert.alert('Error', 'Invalid page number');
      return;
    }

    const pages = newBookPages ? parseInt(newBookPages, 10) : undefined;
    if (newBookPages && (isNaN(pages!) || pages! <= 0)) {
      Alert.alert('Error', 'Please enter a valid number of pages');
      return;
    }

    try {
      const newBook = await addBook({
        title: newBookTitle.trim(),
        author: newBookAuthor.trim() || undefined,
        totalPages: pages,
      });

      addBookToStore(newBook);
      await updateProgress(newBook.id, pageNum);
      updateBookProgress(newBook.id, pageNum);

      setSuccessMessage(`Created "${newBook.title}" at page ${pageNum}`);

      resetModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to create book');
      console.error(error);
    }
  };

  const resetModal = () => {
    setModalVisible(false);
    setScanResult(null);
    setMatchedBooks([]);
    setSelectedBookId(null);
    setManualEntry(false);
    setManualPage('');
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookPages('');
  };

  const handleManualEntry = () => {
    setManualEntry(true);
    setMatchedBooks(books);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan Your Page</Text>
        <Text style={styles.description}>
          Point your camera at the page you're reading to automatically track your progress.
        </Text>

        <Button
          title="Scan Page"
          onPress={handleScan}
          disabled={scanning}
          color="#4CAF50"
        />

        {scanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.scanningText}>Processing image...</Text>
          </View>
        )}

        {successMessage && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {manualEntry ? 'Enter Page Details' : 'Select Your Book'}
            </Text>

            {manualEntry ? (
              <View style={styles.manualEntryForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Page number"
                  keyboardType="numeric"
                  value={manualPage}
                  onChangeText={setManualPage}
                  autoFocus={true}
                />

                <Text style={styles.sectionTitle}>Or create a new book:</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Book title"
                  value={newBookTitle}
                  onChangeText={setNewBookTitle}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Author (optional)"
                  value={newBookAuthor}
                  onChangeText={setNewBookAuthor}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Total pages (optional)"
                  keyboardType="numeric"
                  value={newBookPages}
                  onChangeText={setNewBookPages}
                />

                <View style={styles.buttonRow}>
                  <Button
                    title="Create Book"
                    onPress={handleCreateNewBook}
                    color="#4CAF50"
                  />
                  <Button
                    title="Cancel"
                    onPress={resetModal}
                    color="#9E9E9E"
                  />
                </View>
              </View>
            ) : (
              <>
                {matchedBooks.length > 0 ? (
                  <>
                    <Text style={styles.sectionTitle}>
                      {scanResult?.bookInfo.title
                        ? `Books matching "${scanResult.bookInfo.title}"`
                        : 'Select a book to update'}
                    </Text>

                    <FlatList
                      data={matchedBooks}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.bookItem,
                            selectedBookId === item.id && styles.selectedBook
                          ]}
                          onPress={() => handleSelectBook(item.id)}
                        >
                          <Text style={styles.bookTitle}>{item.title}</Text>
                          {item.author && (
                            <Text style={styles.bookAuthor}>{item.author}</Text>
                          )}
                          <Text style={styles.bookProgress}>
                            Current page: {item.currentPage}
                            {item.totalPages && ` of ${item.totalPages}`}
                          </Text>
                        </TouchableOpacity>
                      )}
                      style={styles.bookList}
                    />

                    <View style={styles.buttonRow}>
                      <Button
                        title="Update Progress"
                        onPress={handleConfirm}
                        disabled={!selectedBookId}
                        color="#4CAF50"
                      />
                      <Button
                        title="Cancel"
                        onPress={resetModal}
                        color="#9E9E9E"
                      />
                    </View>
                  </>
                ) : (
                  <View style={styles.noBooksContainer}>
                    <Text style={styles.noBooksText}>
                      No matching books found. Would you like to create a new book?
                    </Text>

                    <View style={styles.buttonRow}>
                      <Button
                        title="Create New Book"
                        onPress={handleManualEntry}
                        color="#4CAF50"
                      />
                      <Button
                        title="Cancel"
                        onPress={resetModal}
                        color="#9E9E9E"
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    paddingHorizontal: 20,
  },
  scanningIndicator: {
    marginTop: 30,
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  successMessage: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  bookList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  bookItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedBook: {
    backgroundColor: '#e8f5e9',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bookProgress: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
  manualEntryForm: {
    marginTop: 10,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  noBooksContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noBooksText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});
