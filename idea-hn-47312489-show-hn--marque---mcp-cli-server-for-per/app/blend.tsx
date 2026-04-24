import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDesignStore } from '../store/useDesignStore';
import DesignSystemCard from '../components/DesignSystemCard';
import BlendSlider from '../components/BlendSlider';
import { blendSystems } from '../lib/blending';
import { useRouter } from 'expo-router';
import ComponentPreview from '../components/ComponentPreview';

const BlendScreen = () => {
  const { systems, saveSystem } = useDesignStore();
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [weights, setWeights] = useState([]);
  const [blendedSystem, setBlendedSystem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBlending, setIsBlending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (selectedSystems.length > 0) {
      setIsBlending(true);
      const timer = setTimeout(() => {
        const blended = blendSystems(selectedSystems, weights);
        setBlendedSystem(blended);
        setIsBlending(false);
      }, 300); // Small delay to show loading state
      return () => clearTimeout(timer);
    } else {
      setBlendedSystem(null);
    }
  }, [selectedSystems, weights]);

  const handleSelectSystem = (system) => {
    if (selectedSystems.includes(system)) {
      const newSelected = selectedSystems.filter((s) => s !== system);
      setSelectedSystems(newSelected);
      setWeights(newSelected.map((_, i) => 1 / newSelected.length));
    } else if (selectedSystems.length < 5) {
      const newSelected = [...selectedSystems, system];
      setSelectedSystems(newSelected);
      setWeights(newSelected.map((_, i) => 1 / newSelected.length));
    }
  };

  const handleWeightChange = (index, value) => {
    const newWeights = [...weights];
    newWeights[index] = value;

    // Normalize weights to sum to 1
    const sum = newWeights.reduce((a, b) => a + b, 0);
    const normalizedWeights = newWeights.map(w => w / sum);

    setWeights(normalizedWeights);
  };

  const handleSaveBlend = async () => {
    if (blendedSystem) {
      setIsSaving(true);
      try {
        await saveSystem(blendedSystem);
        router.push('/library');
      } catch (error) {
        console.error('Error saving blended system:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <Text className="text-2xl font-bold mb-4 text-gray-800">Blend Systems</Text>

      <Text className="text-lg font-semibold mb-2 text-gray-700">Select 2-5 Systems</Text>
      <FlatList
        data={systems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectSystem(item)}
            disabled={selectedSystems.length >= 5 && !selectedSystems.includes(item)}
          >
            <DesignSystemCard
              system={item}
              selected={selectedSystems.includes(item)}
              disabled={selectedSystems.length >= 5 && !selectedSystems.includes(item)}
            />
          </TouchableOpacity>
        )}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {selectedSystems.length > 0 && (
        <View className="mt-6 bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold mb-4 text-gray-700">Adjust Weights</Text>
          {selectedSystems.map((system, index) => (
            <BlendSlider
              key={system.id}
              system={system}
              weight={weights[index]}
              onChange={(value) => handleWeightChange(index, value)}
            />
          ))}

          {isBlending ? (
            <View className="mt-6 items-center">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="mt-2 text-gray-600">Blending systems...</Text>
            </View>
          ) : (
            blendedSystem && (
              <>
                <Text className="text-lg font-semibold mt-6 mb-4 text-gray-700">Preview</Text>
                <ComponentPreview system={blendedSystem} />

                <View className="mt-6">
                  <Button
                    title={isSaving ? "Saving..." : "Save Blended System"}
                    onPress={handleSaveBlend}
                    disabled={isSaving || selectedSystems.length < 2}
                    color="#4F46E5"
                  />
                </View>
              </>
            )
          )}
        </View>
      )}
    </View>
  );
};

export default BlendScreen;
