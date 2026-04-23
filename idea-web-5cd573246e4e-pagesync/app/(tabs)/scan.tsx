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
    author?: string | null;
    totalPages?: number | null;
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

      setSuccessMessage(`Created "${newBookTitle}" and set to page ${pageNum}`);
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

  return (
    <View style={styles.container}>
      <Button
        title="Scan Page"
        onPress={handleScan}
        disabled={scanning}
      />

      {scanning && (
        <View style={styles.scanningIndicator}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.scanningText}>Scanning...</Text>
        </View>
      )}

      {successMessage && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {manualEntry ? 'Manual Entry' : 'Select Book'}
            </Text>

            {manualEntry ? (
              <View style={styles.manualEntryForm}>
                <Text style={styles.formLabel}>Page Number:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={manualPage}
                  onChangeText={setManualPage}
                  placeholder="Enter page number"
                  autoFocus
                />

                <Text style={styles.formLabel}>Book Title:</Text>
                <TextInput
                  style={styles.input}
                  value={newBookTitle}
                  onChangeText={setNewBookTitle}
                  placeholder="Enter book title"
                />

                <Text style={styles.formLabel}>Author (optional):</Text>
                <TextInput
                  style={styles.input}
                  value={newBookAuthor}
                  onChangeText={setNewBookAuthor}
                  placeholder="Enter author name"
                />

                <Text style={styles.formLabel}>Total Pages (optional):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newBookPages}
                  onChangeText={setNewBookPages}
                  placeholder="Enter total pages"
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={resetModal}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleCreateNewBook}
                  >
                    <Text style={styles.buttonText}>Create & Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {matchedBooks.length > 0 ? (
                  <>
                    <Text style={styles.sectionTitle}>Select Your Book:</Text>
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
                        </TouchableOpacity>
                      )}
                      style={styles.bookList}
                    />

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={resetModal}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, styles.confirmButton]}
                        onPress={handleConfirm}
                        disabled={!selectedBookId}
                      >
                        <Text style={styles.buttonText}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={styles.noBooksContainer}>
                    <Text style={styles.noBooksText}>No books found in your library.</Text>
                    <Text style={styles.noBooksSubtext}>
                      Would you like to create a new book entry?
                    </Text>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={resetModal}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, styles.confirmButton]}
                        onPress={() => setManualEntry(true)}
                      >
                        <Text style={styles.buttonText}>Create New</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanningIndicator: {
    marginTop: 20,
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
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    alignItems: 'center',
  },
  successText: {
    color: '#2E7D32',
    fontSize: 16,
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
  },
  manualEntryForm: {
    marginTop: 10,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  selectedBookItem: {
    backgroundColor: '#E8F5E9',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noBooksContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noBooksText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  noBooksSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});
