import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { parse } from 'chrono-node';
import { MaterialIcons } from '@expo/vector-icons';

interface ParsedData {
  title: string;
  date: Date;
  time: Date;
  location?: string;
  category?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

interface NaturalLanguageParserProps {
  onParsed: (data: ParsedData) => void;
}

const NaturalLanguageParser: React.FC<NaturalLanguageParserProps> = ({ onParsed }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const parseNaturalLanguage = (text: string) => {
    setIsProcessing(true);

    try {
      // Basic parsing logic
      const lowerText = text.toLowerCase();
      let title = text;
      let date = new Date();
      let time = new Date();
      let location: string | undefined;
      let category: string | undefined;
      let recurrence: 'none' | 'daily' | 'weekly' | 'monthly' = 'none';

      // Extract date and time using chrono-node
      const parsedDates = parse(text);
      if (parsedDates.length > 0) {
        const firstDate = parsedDates[0];
        date = firstDate.start.date() || new Date();
        time = firstDate.start.date() || new Date();
      }

      // Extract location if mentioned
      const locationKeywords = ['near', 'at', 'in', 'around'];
      const locationRegex = new RegExp(`(${locationKeywords.join('|')})\\s+(.+?)(?=\\s|$)`, 'i');
      const locationMatch = text.match(locationRegex);
      if (locationMatch && locationMatch[2]) {
        location = locationMatch[2];
      }

      // Extract category based on keywords
      const categoryKeywords = {
        personal: ['family', 'mom', 'dad', 'friend', 'social', 'personal'],
        work: ['meeting', 'project', 'deadline', 'work', 'office'],
        health: ['exercise', 'medication', 'doctor', 'health', 'gym'],
        finance: ['bill', 'payment', 'bank', 'finance', 'money'],
        other: ['other', 'miscellaneous']
      };

      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          category = cat;
          break;
        }
      }

      // Extract recurrence
      const recurrenceKeywords = {
        daily: ['every day', 'daily', 'day'],
        weekly: ['every week', 'weekly', 'week'],
        monthly: ['every month', 'monthly', 'month']
      };

      for (const [recur, keywords] of Object.entries(recurrenceKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          recurrence = recur as 'none' | 'daily' | 'weekly' | 'monthly';
          break;
        }
      }

      // Clean up the title by removing parsed components
      let cleanedTitle = text;
      if (parsedDates.length > 0) {
        cleanedTitle = cleanedTitle.replace(parsedDates[0].text, '').trim();
      }
      if (location) {
        cleanedTitle = cleanedTitle.replace(locationRegex, '').trim();
      }

      // Remove "remind me to" if present
      cleanedTitle = cleanedTitle.replace(/^remind me to\s+/i, '').trim();

      // Capitalize first letter
      cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);

      const parsedData: ParsedData = {
        title: cleanedTitle,
        date,
        time,
        location,
        category,
        recurrence
      };

      onParsed(parsedData);
    } catch (error) {
      console.error('Error parsing natural language:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Example usage with a sample input
  useEffect(() => {
    // This would normally be triggered by the parent component when text changes
    // For demo purposes, we'll parse a sample input
    parseNaturalLanguage('Remind me to call mom tomorrow at 3pm');
  }, []);

  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <MaterialIcons name="autorenew" size={20} color="#666" />
        <Text style={styles.processingText}>Processing...</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 15,
  },
  processingText: {
    marginLeft: 8,
    color: '#666',
  },
});

export default NaturalLanguageParser;
