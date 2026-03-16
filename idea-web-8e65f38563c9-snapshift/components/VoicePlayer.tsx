import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAudio } from '../hooks/useAudio';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const { playAudio, pauseAudio, stopAudio, playbackStatus } = useAudio();

  useEffect(() => {
    if (playbackStatus) {
      setIsPlaying(playbackStatus.isPlaying);
    }
  }, [playbackStatus]);

  const handlePlayPause = async () => {
    if (isLocked) return;

    if (isPlaying) {
      await pauseAudio();
    } else {
      await playAudio(clip.audioFile);
      onPlay();
    }
  };

  const handleStop = async () => {
    await stopAudio();
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{clip.title}</Text>
        <Text style={styles.category}>{clip.category}</Text>
      </View>
      <View style={styles.controlsContainer}>
        {isLocked ? (
          <Ionicons name="lock-closed" size={24} color="#9e9e9e" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
