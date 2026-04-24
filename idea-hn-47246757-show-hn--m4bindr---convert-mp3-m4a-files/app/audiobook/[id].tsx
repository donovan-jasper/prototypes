import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlayer } from '@/hooks/usePlayer';
import { State } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useAudiobooks } from '@/hooks/useAudiobooks';

const AudiobookPlayerScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    currentAudiobook,
    currentChapter,
    playbackState,
    position,
    duration,
    speed,
    setupPlayer,
    play,
    pause,
    seekTo,
    setPlaybackSpeed,
    skipToChapter,
    skipForward,
    skipBackward,
    formatTime,
  } = usePlayer();
  const { getAudiobookById } = useAudiobooks();
  const [isLoading, setIsLoading] = useState(true);
  const [showChapters, setShowChapters] = useState(false);

  useEffect(() => {
    const loadAudiobook = async () => {
      if (id) {
        try {
          setIsLoading(true);
          await setupPlayer(Number(id));
        } catch (error) {
          console.error('Error loading audiobook:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAudiobook();
  }, [id]);

  if (isLoading || !currentAudiobook) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading audiobook...</Text>
      </View>
  );
}

  const isPlaying = playbackState === State.Playing;
  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity onPress={() => setShowChapters(!showChapters)}>
          <Ionicons name="list" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Cover Art */}
      <View style={styles.coverContainer}>
        {currentAudiobook.coverArt ? (
          <Image
            source={{ uri: currentAudiobook.coverArt }}
            style={styles.coverArt}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderCover}>
            <Ionicons name="musical-notes" size={64} color="#666" />
          </View>
        )}
      </View>

      {/* Audiobook Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{currentAudiobook.title}</Text>
        <Text style={styles.author}>{currentAudiobook.author}</Text>
        {currentChapter && (
          <Text style={styles.chapterTitle}>{currentChapter.title}</Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#007AFF"
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
          <Ionicons name="play-back" size={24} color="#000" />
          <Text style={styles.controlText}>15s</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={isPlaying ? pause : play}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={32}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
          <Ionicons name="play-forward" size={24} color="#000" />
          <Text style={styles.controlText}>15s</Text>
        </TouchableOpacity>
      </View>

      {/* Speed Control */}
      <View style={styles.speedContainer}>
        <Text style={styles.speedLabel}>Speed: {speed}x</Text>
        <View style={styles.speedButtons}>
          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <TouchableOpacity
              key={rate}
              style={[
                styles.speedButton,
                speed === rate && styles.activeSpeedButton
              ]}
              onPress={() => setPlaybackSpeed(rate)}
            >
              <Text style={[
                styles.speedButtonText,
                speed === rate && styles.activeSpeedButtonText
              ]}>
                {rate}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chapters List */}
      {showChapters && currentAudiobook.chapters && (
        <ScrollView style={styles.chaptersContainer}>
          {currentAudiobook.chapters.map((chapter, index) => (
            <TouchableOpacity
              key={chapter.id}
              style={[
                styles.chapterItem,
                currentChapter?.id === chapter.id && styles.activeChapter
              ]}
              onPress={() => skipToChapter(index)}
            >
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Text style={styles.chapterDuration}>
                  {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                </Text>
              </View>
              {currentChapter?.id === chapter.id && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  coverArt: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  placeholderCover: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  chapterTitle: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedContainer: {
    marginBottom: 24,
  },
  speedLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  speedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  speedButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  activeSpeedButton: {
    backgroundColor: '#007AFF',
  },
  speedButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeSpeedButtonText: {
    color: '#fff',
  },
  chaptersContainer: {
    maxHeight: 200,
    marginTop: 16,
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeChapter: {
    backgroundColor: '#f0f8ff',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default AudiobookPlayerScreen;
