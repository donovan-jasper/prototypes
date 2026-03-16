import React, { useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useDesignStore } from '../../store/useDesignStore';
import DesignSystemCard from '../../components/DesignSystemCard';

const LibraryScreen = () => {
  const { systems, loadSystems } = useDesignStore();

  useEffect(() => {
    loadSystems();
  }, []);

  return (
    <View className="flex-1 p-4">
      {systems.length > 0 ? (
        <FlatList
          data={systems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <DesignSystemCard system={item} />}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">No design systems yet</Text>
        </View>
      )}
    </View>
  );
};

export default LibraryScreen;
