import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { startRecording, transcribeAudio } from '../lib/voice';

const VoiceButton = ({ onResult }) => {
  const [isRecording, setIsRecording] = useState(false);

  const handlePress = async () => {
    if (isRecording) {
      const audio = await stopRecording();
      const text = await transcribeAudio(audio);
      onResult(text);
    } else {
      await startRecording();
    }
    setIsRecording(!isRecording);
  };

  return (
    <IconButton
      icon={isRecording ? 'microphone-off' : 'microphone'}
      onPress={handlePress}
    />
  );
};

export default VoiceButton;
