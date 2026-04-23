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
      Alert.alert('Voice Input', `Simulated: "${simulatedSpeech}"`);
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

        <NaturalLanguageParser onParsed={handleNaturalLanguageParsed} />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you need to remember?"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{format(date, 'MMM d, yyyy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>{format(time, 'h:mm a')}</Text>
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
                placeholder="Optional location (e.g., 'near grocery store')"
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
            </View>

            {recurrence !== 'none' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Recurrence End Date</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowRecurrenceEndPicker(true)}
                >
                  <Text>
                    {recurrenceEnd ? format(recurrenceEnd, 'MMM d, yyyy') : 'No end date'}
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
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Add Reminder"
            onPress={handleAddReminder}
            disabled={isProcessing}
          />
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleVoiceInput}
            disabled={isProcessing}
          >
            <MaterialIcons name="mic" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

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
      </ScrollView>
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
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 5,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryText: {
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginBottom: 20,
  },
  advancedToggleText: {
    fontSize: 16,
    color: '#666',
  },
  advancedOptions: {
    marginBottom: 20,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  recurrenceButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 5,
  },
  recurrenceButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  recurrenceText: {
    color: '#666',
  },
  recurrenceTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  voiceButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 18,
    marginTop: 10,
    fontWeight: '500',
  },
});
