import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ColorPalette from './ColorPalette';

const DesignSystemCard = ({ system, onPress, selected }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(system);
    } else {
      router.push(`/system/${system.id}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`w-[48%] mb-4 p-4 rounded-lg ${selected ? 'bg-blue-100' : 'bg-white'}`}
    >
      <Text className="text-lg font-bold mb-2">{system.name}</Text>
      <ColorPalette colors={system.colors} size="small" />
    </TouchableOpacity>
  );
};

export default DesignSystemCard;
