import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVoiceRecognition } from '../lib/voice';
import { useQuery } from '../hooks/useQuery';
import { useDatabase } from '../hooks/useDatabase';

const VoiceButton = () => {
  const { isRecording, startRecording, stopRecording, transcription, isOfflineMode } = useVoiceRecognition();
  const { executeQuery } = useQuery();
  const { currentDatabase } = useDatabase();

  const handlePress = async () => {
    if (isRecording) {
      await stopRecording();
      if (transcription.text && currentDatabase) {
        try {
          // Execute the transcribed query
          const results = await executeQuery(currentDatabase.id, transcription.text);
          // You might want to show results or speak them here
        } catch (error) {
          console.error('Query execution failed:', error);
        }
      }
    } else {
      await startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isRecording ? styles.recording : null,
          isOfflineMode ? styles.offline : null
        ]}
        onPress={handlePress}
        disabled={!currentDatabase}
      >
        {isRecording ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <MaterialCommunityIcons
            name="microphone"
            size={24}
            color={isOfflineMode ? '#FF9800' : '#fff'}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 100,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recording: {
    backgroundColor: '#FF3D00',
  },
  offline: {
    backgroundColor: '#FF9800',
  },
});

export default VoiceButton;
