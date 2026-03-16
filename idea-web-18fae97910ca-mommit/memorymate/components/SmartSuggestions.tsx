import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemoryStore } from '../store/memoryStore';

const SmartSuggestions = () => {
  const { suggestions, addMemory } = useMemoryStore();

  const handleSuggestion = (suggestion: any) => {
    addMemory(suggestion);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggestions</Text>
      <View style={styles.suggestions}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestion}
            onPress={() => handleSuggestion(suggestion)}
          >
            <Text style={styles.suggestionText}>{suggestion.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestion: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  suggestionText: {
    fontSize: 14,
  },
});

export default SmartSuggestions;
