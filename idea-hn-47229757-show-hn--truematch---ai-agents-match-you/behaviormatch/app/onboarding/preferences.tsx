import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { Link } from 'expo-router';
import Colors from '../../constants/Colors';

export default function PreferencesScreen() {
  const [ageRange, setAgeRange] = useState('');
  const [location, setLocation] = useState('');
  const [lookingFor, setLookingFor] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tell us about yourself</Text>
      <Text style={styles.subtitle}>
        This helps us find the best matches for you.
      </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Age Range</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 25-35"
          value={ageRange}
          onChangeText={setAgeRange}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., New York, NY"
          value={location}
          onChangeText={setLocation}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>What are you looking for?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Dating, Friends, Networking"
          value={lookingFor}
          onChangeText={setLookingFor}
        />
      </View>
      <Link href="/onboarding/permissions" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 5,
  },
  input: {
    backgroundColor: Colors.card,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
