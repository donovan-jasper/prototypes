import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { detectChaptersBySilence, detectChaptersByTime } from '@/lib/audio/chapterDetector';
import { useAudiobooks } from '@/hooks/useAudiobooks';
import { Chapter } from '@/lib/db/schema';
import { useRouter } from 'expo-router';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';

interface ChapterEditorProps {
  filePath: string;
  fileName: string;
  duration: number;
}

const ChapterEditor: React.FC<ChapterEditorProps> = ({ filePath, fileName, duration }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audiobookTitle, setAudiobookTitle] = useState(fileName.replace(/\.[^/.]+$/, ''));
  const [author, setAuthor] = useState('');
  const { addAudiobook } = useAudiobooks();
  const router = useRouter();
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const detectChapters = async () => {
      try {
        setIsLoading(true);
        // Try silence detection first
        let detectedChapters = await detectChaptersBySilence(filePath);

        // If silence detection didn't find any chapters, fall back to time-based
        if (detectedChapters.length === 0) {
          detectedChapters = detectChaptersByTime(duration, 4);
        }

        setChapters(detectedChapters);
      } catch (err) {
        console.error('Chapter detection error:', err);
        setError('Failed to detect chapters. Using default time-based chapters.');
        // Fallback to time-based chapters
        setChapters(detectChaptersByTime(duration, 4));
      } finally {
        setIsLoading(false);
      }
    };

    detectChapters();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [filePath, duration]);

  const handleChapterTitleChange = (index: number, title: string) => {
    const updatedChapters = [...chapters];
    updatedChapters[index].title = title;
    setChapters(updatedChapters);
  };

  const handleSaveAudiobook = async () => {
    try {
      setIsLoading(true);

      // Create a new audiobook with chapters
      const newAudiobook = await addAudiobook({
        title: audiobookTitle,
        author: author || 'Unknown',
        duration: duration,
        filePath: filePath,
        chapters: chapters,
      });

      // Navigate to the player screen
      router.push(`/audiobook/${newAudiobook.id}`);
    } catch (err) {
      console.error('Error saving audiobook:', err);
      setError('Failed to save audiobook. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Detecting chapters...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={handleSaveAudiobook}>
          <Text style={styles.buttonText}>Continue Anyway</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Chapters</Text>
        <Text style={styles.fileName}>{fileName}</Text>
      </View>

      <View style={styles.metadataSection}>
        <Text style={styles.sectionTitle}>Audiobook Info</Text>
        <TextInput
          style={styles.input}
          placeholder="Audiobook Title"
          value={audiobookTitle}
          onChangeText={setAudiobookTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Author (optional)"
          value={author}
          onChangeText={setAuthor}
        />
      </View>

      <View style={styles.chaptersSection}>
        <Text style={styles.sectionTitle}>Chapters</Text>
        {chapters.map((chapter, index) => (
          <View key={index} style={styles.chapterItem}>
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterNumber}>Chapter {index + 1}</Text>
              <Text style={styles.chapterTime}>
                {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
              </Text>
            </View>
            <TextInput
              style={styles.chapterTitleInput}
              value={chapter.title}
              onChangeText={(text) => handleChapterTitleChange(index, text)}
              placeholder={`Chapter ${index + 1}`}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveAudiobook}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Audiobook</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fileName: {
    fontSize: 16,
    color: '#666',
  },
  metadataSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  chaptersSection: {
    marginBottom: 24,
  },
  chapterItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  chapterTime: {
    fontSize: 14,
    color: '#666',
  },
  chapterTitleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChapterEditor;
