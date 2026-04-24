import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { detectChaptersByTime, detectChaptersBySilence } from '@/lib/audio/chapterDetector';
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
  const [chapterMethod, setChapterMethod] = useState<'time' | 'silence'>('time');
  const [chapterCount, setChapterCount] = useState(4);
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
          name: asset.name || 'Unknown',
          size: asset.size || 0,
          duration: 0, // Will be calculated after processing
        }));
        setFiles(audioFiles);
      }
    } catch (error) {
      console.error('Error picking files:', error);
    }
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);

    try {
      // For simplicity, we'll process the first file only
      const file = files[0];

      // Get duration (simplified - in a real app you'd use FFprobe)
      const duration = 3600000; // Default to 1 hour (60 minutes in ms)

      let chapters;
      if (chapterMethod === 'time') {
        chapters = detectChaptersByTime(duration, chapterCount);
      } else {
        chapters = await detectChaptersBySilence(file.uri);
      }

      // Create audiobook in database
      const audiobook = await createAudiobook({
        title: file.name.replace(/\.[^/.]+$/, ""),
        author: 'Unknown',
        duration: duration,
        filePath: file.uri,
        coverArt: null,
        currentPosition: 0,
      });

      // Save chapters
      await createChapters(audiobook.id, chapters);

      // Navigate to chapter editor
      router.push({
        pathname: '/audiobook/[id]',
        params: { id: audiobook.id },
      });

    } catch (error) {
      console.error('Error processing files:', error);
      alert('Failed to process audio files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFileItem = ({ item }: { item: AudioFile }) => (
    <View style={styles.fileItem}>
      <Text style={styles.fileName}>{item.name}</Text>
      <Text style={styles.fileSize}>{(item.size / (1024 * 1024)).toFixed(2)} MB</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Audio Files</Text>

      <TouchableOpacity style={styles.button} onPress={pickFiles}>
        <Text style={styles.buttonText}>Select Audio Files</Text>
      </TouchableOpacity>

      {files.length > 0 && (
        <>
          <FlatList
            data={files}
            renderItem={renderFileItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.fileList}
          />

          <View style={styles.chapterOptions}>
            <Text style={styles.sectionTitle}>Chapter Detection Method</Text>

            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setChapterMethod('time')}
              >
                <View style={[
                  styles.radioCircle,
                  chapterMethod === 'time' && styles.radioCircleSelected
                ]} />
                <Text style={styles.radioLabel}>Equal Time Splits</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setChapterMethod('silence')}
              >
                <View style={[
                  styles.radioCircle,
                  chapterMethod === 'silence' && styles.radioCircleSelected
                ]} />
                <Text style={styles.radioLabel}>Silence Detection</Text>
              </TouchableOpacity>
            </View>

            {chapterMethod === 'time' && (
              <View style={styles.chapterCount}>
                <Text style={styles.label}>Number of Chapters:</Text>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setChapterCount(Math.max(1, chapterCount - 1))}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{chapterCount}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setChapterCount(chapterCount + 1)}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, styles.processButton]}
            onPress={processFiles}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Process Files</Text>
            )}
          </TouchableOpacity>
        </>
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
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileList: {
    marginBottom: 20,
    maxHeight: 200,
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
  chapterOptions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  radioGroup: {
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6200ee',
    marginRight: 10,
  },
  radioCircleSelected: {
    backgroundColor: '#6200ee',
  },
  radioLabel: {
    fontSize: 16,
  },
  chapterCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  label: {
    fontSize: 16,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 18,
    marginHorizontal: 15,
  },
  processButton: {
    marginTop: 20,
  },
});
