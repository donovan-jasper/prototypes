import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { detectChaptersByTime } from '@/lib/audio/chapterDetector';
import { createAudiobook } from '@/lib/db/audiobooks';
import { createChapters } from '@/lib/db/chapters';

export default function ImportScreen() {
  const [files, setFiles] = useState([]);
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
    }
  };

  const autoChapter = async () => {
    if (files.length === 0) return;

    const audiobook = await createAudiobook({
      title: 'New Audiobook',
      author: 'Unknown',
      duration: 0, // Will be updated after processing
      filePath: files[0].uri,
    });

    const chapters = detectChaptersByTime(3600, 4); // Example: 1-hour audio split into 4 chapters
    await createChapters(audiobook.id, chapters);

    router.push(`/audiobook/${audiobook.id}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickFiles}>
        <Text style={styles.buttonText}>Select Audio Files</Text>
      </TouchableOpacity>

      <FlatList
        data={files}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.fileItem}>
            <Text>{item.name}</Text>
          </View>
        )}
      />

      {files.length > 0 && (
        <TouchableOpacity style={styles.button} onPress={autoChapter}>
          <Text style={styles.buttonText}>Auto-Chapter</Text>
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
  },
  fileItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
