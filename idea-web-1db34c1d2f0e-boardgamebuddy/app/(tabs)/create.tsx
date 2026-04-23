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
        title: `Join my ${title} hangout!`
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const navigateToHangout = () => {
    if (newHangoutId) {
      router.push(`/hangout/${newHangoutId}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Hangout</Text>
            <Text style={styles.subtitle}>Fill in the details below</Text>
          </View>

          <View style={styles.form}>
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
              <Text style={styles.label}>Date & Time</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <Text style={styles.dateTimeText}>
                    {date.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.dateTimeText}>
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.locationToggle}>
                <TouchableOpacity
                  style={[styles.toggleButton, useCurrentLocation && styles.toggleButtonActive]}
                  onPress={() => setUseCurrentLocation(true)}
                >
                  <Text style={styles.toggleButtonText}>Use Current Location</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, !useCurrentLocation && styles.toggleButtonActive]}
                  onPress={() => setUseCurrentLocation(false)}
                >
                  <Text style={styles.toggleButtonText}>Enter Address</Text>
                </TouchableOpacity>
              </View>

              {useCurrentLocation ? (
                <View style={styles.mapContainer}>
                  {currentLocation ? (
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
                  ) : (
                    <View style={styles.mapPlaceholder}>
                      <ActivityIndicator size="large" color="#007AFF" />
                      <Text style={styles.mapPlaceholderText}>Loading map...</Text>
                    </View>
                  )}
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Enter address or venue name"
                  value={location}
                  onChangeText={setLocation}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Max Attendees</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderValue}>{maxAttendees}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={2}
                  maximumValue={20}
                  step={1}
                  value={maxAttendees}
                  onValueChange={(value) => setMaxAttendees(Math.round(value))}
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#ddd"
                  thumbTintColor="#007AFF"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>2</Text>
                  <Text style={styles.sliderLabel}>20</Text>
                </View>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#34C759" />
            <Text style={styles.modalTitle}>Hangout Created!</Text>
            <Text style={styles.modalText}>Your hangout has been successfully created.</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={navigateToHangout}
              >
                <Text style={styles.modalButtonText}>View Hangout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleShare}
              >
                <Text style={styles.modalButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonTertiary]}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push('/(tabs)/');
                }}
              >
                <Text style={styles.modalButtonText}>Back to Feed</Text>
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
    backgroundColor: '#f8f8f8',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  formGroup: {
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
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
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
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholderText: {
    marginTop: 8,
    color: '#666',
  },
  sliderContainer: {
    marginTop: 8,
  },
  slider: {
    height: 40,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    color: '#666',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
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
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
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
    marginBottom: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonSecondary: {
    backgroundColor: '#34C759',
  },
  modalButtonTertiary: {
    backgroundColor: '#ddd',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
