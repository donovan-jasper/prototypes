import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ isPlaying, onPlayPause, onStop }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.controlButton} onPress={onStop}>
        <Ionicons name="stop" size={24} color="#000000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={32}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton}>
        <Ionicons name="volume-high" size={24} color="#000000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 50,
  },
});

export default PlayerControls;
