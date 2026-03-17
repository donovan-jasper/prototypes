import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { CATEGORIES } from '../constants/Categories';
import { createActivity } from '../lib/activities';
import { useLocation } from '../hooks/useLocation';

export default function QuickPostForm() {
  const router = useRouter();
  const { location, error: locationError } = useLocation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startTime, setStartTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // +1 hour
  const [maxAttendees, setMaxAttendees] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (startTime <= new Date()) {
      newErrors.startTime = 'Start time must be in the future';
    }

    if (maxAttendees && (isNaN(Number(maxAttendees)) || Number(maxAttendees) < 2)) {
      newErrors.maxAttendees = 'Max attendees must be at least 2';
    }

    if (!location) {
      newErrors.location = 'Location is required. Please enable location services.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const activityId = await createActivity({
        title: title.trim(),
        description: description.trim(),
        category,
        latitude: location!.coords.latitude,
        longitude: location!.coords.longitude,
        startTime: startTime.toISOString(),
        organizerId: 1, // Mock user ID
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
      });

      Alert.alert(
        'Success!',
        'Your activity has been posted',
        [
          {
            text: 'OK',
            onPress: () => router.push(`/activity/${activityId}`),
          },
        ]
      );

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setStartTime(new Date(Date.now() + 60 * 60 * 1000));
      setMaxAttendees('');
      setErrors({});
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create activity. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Failed to create activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartTime(selectedDate);
      setErrors({ ...errors, startTime: '' });
    }
  };

  if (locationError) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-lg text-red-600 text-center mb-4">
          Location access is required to post activities
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Please enable location services in your device settings
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Getting your location...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold mb-6 text-gray-900">
          Create Activity
        </Text>

        {/* Title Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2 text-gray-700">
            Title *
          </Text>
          <TextInput
            className={`border rounded-lg px-4 py-3 text-base ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Playing chess at Central Park"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            maxLength={100}
          />
          {errors.title && (
            <Text className="text-red-500 text-xs mt-1">{errors.title}</Text>
          )}
        </View>

        {/* Description Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2 text-gray-700">
            Description
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Add more details (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

        {/* Category Selection */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2 text-gray-700">
            Category *
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setCategory(cat.id);
                  if (errors.category) setErrors({ ...errors, category: '' });
                }}
                className={`mr-3 px-4 py-2 rounded-full border ${
                  category === cat.id
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    category === cat.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.category && (
            <Text className="text-red-500 text-xs mt-1">{errors.category}</Text>
          )}
        </View>

        {/* Time Picker */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2 text-gray-700">
            Start Time *
          </Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className={`border rounded-lg px-4 py-3 ${
              errors.startTime ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <Text className="text-base text-gray-900">
              {startTime.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
          {errors.startTime && (
            <Text className="text-red-500 text-xs mt-1">{errors.startTime}</Text>
          )}
          {showTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Max Attendees Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2 text-gray-700">
            Max Attendees
          </Text>
          <TextInput
            className={`border rounded-lg px-4 py-3 text-base ${
              errors.maxAttendees ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Leave empty for unlimited"
            value={maxAttendees}
            onChangeText={(text) => {
              setMaxAttendees(text);
              if (errors.maxAttendees) setErrors({ ...errors, maxAttendees: '' });
            }}
            keyboardType="number-pad"
            maxLength={3}
          />
          {errors.maxAttendees && (
            <Text className="text-red-500 text-xs mt-1">{errors.maxAttendees}</Text>
          )}
        </View>

        {/* Location Info */}
        <View className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Text className="text-sm font-semibold mb-1 text-gray-700">
            Location
          </Text>
          <Text className="text-xs text-gray-600">
            📍 {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Your current location will be used
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-lg py-4 items-center ${
            isSubmitting ? 'bg-gray-400' : 'bg-blue-500'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-semibold">
              Post Activity
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
