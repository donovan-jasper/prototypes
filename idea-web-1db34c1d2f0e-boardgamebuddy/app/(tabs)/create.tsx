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
      Alert.alert('Error', 'Could not create hangout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me for ${title} at ${date.toLocaleString()}!`,
        url: `hobbyhub://hangout/${newHangoutId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewHangout = () => {
    setShowSuccessModal(false);
    router.push(`/hangout/${newHangoutId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
              maxLength={50}
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
                {hobbies.map((h) => (
                  <Picker.Item key={h.id} label={h.name} value={h.id} />
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
                <Text style={styles.dateTimeText}>
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
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
                style={[
                  styles.toggleButton,
                  useCurrentLocation && styles.toggleButtonActive
                ]}
                onPress={() => setUseCurrentLocation(true)}
              >
                <Text style={[
                  styles.toggleButtonText,
                  useCurrentLocation && styles.toggleButtonTextActive
                ]}>Current Location</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !useCurrentLocation && styles.toggleButtonActive
                ]}
                onPress={() => setUseCurrentLocation(false)}
              >
                <Text style={[
                  styles.toggleButtonText,
                  !useCurrentLocation && styles.toggleButtonTextActive
                ]}>Custom Location</Text>
              </TouchableOpacity>
            </View>

            {!useCurrentLocation && (
              <TextInput
                style={[styles.input, styles.locationInput]}
                placeholder="Enter address or location name"
                value={location}
                onChangeText={setLocation}
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
              <Text style={styles.sliderValue}>{maxAttendees}</Text>
              <Slider
                style={styles.slider}
                minimumValue={2}
                maximumValue={20}
                step={1}
                value={maxAttendees}
                onValueChange={setMaxAttendees}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#4CAF50"
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
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Hangout</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.modalTitle}>Hangout Created!</Text>
            <Text style={styles.modalText}>Your hangout has been successfully created.</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.shareButton]}
                onPress={handleShare}
              >
                <Ionicons name="share-social" size={20} color="#4CAF50" />
                <Text style={styles.modalButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.viewButton]}
                onPress={handleViewHangout}
              >
                <Ionicons name="eye" size={20} color="#fff" />
                <Text style={[styles.modalButtonText, styles.viewButtonText]}>View Hangout</Text>
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
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  dateTimeText: {
    fontSize: 16,
    textAlign: 'center',
  },
  locationToggle: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f5f5f5',
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  toggleButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  locationInput: {
    marginTop: 10,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  map: {
    flex: 1,
  },
  sliderContainer: {
    marginTop: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 5,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  viewButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  viewButtonText: {
    color: '#fff',
  },
});
