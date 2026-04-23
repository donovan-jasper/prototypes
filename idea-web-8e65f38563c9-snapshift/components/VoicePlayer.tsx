import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { VoiceClip } from '../types';

interface VoicePlayerProps {
  clip: VoiceClip;
  isPremiumUser: boolean;
  onUpgradePress: () => void;
  onPlaybackStatusUpdate?: (status: any) => void;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({
  clip,
  isPremiumUser,
  onUpgradePress,
  onPlaybackStatusUpdate
}) => {
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
    if (!isPremiumUser && clip.isPremium) {
      return;
    }

    setIsLoading(true);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require(`../assets/voices/${clip.audioFile}`),
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
    if (!isPremiumUser && clip.isPremium) {
      onUpgradePress();
      return;
    }

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

  if (!isPremiumUser && clip.isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <View style={styles.lockIconContainer}>
          <Ionicons name="lock-closed" size={24} color="#FFD700" />
        </View>
        <View style={styles.clipInfo}>
          <Text style={styles.title}>{clip.title}</Text>
          <Text style={styles.category}>{clip.category} • {clip.intensity}</Text>
        </View>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={onUpgradePress}
        >
          <Text style={styles.upgradeButtonText}>Upgrade to Unlock</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.clipHeader}>
        <Text style={styles.title}>{clip.title}</Text>
        {clip.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        )}
      </View>
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
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    opacity: 0.8,
  },
  lockIconContainer: {
    marginRight: 12,
  },
  clipInfo: {
    flex: 1,
  },
  clipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 12,
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
  upgradeButton: {
    backgroundColor: '#673ab7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default VoicePlayer;
