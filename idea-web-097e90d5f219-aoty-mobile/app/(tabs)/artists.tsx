import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getFollowedArtists, addArtist, removeArtist, Artist } from '@/services/database';
import { searchArtists } from '@/services/api';
import { useArtistStore } from '@/stores/artistStore';
import { useUserStore } from '@/stores/userStore';
import { Button, Card, Avatar, Searchbar, Divider, IconButton } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { registerBackgroundSync } from '@/services/sync';

const FREE_TIER_LIMIT = 10;

export default function ArtistsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const { followedArtists, loadFollowedArtists, followArtist, unfollowArtist } = useArtistStore();
  const { isPremium } = useUserStore();

  useEffect(() => {
    loadFollowedArtists();
    registerBackgroundSync();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setSearching(true);
    setError(null);
    try {
      const results = await searchArtists(query);
      const followedIds = new Set(followedArtists.map(a => a.id));
      setSearchResults(results.filter(artist => !followedIds.has(artist.id)));
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to search artists. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleFollow = (artist: Artist) => {
    if (!isPremium && followedArtists.length >= FREE_TIER_LIMIT) {
      Alert.alert(
        'Free Tier Limit Reached',
        `You can only follow ${FREE_TIER_LIMIT} artists on the free tier. Upgrade to premium for unlimited follows!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/upgrade') }
        ]
      );
      return;
    }

    try {
      followArtist(artist);
      setSearchResults(prev => prev.filter(a => a.id !== artist.id));
      Alert.alert('Success', `Now following ${artist.name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to follow artist');
    }
  };

  const handleUnfollow = (artistId: string, artistName: string) => {
    Alert.alert(
      'Unfollow Artist',
      `Stop following ${artistName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: () => {
            unfollowArtist(artistId);
          },
        },
      ]
    );
  };

  const handleArtistPress = (artistId: string) => {
    router.push(`/artist/${artistId}`);
  };

  const renderSearchResult = ({ item }: { item: Artist }) => (
    <Card style={styles.card} onPress={() => handleArtistPress(item.id)}>
      <Card.Title
        title={item.name}
        left={(props) => (
          <Avatar.Image
            {...props}
            source={
              item.imageUrl
                ? { uri: item.imageUrl }
                : require('@/assets/images/placeholder-artist.png')
            }
            size={40}
          />
        )}
        right={(props) => (
          <Button
            {...props}
            mode="contained"
            onPress={() => handleFollow(item)}
            style={styles.followButton}
          >
            Follow
          </Button>
        )}
      />
    </Card>
  );

  const renderFollowedArtist = ({ item }: { item: Artist }) => (
    <Card style={styles.card} onPress={() => handleArtistPress(item.id)}>
      <Card.Title
        title={item.name}
        left={(props) => (
          <Avatar.Image
            {...props}
            source={
              item.imageUrl
                ? { uri: item.imageUrl }
                : require('@/assets/images/placeholder-artist.png')
            }
            size={40}
          />
        )}
        right={(props) => (
          <Button
            {...props}
            mode="outlined"
            onPress={() => handleUnfollow(item.id, item.name)}
            style={styles.unfollowButton}
          >
            Unfollow
          </Button>
        )}
      />
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}>
      <Searchbar
        placeholder="Search artists..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={{ color: colorScheme === 'dark' ? '#ffffff' : '#000000' }}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colorScheme === 'dark' ? '#ff6b6b' : '#d32f2f' }]}>
            {error}
          </Text>
        </View>
      )}

      {searching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
        </View>
      )}

      {searchQuery && !searching && searchResults.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }]}>
            Search Results
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      {followedArtists.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }]}>
            Followed Artists
          </Text>
          <FlatList
            data={followedArtists}
            renderItem={renderFollowedArtist}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      {followedArtists.length === 0 && !searchQuery && !searching && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }]}>
            You're not following any artists yet. Search above to find artists to follow!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 8,
  },
  followButton: {
    marginRight: 8,
  },
  unfollowButton: {
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
});
