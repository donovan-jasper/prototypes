import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { extractMangaArchive } from '../lib/manga-parser';
import { savePage } from '../lib/storage';
import { addManga } from '../lib/db';
import { useUserStore } from '../store/user';
import PremiumGate from './PremiumGate';

const ImportButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const { isPremium } = useUserStore();

  const handleImport = async () => {
    try {
      setIsLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/zip', 'application/x-cbr', 'application/x-cbz'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      // Check if user can add more manga
      if (!isPremium) {
        // In a real app, you would check the current manga count
        // For this prototype, we'll just show the premium gate
        setShowPremiumGate(true);
        setIsLoading(false);
        return;
      }

      // Process the selected file
      const mangaData = await extractMangaArchive(result.assets[0].uri);

      // Save pages to file system
      const mangaId = Date.now().toString();
      const pageUris = await Promise.all(
        mangaData.pages.map((page, index) =>
          savePage(mangaId, index + 1, page.base64)
        )
      );

      // Add to database
      await addManga({
        id: mangaId,
        title: mangaData.metadata.title || 'Untitled Manga',
        coverUri: pageUris[0], // Use first page as cover
        totalPages: mangaData.pages.length,
        currentPage: 0,
        readingMode: 'ltr',
        lastRead: Date.now(),
        isFavorite: false,
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Import failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleImport}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Import Manga</Text>
        )}
      </TouchableOpacity>

      <PremiumGate
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        onUpgrade={() => {
          // In a real app, this would navigate to the purchase flow
          console.log('Upgrade to premium');
          setShowPremiumGate(false);
        }}
      />
    </View>
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
