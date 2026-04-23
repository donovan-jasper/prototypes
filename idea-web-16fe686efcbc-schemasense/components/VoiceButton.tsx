import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useVoiceRecognition } from '../lib/voice';

interface VoiceButtonProps {
  onTranscription: (text: string) => void;
}

export const VoiceButton = ({ onTranscription }: VoiceButtonProps) => {
  const { recording, transcription, startRecording, stopRecording, isRecording } = useVoiceRecognition();

  React.useEffect(() => {
    if (transcription.isFinal && transcription.text) {
      onTranscription(transcription.text);
    }
  }, [transcription]);

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      <View style={styles.button}>
        <MaterialIcons
          name={isRecording ? 'mic' : 'mic-none'}
          size={24}
          color={isRecording ? '#FF3B30' : '#007AFF'}
        />
        {isRecording && (
          <View style={styles.recordingIndicator} />
        )}
      </View>
      {transcription.text && (
        <Text style={styles.transcriptionText} numberOfLines={1}>
          {transcription.text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  recordingIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#FF3B30',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  transcriptionText: {
    flex: 1,
    color: '#333',
    fontSize: 14,
  },
});
