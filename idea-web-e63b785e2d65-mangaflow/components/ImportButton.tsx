import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { extractMangaArchive } from '../lib/manga-parser';
import { savePage } from '../lib/storage';
import { addManga } from '../lib/db';
import { useUserStore } from '../store/user';
import { canAddManga } from '../lib/premium';
import PremiumGate from './PremiumGate';

const ImportButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { isPremium } = useUserStore();

  const handleImport = async () => {
    try {
      setIsLoading(true);

      // Check if user can add more manga
      const mangaCount = await getMangaCount(); // You'll need to implement this
      const canAdd = await canAddManga(mangaCount, isPremium);

      if (!canAdd) {
        setShowPremiumModal(true);
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/zip', 'application/x-cbr', 'application/x-cbz'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      if (!file.uri) {
        Alert.alert('Error', 'No file selected');
        return;
      }

      // Extract manga archive
      const pages = await extractMangaArchive(file.uri);

      if (pages.length === 0) {
        Alert.alert('Error', 'No pages found in the archive');
        return;
      }

      // Save pages to file system
      const mangaId = Date.now().toString();
      const pageUris = [];

      for (let i = 0; i < pages.length; i++) {
        const uri = await savePage(mangaId, i + 1, pages[i]);
        pageUris.push(uri);
      }

      // Add to database
      await addManga({
        id: mangaId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        coverUri: pageUris[0], // Use first page as cover
        totalPages: pages.length,
        currentPage: 1,
        readingMode: 'ltr',
        lastRead: Date.now(),
        isFavorite: false,
      });

      Alert.alert('Success', 'Manga imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      Alert.alert('Error', 'Failed to import manga. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={handleImport}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Importing...' : 'Import Manga'}
        </Text>
      </TouchableOpacity>

      <PremiumGate
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={() => {
          setShowPremiumModal(false);
          // In a real app, this would trigger the purchase flow
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ImportButton;
