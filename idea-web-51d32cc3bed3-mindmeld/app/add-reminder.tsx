import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useReminders } from '../store/reminders';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { format, parse, isValid, addDays, addWeeks, addMonths } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddReminderScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState<string | null>(null);
  const [category, setCategory] = useState('personal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [recurrenceEnd, setRecurrenceEnd] = useState<Date | null>(null);
  const [showRecurrenceEndPicker, setShowRecurrenceEndPicker] = useState(false);
  const { addReminder } = useReminders();
  const router = useRouter();

  const categories = ['personal', 'work', 'health', 'finance', 'other'];
  const recurrenceOptions = ['none', 'daily', 'weekly', 'monthly'];

  const handleAddReminder = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }

    setIsProcessing(true);

    try {
      const reminderDate = new Date(date);
      reminderDate.setHours(time.getHours(), time.getMinutes());

      const reminder = {
        id: Date.now().toString(),
        title,
        date: reminderDate.toISOString(),
        completed: false,
        category,
        location: location || undefined,
        recurrence,
        recurrenceEnd: recurrenceEnd ? recurrenceEnd.toISOString() : undefined,
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
        setTime(now);
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

    // Extract recurrence
    const recurrenceRegex = /(every day|daily|every week|weekly|every month|monthly)/;
    const recurrenceMatch = lowerText.match(recurrenceRegex);
    if (recurrenceMatch) {
      if (recurrenceMatch[0].includes('day')) {
        setRecurrence('daily');
      } else if (recurrenceMatch[0].includes('week')) {
        setRecurrence('weekly');
      } else if (recurrenceMatch[0].includes('month')) {
        setRecurrence('monthly');
      }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const onRecurrenceEndChange = (event: any, selectedDate?: Date) => {
    setShowRecurrenceEndPicker(false);
    if (selectedDate) {
      setRecurrenceEnd(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Reminder</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What do you need to remember?"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleVoiceInput}
            disabled={isProcessing}
          >
            <MaterialIcons
              name="mic"
              size={24}
              color={isProcessing ? '#ccc' : '#4CAF50'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color="#666" />
            <Text style={styles.dateTimeText}>{format(date, 'MMM d, yyyy')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <MaterialIcons name="access-time" size={20} color="#666" />
            <Text style={styles.dateTimeText}>{format(time, 'h:mm a')}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.selectedCategory
                ]}
                onPress={() => setCategory(cat)}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Add location (optional)"
            value={location || ''}
            onChangeText={setLocation}
          />
        </View>

        <TouchableOpacity
          style={styles.advancedOptionsButton}
          onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          <Text style={styles.advancedOptionsText}>
            {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </Text>
          <MaterialIcons
            name={showAdvancedOptions ? 'expand-less' : 'expand-more'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {showAdvancedOptions && (
          <View style={styles.advancedOptionsContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recurrence</Text>
              <View style={styles.recurrenceContainer}>
                {recurrenceOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.recurrenceButton,
                      recurrence === option && styles.selectedRecurrence
                    ]}
                    onPress={() => setRecurrence(option as any)}
                  >
                    <Text style={[
                      styles.recurrenceText,
                      recurrence === option && styles.selectedRecurrenceText
                    ]}>
                      {option === 'none' ? 'None' : option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {recurrence !== 'none' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recurrence End Date</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowRecurrenceEndPicker(true)}
                >
                  <MaterialIcons name="calendar-today" size={20} color="#666" />
                  <Text style={styles.dateTimeText}>
                    {recurrenceEnd ? format(recurrenceEnd, 'MMM d, yyyy') : 'Never'}
                  </Text>
                </TouchableOpacity>

                {showRecurrenceEndPicker && (
                  <DateTimePicker
                    value={recurrenceEnd || new Date()}
                    mode="date"
                    display="default"
                    onChange={onRecurrenceEndChange}
                  />
                )}
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddReminder}
          disabled={isProcessing}
        >
          <Text style={styles.addButtonText}>
            {isProcessing ? 'Saving...' : 'Add Reminder'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent={true}
        visible={showSuccess}
        animationType="fade"
      >
        <View style={styles.successModal}>
          <View style={styles.successContent}>
            <MaterialIcons name="check-circle" size={50} color="#4CAF50" />
            <Text style={styles.successText}>Reminder Added!</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceButton: {
    marginLeft: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  advancedOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  advancedOptionsText: {
    fontSize: 16,
    color: '#333',
  },
  advancedOptionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recurrenceButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedRecurrence: {
    backgroundColor: '#2196F3',
  },
  recurrenceText: {
    color: '#666',
  },
  selectedRecurrenceText: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  successContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
