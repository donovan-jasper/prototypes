import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { getCurrentLocation } from '../../lib/location';

const COMMON_ACTIVITIES = [
  'Coffee',
  'Walk',
  'Basketball',
  'Lunch',
  'Dog Park',
  'Gym',
  'Study',
  'Drinks',
];

const RADIUS_OPTIONS = [0.5, 1, 3, 5];
const EXPIRY_OPTIONS = [
  { label: '30min', hours: 0.5 },
  { label: '1hr', hours: 1 },
  { label: '2hr', hours: 2 },
  { label: '4hr', hours: 4 },
];

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [activity, setActivity] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(3);
  const [groupSize, setGroupSize] = useState('2');
  const [selectedExpiry, setSelectedExpiry] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredActivities = COMMON_ACTIVITIES.filter((a) =>
    a.toLowerCase().includes(activity.toLowerCase())
  );

  const handleActivityChange = (text: string) => {
    setActivity(text);
    setShowSuggestions(text.length > 0);
  };

  const selectActivity = (selectedActivity: string) => {
    setActivity(selectedActivity);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!activity.trim()) {
      Alert.alert('Error', 'Please enter an activity');
      return;
    }

    const groupSizeNum = parseInt(groupSize, 10);
    if (isNaN(groupSizeNum) || groupSizeNum < 1 || groupSizeNum > 10) {
      Alert.alert('Error', 'Group size must be between 1 and 10');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a broadcast');
      return;
    }

    setSubmitting(true);

    try {
      const location = await getCurrentLocation();

      const expiryHours = EXPIRY_OPTIONS.find((opt) => opt.hours === selectedExpiry)?.hours || 2;
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from('broadcasts').insert({
        user_id: user.id,
        activity: activity.trim(),
        description: description.trim() || null,
        lat: location.lat,
        lng: location.lng,
        radius: selectedRadius,
        group_size: groupSizeNum,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert('Success', 'Broadcast created!', [
        {
          text: 'OK',
          onPress: () => {
            setActivity('');
            setDescription('');
            setGroupSize('2');
            setSelectedRadius(3);
            setSelectedExpiry(2);
            router.push('/');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error creating broadcast:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create broadcast. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Broadcast</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.label}>Activity</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you want to do?"
            value={activity}
            onChangeText={handleActivityChange}
            onFocus={() => setShowSuggestions(activity.length > 0)}
            autoCapitalize="words"
          />
          {showSuggestions && filteredActivities.length > 0 && (
            <View style={styles.suggestions}>
              {filteredActivities.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionItem}
                  onPress={() => selectActivity(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add more details..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Radius</Text>
          <View style={styles.buttonGroup}>
            {RADIUS_OPTIONS.map((radius) => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.optionButton,
                  selectedRadius === radius && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedRadius(radius)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedRadius === radius && styles.optionButtonTextActive,
                  ]}
                >
                  {radius}mi
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Group Size</Text>
          <TextInput
            style={styles.input}
            placeholder="2"
            value={groupSize}
            onChangeText={setGroupSize}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.hint}>Maximum 10 people</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Expires In</Text>
          <View style={styles.buttonGroup}>
            {EXPIRY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.hours}
                style={[
                  styles.optionButton,
                  selectedExpiry === option.hours && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedExpiry(option.hours)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedExpiry === option.hours && styles.optionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Broadcast</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  suggestions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333333',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
