import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface VoicePlayerProps {
  clip: {
    id: string;
    title: string;
    category: string;
    audioFile: string;
    duration: number;
    intensity: string;
    isPremium: boolean;
  };
  onPlay: () => void;
  isLocked?: boolean;
}

export default function VoicePlayer({ clip, onPlay, isLocked = false }: VoicePlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(clip.duration);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAndPlayAudio = async () => {
    if (isLocked) return;

    setIsLoading(true);
    setError(null);

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        require(`../assets/voices/${clip.audioFile}`),
        {
          shouldPlay: true,
          progressUpdateIntervalMillis: 500,
        }
      );

      setSound(newSound);
      setIsPlaying(true);
      onPlay();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis);
          setPlaybackDuration(status.durationMillis || clip.duration * 1000);

          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });
    } catch (err) {
      console.error('Error loading audio:', err);
      setError('Failed to load audio file');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (isLocked) return;

    if (isPlaying) {
      await sound?.pauseAsync();
      setIsPlaying(false);
    } else {
      if (!sound) {
        await loadAndPlayAudio();
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleStop = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPlaybackPosition(0);
    }
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
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.controlsContainer}>
        {isLocked ? (
          <Ionicons name="lock-closed" size={24} color="#9e9e9e" />
        ) : isLoading ? (
          <ActivityIndicator size="small" color="#673ab7" />
        ) : (
          <>
            <TouchableOpacity onPress={handlePlayPause}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color="#673ab7"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleStop}>
              <Ionicons name="stop" size={24} color="#673ab7" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {!isLocked && (
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(playbackPosition)}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(playbackPosition / playbackDuration) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  errorText: {
    fontSize: 14,
    color: '#e53935',
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#673ab7',
    borderRadius: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#9e9e9e',
  },
});
