import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import PlayerControls from '../components/PlayerControls';
import { usePlayerStore } from '../store/usePlayerStore';
import { useSleepStore } from '../store/useSleepStore';
import { Ionicons } from '@expo/vector-icons';

export default function PlayerScreen() {
  const router = useRouter();
  const { currentContent, isPlaying, togglePlayback, stopPlayback } = usePlayerStore();
  const { sleepStage, sleepTimer, startSleepSession, stopSleepSession } = useSleepStore();

  useEffect(() => {
    if (!currentContent) {
      router.back();
    }

    // Start sleep session if not already started
    if (!sleepTimer) {
      startSleepSession();
    }

    return () => {
      // Clean up when leaving the screen
      stopSleepSession();
    };
  }, []);

  const handleBackPress = () => {
    stopPlayback();
    stopSleepSession();
    router.back();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-down" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
      </View>

      <View style={styles.contentContainer}>
        <Image
          source={{ uri: currentContent?.image || 'https://via.placeholder.com/300' }}
          style={styles.contentImage}
        />
        <Text style={styles.contentTitle}>{currentContent?.title}</Text>
        <Text style={styles.contentSubtitle}>DriftWave</Text>

        <View style={styles.sleepInfo}>
          <Text style={styles.sleepStage}>Sleep Stage: {sleepStage}</Text>
          <Text style={styles.sleepTimer}>Time: {formatTime(sleepTimer)}</Text>
        </View>
      </View>

      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={togglePlayback}
        onStop={handleBackPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 24,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  sleepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sleepStage: {
    fontSize: 16,
    color: '#000000',
  },
  sleepTimer: {
    fontSize: 16,
    color: '#000000',
  },
});
