import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

const VoicePlayer = ({ text, voice, isPlaying: initialIsPlaying, onPlaybackStatusUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(initialIsPlaying || false);

  useEffect(() => {
    if (initialIsPlaying) {
      playNarration();
    }
  }, [initialIsPlaying]);

  const playNarration = () => {
    if (text) {
      setIsPlaying(true);
      Speech.speak(text, {
        language: 'en-US',
        voice: voice || 'com.apple.ttsbundle.siri_female_en-US_compact',
        onDone: () => {
          setIsPlaying(false);
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({ isLoaded: true, didJustFinish: true });
          }
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsPlaying(false);
        }
      });
    }
  };

  const stopNarration = () => {
    Speech.stop();
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopNarration();
    } else {
      playNarration();
    }
  };

  return (
    <View style={styles.container} testID="voice-player">
      <TouchableOpacity onPress={togglePlayback} style={styles.button}>
        <Ionicons
          name={isPlaying ? 'pause-circle' : 'play-circle'}
          size={32}
          color="#fff"
        />
        <Text style={styles.buttonText}>
          {isPlaying ? 'Pause' : 'Play'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a4a4a',
    padding: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
});

export default VoicePlayer;
