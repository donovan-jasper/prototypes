import React, { useContext, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Searchbar } from 'react-native-paper';
import ChannelCard from '../components/ChannelCard';
import { AppContext } from '../context/AppContext';

const HomeScreen: React.FC = () => {
  const { channels, favorites, addFavorite, removeFavorite } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChannels, setFilteredChannels] = useState(channels);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setFilteredChannels(
      channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, channels]);

  useEffect(() => {
    setIsLoading(false);
  }, [channels]);

  const handleToggleFavorite = (channelId: string) => {
    if (favorites.some(fav => fav.id === channelId)) {
      removeFavorite(channelId);
    } else {
      addFavorite(channelId);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search channels"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredChannels}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChannelCard
            channel={item}
            isFavorite={favorites.some(fav => fav.id === item.id)}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    marginBottom: 8,
  },
});

export default HomeScreen;
