import { StyleSheet, View, Text, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getAllAlbums, getArtistById, Album } from '@/services/database';
import { syncNewReleases } from '@/services/sync';

interface AlbumWithArtist extends Album {
  artistName: string;
}

export default function HomeScreen() {
  const [albums, setAlbums] = useState<AlbumWithArtist[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    const allAlbums = getAllAlbums();
    const albumsWithArtists = allAlbums.map((album) => {
      const artist = getArtistById(album.artistId);
      return {
        ...album,
        artistName: artist?.name || 'Unknown Artist',
      };
    });
    setAlbums(albumsWithArtists);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncNewReleases();
      await loadAlbums();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAlbumPress = (albumId: string) => {
    router.push(`/album/${albumId}`);
  };

  const renderAlbumCard = ({ item }: { item: AlbumWithArtist }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleAlbumPress(item.id)}
      activeOpacity={0.7}>
      <Image
        source={
          item.coverUrl
            ? { uri: item.coverUrl }
            : require('@/assets/images/placeholder-album.png')
        }
        style={styles.cover}
      />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {item.artistName}
        </Text>
      </View>
      <View style={[styles.scoreBadge, getScoreColor(item.consensusScore)]}>
        <Text style={styles.scoreText}>{item.consensusScore}</Text>
      </View>
    </TouchableOpacity>
  );

  const getScoreColor = (score: number) => {
    if (score >= 75) return styles.scoreGreen;
    if (score >= 50) return styles.scoreYellow;
    return styles.scoreRed;
  };

  if (albums.length === 0 && !refreshing) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎵</Text>
        <Text style={styles.emptyTitle}>No albums yet</Text>
        <Text style={styles.emptyText}>Follow artists to see their albums here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={albums}
        renderItem={renderAlbumCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#1DB954"
            colors={['#1DB954']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  cover: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#999',
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreGreen: {
    backgroundColor: '#1DB954',
  },
  scoreYellow: {
    backgroundColor: '#FFA500',
  },
  scoreRed: {
    backgroundColor: '#FF4444',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
