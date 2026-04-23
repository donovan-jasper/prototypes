import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMediaStore } from '../../store/mediaStore';
import { MediaGrid } from '../../components/MediaGrid';
import { getDuplicates } from '../../database/queries';

export default function GalleryScreen() {
  const navigation = useNavigation();
  const { media, loading, loadMedia } = useMediaStore();
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMedia();
    loadDuplicateCount();
  }, []);

  const loadDuplicateCount = async () => {
    try {
      const duplicates = await getDuplicates();
      setDuplicateCount(duplicates.length);
    } catch (error) {
      console.error('Error loading duplicate count:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedia();
    await loadDuplicateCount();
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
      {duplicateCount > 0 && (
        <TouchableOpacity
          style={styles.duplicatesButton}
          onPress={() => navigation.navigate('duplicates')}
        >
          <Text style={styles.duplicatesButtonText}>
            {duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''} found
          </Text>
        </TouchableOpacity>
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
  duplicatesButton: {
    backgroundColor: '#FFC107',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  duplicatesButtonText: {
    color: '#333',
    fontWeight: '600',
  },
});
