import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { getAudiobookById, updateProgress } from '@/lib/db/audiobooks';
import { getChaptersByAudiobookId } from '@/lib/db/chapters';
import PlayerControls from '@/components/PlayerControls';

export default function AudiobookScreen() {
  const { id } = useLocalSearchParams();
  const [audiobook, setAudiobook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fileUris, setFileUris] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [fileDurations, setFileDurations] = useState([]);

  useEffect(() => {
    const loadAudiobook = async () => {
      const book = await getAudiobookById(id);
      setAudiobook(book);
      setPosition(book.currentPosition || 0);
      setDuration(book.duration);

      // Parse file URIs from JSON
      try {
        const uris = JSON.parse(book.filePath);
        setFileUris(Array.isArray(uris) ? uris : [book.filePath]);
      } catch {
        setFileUris([book.filePath]);
      }

      const chapterList = await getChaptersByAudiobookId(id);
      setChapters(chapterList);
    };
    loadAudiobook();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  useEffect(() => {
    if (fileUris.length > 0) {
      loadCurrentFile();
    }
  }, [fileUris, currentFileIndex]);

  const loadCurrentFile = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUris[currentFileIndex] },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      
      const status = await newSound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        const newDurations = [...fileDurations];
        newDurations[currentFileIndex] = status.durationMillis;
        setFileDurations(newDurations);
      }
    } catch (error) {
      console.error('Error loading audio file:', error);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };

  const onPlaybackStatusUpdate = async (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);

      // Check if current file finished and move to next
      if (status.didJustFinish && currentFileIndex < fileUris.length - 1) {
        setCurrentFileIndex(currentFileIndex + 1);
        setIsPlaying(false);
      } else if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const playPause = async () => {
    if (!sound) {
      await loadCurrentFile();
    }

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const skipForward = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        const newPosition = Math.min(position + 15000, status.durationMillis);
        await sound.setPositionAsync(newPosition);
        setPosition(newPosition);
      }
    }
  };

  const skipBackward = async () => {
    if (sound) {
      const newPosition = Math.max(position - 15000, 0);
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const jumpToChapter = async (chapter) => {
    if (sound) {
      await sound.setPositionAsync(chapter.startTime);
      setPosition(chapter.startTime);
    }
  };

  useEffect(() => {
    if (audiobook && position > 0) {
      updateProgress(audiobook.id, position);
    }
  }, [position]);

  if (!audiobook) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{audiobook.title}</Text>
      <Text style={styles.author}>{audiobook.author}</Text>
      
      {fileUris.length > 1 && (
        <Text style={styles.fileInfo}>
          Playing file {currentFileIndex + 1} of {fileUris.length}
        </Text>
      )}

      <PlayerControls
        isPlaying={isPlaying}
        position={position}
        duration={duration}
        onPlayPause={playPause}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
      />

      <Text style={styles.chaptersTitle}>Chapters</Text>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chapterItem}
            onPress={() => jumpToChapter(item)}
          >
            <Text style={styles.chapterTitle}>{item.title}</Text>
            <Text style={styles.chapterTime}>{formatTime(item.startTime)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const formatTime = (millis) => {
  const hours = Math.floor(millis / 3600000);
  const minutes = Math.floor((millis % 3600000) / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  author: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  fileInfo: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 20,
  },
  chaptersTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  chapterItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chapterTitle: {
    fontSize: 16,
  },
  chapterTime: {
    fontSize: 14,
    color: '#666',
  },
});
