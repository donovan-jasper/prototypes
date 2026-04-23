import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useStore } from '../../store/useStore';
import DrillCard from '../../components/DrillCard';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DrillLibrary() {
  const { drills, loadDrills, startDrill, isPremium } = useStore();
  const router = useRouter();

  useEffect(() => {
    loadDrills();
  }, []);

  const handleDrillPress = (drillId: string) => {
    startDrill(drillId);
    router.push('/(tabs)/practice');
  };

  const renderDrill = ({ item }: { item: any }) => (
    <DrillCard
      drill={item}
      onPress={() => handleDrillPress(item.id)}
      isPremium={isPremium || item.id === 'aim-training' || item.id === 'timing-challenge'}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drill Library</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/analytics')}>
          <Ionicons name="stats-chart" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={drills}
        renderItem={renderDrill}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No drills available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
