import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useSleepStore } from '../../store/useSleepStore';
import { Ionicons } from '@expo/vector-icons';

export default function TonightScreen() {
  const router = useRouter();
  const { currentContent, isPlaying, togglePlayback } = usePlayerStore();
  const { sleepStage, startSleepSession } = useSleepStore();

  useEffect(() => {
    if (!currentContent) {
      // Load default content if none is selected
      usePlayerStore.getState().loadContent('story-1');
    }
  }, [currentContent]);

  const handleStartSession = () => {
    startSleepSession();
    if (!isPlaying) {
      togglePlayback();
    }
    router.push('/player');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tonight</Text>
        <Text style={styles.subtitle}>Your sleep session</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.currentContent}>
          {currentContent?.title || 'No content selected'}
        </Text>
        <Text style={styles.sleepStage}>Current sleep stage: {sleepStage}</Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartSession}
        >
          <Ionicons name="play" size={24} color="white" />
          <Text style={styles.startButtonText}>Start Sleep Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentContent: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
  },
  sleepStage: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 30,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
