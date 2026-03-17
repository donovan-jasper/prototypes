import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Picker } from 'react-native';

const CoachScreen = () => {
  const [context, setContext] = useState('general');
  const [responseSuggestions] = useState({
    general: [
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
    ],
    dating: [
      "Ask about their hobbies and interests in detail",
      "Share a funny or relatable story from your own dating experiences",
      "Ask about their values and what they're looking for in a partner",
      "Compliment their personality or communication style",
      "Ask about their weekend plans or favorite places to go",
      "Share a personal opinion about a topic they mentioned",
      "Ask about their family or pets if they've mentioned them",
      "Compliment their writing style or message structure",
      "Ask about their favorite movies, books, or music",
      "Share a lighthearted joke or pun"
    ],
    professional: [
      "Ask about their recent projects or achievements",
      "Share a relevant industry insight or news",
      "Ask for their thoughts on a specific business challenge",
      "Compliment their professional approach or communication",
      "Ask about their career goals and how they're working toward them",
      "Share a case study or example from your own experience",
      "Ask about their team or colleagues if relevant",
      "Compliment their industry knowledge",
      "Ask about their preferred communication style",
      "Share a relevant white paper or article"
    ],
    family: [
      "Ask about their day in detail",
      "Share a family memory or tradition",
      "Ask about their family's interests or hobbies",
      "Compliment their communication style or tone",
      "Ask about their family's recent activities or events",
      "Share a personal story about your own family",
      "Ask about their feelings on a recent family discussion",
      "Compliment their perspective on family matters",
      "Ask about their family's health or well-being",
      "Share a lighthearted family joke or pun"
    ]
  });

  const getRandomSuggestion = () => {
    const suggestions = responseSuggestions[context as keyof typeof responseSuggestions];
    const randomIndex = Math.floor(Math.random() * suggestions.length);
    return suggestions[randomIndex];
  };

  const [suggestion, setSuggestion] = useState(getRandomSuggestion());

  const generateNewSuggestion = () => {
    setSuggestion(getRandomSuggestion());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Smart Response Coach</Text>
      <Text style={styles.subtitle}>Get suggestions on how to respond to AI-generated messages</Text>

      <View style={styles.contextSelector}>
        <Text style={styles.contextLabel}>Context:</Text>
        <Picker
          selectedValue={context}
          style={styles.picker}
          onValueChange={(itemValue) => setContext(itemValue)}
        >
          <Picker.Item label="General" value="general" />
          <Picker.Item label="Dating" value="dating" />
          <Picker.Item label="Professional" value="professional" />
          <Picker.Item label="Family" value="family" />
        </Picker>
      </View>

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
        <Text style={styles.tip}>- Tailor your responses to the context of the conversation</Text>
        <Text style={styles.tip}>- Use humor appropriately to lighten the mood</Text>
        <Text style={styles.tip}>- Ask open-ended questions to encourage detailed responses</Text>
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
  contextSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contextLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
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
