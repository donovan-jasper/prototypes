import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SmartSuggestionProps {
  suggestion: string;
  onAccept: () => void;
}

export default function SmartSuggestion({ suggestion, onAccept }: SmartSuggestionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{suggestion}</Text>
      <TouchableOpacity onPress={onAccept} style={styles.button}>
        <Text style={styles.buttonText}>Apply Suggestion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#e0f7fa',
    borderRadius: 5,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
