import React, { useState } from 'react';
import { View, Button, ActivityIndicator, Text } from 'react-native';
import CameraCapture from '../../components/CameraCapture';
import { analyzeImageFromUri } from '../../lib/imageAnalysis';
import { generateSystem } from '../../lib/designSystem';
import { useDesignStore } from '../../store/useDesignStore';
import { useRouter } from 'expo-router';

const CreateScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { saveSystem } = useDesignStore();
  const router = useRouter();

  const handleImageCapture = async (imageUri) => {
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await analyzeImageFromUri(imageUri);
      const system = generateSystem(analysis);
      await saveSystem(system);
      router.push('/library');
    } catch (error) {
      console.error('Error creating system:', error);
      setError(error.message || 'Failed to create design system');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-gray-600">Analyzing image...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <Button title="Try Again" onPress={() => setError(null)} />
        </View>
      ) : (
        <CameraCapture onCapture={handleImageCapture} />
      )}
    </View>
  );
};

export default CreateScreen;
