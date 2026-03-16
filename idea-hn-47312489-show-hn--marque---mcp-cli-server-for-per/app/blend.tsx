import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useDesignStore } from '../store/useDesignStore';
import DesignSystemCard from '../components/DesignSystemCard';
import BlendSlider from '../components/BlendSlider';
import { blendSystems } from '../lib/blending';
import { useRouter } from 'expo-router';

const BlendScreen = () => {
  const { systems, saveSystem } = useDesignStore();
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [weights, setWeights] = useState([]);
  const [blendedSystem, setBlendedSystem] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (selectedSystems.length > 0) {
      const blended = blendSystems(selectedSystems, weights);
      setBlendedSystem(blended);
    }
  }, [selectedSystems, weights]);

  const handleSelectSystem = (system) => {
    if (selectedSystems.includes(system)) {
      setSelectedSystems(selectedSystems.filter((s) => s !== system));
    } else {
      setSelectedSystems([...selectedSystems, system]);
      setWeights([...weights, 1 / (selectedSystems.length + 1)]);
    }
  };

  const handleWeightChange = (index, value) => {
    const newWeights = [...weights];
    newWeights[index] = value;
    setWeights(newWeights);
  };

  const handleSaveBlend = async () => {
    if (blendedSystem) {
      await saveSystem(blendedSystem);
      router.push('/library');
    }
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Blend Systems</Text>
      <FlatList
        data={systems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DesignSystemCard
            system={item}
            onPress={() => handleSelectSystem(item)}
            selected={selectedSystems.includes(item)}
          />
        )}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
      {selectedSystems.length > 0 && (
        <View className="mt-4">
          <Text className="text-lg mb-2">Adjust Weights</Text>
          {selectedSystems.map((system, index) => (
            <BlendSlider
              key={system.id}
              system={system}
              weight={weights[index]}
              onChange={(value) => handleWeightChange(index, value)}
            />
          ))}
          <Button
            title="Save Blended System"
            onPress={handleSaveBlend}
            disabled={!blendedSystem}
          />
        </View>
      )}
    </View>
  );
};

export default BlendScreen;
