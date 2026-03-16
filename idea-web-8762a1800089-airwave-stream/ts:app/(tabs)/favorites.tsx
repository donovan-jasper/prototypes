import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFavorites } from '../../hooks/useFavorites';
import ChannelGrid from '../../components/ChannelGrid';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Channels</Text>
      <ChannelGrid channels={favorites} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
});
