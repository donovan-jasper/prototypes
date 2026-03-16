import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ColorPalette = ({ colors, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  };

  return (
    <View className="flex-row flex-wrap">
      {Object.entries(colors).map(([name, color]) => (
        <View key={name} className="mr-2 mb-2 items-center">
          <TouchableOpacity
            className={`${sizeClasses[size]} rounded-full`}
            style={{ backgroundColor: color }}
          />
          <Text className="text-xs mt-1">{name}</Text>
        </View>
      ))}
    </View>
  );
};

export default ColorPalette;
