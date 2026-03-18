import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStore } from '../lib/store';
import { startRecording, stopRecording } from '../lib/video';

const PlaybackControls = ({ canvasRef }) => {
  const { isPlaying, togglePlay } = useStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);

  const handleRecord = async () => {
    if (isRecording) {
      const uri = await stopRecording(recording);
      setIsRecording(false);
      // Handle saved video URI
    } else {
      const newRecording = await startRecording(canvasRef);
      setRecording(newRecording);
      setIsRecording(true);
    }
  };

  const handleReset = () => {
    if (canvasRef.current && canvasRef.current.reset) {
      canvasRef.current.reset();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={togglePlay}>
        <MaterialIcons
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={24}
          color="white"
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <MaterialIcons name="replay" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, isRecording && styles.recordingButton]}
        onPress={handleRecord}
      >
        <MaterialIcons name="fiber-manual-record" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#ff0000',
  },
});

export default PlaybackControls;
