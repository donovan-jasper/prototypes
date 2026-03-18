import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { detectChaptersByTime } from '@/lib/audio/chapterDetector';
import { createAudiobook } from '@/lib/db/audiobooks';
import { createChapters } from '@/lib/db/chapters';
import { extractMultipleFileDurations, calculateTotalDuration } from '@/lib/audio/processor';
import { extractMetadata } from '@/lib/audio/metadata';

export default function ImportScreen() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
      });
      if (!result.canceled) {
        setFiles(result.assets);
      }
    } catch (err) {
      console.error('Error picking files:', err);
      Alert.alert('Error', 'Failed to pick audio files');
    }
  };

  const autoChapter = async () => {
    if (files.length === 0) return;

    setLoading(true);
    try {
      // Extract durations from all files
      const fileUris = files.map(f => f.uri);
      const durations = await extractMultipleFileDurations(fileUris);
      const totalDuration = calculateTotalDuration(durations);

      // Extract metadata from first file
      const metadata = await extractMetadata(fileUris[0]);

      // Create temporary audiobook with all file URIs stored as JSON
      const audiobook = await createAudiobook({
        title: metadata.title,
        author: metadata.author,
        duration: totalDuration,
        filePath: JSON.stringify(fileUris),
      });

      // Generate initial chapters based on actual total duration
      const chapters = detectChaptersByTime(totalDuration, Math.max(4, files.length));
      await createChapters(audiobook.id, chapters);

      setLoading(false);
      
      // Navigate to chapter editor instead of player
      router.push(`/chapter-editor/${audiobook.id}`);
    } catch (error) {
      setLoading(false);
      console.error('Error processing audiobook:', error);
      Alert.alert('Error', 'Failed to process audiobook');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickFiles} disabled={loading}>
        <Text style={styles.buttonText}>Select Audio Files</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing audio files...</Text>
        </View>
      )}

      <FlatList
        data={files}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.fileItem}>
            <Text style={styles.fileName}>{item.name}</Text>
            <Text style={styles.fileSize}>{(item.size / 1024 / 1024).toFixed(2)} MB</Text>
          </View>
        )}
      />

      {files.length > 0 && !loading && (
        <TouchableOpacity style={styles.button} onPress={autoChapter}>
          <Text style={styles.buttonText}>Create Audiobook ({files.length} files)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileName: {
    flex: 1,
    fontSize: 14,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});
