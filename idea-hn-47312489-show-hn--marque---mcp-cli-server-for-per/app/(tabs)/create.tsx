import React, { useState } from 'react';
import { View, Button, ActivityIndicator } from 'react-native';
import CameraCapture from '../../components/CameraCapture';
import { analyzeImage } from '../../lib/imageAnalysis';
import { generateSystem } from '../../lib/designSystem';
import { useDesignStore } from '../../store/useDesignStore';
import { useRouter } from 'expo-router';

const CreateScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { saveSystem } = useDesignStore();
  const router = useRouter();

  const handleImageCapture = async (imageUri) => {
    setIsLoading(true);
    try {
      const analysis = await analyzeImage(imageUri);
      const system = generateSystem(analysis);
      await saveSystem(system);
      router.push('/library');
    } catch (error) {
      console.error('Error creating system:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <CameraCapture onCapture={handleImageCapture} />
      )}
    </View>
  );
};

export default CreateScreen;
