import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
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
      addElements(diagramData.elements);
      setPrompt('');
    } catch (err) {
      setError('Failed to generate diagram. Please try again.');
      console.error('AI generation error:', err);
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
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleGenerate}
        disabled={isLoading}
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
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
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
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});

export default AIAssistant;
