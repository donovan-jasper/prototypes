import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVITY_TYPES = [
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Yoga', emoji: '🧘' },
  { name: 'Frisbee', emoji: '🥏' },
  { name: 'Soccer', emoji: '⚽' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Running', emoji: '🏃' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Cycling', emoji: '🚴' },
  { name: 'Hiking', emoji: '🥾' },
  { name: 'Pickleball', emoji: '🏓' },
];

const CreateEventScreen = ({ navigation }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [location, setLocation] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('8');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (useCurrentLocation) {
      fetchCurrentLocation();
    }
  }, [useCurrentLocation]);

  useEffect(() => {
    generateTimeOptions();
  }, []);

  const fetchCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use your current location.');
        setUseCurrentLocation(false);
        setLoadingLocation(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setCurrentCoords({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const [result] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (result) {
        const locationName = `${result.name || result.street || 'Current Location'}`;
        setLocation(locationName);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Error', 'Could not fetch your current location.');
      setUseCurrentLocation(false);
    } finally {
      setLoadingLocation(false);
    }
  };

  const generateTimeOptions = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);

    const hours = now.getHours();
    const mins = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = mins < 10 ? `0${mins}` : mins;

    setStartTime(`${displayHours}:${displayMinutes} ${ampm}`);
  };

  const getTimeOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 16; i++) {
      const time = new Date(now.getTime() + i * 15 * 60000);
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
      options.push({
        label: `${displayHours}:${displayMinutes} ${ampm}`,
        value: time.toISOString(),
      });
    }
    
    return options;
  };

  const handleCreateEvent = async () => {
    if (!selectedActivity) {
      Alert.alert('Missing Information', 'Please select an activity type.');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Missing Information', 'Please enter a location.');
      return;
    }

    if (!startTime) {
      Alert.alert('Missing Information', 'Please select a start time.');
      return;
    }

    const capacity = parseInt(maxCapacity);
    if (isNaN(capacity) || capacity < 4 || capacity > 20) {
      Alert.alert('Invalid Capacity', 'Max capacity must be between 4 and 20 people.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please add a brief description.');
      return;
    }

    setCreating(true);

    try {
      const event = {
        id: `user-event-${Date.now()}`,
        title: selectedActivity.name,
        emoji: selectedActivity.emoji,
        location: location.trim(),
        latitude: currentCoords?.latitude || 0,
        longitude: currentCoords?.longitude || 0,
        distance: 0,
        time: startTime,
        currentParticipants: 1,
        maxCapacity: capacity,
        description: description.trim(),
        createdBy: 'user',
        createdAt: new Date().toISOString(),
      };

      const existingEvents = await AsyncStorage.getItem('userEvents');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      events.push(event);
      await AsyncStorage.setItem('userEvents', JSON.stringify(events));

      Alert.alert('Success', 'Your activity has been created!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Could not create activity. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Type</Text>
        <View style={styles.activityGrid}>
          {ACTIVITY_TYPES.map((activity) => (
            <TouchableOpacity
              key={activity.name}
              style={[
                styles.activityButton,
                selectedActivity?.name === activity.name && styles.activityButtonSelected,
              ]}
              onPress={() => setSelectedActivity(activity)}
            >
              <Text style={styles.activityEmoji}>{activity.emoji}</Text>
              <Text
                style={[
                  styles.activityName,
                  selectedActivity?.name === activity.name && styles.activityNameSelected,
                ]}
              >
                {activity.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, useCurrentLocation && styles.toggleButtonActive]}
            onPress={() => setUseCurrentLocation(true)}
          >
            <Text style={[styles.toggleText, useCurrentLocation && styles.toggleTextActive]}>
              Current Location
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !useCurrentLocation && styles.toggleButtonActive]}
            onPress={() => setUseCurrentLocation(false)}
          >
            <Text style={[styles.toggleText, !useCurrentLocation && styles.toggleTextActive]}>
              Manual Entry
            </Text>
          </TouchableOpacity>
        </View>

        {loadingLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Enter location or venue name"
            value={location}
            onChangeText={setLocation}
            editable={!useCurrentLocation}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Start Time (within next 4 hours)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
          {getTimeOptions().map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeButton,
                startTime === option.label && styles.timeButtonSelected,
              ]}
              onPress={() => setStartTime(option.label)}
            >
              <Text
                style={[
                  styles.timeText,
                  startTime === option.label && styles.timeTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Max Capacity (4-20 people)</Text>
        <TextInput
          style={styles.input}
          placeholder="8"
          value={maxCapacity}
          onChangeText={setMaxCapacity}
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell people what to expect..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.createButton, creating && styles.createButtonDisabled]}
        onPress={handleCreateEvent}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.createButtonText}>Create Activity</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  activityButton: {
    width: '30%',
    margin: '1.66%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  activityEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  activityName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  activityNameSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  locationToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  timeScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  timeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateEventScreen;
