import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { getChapters, updateChapter, deleteChapter, createChapter } from '@/lib/db/chapters';
import { getAudiobook, updateAudiobook } from '@/lib/db/audiobooks';
import { mergeAudioFiles, embedChapters } from '@/lib/audio/processor';
import { useRouter } from 'expo-router';

interface Chapter {
  id: number;
  title: string;
  startTime: number;
  endTime: number;
  order: number;
}

interface ChapterEditorProps {
  audiobookId: number;
}

export default function ChapterEditor({ audiobookId }: ChapterEditorProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [audiobook, setAudiobook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const router = useRouter();
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const book = await getAudiobook(audiobookId);
      const chapterList = await getChapters(audiobookId);

      setAudiobook(book);
      setChapters(chapterList.sort((a, b) => a.order - b.order));
      setIsLoading(false);

      // Load audio for preview
      await loadAudio(book.filePath);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  const loadAudio = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      setSound(sound);

      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded) {
          setCurrentPosition(status.positionMillis || 0);
        }
      });
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    } else {
      await sound.playAsync();
      setIsPlaying(true);

      // Update position every 100ms
      playbackInterval.current = setInterval(async () => {
        if (sound) {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            setCurrentPosition(status.positionMillis || 0);
          }
        }
      }, 100);
    }
  };

  const seekTo = async (position: number) => {
    if (sound) {
      await sound.setPositionAsync(position);
      setCurrentPosition(position);
    }
  };

  const handleChapterChange = (id: number, field: 'title' | 'startTime' | 'endTime', value: string | number) => {
    setChapters(prev => prev.map(chapter =>
      chapter.id === id ? { ...chapter, [field]: value } : chapter
    ));
  };

  const saveChapter = async (chapter: Chapter) => {
    try {
      await updateChapter(chapter);
    } catch (error) {
      console.error('Error saving chapter:', error);
    }
  };

  const addChapter = async () => {
    try {
      const newChapter = {
        audiobookId,
        title: `Chapter ${chapters.length + 1}`,
        startTime: currentPosition,
        endTime: currentPosition + 30000, // Default 30 seconds
        order: chapters.length,
      };

      const createdChapter = await createChapter(newChapter);
      setChapters([...chapters, createdChapter]);
    } catch (error) {
      console.error('Error adding chapter:', error);
    }
  };

  const removeChapter = async (id: number) => {
    try {
      await deleteChapter(id);
      setChapters(prev => prev.filter(chapter => chapter.id !== id));
    } catch (error) {
      console.error('Error removing chapter:', error);
    }
  };

  const saveAudiobook = async () => {
    if (!audiobook) return;

    setIsSaving(true);

    try {
      // Sort chapters by start time
      const sortedChapters = [...chapters].sort((a, b) => a.startTime - b.startTime);

      // Update chapter orders based on sorted position
      const updatedChapters = sortedChapters.map((chapter, index) => ({
        ...chapter,
        order: index,
      }));

      // Save all chapters
      for (const chapter of updatedChapters) {
        await updateChapter(chapter);
      }

      // Update audiobook duration if needed
      if (updatedChapters.length > 0) {
        const lastChapter = updatedChapters[updatedChapters.length - 1];
        await updateAudiobook(audiobook.id, {
          duration: lastChapter.endTime,
        });
      }

      // Merge and embed chapters (if needed)
      // This would be more complex in a real implementation
      // For now we'll just navigate back to the player

      router.push({
        pathname: '/audiobook/[id]',
        params: { id: audiobook.id },
      });
    } catch (error) {
      console.error('Error saving audiobook:', error);
      alert('Failed to save audiobook. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading audiobook data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Chapters</Text>

      {/* Audio Player Controls */}
      <View style={styles.playerControls}>
        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
          <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
        <Text style={styles.positionText}>
          {formatTime(currentPosition)} / {formatTime(audiobook?.duration || 0)}
        </Text>
      </View>

      {/* Chapter List */}
      <ScrollView style={styles.chapterList}>
        {chapters.map((chapter, index) => (
          <View key={chapter.id} style={styles.chapterItem}>
            <TextInput
              style={styles.chapterTitle}
              value={chapter.title}
              onChangeText={(text) => handleChapterChange(chapter.id, 'title', text)}
              onBlur={() => saveChapter(chapter)}
            />

            <View style={styles.timeControls}>
              <TextInput
                style={styles.timeInput}
                value={formatTime(chapter.startTime)}
                onChangeText={(text) => {
                  const time = parseTime(text);
                  handleChapterChange(chapter.id, 'startTime', time);
                }}
                onBlur={() => saveChapter(chapter)}
              />
              <Text> - </Text>
              <TextInput
                style={styles.timeInput}
                value={formatTime(chapter.endTime)}
                onChangeText={(text) => {
                  const time = parseTime(text);
                  handleChapterChange(chapter.id, 'endTime', time);
                }}
                onBlur={() => saveChapter(chapter)}
              />
            </View>

            <View style={styles.chapterActions}>
              <TouchableOpacity
                style={styles.seekButton}
                onPress={() => seekTo(chapter.startTime)}
              >
                <Text style={styles.seekButtonText}>Go to Start</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.seekButton, styles.deleteButton]}
                onPress={() => removeChapter(chapter.id)}
              >
                <Text style={styles.seekButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addChapter}>
          <Text style={styles.addButtonText}>+ Add Chapter</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.disabledButton]}
        onPress={saveAudiobook}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Audiobook</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

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

const parseTime = (timeString: string) => {
  const parts = timeString.split(':').map(Number);

  if (parts.length === 3) {
    // HH:MM:SS
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  } else if (parts.length === 2) {
    // MM:SS
    return (parts[0] * 60 + parts[1]) * 1000;
  } else {
    // SS
    return parts[0] * 1000;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  playButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  playButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  positionText: {
    fontSize: 16,
  },
  chapterList: {
    flex: 1,
  },
  chapterItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeInput: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    minWidth: 80,
    textAlign: 'center',
  },
  chapterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seekButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
  },
  seekButtonText: {
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  addButton: {
    backgroundColor: '#4CD964',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
