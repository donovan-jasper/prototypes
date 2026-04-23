import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { generateDiagram } from '../lib/ai';
import { useDrawingStore } from '../store/useDrawingStore';

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addElements = useDrawingStore(state => state.addElements);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const diagramData = await generateDiagram(prompt);
      if (diagramData.elements && diagramData.elements.length > 0) {
        addElements(diagramData.elements);
        setPrompt('');
      } else {
        throw new Error('No elements generated');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      setError('Failed to generate diagram. Please try again.');
      Alert.alert('Error', 'Failed to generate diagram. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Diagram Generator</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe your diagram (e.g., 'Create a flowchart for user onboarding')"
        value={prompt}
        onChangeText={setPrompt}
        multiline
        numberOfLines={3}
        editable={!isLoading}
        placeholderTextColor="#999"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleGenerate}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Generate Diagram</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>
        Examples: "Create a mind map for project planning", "Design a simple flowchart for a website", "Make an org chart for a small team"
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 12,
    fontSize: 14,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default AIAssistant;
