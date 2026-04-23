import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import Slider from '@react-native-community/slider';

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
  const [maxAttendees, setMaxAttendees] = useState(6);
  const [loading, setLoading] = useState(false);
  const [hobbies, setHobbies] = useState<{id: string, name: string}[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newHangoutId, setNewHangoutId] = useState<string | null>(null);

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

    if (maxAttendees < 2 || maxAttendees > 20) {
      Alert.alert('Error', 'Please select a valid number of attendees (2-20)');
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
        [id, title.trim(), hobby, latitude, longitude, date.toISOString(), maxAttendees, 'currentUser']
      );

      // Add current user as attendee
      await db.runAsync(
        'INSERT INTO attendees (hangoutId, userId, status) VALUES (?, ?, ?)',
        [id, 'currentUser', 'going']
      );

      setNewHangoutId(id);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating hangout:', error);
      Alert.alert('Error', 'Failed to create hangout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me for ${title} at ${location} on ${date.toLocaleString()}!`,
        url: `hobbyhub://hangout/${newHangoutId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>Create a Hangout</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Board Game Night"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Hobby</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={hobby}
                onValueChange={(itemValue) => setHobby(itemValue)}
                style={styles.picker}
              >
                {hobbies.map((hobbyItem) => (
                  <Picker.Item
                    key={hobbyItem.id}
                    label={hobbyItem.name}
                    value={hobbyItem.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateText}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Ionicons name="time" size={20} color="#666" />
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locationToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, useCurrentLocation && styles.toggleButtonActive]}
                onPress={() => setUseCurrentLocation(true)}
              >
                <Text style={[styles.toggleText, useCurrentLocation && styles.toggleTextActive]}>Current Location</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !useCurrentLocation && styles.toggleButtonActive]}
                onPress={() => setUseCurrentLocation(false)}
              >
                <Text style={[styles.toggleText, !useCurrentLocation && styles.toggleTextActive]}>Custom Location</Text>
              </TouchableOpacity>
            </View>

            {!useCurrentLocation && (
              <TextInput
                style={[styles.input, styles.locationInput]}
                placeholder="Enter address or venue name"
                value={location}
                onChangeText={setLocation}
                autoCapitalize="words"
              />
            )}

            {useCurrentLocation && currentLocation && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: currentLocation.coords.latitude,
                      longitude: currentLocation.coords.longitude,
                    }}
                    title="Your Location"
                  />
                </MapView>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Max Attendees</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={2}
                maximumValue={20}
                step={1}
                value={maxAttendees}
                onValueChange={setMaxAttendees}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#007AFF"
              />
              <Text style={styles.sliderValue}>{maxAttendees}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Create Hangout</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={60} color="#34C759" />
            <Text style={styles.modalTitle}>Hangout Created!</Text>
            <Text style={styles.modalText}>Your hangout has been successfully created and is now visible in the proximity feed.</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push(`/hangout/${newHangoutId}`);
                }}
              >
                <Text style={styles.modalButtonText}>View Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push('/');
                }}
              >
                <Text style={styles.modalButtonText}>Back to Feed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonTertiary]}
                onPress={handleShare}
              >
                <Text style={styles.modalButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  locationToggle: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
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
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    width: '100%',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonSecondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonTertiary: {
    backgroundColor: '#e0e0e0',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
