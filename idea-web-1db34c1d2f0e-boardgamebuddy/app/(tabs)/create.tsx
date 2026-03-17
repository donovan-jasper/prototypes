import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';

// Initialize database
const db = SQLite.openDatabaseSync('hobbyhub.db');

// Create tables if they don't exist
db.execSync(`
  CREATE TABLE IF NOT EXISTS hangouts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    hobby TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    startTime TEXT NOT NULL,
    maxAttendees INTEGER DEFAULT 6
  );
`);

export default function CreateHangoutScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [hobby, setHobby] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('6');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !hobby || !time || !location) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // For demo purposes, we'll use fixed coordinates
      // In a real app, you'd geocode the location
      const latitude = 40.7128; // Default to NYC
      const longitude = -74.0060;

      // Generate a simple ID
      const id = Date.now().toString();

      // Insert into database
      await db.runAsync(
        'INSERT INTO hangouts (id, title, hobby, latitude, longitude, startTime, maxAttendees) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, title, hobby, latitude, longitude, time, parseInt(maxAttendees)]
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
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hobby</Text>
              <TextInput
                style={styles.input}
                value={hobby}
                onChangeText={setHobby}
                placeholder="e.g., Board Games, Yoga, Photography"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="e.g., Today at 7 PM"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Central Park, Brooklyn"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Attendees</Text>
              <TextInput
                style={styles.input}
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                placeholder="e.g., 6"
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating...' : 'Create Hangout'}
              </Text>
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
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  submitButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
