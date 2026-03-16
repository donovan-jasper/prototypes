import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ConversationStarter = () => {
  const [prompt, setPrompt] = useState('');

  const generatePrompt = () => {
    const prompts = [
      'What is your favorite memory from childhood?',
      'What is the best advice you have ever received?',
      'What is your dream vacation destination?',
      'What is your favorite book or movie and why?',
      'What is your favorite way to spend a weekend?',
    ];
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setPrompt(prompts[randomIndex]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversation Starter</Text>
      <Text style={styles.prompt}>{prompt || 'Click "Shuffle" to get a prompt'}</Text>
      <Button title="Shuffle" onPress={generatePrompt} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  prompt: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default ConversationStarter;
