import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useReminders } from '../store/reminders';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { format, parse, isValid, addDays, addWeeks, addMonths } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import NaturalLanguageParser from '../components/NaturalLanguageParser';

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

  const handleNaturalLanguageParsed = (parsedData: {
    title: string;
    date: Date;
    time: Date;
    location?: string;
    category?: string;
    recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  }) => {
    setTitle(parsedData.title);
    setDate(parsedData.date);
    setTime(parsedData.time);
    if (parsedData.location) setLocation(parsedData.location);
    if (parsedData.category) setCategory(parsedData.category);
    if (parsedData.recurrence) setRecurrence(parsedData.recurrence);
  };

  const handleVoiceInput = async () => {
    try {
      setIsProcessing(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for voice input');
        return;
      }

      // Get current location
      const locationData = await Location.getCurrentPositionAsync({});
      const currentLocation = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      if (currentLocation[0]) {
        const locationName = `${currentLocation[0].name || ''}, ${currentLocation[0].city || ''}`.trim();
        setLocation(locationName);
      }

      // Simulate voice input processing
      const simulatedSpeech = `Remind me to ${title || 'do something'} ${location ? `when I'm near ${location}` : ''}`;
      Alert.alert('Voice Input', `Simulated: "${simulatedSpeech}"`);

      // In a real app, you would parse the voice input here
      // For now, we'll just use the simulated data
      const parsedData = {
        title: title || 'New reminder',
        date: new Date(),
        time: new Date(),
        location: location || undefined,
        category: 'personal',
        recurrence: 'none' as const
      };

      handleNaturalLanguageParsed(parsedData);
    } catch (error) {
      console.error('Voice input error:', error);
      Alert.alert('Error', 'Failed to process voice input');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  const onRecurrenceEndChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || recurrenceEnd || new Date();
    setShowRecurrenceEndPicker(Platform.OS === 'ios');
    setRecurrenceEnd(currentDate);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Reminder</Text>
          <TouchableOpacity onPress={handleVoiceInput} style={styles.voiceButton}>
            <MaterialIcons name="mic" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <NaturalLanguageParser
          onParsed={handleNaturalLanguageParsed}
          initialText={title}
        />

        <TextInput
          style={styles.input}
          placeholder="Reminder title"
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color="#666" />
            <Text style={styles.dateTimeText}>{format(date, 'MMM dd, yyyy')}</Text>
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

        <View style={styles.categoryContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryButtons}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  category === cat && styles.categoryButtonTextActive
                ]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          <Text style={styles.advancedToggleText}>
            {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
          </Text>
          <MaterialIcons
            name={showAdvancedOptions ? 'expand-less' : 'expand-more'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {showAdvancedOptions && (
          <View style={styles.advancedOptions}>
            <View style={styles.locationContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Home, Office, Gym"
                value={location || ''}
                onChangeText={setLocation}
              />
            </View>

            <View style={styles.recurrenceContainer}>
              <Text style={styles.label}>Recurrence</Text>
              <View style={styles.recurrenceButtons}>
                {recurrenceOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.recurrenceButton,
                      recurrence === option && styles.recurrenceButtonActive
                    ]}
                    onPress={() => setRecurrence(option as any)}
                  >
                    <Text style={[
                      styles.recurrenceButtonText,
                      recurrence === option && styles.recurrenceButtonTextActive
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {recurrence !== 'none' && (
                <View style={styles.recurrenceEndContainer}>
                  <Text style={styles.label}>Ends on</Text>
                  <TouchableOpacity
                    style={styles.recurrenceEndButton}
                    onPress={() => setShowRecurrenceEndPicker(true)}
                  >
                    <Text style={styles.recurrenceEndText}>
                      {recurrenceEnd ? format(recurrenceEnd, 'MMM dd, yyyy') : 'Never'}
                    </Text>
                    <MaterialIcons name="calendar-today" size={20} color="#666" />
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
          </View>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleAddReminder}
          disabled={isProcessing || !title.trim()}
        >
          <Text style={styles.saveButtonText}>
            {isProcessing ? 'Saving...' : 'Save Reminder'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent={true}
        visible={showSuccess}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <MaterialIcons name="check-circle" size={60} color="#4CAF50" />
            <Text style={styles.modalText}>Reminder saved!</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  voiceButton: {
    padding: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    color: '#666',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  advancedToggleText: {
    fontSize: 16,
    color: '#666',
  },
  advancedOptions: {
    marginBottom: 16,
  },
  locationContainer: {
    marginBottom: 16,
  },
  recurrenceContainer: {
    marginBottom: 16,
  },
  recurrenceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recurrenceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
  },
  recurrenceButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  recurrenceButtonText: {
    color: '#666',
    fontSize: 14,
  },
  recurrenceButtonTextActive: {
    color: '#FFFFFF',
  },
  recurrenceEndContainer: {
    marginTop: 16,
  },
  recurrenceEndButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  recurrenceEndText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
