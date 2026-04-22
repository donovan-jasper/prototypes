import { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { startRecording, stopRecording, transcribeAudio } from '../lib/voice';

export default function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);

  const handlePress = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      setIsRecording(false);
      
      if (uri) {
        const { text } = await transcribeAudio(uri);
        onTranscript(text);
      }
    } else {
      await startRecording();
      setIsRecording(true);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isRecording && styles.recording]} 
      onPress={handlePress}
    >
      <Text style={styles.text}>{isRecording ? '🔴 Stop' : '🎤 Talk'}</Text>
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
  },
  recording: {
    backgroundColor: '#FF3B30',
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
