import React from 'react';
import { View, Text, Slider } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <MaterialIcons name="location-on" size={18} color="#6b7280" className="mr-1" />
          <Text className="text-sm font-medium text-gray-700">Search Radius</Text>
        </View>
        <Text className="text-sm text-gray-600">{value.toFixed(1)} miles</Text>
      </View>

      <Slider
        minimumValue={0.5}
        maximumValue={5}
        step={0.1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#3b82f6"
        maximumTrackTintColor="#e5e7eb"
        thumbTintColor="#3b82f6"
      />
    </View>
  );
}
