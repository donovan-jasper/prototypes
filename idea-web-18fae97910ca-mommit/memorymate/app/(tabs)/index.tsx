import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useMemoryStore } from '../../store/memoryStore';
import MemoryCard from '../../components/MemoryCard';
import SmartSuggestions from '../../components/SmartSuggestions';
import VoiceInput from '../../components/VoiceInput';

const HomeScreen = () => {
  const { memories, fetchMemories } = useMemoryStore();

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

export default HomeScreen;
