import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useMemoryStore } from '../../store/memoryStore';
import MemoryCard from '../../components/MemoryCard';
import SmartSuggestions from '../../components/SmartSuggestions';
import VoiceInput from '../../components/VoiceInput';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const { memories, fetchMemories } = useMemoryStore();
  const router = useRouter();

  useEffect(() => {
    fetchMemories();
  }, []);

  const todayMemories = memories.filter(memory => {
    const today = new Date();
    const memoryDate = new Date(memory.trigger_value);
    return memoryDate.toDateString() === today.toDateString();
  });

  return (
    <View style={styles.container}>
      <SmartSuggestions />
      <VoiceInput />
      <FlatList
        data={todayMemories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemoryCard memory={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No reminders for today</Text>}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-memory')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default HomeScreen;
