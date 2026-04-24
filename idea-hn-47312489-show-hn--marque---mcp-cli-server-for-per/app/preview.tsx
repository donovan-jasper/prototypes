import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useDesignStore } from '../store/useDesignStore';
import ComponentPreview from '../components/ComponentPreview';
import { useRouter } from 'expo-router';

const PreviewScreen = () => {
  const { currentSystem } = useDesignStore();
  const router = useRouter();

  if (!currentSystem) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg text-gray-600 mb-4">No system selected</Text>
        <TouchableOpacity
          onPress={() => router.push('/library')}
          className="bg-indigo-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Select a System</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4 text-gray-800">Component Preview</Text>
        <ComponentPreview system={currentSystem} />
      </View>
    </ScrollView>
  );
};

export default PreviewScreen;
