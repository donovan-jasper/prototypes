import React from 'react';
import { View, Text, Slider } from 'react-native';

const BlendSlider = ({ system, weight, onChange }) => {
  return (
    <View className="mb-4">
      <Text className="mb-2">{system.name}</Text>
      <View className="flex-row items-center">
        <Text className="w-8 text-right mr-2">{Math.round(weight * 100)}%</Text>
        <Slider
          style={{ flex: 1 }}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={weight}
          onValueChange={onChange}
          minimumTrackTintColor="#1fb28a"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#1a90ff"
        />
      </View>
    </View>
  );
};

export default BlendSlider;
