import React, { useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import ChannelCard from '../components/ChannelCard';
import { AppContext } from '../context/AppContext';

const FavoritesScreen: React.FC = () => {
  const { channels, favorites, removeFavorite } = useContext(AppContext);

  const favoriteChannels = channels.filter(channel =>
    favorites.some(fav => fav.id === channel.id)
  );

  if (favoriteChannels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No favorites yet. Add some from the Home screen!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteChannels}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChannelCard
            channel={item}
            isFavorite={true}
            onToggleFavorite={() => removeFavorite(item.id)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FavoritesScreen;
