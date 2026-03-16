import React from 'react';
import { View, Text, Button } from 'react-native';

const SettingsScreen = () => {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-4">Settings</Text>
      <Button title="Manage Subscription" onPress={() => {}} />
    </View>
  );
};

export default SettingsScreen;
