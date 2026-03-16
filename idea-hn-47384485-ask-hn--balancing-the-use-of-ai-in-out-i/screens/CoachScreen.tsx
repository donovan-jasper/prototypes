import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const CoachScreen = () => {
  const [responseSuggestions] = useState([
    "Ask a specific follow-up question only a human would know",
    "Request a voice note or video call",
    "Share a personal story or memory",
    "Ask about their day or recent experiences",
    "Compliment something specific about their message",
    "Express genuine interest in their perspective",
    "Ask for clarification on a point they made",
    "Share a relevant anecdote from your own life",
    "Ask about their plans or goals",
    "Express empathy for their situation"
  ]);

  const getRandomSuggestion = () => {
    const randomIndex = Math.floor(Math.random() * responseSuggestions.length);
    return responseSuggestions[randomIndex];
  };

  const [suggestion, setSuggestion] = useState(getRandomSuggestion());

  const generateNewSuggestion = () => {
    setSuggestion(getRandomSuggestion());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Smart Response Coach</Text>
      <Text style={styles.subtitle}>Get suggestions on how to respond to AI-generated messages</Text>
      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionTitle}>Response Suggestion:</Text>
        <Text style={styles.suggestionText}>{suggestion}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={generateNewSuggestion}>
        <Text style={styles.buttonText}>New Suggestion</Text>
      </TouchableOpacity>
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Additional Tips:</Text>
        <Text style={styles.tip}>- Be specific in your questions to avoid generic AI responses</Text>
        <Text style={styles.tip}>- Use non-verbal communication (voice notes, video calls) to establish authenticity</Text>
        <Text style={styles.tip}>- Share personal experiences to create a deeper connection</Text>
        <Text style={styles.tip}>- Show genuine interest in their perspective and experiences</Text>
        <Text style={styles.tip}>- Be patient and give them time to respond thoughtfully</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  suggestionContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: 'tomato',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tipsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 5,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tip: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default CoachScreen;
