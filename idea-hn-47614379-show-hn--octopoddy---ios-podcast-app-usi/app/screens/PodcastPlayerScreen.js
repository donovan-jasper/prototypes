import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { detectAd, getAdSegments } from '../utils/adDetection';

const PodcastPlayerScreen = ({ route }) => {
  const { episode } = route.params;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [adSegments, setAdSegments] = useState([]);
  const [isAdDetecting, setIsAdDetecting] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: episode.audioUrl },
        { shouldPlay: false }
      );
      setSound(newSound);

      // Get duration
      const status = await newSound.getStatusAsync();
      setDuration(status.durationMillis || 0);

      // Check for existing ad segments
      const segments = await getAdSegments(episode.id);
      setAdSegments(segments);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
    }
  };

  const playPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      await sound.playAsync();
      setIsPlaying(true);

      // Update position every second
      intervalRef.current = setInterval(async () => {
        const status = await sound.getStatusAsync();
        setPosition(status.positionMillis || 0);

        // Check if current position is in an ad segment
        if (status.isPlaying) {
          const currentPos = status.positionMillis;
          const isInAd = adSegments.some(segment =>
            currentPos >= segment.start && currentPos <= segment.end
          );

          if (isInAd) {
            // Skip the ad
            await sound.setPositionAsync(adSegments.find(seg =>
              currentPos >= seg.start && currentPos <= seg.end
            ).end + 100); // Add small buffer
          }
        }
      }, 1000);
    }
  };

  const detectAds = async () => {
    setIsAdDetecting(true);
    try {
      const detectedSegments = await detectAd(episode);
      setAdSegments(detectedSegments);
    } catch (error) {
      console.error('Error detecting ads:', error);
    } finally {
      setIsAdDetecting(false);
    }
  };

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{episode.title}</Text>
      <Text style={styles.podcastName}>{episode.podcastName}</Text>

      <View style={styles.progressContainer}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${(position / duration) * 100}%` }]} />
        </View>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={playPause}>
          <Text style={styles.controlText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.adButton]}
          onPress={detectAds}
          disabled={isAdDetecting}
        >
          {isAdDetecting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.controlText}>Detect Ads</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.adInfo}>
        <Text style={styles.adCount}>Detected Ads: {adSegments.length}</Text>
        {adSegments.map((segment, index) => (
          <Text key={index} style={styles.adSegment}>
            Ad {index + 1}: {formatTime(segment.start)} - {formatTime(segment.end)}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  podcastName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  time: {
    fontSize: 14,
    color: '#333',
    width: 50,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  adButton: {
    backgroundColor: '#FF3B30',
  },
  controlText: {
    color: 'white',
    fontSize: 16,
  },
  adInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  adCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  adSegment: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
});

export default PodcastPlayerScreen;
