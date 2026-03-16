import React, { useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemoryStore } from '../../store/memoryStore';
import { useRouter } from 'expo-router';

const SharedScreen = () => {
  const { spaces, fetchSpaces } = useMemoryStore();
  const router = useRouter();

  useEffect(() => {
    fetchSpaces();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={spaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.spaceItem}
            onPress={() => router.push(`/space/${item.id}`)}
          >
            <Text style={styles.spaceName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No shared spaces</Text>}
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/create-space')}
      >
        <Text style={styles.createButtonText}>Create New Space</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  spaceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  spaceName: {
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SharedScreen;
