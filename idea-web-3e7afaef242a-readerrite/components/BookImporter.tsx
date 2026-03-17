import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { addBook } from '../lib/database';
import { saveBookFile } from '../lib/fileManager';
import { extractMetadata } from '../lib/bookParser';
import { useLibraryStore } from '../store/useLibraryStore';

const FREE_TIER_LIMIT = 10;

export default function BookImporter() {
  const [importing, setImporting] = useState(false);
  const { books, addBook: addBookToStore, isPremium } = useLibraryStore();

  const handleImport = async () => {
    if (!isPremium && books.length >= FREE_TIER_LIMIT) {
      Alert.alert(
        'Free Tier Limit Reached',
        `You've reached the limit of ${FREE_TIER_LIMIT} books. Upgrade to premium for unlimited books.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setImporting(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/epub+zip', 'application/pdf', 'application/x-mobipocket-ebook', 'text/plain'],
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        setImporting(false);
        return;
      }

      const file = result.assets[0];
      const format = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      
      const filePath = await saveBookFile(file.name, file.uri);
      
      const metadata = await extractMetadata(filePath, format);
      
      const bookData = {
        title: metadata.title,
        author: metadata.author,
        filePath,
        format: metadata.format,
        coverPath: metadata.coverPath,
        dateAdded: Date.now(),
        currentPage: 0
      };
      
      const bookId = await addBook(bookData);
      
      addBookToStore({
        id: bookId,
        ...bookData
      });
      
      Alert.alert('Success', `"${metadata.title}" has been added to your library.`);
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'Could not import the book. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleImport}
      disabled={importing}
    >
      {importing ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>+</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  }
});
