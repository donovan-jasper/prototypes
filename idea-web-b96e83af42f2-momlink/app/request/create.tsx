import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { createRequest } from '../../lib/db';
import { getCurrentLocation } from '../../lib/location';

const EXPIRATION_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '2 hours', hours: 2 },
  { label: '4 hours', hours: 4 },
  { label: '8 hours', hours: 8 },
];

export default function CreateRequestScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExpiration, setSelectedExpiration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your request');
      return;
    }

    if (selectedExpiration === null) {
      Alert.alert('Missing Expiration', 'Please select when this request expires');
      return;
    }

    if (!user) {
      Alert.alert('Not Logged In', 'Please log in to create a request');
      return;
    }

    setLoading(true);

    try {
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Location Error', 'Could not get your location. Please try again.');
        setLoading(false);
        return;
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + selectedExpiration);

      await createRequest({
        title: title.trim(),
        description: description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        authorId: user.id,
        expiresAt: expiresAt.toISOString(),
      });

      Alert.alert('Success', 'Your request has been posted!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Create request error:', error);
      Alert.alert('Error', 'Could not create request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>New Request</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Need pickup from soccer 4pm today"
                value={title}
                onChangeText={setTitle}
                editable={!loading}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add more details about your request..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
                maxLength={500}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expires in *</Text>
              <View style={styles.expirationButtons}>
                {EXPIRATION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.hours}
                    style={[
                      styles.expirationButton,
                      selectedExpiration === option.hours && styles.expirationButtonActive
                    ]}
                    onPress={() => setSelectedExpiration(option.hours)}
                    disabled={loading}
                  >
                    <Text style={[
                      styles.expirationButtonText,
                      selectedExpiration === option.hours && styles.expirationButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Post Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  expirationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  expirationButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  expirationButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  expirationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  expirationButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
