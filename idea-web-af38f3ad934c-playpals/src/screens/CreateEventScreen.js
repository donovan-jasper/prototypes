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

      // Save to AsyncStorage
      const existingEvents = await AsyncStorage.getItem('userEvents');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      events.push(event);
      await AsyncStorage.setItem('userEvents', JSON.stringify(events));

      // Navigate back to HomeScreen with the new event
      navigation.navigate('Home', { newEvent: event });
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create a New Event</Text>

      {/* Activity Selection */}
      <Text style={styles.sectionTitle}>Activity Type</Text>
      <View style={styles.activityGrid}>
        {ACTIVITY_TYPES.map((activity) => (
          <TouchableOpacity
            key={activity.name}
            style={[
              styles.activityButton,
              selectedActivity?.name === activity.name && styles.selectedActivity,
            ]}
            onPress={() => setSelectedActivity(activity)}
          >
            <Text style={styles.activityEmoji}>{activity.emoji}</Text>
            <Text style={styles.activityText}>{activity.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location */}
      <Text style={styles.sectionTitle}>Location</Text>
      <View style={styles.locationContainer}>
        <TouchableOpacity
          style={styles.locationToggle}
          onPress={() => setUseCurrentLocation(!useCurrentLocation)}
        >
          <Text style={styles.locationToggleText}>
            {useCurrentLocation ? 'Using Current Location' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
          editable={!useCurrentLocation}
        />
        {loadingLocation && <ActivityIndicator style={styles.loadingIndicator} />}
      </View>

      {/* Time */}
      <Text style={styles.sectionTitle}>Start Time</Text>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{startTime}</Text>
        <TouchableOpacity style={styles.timeButton} onPress={() => generateTimeOptions()}>
          <Text style={styles.timeButtonText}>Now</Text>
        </TouchableOpacity>
      </View>

      {/* Capacity */}
      <Text style={styles.sectionTitle}>Max Capacity</Text>
      <TextInput
        style={styles.input}
        value={maxCapacity}
        onChangeText={setMaxCapacity}
        keyboardType="numeric"
        placeholder="8"
      />

      {/* Description */}
      <Text style={styles.sectionTitle}>Description</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Briefly describe the event"
        multiline
      />

      {/* Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateEvent}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Create Event</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#444',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  selectedActivity: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  activityEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  activityText: {
    fontSize: 12,
    textAlign: 'center',
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationToggle: {
    marginBottom: 10,
  },
  locationToggleText: {
    color: '#2196f3',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    elevation: 1,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 15,
  },
  timeButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  timeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateEventScreen;
