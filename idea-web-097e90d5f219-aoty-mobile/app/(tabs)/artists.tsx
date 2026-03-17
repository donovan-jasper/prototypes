import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getFollowedArtists, addArtist, removeArtist, Artist } from '@/services/database';
import { searchArtists } from '@/services/api';

const FREE_TIER_LIMIT = 10;

export default function ArtistsScreen() {
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadFollowedArtists();
  }, []);

  const loadFollowedArtists = () => {
    const artists = getFollowedArtists();
    setFollowedArtists(artists);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchArtists(query);
      const followedIds = new Set(followedArtists.map(a => a.id));
      setSearchResults(results.filter(artist => !followedIds.has(artist.id)));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleFollow = (artist: Artist) => {
    if (followedArtists.length >= FREE_TIER_LIMIT) {
      Alert.alert(
        'Free Tier Limit Reached',
        `You can only follow ${FREE_TIER_LIMIT} artists on the free tier. Upgrade to premium for unlimited follows!`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      addArtist({ ...artist, followedAt: Date.now() });
      loadFollowedArtists();
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
            removeArtist(artistId);
            loadFollowedArtists();
          },
        },
      ]
    );
  };

  const handleArtistPress = (artistId: string) => {
    router.push(`/artist/${artistId}`);
  };

  const renderSearchResult = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={styles.artistCard}
      onPress={() => handleArtistPress(item.id)}
      activeOpacity={0.7}>
      <Image
        source={
          item.imageUrl
            ? { uri: item.imageUrl }
            : require('@/assets/images/placeholder-album.png')
        }
        style={styles.artistImage}
      />
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.followButton}
        onPress={() => handleFollow(item)}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFollowedArtist = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={styles.artistCard}
      onPress={() => handleArtistPress(item.id)}
      activeOpacity={0.7}>
      <Image
        source={
          item.imageUrl
            ? { uri: item.imageUrl }
            : require('@/assets/images/placeholder-album.png')
        }
        style={styles.artistImage}
      />
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.unfollowButton}
        onPress={() => handleUnfollow(item.id, item.name)}>
        <Text style={styles.unfollowButtonText}>Unfollow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {searchQuery.trim().length >= 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searching ? 'Searching...' : 'Search Results'}
          </Text>
          {searchResults.length === 0 && !searching ? (
            <Text style={styles.emptyText}>No artists found</Text>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Following</Text>
          <Text style={styles.tierLimit}>
            {followedArtists.length}/{FREE_TIER_LIMIT}
          </Text>
        </View>
        {followedArtists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎤</Text>
            <Text style={styles.emptyText}>No artists followed yet</Text>
            <Text style={styles.emptySubtext}>Search above to find artists</Text>
          </View>
        ) : (
          <FlatList
            data={followedArtists}
            renderItem={renderFollowedArtist}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  tierLimit: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  artistCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
  },
  artistInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  followButton: {
    backgroundColor: '#1DB954',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  unfollowButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  unfollowButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});
