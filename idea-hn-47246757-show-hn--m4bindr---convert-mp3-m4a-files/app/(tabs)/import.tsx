import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { detectChaptersBySilence, detectChaptersByTime } from '@/lib/audio/chapterDetector';
import { createAudiobook } from '@/lib/db/audiobooks';
import { createChapters } from '@/lib/db/chapters';
import { useRouter } from 'expo-router';

interface AudioFile {
  uri: string;
  name: string;
  size: number;
  duration: number;
}

export default function ImportScreen() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const router = useRouter();

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const audioFiles = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name || 'Untitled',
          size: asset.size || 0,
          duration: 0, // Will be calculated
        }));
        setFiles(audioFiles);
      }
    } catch (error) {
      console.error('Error picking files:', error);
    }
  };

  const processFiles = async (method: 'silence' | 'time') => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // For simplicity, we'll process one file at a time
      const file = files[0];
      let chapters;

      if (method === 'silence') {
        chapters = await detectChaptersBySilence(file.uri, -40, 2);
      } else {
        // For time-based, we need to get the duration first
        const durationCommand = `-i "${file.uri}" -show_entries format=duration -v quiet -of csv=p=0`;
        const durationResult = await FFprobeKit.execute(durationCommand);
        const durationOutput = await durationResult.getOutput();
        const duration = parseFloat(durationOutput) * 1000; // Convert to ms

        chapters = detectChaptersByTime(duration, 4);
      }

      // Create audiobook in database
      const audiobook = await createAudiobook({
        title: file.name.replace(/\.[^/.]+$/, ""),
        author: 'Unknown',
        duration: chapters[chapters.length - 1].endTime,
        filePath: file.uri,
        coverArt: null,
        currentPosition: 0,
      });

      // Create chapters
      await createChapters(audiobook.id, chapters);

      // Navigate to chapter editor
      router.push({
        pathname: '/audiobook/[id]',
        params: { id: audiobook.id },
      });

    } catch (error) {
      console.error('Error processing files:', error);
      alert('Failed to process audio file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Audio Files</Text>

      {files.length === 0 ? (
        <TouchableOpacity style={styles.button} onPress={pickFiles}>
          <Text style={styles.buttonText}>Select Audio Files</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.fileListContainer}>
          <Text style={styles.sectionTitle}>Selected Files:</Text>
          <FlatList
            data={files}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.fileItem}>
                <Text style={styles.fileName}>{item.name}</Text>
                <Text style={styles.fileSize}>{(item.size / (1024 * 1024)).toFixed(2)} MB</Text>
              </View>
            )}
          />

          <Text style={styles.sectionTitle}>Auto-Chapter Method:</Text>

          <TouchableOpacity
            style={[styles.button, styles.methodButton]}
            onPress={() => processFiles('silence')}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>Detect Silence</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.methodButton]}
            onPress={() => processFiles('time')}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>Equal Time Split</Text>
          </TouchableOpacity>

          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.processingText}>Processing audio...</Text>
              <Text style={styles.progressText}>{processingProgress}%</Text>
            </View>
          )}
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fileListContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  fileItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fileName: {
    fontSize: 16,
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
  },
  methodButton: {
    marginTop: 10,
  },
  processingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
});
