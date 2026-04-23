import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Searchbar, Card, Button, Avatar, Text } from 'react-native-paper';
import { useArtistStore } from '@/stores/artistStore';
import { Artist } from '@/services/database';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { followedArtists, followArtist, unfollowArtist } = useArtistStore();

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call your API
      // For demo purposes, we'll simulate search results
      const mockResults: Artist[] = [
        {
          id: `artist-${searchQuery.toLowerCase()}-1`,
          name: `${searchQuery} Band`,
          imageUrl: 'https://via.placeholder.com/150',
          followedAt: 0
        },
        {
          id: `artist-${searchQuery.toLowerCase()}-2`,
          name: `${searchQuery} Project`,
          imageUrl: 'https://via.placeholder.com/150',
          followedAt: 0
        },
        {
          id: `artist-${searchQuery.toLowerCase()}-3`,
          name: `${searchQuery} Collective`,
          imageUrl: 'https://via.placeholder.com/150',
          followedAt: 0
        }
      ];
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (artist: Artist) => {
    try {
      await followArtist(artist);
    } catch (error) {
      console.error('Failed to follow artist:', error);
    }
  };

  const handleUnfollow = async (artistId: string) => {
    try {
      await unfollowArtist(artistId);
    } catch (error) {
      console.error('Failed to unfollow artist:', error);
    }
  };

  const isArtistFollowed = (artistId: string) => {
    return followedArtists.some(artist => artist.id === artistId);
  };

  const renderItem = ({ item }: { item: Artist }) => {
    const isFollowed = isArtistFollowed(item.id);

    return (
      <Card style={styles.card} mode="outlined">
        <Card.Title
          title={item.name}
          left={(props) => <Avatar.Image {...props} source={{ uri: item.imageUrl }} />}
          right={(props) => (
            <Button
              mode="contained"
              onPress={() => isFollowed ? handleUnfollow(item.id) : handleFollow(item)}
              style={isFollowed ? styles.unfollowButton : styles.followButton}
            >
              {isFollowed ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        />
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search artists"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searchQuery.length > 2 ? (
              <Text style={styles.emptyText}>No artists found</Text>
            ) : (
              <Text style={styles.emptyText}>Type to search for artists</Text>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  followButton: {
    backgroundColor: '#6200ee',
  },
  unfollowButton: {
    backgroundColor: '#ff5252',
  },
  loading: {
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default SearchScreen;
