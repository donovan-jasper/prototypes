import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Album } from '@/services/database';

interface AlbumCardProps {
  album: Album;
  artistName: string;
  onPress: () => void;
}

export default function AlbumCard({ album, artistName, onPress }: AlbumCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return styles.scoreGreen;
    if (score >= 50) return styles.scoreYellow;
    return styles.scoreRed;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={
          album.coverUrl
            ? { uri: album.coverUrl }
            : require('@/assets/images/placeholder-album.png')
        }
        style={styles.cover}
      />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {album.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artistName}
        </Text>
      </View>
      <View style={[styles.scoreBadge, getScoreColor(album.consensusScore)]}>
        <Text style={styles.scoreText}>{album.consensusScore}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
