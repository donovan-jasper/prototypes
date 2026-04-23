import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useStore } from '../../store/useStore';
import DrillCard from '../../components/DrillCard';
import { Drill } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const IndexScreen = () => {
  const { drills, loadDrills, startDrill } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'aim' | 'timing' | 'swipe' | 'pattern' | 'reflex'>('all');
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      await loadDrills();
      setIsLoading(false);
    };

    initialize();
  }, []);

  const handleDrillPress = (drillId: string) => {
    startDrill(drillId);
    router.push('/(tabs)/practice');
  };

  const filteredDrills = filter === 'all'
    ? drills
    : drills.filter(drill => drill.type === filter);

  const renderFilterButton = (type: typeof filter, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === type && styles.activeFilterButton]}
      onPress={() => setFilter(type)}
    >
      <Text style={[styles.filterButtonText, filter === type && styles.activeFilterButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading drills...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drill Library</Text>
        <Text style={styles.subtitle}>Select a drill to practice</Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('aim', 'Aim')}
        {renderFilterButton('timing', 'Timing')}
        {renderFilterButton('swipe', 'Swipe')}
        {renderFilterButton('pattern', 'Pattern')}
        {renderFilterButton('reflex', 'Reflex')}
      </View>

      <FlatList
        data={filteredDrills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DrillCard
            drill={item}
            onPress={() => handleDrillPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={40} color="#999" />
            <Text style={styles.emptyText}>No drills found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200EE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#6200EE',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  activeFilterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});

export default IndexScreen;
