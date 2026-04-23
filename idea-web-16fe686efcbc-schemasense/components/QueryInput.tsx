import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VoiceButton } from './VoiceButton';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  initialValue?: string;
  isProcessing: boolean;
}

export const QueryInput = ({ onSubmit, initialValue = '', isProcessing }: QueryInputProps) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = () => {
    if (query.trim() && !isProcessing) {
      onSubmit(query.trim());
    }
  };

  const handleVoiceTranscription = (transcription: string) => {
    setQuery(transcription);
    onSubmit(transcription);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question about your data..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          multiline
          blurOnSubmit
          returnKeyType="search"
          editable={!isProcessing}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSubmit}
          disabled={!query.trim() || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <MaterialIcons
              name="send"
              size={24}
              color={query.trim() ? '#007AFF' : '#CCC'}
            />
          )}
        </TouchableOpacity>
      </View>
      <VoiceButton
        onTranscription={handleVoiceTranscription}
        isProcessing={isProcessing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 8,
    padding: 4,
  },
});
