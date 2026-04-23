import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

// Initialize database
const db = SQLite.openDatabaseSync('hobbyhub.db');

export default function CreateHangoutScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [hobby, setHobby] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [maxAttendees, setMaxAttendees] = useState('6');
  const [loading, setLoading] = useState(false);
  const [hobbies, setHobbies] = useState<{id: string, name: string}[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    // Load hobbies from database
    const loadHobbies = async () => {
      try {
        const result = await db.getAllAsync<{id: string, name: string}>('SELECT id, name FROM hobbies ORDER BY name');
        setHobbies(result);
        if (result.length > 0) {
          setHobby(result[0].id);
        }
      } catch (error) {
        console.error('Error loading hobbies:', error);
      }
    };

    loadHobbies();
  }, []);

  useEffect(() => {
    // Get current location if enabled
    if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, [useCurrentLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable location services to use your current location');
        setUseCurrentLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      setLocation('Current Location');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your current location');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your hangout');
      return false;
    }

    if (!hobby) {
      Alert.alert('Error', 'Please select a hobby');
      return false;
    }

    if (!useCurrentLocation && !location.trim()) {
      Alert.alert('Error', 'Please enter a location or enable current location');
      return false;
    }

    const attendees = parseInt(maxAttendees);
    if (isNaN(attendees) || attendees < 2 || attendees > 20) {
      Alert.alert('Error', 'Please enter a valid number of attendees (2-20)');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Get location coordinates
      let latitude = 0;
      let longitude = 0;

      if (useCurrentLocation && currentLocation) {
        latitude = currentLocation.coords.latitude;
        longitude = currentLocation.coords.longitude;
      } else {
        // In a real app, we would geocode the address here
        // For demo purposes, we'll use fixed coordinates
        latitude = 40.7128;
        longitude = -74.0060;
      }

      // Generate a simple ID
      const id = Date.now().toString();

      // Insert into database
      await db.runAsync(
        'INSERT INTO hangouts (id, title, hobby, latitude, longitude, startTime, maxAttendees, creatorId) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, title.trim(), hobby, latitude, longitude, date.toISOString(), parseInt(maxAttendees), 'currentUser']
      );

      Alert.alert('Success', 'Hangout created successfully!', [
        { text: 'OK', onPress: () => router.push('/') }
      ]);
    } catch (error) {
      console.error('Error creating hangout:', error);
      Alert.alert('Error', 'Failed to create hangout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Create New Hangout</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Board Game Night"
                placeholderTextColor="#888"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hobby</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={hobby}
                  onValueChange={(itemValue) => setHobby(itemValue)}
                  style={styles.picker}
                >
                  {hobbies.map((h) => (
                    <Picker.Item key={h.id} label={h.name} value={h.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date & Time</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                  <Text style={styles.dateTimeText}>
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color="#007AFF" />
                  <Text style={styles.dateTimeText}>
                    {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.locationToggle}>
                <TouchableOpacity
                  style={[styles.toggleButton, useCurrentLocation && styles.toggleButtonActive]}
                  onPress={() => setUseCurrentLocation(true)}
                >
                  <Text style={[styles.toggleText, useCurrentLocation && styles.toggleTextActive]}>
                    Use Current Location
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, !useCurrentLocation && styles.toggleButtonActive]}
                  onPress={() => setUseCurrentLocation(false)}
                >
                  <Text style={[styles.toggleText, !useCurrentLocation && styles.toggleTextActive]}>
                    Enter Address
                  </Text>
                </TouchableOpacity>
              </View>

              {!useCurrentLocation && (
                <TextInput
                  style={[styles.input, styles.locationInput]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g., Central Park, Brooklyn"
                  placeholderTextColor="#888"
                />
              )}

              {useCurrentLocation && currentLocation && (
                <View style={styles.locationInfo}>
                  <Ionicons name="location" size={16} color="#007AFF" />
                  <Text style={styles.locationText}>
                    {currentLocation.coords.latitude.toFixed(4)}, {currentLocation.coords.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Attendees</Text>
              <TextInput
                style={styles.input}
                value={maxAttendees}
                onChangeText={(text) => {
                  // Only allow numbers
                  if (/^\d*$/.test(text)) {
                    setMaxAttendees(text);
                  }
                }}
                placeholder="e.g., 6"
                keyboardType="numeric"
                placeholderTextColor="#888"
                maxLength={2}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Create Hangout</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  dateTimeText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  locationToggle: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleText: {
    color: '#666',
    fontSize: 14,
  },
  toggleTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  locationInput: {
    marginTop: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
