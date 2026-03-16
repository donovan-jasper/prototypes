import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import PromptInput from '../../components/PromptInput';
import GenerationCard from '../../components/GenerationCard';
import { useAppStore } from '../../store/app-store';
import { getGenerations } from '../../lib/database';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const generations = useAppStore(state => state.generations);
  const loadGenerations = useAppStore(state => state.loadGenerations);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGenerations();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <PromptInput />
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 16 }}>Recent Generations</Text>
      {generations.map(gen => (
        <GenerationCard key={gen.id} generation={gen} />
      ))}
    </ScrollView>
  );
}
