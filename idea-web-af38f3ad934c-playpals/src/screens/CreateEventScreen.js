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
  Picker,
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

      Alert.alert('Success', 'Your event has been created!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Could not create your event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create a New Event</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activityContainer}>
          {ACTIVITY_TYPES.map((activity) => (
            <TouchableOpacity
              key={activity.name}
              style={[
                styles.activityButton,
                selectedActivity?.name === activity.name && styles.selectedActivity
              ]}
              onPress={() => setSelectedActivity(activity)}
            >
              <Text style={styles.activityEmoji}>{activity.emoji}</Text>
              <Text style={styles.activityText}>{activity.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationContainer}>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location"
            editable={!useCurrentLocation}
          />
          <TouchableOpacity
            style={styles.locationToggle}
            onPress={() => setUseCurrentLocation(!useCurrentLocation)}
          >
            <Text style={styles.locationToggleText}>
              {useCurrentLocation ? 'Use Custom Location' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>
        </View>
        {loadingLocation && <ActivityIndicator size="small" color="#007AFF" />}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Start Time</Text>
        <View style={styles.timePickerContainer}>
          <Picker
            selectedValue={startTime}
            style={styles.timePicker}
            onValueChange={(itemValue) => setStartTime(itemValue)}
          >
            {getTimeOptions().map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.label} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Max Capacity</Text>
        <TextInput
          style={styles.input}
          value={maxCapacity}
          onChangeText={setMaxCapacity}
          keyboardType="numeric"
          placeholder="Enter max capacity"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Briefly describe the event"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateEvent}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
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
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  activityContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  activityButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedActivity: {
    borderColor: '#007AFF',
    backgroundColor: '#E6F0FF',
  },
  activityEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  activityText: {
    fontSize: 12,
    color: '#555',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  locationToggle: {
    marginLeft: 10,
  },
  locationToggleText: {
    color: '#007AFF',
    fontSize: 14,
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timePicker: {
    width: '100%',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateEventScreen;
