import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
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

  useEffect(() => {
    const loadAudiobook = async () => {
      const book = await getAudiobookById(id);
      setAudiobook(book);
      setPosition(book.currentPosition || 0);

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

  const loadAudio = async () => {
    if (!audiobook) return;

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audiobook.filePath },
      { positionMillis: position },
      onPlaybackStatusUpdate
    );
    setSound(newSound);
    setDuration(audiobook.duration);
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const playPause = async () => {
    if (!sound) {
      await loadAudio();
    }

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const skipForward = async () => {
    if (sound) {
      const newPosition = Math.min(position + 15000, duration);
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
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

      <PlayerControls
        isPlaying={isPlaying}
        position={position}
        duration={duration}
        onPlayPause={playPause}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
      />

      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chapterItem}
            onPress={() => jumpToChapter(item)}
          >
            <Text>{item.title}</Text>
            <Text>{formatTime(item.startTime)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const formatTime = (millis) => {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
    marginBottom: 20,
  },
  chapterItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
