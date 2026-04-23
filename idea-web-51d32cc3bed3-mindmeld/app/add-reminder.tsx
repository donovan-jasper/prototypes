import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useReminders } from '../store/reminders';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { format, parse, isValid } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';

export default function AddReminderScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState<string | null>(null);
  const [category, setCategory] = useState('personal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addReminder } = useReminders();
  const router = useRouter();

  const categories = ['personal', 'work', 'health', 'finance', 'other'];

  const handleAddReminder = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }

    setIsProcessing(true);

    try {
      const reminder = {
        id: Date.now().toString(),
        title,
        date: date.toISOString(),
        completed: false,
        category,
        location: location || undefined,
      };

      await addReminder(reminder);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminder');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = async () => {
    try {
      setIsProcessing(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for voice input');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const currentLocation = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      if (currentLocation[0]) {
        const locationName = `${currentLocation[0].name || ''}, ${currentLocation[0].city || ''}`.trim();
        setLocation(locationName);
      }

      // In a real app, you would use a speech recognition API here
      // For demo purposes, we'll simulate it
      const simulatedSpeech = `Remind me to ${title || 'do something'} ${location ? `when I'm near ${location}` : ''}`;
      parseNaturalLanguage(simulatedSpeech);
    } catch (error) {
      console.error('Voice input error:', error);
      Alert.alert('Error', 'Failed to process voice input');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseNaturalLanguage = (text: string) => {
    // Simple NLP parsing - in a real app, use a proper NLP library
    const lowerText = text.toLowerCase();

    // Extract date/time
    const dateRegex = /(tomorrow|today|next week|in \d+ days|at \d+:\d+)/;
    const dateMatch = lowerText.match(dateRegex);
    if (dateMatch) {
      const now = new Date();
      if (dateMatch[0].includes('tomorrow')) {
        now.setDate(now.getDate() + 1);
      } else if (dateMatch[0].includes('next week')) {
        now.setDate(now.getDate() + 7);
      } else if (dateMatch[0].includes('in ')) {
        const days = parseInt(dateMatch[0].split(' ')[1]);
        now.setDate(now.getDate() + days);
      }

      const timeRegex = /at (\d+):(\d+)/;
      const timeMatch = lowerText.match(timeRegex);
      if (timeMatch) {
        now.setHours(parseInt(timeMatch[1]));
        now.setMinutes(parseInt(timeMatch[2]));
      }

      if (isValid(now)) {
        setDate(now);
      }
    }

    // Extract location
    const locationRegex = /near (.*?)(?= at|$)/;
    const locationMatch = lowerText.match(locationRegex);
    if (locationMatch) {
      setLocation(locationMatch[1]);
    }

    // Extract title
    const titleRegex = /remind me to (.*?)(?= at| near|$)/;
    const titleMatch = lowerText.match(titleRegex);
    if (titleMatch) {
      setTitle(titleMatch[1]);
    }

    // Categorize
    const workKeywords = ['meeting', 'project', 'deadline', 'call', 'email'];
    const healthKeywords = ['exercise', 'medication', 'doctor', 'appointment'];
    const financeKeywords = ['pay', 'bill', 'budget', 'investment'];

    if (workKeywords.some(keyword => lowerText.includes(keyword))) {
      setCategory('work');
    } else if (healthKeywords.some(keyword => lowerText.includes(keyword))) {
      setCategory('health');
    } else if (financeKeywords.some(keyword => lowerText.includes(keyword))) {
      setCategory('finance');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Add New Reminder</Text>

        {showSuccess && (
          <View style={styles.successBanner}>
            <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.successText}>Reminder saved successfully!</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="What do you need to remember?"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            onBlur={() => parseNaturalLanguage(title)}
            editable={!isProcessing}
          />

          <TouchableOpacity
            onPress={handleVoiceInput}
            style={[styles.micButton, isProcessing && styles.disabledButton]}
            disabled={isProcessing}
          >
            <MaterialIcons name="mic" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.label}>Date & Time:</Text>
          <Text style={styles.dateText}>{format(date, 'MMM d, yyyy h:mm a')}</Text>
        </View>

        {location && (
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        )}

        <View style={styles.categoryContainer}>
          <Text style={styles.label}>Category:</Text>
          <View style={styles.categoryButtons}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.selectedCategory
                ]}
                onPress={() => setCategory(cat)}
                disabled={isProcessing}
              >
                <Text style={[
                  styles.categoryText,
                  category === cat && styles.selectedCategoryText
                ]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, isProcessing && styles.disabledButton]}
          onPress={handleAddReminder}
          disabled={isProcessing}
        >
          <Text style={styles.addButtonText}>
            {isProcessing ? 'Saving...' : 'Add Reminder'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    marginLeft: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  micButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  dateContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    color: '#333',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
