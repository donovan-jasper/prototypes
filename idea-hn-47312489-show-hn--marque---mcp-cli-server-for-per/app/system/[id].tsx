import React, { useEffect } from 'react';
import { View, Text, ScrollView, Button, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDesignStore } from '../../store/useDesignStore';
import ColorPalette from '../../components/ColorPalette';
import TypographyScale from '../../components/TypographyScale';
import ExportModal from '../../components/ExportModal';
import { Ionicons } from '@expo/vector-icons';

const SystemDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { systems, selectSystem } = useDesignStore();
  const router = useRouter();
  const [showExportModal, setShowExportModal] = React.useState(false);

  useEffect(() => {
    selectSystem(id);
  }, [id]);

  const system = systems.find((s) => s.id === id);

  if (!system) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>System not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800">{system.name}</Text>
          <TouchableOpacity
            onPress={() => router.push('/blend')}
            className="flex-row items-center bg-indigo-600 px-4 py-2 rounded-lg"
          >
            <Ionicons name="color-palette-outline" size={18} color="white" />
            <Text className="text-white ml-2">Blend</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <Text className="text-lg font-semibold mb-2 text-gray-700">Colors</Text>
          <ColorPalette colors={system.colors} />
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <Text className="text-lg font-semibold mb-2 text-gray-700">Typography</Text>
          <TypographyScale typography={system.typography} />
        </View>

        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            onPress={() => router.push('/preview')}
            className="flex-1 mr-2 bg-indigo-600 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-medium">Preview Components</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowExportModal(true)}
            className="flex-1 ml-2 bg-gray-200 py-3 rounded-lg items-center"
          >
            <Text className="text-gray-800 font-medium">Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        system={system}
      />
    </ScrollView>
  );
};

export default SystemDetailScreen;
