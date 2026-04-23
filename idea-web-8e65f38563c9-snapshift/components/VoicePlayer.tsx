import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { VoiceClip } from '../types';

interface VoicePlayerProps {
  clip: VoiceClip;
  onPlaybackStatusUpdate?: (status: any) => void;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({ clip, onPlaybackStatusUpdate }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(clip.duration * 1000);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async () => {
    setIsLoading(true);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `../assets/voices/${clip.audioFile}` },
        { shouldPlay: true },
        onPlaybackStatusUpdate || handlePlaybackStatusUpdate
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading sound', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis || clip.duration * 1000);
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const togglePlayback = async () => {
    if (!sound) {
      await loadSound();
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{clip.title}</Text>
        <Text style={styles.category}>{clip.category}</Text>
        {clip.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="lock-closed" size={12} color="#FFD700" />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={togglePlayback} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={48}
              color="#4CAF50"
            />
          )}
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(playbackPosition)}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(playbackPosition / playbackDuration) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666666',
    textTransform: 'capitalize',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
});

export default VoicePlayer;
