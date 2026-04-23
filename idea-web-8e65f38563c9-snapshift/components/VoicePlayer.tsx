import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { VoiceClip } from '../types';
import { SubscriptionContext } from '../context/SubscriptionContext';
import { PremiumGate } from './PremiumGate';

interface VoicePlayerProps {
  clip: VoiceClip;
  onPlaybackStatusUpdate?: (status: any) => void;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({ clip, onPlaybackStatusUpdate }) => {
  const { isFeatureUnlocked } = useContext(SubscriptionContext);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async () => {
    if (!isFeatureUnlocked('fullLibrary') && clip.isPremium) {
      return;
    }

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
      setPlaybackDuration(status.durationMillis || 0);
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

  const renderPlayer = () => (
    <View style={styles.container}>
      <Text style={styles.title}>{clip.title}</Text>
      <Text style={styles.category}>{clip.category} • {clip.intensity}</Text>

      <View style={styles.controls}>
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
                { width: `${(playbackPosition / (playbackDuration || 1)) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <PremiumGate
      feature="fullLibrary"
      renderLocked={() => (
        <View style={styles.lockedContainer}>
          <Text style={styles.title}>{clip.title}</Text>
          <Text style={styles.category}>{clip.category} • {clip.intensity}</Text>
          <Text style={styles.lockedText}>Premium Content</Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade to Unlock</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      {renderPlayer()}
    </PremiumGate>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
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
    color: '#666',
    textAlign: 'right',
  },
  lockedContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedText: {
    fontSize: 14,
    color: '#FF9800',
    marginBottom: 8,
  },
  upgradeButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default VoicePlayer;
