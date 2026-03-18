import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { useMemoryStore } from '../store/memoryStore';
import { useRouter } from 'expo-router';
import { parseNaturalLanguage } from '../lib/ai';

const AddMemoryScreen = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addMemory } = useMemoryStore();
  const router = useRouter();

  const handleAddMemory = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Please enter a reminder');
      return;
    }

    setIsProcessing(true);
    try {
      const parsed = await parseNaturalLanguage(input);
      
      if (!parsed) {
        Alert.alert(
          'Parsing Failed',
          'Could not understand your reminder. Please check your OpenAI API key in Settings or try rephrasing.',
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
        return;
      }

      addMemory({
        title: parsed.title,
        description: parsed.description,
        trigger_type: parsed.trigger_type,
        trigger_value: parsed.trigger_value,
        completed: false,
      });
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create reminder. Please try again.');
      console.error('Add memory error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Describe your reminder</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Remind me to call mom tomorrow at 5 PM"
        value={input}
        onChangeText={setInput}
        multiline
        numberOfLines={4}
        editable={!isProcessing}
      />
      {isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : (
        <Button title="Add Memory" onPress={handleAddMemory} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    minHeight: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default AddMemoryScreen;
