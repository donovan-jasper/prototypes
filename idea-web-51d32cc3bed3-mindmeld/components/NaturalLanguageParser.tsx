import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { parseNaturalLanguage } from '../lib/natural-language';
import { useReminders } from '../store/reminders';

interface NaturalLanguageParserProps {
  onParsed: (parsedData: {
    title: string;
    date: Date;
    time: Date;
    location?: string;
    category?: string;
    recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  }) => void;
}

export default function NaturalLanguageParser({ onParsed }: NaturalLanguageParserProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParse = () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to parse');
      return;
    }

    setIsProcessing(true);

    try {
      const parsed = parseNaturalLanguage(inputText);
      onParsed(parsed);
      setInputText('');
    } catch (error) {
      Alert.alert('Error', 'Could not parse your input. Please try again with a different format.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type your reminder (e.g., 'Remind me to call mom tomorrow at 3pm')"
        value={inputText}
        onChangeText={setInputText}
        multiline
      />
      <Button
        title={isProcessing ? 'Processing...' : 'Parse Reminder'}
        onPress={handleParse}
        disabled={isProcessing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  input: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});
