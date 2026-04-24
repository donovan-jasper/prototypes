import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { detectAd, getAdSegments } from '../utils/adDetection';
import Slider from '@react-native-community/slider';

const PodcastPlayerScreen = ({ route }) => {
  const { episode } = route.params;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [adSegments, setAdSegments] = useState([]);
  const [isScanningAds, setIsScanningAds] = useState(false);
  const [skipAdsEnabled, setSkipAdsEnabled] = useState(true);
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
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: episode.audioUrl },
        { shouldPlay: false }
      );
      setSound(newSound);

      // Get duration
      const status = await newSound.getStatusAsync();
      setDuration(status.durationMillis || 0);

      // Load existing ad segments
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
      startPositionTracking();
    }
  };

  const startPositionTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (sound) {
        const status = await sound.getStatusAsync();
        setPosition(status.positionMillis || 0);

        // Skip ads if enabled
        if (skipAdsEnabled && status.isPlaying) {
          checkForAds(status.positionMillis);
        }
      }
    }, 1000);
  };

  const checkForAds = async (currentPosition) => {
    const currentSegment = adSegments.find(segment =>
      currentPosition >= segment.start && currentPosition < segment.end
    );

    if (currentSegment && sound) {
      // Skip to end of ad segment
      await sound.setPositionAsync(currentSegment.end / 1000);
      setPosition(currentSegment.end);
    }
  };

  const scanForAds = async () => {
    if (!sound || isScanningAds) return;

    setIsScanningAds(true);
    try {
      const detectedSegments = await detectAd(episode);
      setAdSegments(detectedSegments);
    } catch (error) {
      console.error('Error scanning for ads:', error);
    } finally {
      setIsScanningAds(false);
    }
  };

  const onSliderChange = async (value) => {
    if (!sound) return;

    await sound.setPositionAsync(value / 1000);
    setPosition(value);

    // If we're in an ad segment, skip to end
    if (skipAdsEnabled) {
      checkForAds(value);
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
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading episode...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{episode.title}</Text>
      <Text style={styles.podcastName}>{episode.podcastName}</Text>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={playPause} style={styles.playButton}>
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={scanForAds}
          style={[styles.scanButton, isScanningAds && styles.disabledButton]}
          disabled={isScanningAds}
        >
          <Text style={styles.scanButtonText}>
            {isScanningAds ? 'Scanning...' : 'Scan for Ads'}
          </Text>
        </TouchableOpacity>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Skip Ads:</Text>
          <TouchableOpacity
            onPress={() => setSkipAdsEnabled(!skipAdsEnabled)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleButtonText}>
              {skipAdsEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onValueChange={onSliderChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#007AFF"
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.adInfoContainer}>
        <Text style={styles.adInfoText}>
          {adSegments.length} ad segments detected
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  controlsContainer: {
    marginBottom: 30,
  },
  playButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#4CD964',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  toggleLabel: {
    fontSize: 16,
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  adInfoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  adInfoText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PodcastPlayerScreen;
