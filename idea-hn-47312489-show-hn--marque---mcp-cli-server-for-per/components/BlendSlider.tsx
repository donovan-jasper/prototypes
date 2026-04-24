import React from 'react';
import { View, Text, Slider } from 'react-native';

interface BlendSliderProps {
  system: {
    id: string;
    name: string;
    colors: Record<string, string>;
  };
  weight: number;
  onChange: (value: number) => void;
}

const BlendSlider: React.FC<BlendSliderProps> = ({ system, weight, onChange }) => {
  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <View
          className="w-4 h-4 rounded-full mr-2"
          style={{ backgroundColor: system.colors.primary || '#000000' }}
        />
        <Text className="text-gray-700 font-medium">{system.name}</Text>
      </View>

      <View className="flex-row items-center">
        <Text className="w-12 text-right mr-2 text-gray-600">{Math.round(weight * 100)}%</Text>
        <Slider
          style={{ flex: 1 }}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={weight}
          onValueChange={onChange}
          minimumTrackTintColor="#4F46E5"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#4F46E5"
        />
      </View>
    </View>
  );
};

export default BlendSlider;
