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

        {successMessage && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <Button
          title={scanning ? 'Scanning...' : 'Scan Page'}
          onPress={handleScan}
          disabled={scanning}
        />

        {scanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.scanningText}>Processing image...</Text>
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
              {manualEntry ? 'Enter Page Number' : 'Select Your Book'}
            </Text>

            {manualEntry ? (
              <View style={styles.manualEntryContainer}>
                <Text style={styles.label}>Page Number:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={manualPage}
                  onChangeText={setManualPage}
                  placeholder="Enter page number"
                  autoFocus
                />

                {matchedBooks.length > 0 && (
                  <>
                    <Text style={styles.label}>Select Book:</Text>
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
                          {item.author && <Text style={styles.bookAuthor}>{item.author}</Text>}
                        </TouchableOpacity>
                      )}
                      style={styles.bookList}
                    />
                  </>
                )}

                {matchedBooks.length === 0 && (
                  <>
                    <Text style={styles.label}>Create New Book:</Text>
                    <TextInput
                      style={styles.input}
                      value={newBookTitle}
                      onChangeText={setNewBookTitle}
                      placeholder="Book title"
                    />
                    <TextInput
                      style={styles.input}
                      value={newBookAuthor}
                      onChangeText={setNewBookAuthor}
                      placeholder="Author (optional)"
                    />
                    <TextInput
                      style={styles.input}
                      value={newBookPages}
                      onChangeText={setNewBookPages}
                      placeholder="Total pages (optional)"
                      keyboardType="numeric"
                    />
                  </>
                )}
              </View>
            ) : (
              <>
                {scanResult?.bookInfo.title && (
                  <Text style={styles.detectedText}>
                    Detected: "{scanResult.bookInfo.title}" - Page {scanResult.pageNumber}
                  </Text>
                )}

                {matchedBooks.length > 0 ? (
                  <>
                    <Text style={styles.label}>Select Book:</Text>
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
                          {item.author && <Text style={styles.bookAuthor}>{item.author}</Text>}
                        </TouchableOpacity>
                      )}
                      style={styles.bookList}
                    />
                  </>
                ) : (
                  <View style={styles.noBooksContainer}>
                    <Text style={styles.noBooksText}>No matching books found</Text>
                    <Button
                      title="Create New Book"
                      onPress={() => setManualEntry(true)}
                    />
                  </View>
                )}
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={resetModal}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={manualEntry ? handleCreateNewBook : handleConfirm}
                disabled={!selectedBookId && !manualEntry}
              >
                <Text style={styles.buttonText}>
                  {manualEntry ? 'Create & Update' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>

            {!manualEntry && (
              <TouchableOpacity
                style={styles.manualEntryButton}
                onPress={handleManualEntry}
              >
                <Text style={styles.manualEntryText}>Can't find your book? Enter manually</Text>
              </TouchableOpacity>
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
  },
  successContainer: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
  },
  successText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scanningIndicator: {
    marginTop: 20,
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 10,
    color: '#666',
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
  },
  detectedText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4CAF50',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  bookList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  bookItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedBookItem: {
    backgroundColor: '#f0f8ff',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
  },
  noBooksContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  noBooksText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  modalButtons: {
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
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  manualEntryButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  manualEntryText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  manualEntryContainer: {
    marginBottom: 20,
  },
});
