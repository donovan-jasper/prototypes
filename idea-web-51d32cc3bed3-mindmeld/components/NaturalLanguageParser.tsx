import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { parse, isValid, addDays, addWeeks, addMonths } from 'date-fns';
import * as chrono from 'chrono-node';

interface ParsedReminder {
  title: string;
  date: Date;
  time: Date;
  location?: string;
  category?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

interface NaturalLanguageParserProps {
  onParsed: (parsedData: ParsedReminder) => void;
  initialText?: string;
}

const NaturalLanguageParser: React.FC<NaturalLanguageParserProps> = ({ onParsed, initialText = '' }) => {
  const [inputText, setInputText] = useState(initialText);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseNaturalLanguage = (text: string): ParsedReminder => {
    // Default values
    const now = new Date();
    let parsedDate = now;
    let parsedTime = now;
    let title = text;
    let location: string | undefined;
    let category: string | undefined;
    let recurrence: 'none' | 'daily' | 'weekly' | 'monthly' = 'none';

    // Extract date and time using chrono
    const parsedDates = chrono.parse(text);
    if (parsedDates.length > 0) {
      const firstDate = parsedDates[0];
      parsedDate = firstDate.start.date() || now;
      parsedTime = firstDate.start.date() || now;

      // Remove the date/time part from the title
      title = text.replace(firstDate.text, '').trim();
    }

    // Check for recurrence patterns
    const recurrenceKeywords = {
      daily: ['every day', 'daily', 'each day'],
      weekly: ['every week', 'weekly', 'each week'],
      monthly: ['every month', 'monthly', 'each month']
    };

    for (const [recurrenceType, keywords] of Object.entries(recurrenceKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        recurrence = recurrenceType as 'none' | 'daily' | 'weekly' | 'monthly';
        break;
      }
    }

    // Check for location (simple pattern matching)
    const locationMatch = text.match(/(near|at|in|around)\s+(.+?)(?=\s|$)/i);
    if (locationMatch) {
      location = locationMatch[2];
      title = title.replace(locationMatch[0], '').trim();
    }

    // Check for category (simple pattern matching)
    const categoryKeywords = {
      work: ['work', 'job', 'office', 'meeting', 'project'],
      personal: ['personal', 'family', 'home', 'mom', 'dad', 'friend'],
      health: ['health', 'exercise', 'workout', 'medication', 'doctor'],
      finance: ['finance', 'money', 'bill', 'payment', 'bank']
    };

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        category = cat;
        break;
      }
    }

    return {
      title,
      date: parsedDate,
      time: parsedTime,
      location,
      category,
      recurrence
    };
  };

  const handleParse = () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      const parsedData = parseNaturalLanguage(inputText);
      onParsed(parsedData);
    } catch (error) {
      console.error('Error parsing natural language:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      handleParse();
    }
  }, [initialText]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your reminder (e.g., 'Remind me to call mom tomorrow at 3pm')"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleParse}
          multiline
        />
        <TouchableOpacity
          style={styles.parseButton}
          onPress={handleParse}
          disabled={isProcessing || !inputText.trim()}
        >
          <MaterialIcons
            name="send"
            size={24}
            color={inputText.trim() ? '#4CAF50' : '#CCCCCC'}
          />
        </TouchableOpacity>
      </View>
      {isProcessing && <Text style={styles.processingText}>Processing...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    minHeight: 40,
    padding: 8,
    fontSize: 16,
  },
  parseButton: {
    padding: 8,
  },
  processingText: {
    marginTop: 8,
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default NaturalLanguageParser;
