import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemoryStore } from '../store/memoryStore';
import * as Speech from 'expo-speech';

const VoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { addMemory } = useMemoryStore();

  const handleVoiceInput = async () => {
    setIsRecording(true);
    try {
      // Simulate voice input
      const result = await new Promise<string>((resolve) => {
        setTimeout(() => resolve('Remind me to call mom tomorrow at 5 PM'), 2000);
      });

      // Parse the result and add memory
      const memory = {
        title: 'Call mom',
        description: 'Remind me to call mom',
        trigger_type: 'time',
        trigger_value: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        completed: false,
      };
      addMemory(memory);
    } catch (error) {
      console.error('Voice input error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleVoiceInput}>
        <Ionicons name="mic" size={24} color={isRecording ? 'red' : 'black'} />
        <Text style={styles.buttonText}>Voice Input</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default VoiceInput;
