import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const RecordButton = ({ onPress, isRecording }) => {
  return (
    <TouchableOpacity
      style={[styles.button, isRecording ? styles.recording : null]}
      onPress={onPress}
    >
      <Text style={styles.text}>{isRecording ? 'Stop' : 'Record'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
  },
  recording: {
    backgroundColor: '#F44336',
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});

export default RecordButton;
