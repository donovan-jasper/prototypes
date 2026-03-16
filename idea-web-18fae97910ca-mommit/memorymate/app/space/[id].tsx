import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useMemoryStore } from '../../store/memoryStore';
import { useLocalSearchParams } from 'expo-router';
import MemoryCard from '../../components/MemoryCard';

const SpaceDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { memories, fetchMemories } = useMemoryStore();

  useEffect(() => {
    fetchMemories();
  }, []);

  const spaceMemories = memories.filter(memory => memory.space_id === id);

  return (
    <View style={styles.container}>
      <FlatList
        data={spaceMemories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemoryCard memory={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No memories in this space</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default SpaceDetailScreen;
