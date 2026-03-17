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
        <Text style={styles.title}>Scan a Page</Text>
        <Text style={styles.subtitle}>Point your camera at any page to detect the page number and book</Text>
        
        <TouchableOpacity
          style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
          onPress={handleScan}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.scanButtonText}>Open Camera</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manualButton}
          onPress={handleManualEntry}
        >
          <Text style={styles.manualButtonText}>Enter Manually</Text>
        </TouchableOpacity>

        {successMessage && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ {successMessage}</Text>
          </View>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {manualEntry ? 'Manual Entry' : 'Scan Result'}
            </Text>
            
            {!manualEntry && scanResult && (
              <View style={styles.detectedInfo}>
                <Text style={styles.detectedLabel}>Detected Page:</Text>
                <Text style={styles.detectedValue}>{scanResult.pageNumber || 'Not found'}</Text>
                {scanResult.bookInfo.title && (
                  <>
                    <Text style={styles.detectedLabel}>Detected Book:</Text>
                    <Text style={styles.detectedValue}>{scanResult.bookInfo.title}</Text>
                  </>
                )}
              </View>
            )}

            {manualEntry && (
              <TextInput
                style={styles.input}
                placeholder="Page Number"
                value={manualPage}
                onChangeText={setManualPage}
                keyboardType="number-pad"
                autoFocus
              />
            )}

            <Text style={styles.sectionTitle}>Select a Book:</Text>
            <FlatList
              data={matchedBooks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.bookItem,
                    selectedBookId === item.id && styles.bookItemSelected
                  ]}
                  onPress={() => handleSelectBook(item.id)}
                >
                  <Text style={styles.bookItemTitle}>{item.title}</Text>
                  {item.author && <Text style={styles.bookItemAuthor}>{item.author}</Text>}
                </TouchableOpacity>
              )}
              style={styles.bookList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No books found</Text>
              }
            />

            <Text style={styles.sectionTitle}>Or Create New Book:</Text>
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
              value={newBookPages}
              onChangeText={setNewBookPages}
              keyboardType="number-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={resetModal}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              {selectedBookId ? (
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.buttonText}>Update Progress</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleCreateNewBook}
                >
                  <Text style={styles.buttonText}>Create & Update</Text>
                </TouchableOpacity>
              )}
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  manualButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  manualButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  successBox: {
    marginTop: 24,
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  detectedInfo: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detectedLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  detectedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  bookList: {
    maxHeight: 150,
    marginBottom: 8,
  },
  bookItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bookItemSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  bookItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bookItemAuthor: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
