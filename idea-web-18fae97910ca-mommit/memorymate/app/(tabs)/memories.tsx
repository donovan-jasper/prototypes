import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useMemoryStore } from '../../store/memoryStore';
import MemoryCard from '../../components/MemoryCard';

const MemoriesScreen = () => {
  const { memories, fetchMemories } = useMemoryStore();

  useEffect(() => {
    fetchMemories();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={memories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemoryCard memory={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default MemoriesScreen;
