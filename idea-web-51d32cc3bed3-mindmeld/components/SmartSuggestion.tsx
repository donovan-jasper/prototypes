import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SmartSuggestionProps {
  suggestion: string;
  onAccept: () => void;
}

export default function SmartSuggestion({ suggestion, onAccept }: SmartSuggestionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Suggested: {suggestion}</Text>
      <TouchableOpacity onPress={onAccept}>
        <Text style={styles.link}>Add to reminders</Text>
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
  },
  link: {
    color: '#007AFF',
    marginTop: 5,
  },
});
