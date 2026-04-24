import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAudiobook } from '@/lib/db/audiobooks';
import { getChapters, updateChapter, deleteChapter, createChapter } from '@/lib/db/chapters';
import { Audio } from 'expo-av';

interface Chapter {
  id?: number;
  title: string;
  startTime: number;
  endTime: number;
}

interface Audiobook {
  id: number;
  title: string;
  author: string;
  duration: number;
  filePath: string;
}

export default function ChapterEditor() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [audiobook, setAudiobook] = useState<Audiobook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (typeof id === 'string') {
          const bookId = parseInt(id);
          const book = await getAudiobook(bookId);
          const chapterList = await getChapters(bookId);

          setAudiobook(book);
          setChapters(chapterList);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  const loadAudio = async () => {
    if (!audiobook) return;

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audiobook.filePath },
        { shouldPlay: false }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setIsPlaying(status.isPlaying);
        }
      });
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const playAudio = async () => {
    if (sound) {
      await sound.playAsync();
    } else {
      await loadAudio();
      if (sound) {
        await sound.playAsync();
      }
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
  };

  const seekTo = async (time: number) => {
    if (sound) {
      await sound.setPositionAsync(time);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleChapterChange = (index: number, field: 'title' | 'startTime' | 'endTime', value: string | number) => {
    const updatedChapters = [...chapters];
    if (field === 'title') {
      updatedChapters[index].title = value as string;
    } else if (field === 'startTime') {
      updatedChapters[index].startTime = Number(value);
    } else if (field === 'endTime') {
      updatedChapters[index].endTime = Number(value);
    }
    setChapters(updatedChapters);
  };

  const saveChapters = async () => {
    if (!audiobook) return;

    try {
      // Update existing chapters and create new ones
      for (const chapter of chapters) {
        if (chapter.id) {
          await updateChapter(chapter.id, chapter);
        } else {
          await createChapter(audiobook.id, chapter);
        }
      }

      // Navigate back to player
      router.push({
        pathname: '/audiobook/[id]',
        params: { id: audiobook.id },
      });
    } catch (error) {
      console.error('Error saving chapters:', error);
      alert('Failed to save chapters. Please try again.');
    }
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      title: `Chapter ${chapters.length + 1}`,
      startTime: chapters.length > 0 ? chapters[chapters.length - 1].endTime : 0,
      endTime: chapters.length > 0 ? chapters[chapters.length - 1].endTime + 30000 : 30000,
    };
    setChapters([...chapters, newChapter]);
  };

  const removeChapter = async (index: number) => {
    const chapterToRemove = chapters[index];
    if (chapterToRemove.id) {
      try {
        await deleteChapter(chapterToRemove.id);
      } catch (error) {
        console.error('Error deleting chapter:', error);
        alert('Failed to delete chapter. Please try again.');
      }
    }

    const updatedChapters = [...chapters];
    updatedChapters.splice(index, 1);
    setChapters(updatedChapters);
  };

  const renderChapterItem = ({ item, index }: { item: Chapter; index: number }) => (
    <View style={styles.chapterItem}>
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterTitle}>Chapter {index + 1}</Text>
        <TouchableOpacity onPress={() => removeChapter(index)}>
          <Text style={styles.removeButton}>Remove</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        value={item.title}
        onChangeText={(text) => handleChapterChange(index, 'title', text)}
        placeholder="Chapter title"
      />

      <View style={styles.timeInputs}>
        <View style={styles.timeInput}>
          <Text style={styles.label}>Start Time (ms):</Text>
          <TextInput
            style={styles.input}
            value={item.startTime.toString()}
            onChangeText={(text) => handleChapterChange(index, 'startTime', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.timeInput}>
          <Text style={styles.label}>End Time (ms):</Text>
          <TextInput
            style={styles.input}
            value={item.endTime.toString()}
            onChangeText={(text) => handleChapterChange(index, 'endTime', text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.timeControls}>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => seekTo(item.startTime)}
        >
          <Text style={styles.timeButtonText}>Go to Start</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => seekTo(item.endTime)}
        >
          <Text style={styles.timeButtonText}>Go to End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading audiobook data...</Text>
      </View>
    );
  }

  if (!audiobook) {
    return (
      <View style={styles.container}>
        <Text>Audiobook not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{audiobook.title}</Text>
      <Text style={styles.author}>{audiobook.author}</Text>

      <View style={styles.playerControls}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={isPlaying ? pauseAudio : playAudio}
        >
          <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
        <Text style={styles.positionText}>{formatTime(position)}</Text>
      </View>

      <FlatList
        data={chapters}
        renderItem={renderChapterItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.chapterList}
      />

      <TouchableOpacity style={styles.addButton} onPress={addChapter}>
        <Text style={styles.addButtonText}>Add Chapter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={saveChapters}>
        <Text style={styles.saveButtonText}>Save Chapters</Text>
      </TouchableOpacity>
    </View>
  );
}

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
    marginBottom: 5,
  },
  author: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
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
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeButton: {
    color: '#ff3b30',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  timeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  timeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    backgroundColor: '#6200ee',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
