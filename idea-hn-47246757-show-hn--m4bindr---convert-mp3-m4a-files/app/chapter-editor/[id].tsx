import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAudiobookById } from '@/lib/db/audiobooks';
import { getChaptersByAudiobookId } from '@/lib/db/chapters';
import ChapterEditor from '@/components/ChapterEditor';

export default function ChapterEditorScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [audiobook, setAudiobook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileUris, setFileUris] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const book = await getAudiobookById(id);
        setAudiobook(book);

        // Parse file URIs from JSON
        try {
          const uris = JSON.parse(book.filePath);
          setFileUris(Array.isArray(uris) ? uris : [book.filePath]);
        } catch {
          setFileUris([book.filePath]);
        }

        const chapterList = await getChaptersByAudiobookId(id);
        setChapters(chapterList);
      } catch (error) {
        console.error('Error loading audiobook data:', error);
        Alert.alert('Error', 'Failed to load audiobook data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSave = () => {
    router.push(`/audiobook/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading chapters...</Text>
      </View>
    );
  }

  if (!audiobook) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Audiobook not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{audiobook.title}</Text>
        <Text style={styles.subtitle}>Edit chapters before saving</Text>
        {fileUris.length > 1 && (
          <Text style={styles.fileInfo}>
            Merging {fileUris.length} audio files
          </Text>
        )}
      </View>
      <ChapterEditor
        audiobookId={audiobook.id}
        initialChapters={chapters}
        audioFilePath={fileUris[0]}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  fileInfo: {
    fontSize: 12,
    color: '#007AFF',
  },
});
