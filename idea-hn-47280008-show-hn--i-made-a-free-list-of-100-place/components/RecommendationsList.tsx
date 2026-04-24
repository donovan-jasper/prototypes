import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import DirectoryCard from './DirectoryCard';
import { getPriorityRecommendations } from '@/lib/directories';
import { Directory } from '@/lib/database';

interface RecommendationsListProps {
  category: string;
}

export default function RecommendationsList({ category }: RecommendationsListProps) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        const recs = await getPriorityRecommendations(category, 5);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [category]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Finding best matches...</Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Here</Text>
      <Text style={styles.subtitle}>Top recommendations for {category}</Text>

      <FlatList
        data={recommendations}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <DirectoryCard
              directory={item}
              onPress={() => router.push(`/directory/${item.id}`)}
              compact
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  listContent: {
    paddingVertical: 8,
  },
  cardContainer: {
    marginRight: 12,
    width: 220,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
