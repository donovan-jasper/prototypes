import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const MessageComposer = ({ onMessageChange, maxLength = 500 }) => {
  const [message, setMessage] = useState('');

  const handleChange = (text) => {
    setMessage(text);
    onMessageChange(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Write your message..."
        multiline
        value={message}
        onChangeText={handleChange}
        maxLength={maxLength}
      />
      <Text style={styles.charCount}>{message.length} / {maxLength}</Text>
      <TouchableOpacity style={styles.voiceButton}>
        <Text style={styles.voiceButtonText}>Add Voice Note</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    height: 150,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    marginBottom: 10,
  },
  voiceButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  voiceButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default MessageComposer;
