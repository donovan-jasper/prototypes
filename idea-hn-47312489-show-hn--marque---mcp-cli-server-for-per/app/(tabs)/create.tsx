import React, { useState } from 'react';
import { View, Button, ActivityIndicator, Text, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CameraCapture from '../../components/CameraCapture';
import DesignSystemPreview from '../../components/DesignSystemPreview';
import { analyzeImageFromUri } from '../../lib/imageAnalysis';
import { generateSystem } from '../../lib/designSystem';
import { useDesignStore } from '../../store/useDesignStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CreateScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { saveSystem } = useDesignStore();
  const router = useRouter();

  const handleImageCapture = async (imageUri: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await analyzeImageFromUri(imageUri);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError(error.message || 'Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSystem = async () => {
    if (!analysisResult) return;

    setIsLoading(true);
    try {
      const system = generateSystem(analysisResult);
      await saveSystem(system);
      router.push('/library');
    } catch (error) {
      console.error('Error saving system:', error);
      setError('Failed to save design system');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleImageCapture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      {isLoading ? (
        <View className="flex-1 items-center justify-center p-4">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-600 text-lg">Analyzing your design...</Text>
          <Text className="mt-2 text-gray-500 text-center">
            This might take a few seconds while we analyze the image and generate your design system.
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text className="text-red-500 text-center mt-4 text-lg">{error}</Text>
          <View className="mt-6 w-full max-w-xs">
            <Button
              title="Try Again"
              onPress={() => setError(null)}
              color="#007AFF"
            />
          </View>
        </View>
      ) : analysisResult ? (
        <DesignSystemPreview
          analysis={analysisResult}
          onSave={handleSaveSystem}
        />
      ) : showCamera ? (
        <CameraCapture
          onCapture={handleImageCapture}
          onCancel={() => setShowCamera(false)}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Create Your Design System
          </Text>

          <View className="w-full max-w-sm space-y-4">
            <TouchableOpacity
              className="bg-blue-500 py-4 px-6 rounded-lg flex-row items-center justify-center"
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text className="text-white text-lg font-medium ml-2">Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-200 py-4 px-6 rounded-lg flex-row items-center justify-center"
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={24} color="#333" />
              <Text className="text-gray-800 text-lg font-medium ml-2">Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          <Text className="mt-8 text-gray-500 text-center px-4">
            Take a photo of any UI (app screenshot, website, poster) to automatically extract colors, typography, and component styles.
          </Text>
        </View>
      )}
    </View>
  );
};

export default CreateScreen;
