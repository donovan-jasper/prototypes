import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { generateDiagram } from '@/lib/ai';
import { useDrawingStore } from '@/store/useDrawingStore';

export function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addElements } = useDrawingStore();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const diagram = await generateDiagram(prompt);
      addElements(diagram.elements);
    } catch (error) {
      console.error('Failed to generate diagram:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Describe your diagram..."
        value={prompt}
        onChangeText={setPrompt}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerate}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Generating...' : 'Generate Diagram'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
