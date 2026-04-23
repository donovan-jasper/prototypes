import { View, Button, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { scanPage } from '../../lib/ocr';
import { updateProgress, searchBooksByTitle, addBook, searchBooksByISBN } from '../../lib/db';
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

        // First try to match by ISBN if available
        if (ocrResult.bookInfo.isbn) {
          const isbnMatches = await searchBooksByISBN(ocrResult.bookInfo.isbn);
          if (isbnMatches.length > 0) {
            setMatchedBooks(isbnMatches);
            setModalVisible(true);
            setScanning(false);
            return;
          }
        }

        // Then try to match by title
        if (ocrResult.bookInfo.title) {
          const titleMatches = await searchBooksByTitle(ocrResult.bookInfo.title);
          if (titleMatches.length > 0) {
            setMatchedBooks(titleMatches);
            setModalVisible(true);
            setScanning(false);
            return;
          }
        }

        // If no matches found, show all books for selection
        setMatchedBooks(books);
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
        isbn: scanResult?.bookInfo.isbn || undefined,
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
          Point your camera at a book page to automatically track your progress.
        </Text>

        {successMessage && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Scan Page"
            onPress={handleScan}
            disabled={scanning}
            color="#4CAF50"
          />
        </View>

        {scanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.scanningText}>Scanning...</Text>
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
                  placeholder="Page Number"
                  keyboardType="numeric"
                  value={manualPage}
                  onChangeText={setManualPage}
                  autoFocus={true}
                />

                <Text style={styles.sectionTitle}>Book Information</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Book Title"
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
                  placeholder="Total Pages (optional)"
                  keyboardType="numeric"
                  value={newBookPages}
                  onChangeText={setNewBookPages}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={resetModal}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleCreateNewBook}
                  >
                    <Text style={styles.buttonText}>Create Book</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {matchedBooks.length > 0 ? (
                  <>
                    <FlatList
                      data={matchedBooks}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.bookItem,
                            selectedBookId === item.id && styles.selectedBookItem
                          ]}
                          onPress={() => handleSelectBook(item.id)}
                        >
                          <Text style={styles.bookTitle}>{item.title}</Text>
                          {item.author && (
                            <Text style={styles.bookAuthor}>{item.author}</Text>
                          )}
                          <Text style={styles.bookProgress}>
                            Current: Page {item.currentPage}
                            {item.totalPages ? ` of ${item.totalPages}` : ''}
                          </Text>
                        </TouchableOpacity>
                      )}
                      style={styles.bookList}
                    />

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={resetModal}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.modalButton, styles.confirmButton]}
                        onPress={handleConfirm}
                        disabled={!selectedBookId}
                      >
                        <Text style={styles.buttonText}>Update Progress</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={styles.noBooksContainer}>
                    <Text style={styles.noBooksText}>No matching books found</Text>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={resetModal}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.modalButton, styles.confirmButton]}
                        onPress={handleManualEntry}
                      >
                        <Text style={styles.buttonText}>Enter Manually</Text>
                      </TouchableOpacity>
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
  buttonContainer: {
    marginBottom: 20,
    width: '100%',
  },
  scanningIndicator: {
    marginTop: 20,
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  successText: {
    color: '#2e7d32',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  manualEntryForm: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  bookList: {
    maxHeight: 300,
  },
  bookItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedBookItem: {
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
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noBooksContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noBooksText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});
