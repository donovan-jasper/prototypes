import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useDesignStore } from '../store/useDesignStore';
import ComponentPreview from '../components/ComponentPreview';

const PreviewScreen = () => {
  const { currentSystem } = useDesignStore();

  if (!currentSystem) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No system selected</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Component Preview</Text>
      <ComponentPreview system={currentSystem} />
    </ScrollView>
  );
};

export default PreviewScreen;
