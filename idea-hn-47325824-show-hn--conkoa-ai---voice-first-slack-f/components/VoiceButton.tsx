import { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { startRecording, stopRecording, transcribeAudio } from '../lib/voice';

export default function VoiceButton({ onTranscript, disabled }: { onTranscript: (text: string, audioUri?: string) => void, disabled?: boolean }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handlePress = async () => {
    if (disabled || isTranscribing) return; // Prevent interaction if disabled or already transcribing

    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true); // Indicate that transcription is starting
      const uri = await stopRecording();
      
      if (uri) {
        try {
          const { text } = await transcribeAudio(uri);
          onTranscript(text, uri);
        } catch (error) {
          console.error('Error during transcription:', error);
          // Optionally, provide user feedback about transcription failure
        } finally {
          setIsTranscribing(false);
        }
      } else {
        setIsTranscribing(false);
      }
    } else {
      await startRecording();
      setIsRecording(true);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isRecording && styles.recording, (disabled || isTranscribing) && styles.disabledButton]} 
      onPress={handlePress}
      disabled={disabled || isTranscribing}
    >
      {isTranscribing ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text style={styles.text}>{isRecording ? '🔴 Stop' : '🎤 Talk'}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100, // Ensure button has a minimum size
    minHeight: 100,
  },
  recording: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    opacity: 0.6, // Visually indicate disabled state
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
