import React, { useEffect } from 'react';
import { View, Text, ScrollView, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDesignStore } from '../../store/useDesignStore';
import ColorPalette from '../../components/ColorPalette';
import TypographyScale from '../../components/TypographyScale';
import ExportModal from '../../components/ExportModal';

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
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">{system.name}</Text>
      <Text className="text-lg mb-2">Colors</Text>
      <ColorPalette colors={system.colors} />
      <Text className="text-lg mb-2 mt-4">Typography</Text>
      <TypographyScale typography={system.typography} />
      <View className="flex-row justify-between mt-8">
        <Button
          title="Preview Components"
          onPress={() => router.push('/preview')}
        />
        <Button
          title="Export"
          onPress={() => setShowExportModal(true)}
        />
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
