import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ComponentPreview = ({ system }) => {
  return (
    <View>
      <Text className="text-lg font-bold mb-2">Buttons</Text>
      <View className="flex-row mb-4">
        <TouchableOpacity
          className="px-4 py-2 rounded mr-2"
          style={{ backgroundColor: system.colors.primary }}
        >
          <Text className="text-white">Primary</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-4 py-2 rounded mr-2 border"
          style={{ borderColor: system.colors.primary }}
        >
          <Text style={{ color: system.colors.primary }}>Secondary</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-4 py-2 rounded border"
          style={{ borderColor: system.colors.primary }}
        >
          <Text style={{ color: system.colors.primary }}>Outline</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-lg font-bold mb-2">Cards</Text>
      <View
        className="p-4 rounded-lg mb-4"
        style={{
          backgroundColor: system.colors.background,
          shadowColor: system.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text style={{ color: system.colors.text }}>Card Content</Text>
      </View>

      <Text className="text-lg font-bold mb-2">Forms</Text>
      <View className="mb-2">
        <Text className="mb-1" style={{ color: system.colors.text }}>Input Label</Text>
        <View
          className="h-10 px-4 rounded border"
          style={{
            borderColor: system.colors.border,
            backgroundColor: system.colors.inputBackground,
          }}
        />
      </View>
    </View>
  );
};

export default ComponentPreview;
