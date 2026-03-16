import React from 'react';
import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

const HomeScreen = () => {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-4">DesignBlend</Text>
      <Text className="text-lg text-center mb-8">
        Generate beautiful, consistent design systems in seconds—just snap a screenshot or describe your vision.
      </Text>
      <Link href="/create" asChild>
        <Button title="Create New System" />
      </Link>
    </View>
  );
};

export default HomeScreen;
