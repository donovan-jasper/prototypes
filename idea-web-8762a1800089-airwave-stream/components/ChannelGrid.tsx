import React from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '../hooks/useFavorites';
import { Ionicons } from '@expo/vector-icons';

interface Channel {
  id: string;
  name: string;
  number: string;
  currentShow?: string;
}

interface Props {
  channels: Channel[];
  loading?: boolean;
}

export default function ChannelGrid({ channels, loading }: Props) {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();

  const isFavorite = (channelId: string) => {
    return favorites.some(fav => fav.id === channelId);
  };

  const renderItem = ({ item }: { item: Channel }) => (
    <TouchableOpacity
      style={styles.channelItem}
      onPress={() => router.push(`/channel/${item.id}`)}
    >
      <View style={styles.channelInfo}>
        <Text style={styles.channelNumber}>{item.number}</Text>
        <Text style={styles.channelName}>{item.name}</Text>
        {item.currentShow && (
          <Text style={styles.currentShow} numberOfLines={1}>
            {item.currentShow}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite(item);
        }}
        style={styles.favoriteButton}
      >
        <Ionicons
          name={isFavorite(item.id) ? 'star' : 'star-outline'}
          size={24}
          color={isFavorite(item.id) ? '#FFD700' : '#ccc'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <FlatList
      data={channels}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.grid}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 8,
  },
  channelItem: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  channelInfo: {
    flex: 1,
  },
  channelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  currentShow: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
