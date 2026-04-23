import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useReminders } from '../store/reminders';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { format, parse, isValid, addDays, addWeeks, addMonths } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { parseNaturalLanguage } from '../lib/natural-language';

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
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
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

  const handleNaturalLanguageInput = () => {
    if (!naturalLanguageInput.trim()) return;

    try {
      const parsed = parseNaturalLanguage(naturalLanguageInput);

      setTitle(parsed.title);
      setDate(parsed.date);
      setTime(parsed.time);
      if (parsed.location) setLocation(parsed.location);
      if (parsed.category) setCategory(parsed.category);

      // Show success feedback
      Alert.alert('Success', 'Reminder details extracted from your input!');
    } catch (error) {
      Alert.alert('Error', 'Could not parse your input. Please try again or enter details manually.');
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
      setNaturalLanguageInput(simulatedSpeech);
      handleNaturalLanguageInput();
    } catch (error) {
      console.error('Voice input error:', error);
      Alert.alert('Error', 'Failed to process voice input');
    } finally {
      setIsProcessing(false);
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
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.naturalLanguageSection}>
          <TextInput
            style={styles.naturalLanguageInput}
            placeholder="Try saying: 'Remind me to call mom tomorrow at 3pm'"
            value={naturalLanguageInput}
            onChangeText={setNaturalLanguageInput}
            onSubmitEditing={handleNaturalLanguageInput}
            returnKeyType="done"
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

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Reminder Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Reminder title"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <View style={styles.dateTimeRow}>
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
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setTime(selectedTime);
              }}
            />
          )}

          <View style={styles.categorySection}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryOptions}>
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
              <View style={styles.locationSection}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Add location (optional)"
                  value={location || ''}
                  onChangeText={setLocation}
                />
              </View>

              <View style={styles.recurrenceSection}>
                <Text style={styles.label}>Recurrence</Text>
                <View style={styles.recurrenceOptions}>
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
                  <View style={styles.recurrenceEndSection}>
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
                        onChange={(event, selectedDate) => {
                          setShowRecurrenceEndPicker(false);
                          if (selectedDate) setRecurrenceEnd(selectedDate);
                        }}
                      />
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAddReminder}
            disabled={isProcessing}
          >
            <Text style={styles.saveButtonText}>
              {isProcessing ? 'Saving...' : 'Save Reminder'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showSuccess}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successModal}>
          <View style={styles.successContent}>
            <MaterialIcons name="check-circle" size={50} color="#4CAF50" />
            <Text style={styles.successText}>Reminder Saved!</Text>
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
  closeButton: {
    padding: 8,
  },
  naturalLanguageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  naturalLanguageInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  voiceButton: {
    marginLeft: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  formSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  categorySection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 5,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 15,
  },
  advancedToggleText: {
    fontSize: 16,
    color: '#666',
  },
  advancedOptions: {
    marginTop: 10,
  },
  locationSection: {
    marginBottom: 15,
  },
  recurrenceSection: {
    marginBottom: 15,
  },
  recurrenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  recurrenceButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 5,
    backgroundColor: '#f0f0f0',
  },
  recurrenceButtonActive: {
    backgroundColor: '#2196F3',
  },
  recurrenceText: {
    color: '#666',
    fontSize: 14,
  },
  recurrenceTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  recurrenceEndSection: {
    marginTop: 10,
  },
  recurrenceEndButton: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recurrenceEndText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  },
  successText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
});
