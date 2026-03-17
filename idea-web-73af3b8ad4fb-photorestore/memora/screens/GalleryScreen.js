import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRestorations } from '../services/StorageService';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 3;

const GalleryScreen = ({ navigation }) => {
  const [restorations, setRestorations] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadRestorations();
    }, [])
  );

  const loadRestorations = async () => {
    const data = await getRestorations();
    setRestorations(data);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate('Detail', { restoration: item })}
    >
      <Image source={{ uri: item.restoredUri }} style={styles.thumbnail} />
      <View style={styles.qualityBadge}>
        <Text style={styles.qualityText}>{(item.quality * 100).toFixed(0)}%</Text>
      </View>
    </TouchableOpacity>
  );

  if (restorations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No saved restorations yet</Text>
        <Text style={styles.emptySubtext}>Restore a photo to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={restorations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  grid: {
    padding: 8,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  qualityBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default GalleryScreen;
