import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ImageAnalysis } from '../lib/imageAnalysis';
import { generateSystem } from '../lib/designSystem';

interface DesignSystemPreviewProps {
  analysis: ImageAnalysis;
  onSave?: () => void;
}

const DesignSystemPreview: React.FC<DesignSystemPreviewProps> = ({ analysis, onSave }) => {
  const system = generateSystem(analysis);

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Design System Preview</Text>

      {/* Color Palette */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-700 mb-3">Color Palette</Text>
        <View className="flex-row flex-wrap">
          {system.colors && Object.entries(system.colors).map(([name, color]) => (
            <View key={name} className="mr-3 mb-3">
              <View
                className="w-16 h-16 rounded-lg"
                style={{ backgroundColor: color }}
              />
              <Text className="text-center mt-1 text-sm text-gray-600">{name}</Text>
              <Text className="text-center text-xs text-gray-500">{color}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Typography */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-700 mb-3">Typography</Text>
        <View className="space-y-4">
          {system.typography?.scale?.map((size, index) => (
            <View key={index} className="flex-row items-center">
              <Text
                className="text-gray-800"
                style={{
                  fontSize: size,
                  fontFamily: system.typography?.fontFamily,
                  fontWeight: system.typography?.weights?.[index % system.typography.weights.length] || '400'
                }}
              >
                {system.typography?.fontFamily || 'System Font'} {size}px
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Spacing */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-700 mb-3">Spacing Scale</Text>
        <View className="space-y-2">
          {system.spacing?.scale?.map((space, index) => (
            <View key={index} className="flex-row items-center">
              <View
                className="bg-blue-100 rounded"
                style={{ width: space, height: space }}
              />
              <Text className="ml-2 text-gray-700">{space}px</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Component Preview */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-700 mb-3">Component Preview</Text>

        {/* Buttons */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-600 mb-2">Buttons</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor: system.components?.buttons?.primary?.background || '#007AFF',
              }}
            >
              <Text
                className="font-medium"
                style={{
                  color: system.components?.buttons?.primary?.text || '#FFFFFF',
                }}
              >
                Primary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="px-4 py-2 rounded-lg border"
              style={{
                borderColor: system.components?.buttons?.secondary?.background || '#007AFF',
              }}
            >
              <Text
                className="font-medium"
                style={{
                  color: system.components?.buttons?.secondary?.text || '#007AFF',
                }}
              >
                Secondary
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-600 mb-2">Card</Text>
          <View
            className="p-4 rounded-lg"
            style={{
              backgroundColor: system.components?.cards?.background || '#FFFFFF',
              borderRadius: system.components?.cards?.borderRadius || 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: system.components?.cards?.shadow ? 3 : 0,
              elevation: system.components?.cards?.shadow ? 2 : 0,
            }}
          >
            <Text className="text-gray-800">Card Content</Text>
          </View>
        </View>
      </View>

      {onSave && (
        <TouchableOpacity
          className="bg-blue-500 py-3 px-6 rounded-lg items-center"
          onPress={onSave}
        >
          <Text className="text-white text-lg font-medium">Save Design System</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default DesignSystemPreview;
