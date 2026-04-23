import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useMediaStore } from '../../store/mediaStore';
import { MediaGrid } from '../../components/MediaGrid';
import { DuplicateCard } from '../../components/DuplicateCard';
import { getDuplicates } from '../../database/queries';

export default function GalleryScreen() {
  const { media, loading, loadMedia } = useMediaStore();
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [currentDuplicateIndex, setCurrentDuplicateIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMedia();
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    try {
      const foundDuplicates = await getDuplicates();
      setDuplicates(foundDuplicates);
    } catch (error) {
      console.error('Error loading duplicates:', error);
    }
  };

  const handleDuplicateResolved = () => {
    if (currentDuplicateIndex < duplicates.length - 1) {
      setCurrentDuplicateIndex(currentDuplicateIndex + 1);
    } else {
      setDuplicates([]);
      setCurrentDuplicateIndex(0);
    }
    loadMedia(); // Refresh media after resolution
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedia();
    await loadDuplicates();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {duplicates.length > 0 && currentDuplicateIndex < duplicates.length && (
        <DuplicateCard
          duplicates={duplicates[currentDuplicateIndex]}
          onResolve={handleDuplicateResolved}
        />
      )}

      <FlatList
        data={media}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MediaGrid item={item} />}
        numColumns={3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No media found. Connect a cloud service to sync photos.</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
  },
});
