import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { createRequest } from '../../lib/db';
import { getCurrentLocation } from '../../lib/location';
import { Ionicons } from '@expo/vector-icons';

export default function CreateRequest() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [expiresIn, setExpiresIn] = useState(60); // minutes
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to create a request');
      router.push('/auth/login');
    } else {
      loadCurrentLocation();
    }
  }, [user]);

  async function loadCurrentLocation() {
    const loc = await getCurrentLocation();
    if (loc) {
      setLocation(loc);
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your request');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide more details about your request');
      return;
    }

    if (location.latitude === 0 || location.longitude === 0) {
      Alert.alert('Error', 'Could not determine your location. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      const expiresAt = new Date(Date.now() + expiresIn * 60000).toISOString();

      const requestId = await createRequest({
        title,
        description,
        latitude: location.latitude,
        longitude: location.longitude,
        authorId: user!.id,
        expiresAt,
      });

      Alert.alert('Success', 'Your request has been posted!');
      router.push(`/request/${requestId}`);
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Error', 'Failed to create request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Request</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="What do you need help with?"
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Provide details about your request..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Expiration</Text>
        <View style={styles.expiresContainer}>
          <TouchableOpacity
            style={[styles.expiresButton, expiresIn === 30 && styles.expiresButtonActive]}
            onPress={() => setExpiresIn(30)}
          >
            <Text style={styles.expiresButtonText}>30 min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.expiresButton, expiresIn === 60 && styles.expiresButtonActive]}
            onPress={() => setExpiresIn(60)}
          >
            <Text style={styles.expiresButtonText}>1 hour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.expiresButton, expiresIn === 120 && styles.expiresButtonActive]}
            onPress={() => setExpiresIn(120)}
          >
            <Text style={styles.expiresButtonText}>2 hours</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.expiresButton, expiresIn === 240 && styles.expiresButtonActive]}
            onPress={() => setExpiresIn(240)}
          >
            <Text style={styles.expiresButtonText}>4 hours</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Post Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 16,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  expiresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  expiresButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  expiresButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  expiresButtonText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
