import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { extractMangaArchive, detectMetadata } from '../lib/manga-parser';
import { addManga, getMangaCount } from '../lib/db';

interface ImportButtonProps {
  onImportComplete: () => void;
}

export default function ImportButton({ onImportComplete }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    try {
      const count = await getMangaCount();
      if (count >= 10) {
        Alert.alert(
          'Free Tier Limit',
          'You have reached the limit of 10 manga. Upgrade to Premium for unlimited imports.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/zip', 'application/x-cbz', 'application/x-cbr'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setIsImporting(true);

      const file = result.assets[0];
      const metadata = detectMetadata(file.name);

      const { coverUri, totalPages, mangaId } = await extractMangaArchive(file.uri);

      await addManga({
        title: metadata.title,
        coverUri,
        totalPages,
        currentPage: 0,
        readingMode: 'ltr',
        lastRead: Date.now(),
        isFavorite: false,
      });

      Alert.alert('Success', `${metadata.title} imported successfully!`);
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'Could not import manga. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isImporting && styles.buttonDisabled]}
      onPress={handleImport}
      disabled={isImporting}
    >
      <Text style={styles.buttonText}>
        {isImporting ? 'Importing...' : '+ Import Manga'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    margin: 16,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
