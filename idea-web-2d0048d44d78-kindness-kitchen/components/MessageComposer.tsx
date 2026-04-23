import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const MessageComposer = ({ onMessageChange, maxLength = 500 }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleTextChange = (text) => {
    if (text.length <= maxLength) {
      setMessage(text);
      onMessageChange(text);
    }
  };

  const handleVoiceNote = () => {
    // In a real app, this would start/stop voice recording
    setIsRecording(!isRecording);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a personal message</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Write your message..."
        value={message}
        onChangeText={handleTextChange}
        multiline
        numberOfLines={6}
        maxLength={maxLength}
      />

      <View style={styles.footer}>
        <Text style={styles.charCount}>
          {message.length} / {maxLength}
        </Text>

        <TouchableOpacity
          style={[
            styles.voiceButton,
            isRecording && styles.recordingButton
          ]}
          onPress={handleVoiceNote}
        >
          <Text style={[
            styles.voiceButtonText,
            isRecording && styles.recordingButtonText
          ]}>
            {isRecording ? 'Stop Recording' : '+ Add Voice Note'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    color: '#666',
    fontSize: 14,
  },
  voiceButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
  },
  voiceButtonText: {
    color: '#333',
    fontSize: 14,
  },
  recordingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MessageComposer;
