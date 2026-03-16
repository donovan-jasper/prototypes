import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Clipboard } from 'react-native';
import { exportToReactNative, exportToTailwind, exportToCSS, exportToFigma } from '../lib/export';

const ExportModal = ({ visible, onClose, system }) => {
  const [format, setFormat] = useState('react-native');
  const [code, setCode] = useState('');

  const handleFormatChange = (newFormat) => {
    setFormat(newFormat);
    switch (newFormat) {
      case 'react-native':
        setCode(exportToReactNative(system));
        break;
      case 'tailwind':
        setCode(exportToTailwind(system));
        break;
      case 'css':
        setCode(exportToCSS(system));
        break;
      case 'figma':
        setCode(exportToFigma(system));
        break;
      default:
        setCode('');
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(code);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4">Export Design System</Text>
        <View className="flex-row mb-4">
          <TouchableOpacity
            onPress={() => handleFormatChange('react-native')}
            className={`px-4 py-2 mr-2 rounded ${format === 'react-native' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Text className={format === 'react-native' ? 'text-white' : 'text-black'}>React Native</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFormatChange('tailwind')}
            className={`px-4 py-2 mr-2 rounded ${format === 'tailwind' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Text className={format === 'tailwind' ? 'text-white' : 'text-black'}>Tailwind</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFormatChange('css')}
            className={`px-4 py-2 mr-2 rounded ${format === 'css' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Text className={format === 'css' ? 'text-white' : 'text-black'}>CSS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFormatChange('figma')}
            className={`px-4 py-2 rounded ${format === 'figma' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Text className={format === 'figma' ? 'text-white' : 'text-black'}>Figma</Text>
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 bg-gray-100 p-4 rounded">
          <Text className="text-sm">{code}</Text>
        </ScrollView>
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            onPress={copyToClipboard}
            className="px-4 py-2 bg-blue-500 rounded"
          >
            <Text className="text-white">Copy to Clipboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ExportModal;
