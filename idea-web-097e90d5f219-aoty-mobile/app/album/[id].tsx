import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { calculateConsensusScore } from '../../utils/scoreCalculator';
import ConsensusScore from '../../components/ConsensusScore';
import { mockReviews } from '../../utils/mockData';

// Mock album data
const mockAlbums = {
  '1': {
    id: '1',
    title: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    cover: 'https://example.com/darkside.jpg',
    releaseDate: '1973-03-01',
    reviews: mockReviews.filter(review => review.albumId === '1')
  },
  '2': {
    id: '2',
    title: 'Thriller',
    artist: 'Michael Jackson',
    cover: 'https://example.com/thriller.jpg',
    releaseDate: '1982-11-30',
    reviews: mockReviews.filter(review => review.albumId === '2')
  }
};

export default function AlbumDetail() {
  const { id } = useLocalSearchParams();
  const album = mockAlbums[id as string];

  if (!album) {
    return (
      <View style={styles.container}>
        <Text>Album not found</Text>
      </View>
    );
  }

  const consensusScore = calculateConsensusScore(album.reviews);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{album.title}</Text>
        <Text style={styles.artist}>{album.artist}</Text>
        <Text style={styles.date}>{album.releaseDate}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <ConsensusScore score={consensusScore} reviews={album.reviews} />
      </View>

      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Critic Reviews</Text>
        {album.reviews.map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            <Text style={styles.reviewSource}>{review.source}</Text>
            <Text style={styles.reviewScore}>{review.score}/10</Text>
            <Text style={styles.reviewText}>{review.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#888',
  },
  scoreContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  reviewsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reviewItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  reviewSource: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewScore: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
