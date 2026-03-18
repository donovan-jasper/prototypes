import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, RefreshControl } from 'react-native';
import { RelationshipCard } from '../../components/RelationshipCard';
import { getRelationships } from '../../services/relationshipService';
import { RelationshipWithHealth } from '../../types';
import { useRouter, useFocusEffect } from 'expo-router';

export default function RelationshipsScreen() {
  const router = useRouter();
  const [relationships, setRelationships] = useState<RelationshipWithHealth[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Family', 'Friends', 'Professional', 'Acquaintance'];

  const loadRelationships = useCallback((category: string = 'All') => {
    try {
      const data = getRelationships(category);
      setRelationships(data);
    } catch (error) {
      console.error('Failed to load relationships:', error);
      setRelationships([]);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    loadRelationships(selectedCategory);
    setRefreshing(false);
  }, [selectedCategory, loadRelationships]);

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    loadRelationships(category);
  };

  useFocusEffect(
    useCallback(() => {
      loadRelationships(selectedCategory);
    }, [selectedCategory, loadRelationships])
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No relationships yet</Text>
      <Text style={styles.emptyText}>
        Tap the + button below to add your first relationship and start keeping in touch
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterButton,
              selectedCategory === category && styles.filterButtonActive,
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === category && styles.filterTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={relationships}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RelationshipCard relationship={item} />}
        contentContainerStyle={[
          styles.listContent,
          relationships.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/relationship/add')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 8,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
