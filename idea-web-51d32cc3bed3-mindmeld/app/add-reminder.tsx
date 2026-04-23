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
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <NaturalLanguageParser onParsed={handleNaturalLanguageParsed} />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Reminder Title</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you need to remember?"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <TouchableOpacity
            style={styles.microphoneButton}
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {format(date, 'MMM d, yyyy')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {format(time, 'h:mm a')}
              </Text>
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
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
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
                  styles.categoryText,
                  category === cat && styles.categoryTextActive
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
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Add a location (optional)"
                value={location || ''}
                onChangeText={setLocation}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Recurrence</Text>
              <View style={styles.recurrenceContainer}>
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
                      styles.recurrenceText,
                      recurrence === option && styles.recurrenceTextActive
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
            <MaterialIcons name="check-circle" size={50} color="#4CAF50" />
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
    backgroundColor: '#fff',
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
  },
  closeButton: {
    padding: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  microphoneButton: {
    position: 'absolute',
    right: 10,
    top: 35,
    padding: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryText: {
    color: '#666',
  },
  categoryTextActive: {
    color: 'white',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginVertical: 20,
  },
  advancedToggleText: {
    fontSize: 16,
    color: '#666',
  },
  advancedOptions: {
    marginTop: 10,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  recurrenceButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  recurrenceButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  recurrenceText: {
    color: '#666',
  },
  recurrenceTextActive: {
    color: 'white',
  },
  recurrenceEndContainer: {
    marginTop: 15,
  },
  recurrenceEndButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
  },
  recurrenceEndText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
