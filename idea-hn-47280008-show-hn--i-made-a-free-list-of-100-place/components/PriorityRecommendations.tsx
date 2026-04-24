import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useDirectories } from '@/hooks/useDirectories';
import DirectoryCard from './DirectoryCard';
import { Directory } from '@/lib/database';
import { Category } from '@/constants/categories';

interface PriorityRecommendationsProps {
  category: Category;
  limit?: number;
}

const PriorityRecommendations: React.FC<PriorityRecommendationsProps> = ({
  category,
  limit = 10
}) => {
  const { getPriorityRecommendations } = useDirectories();
  const [recommendations, setRecommendations] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const recs = await getPriorityRecommendations(category, limit);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [category, limit]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Finding best directories...</Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Start Here</Text>
        <Text style={styles.subtitle}>Top {limit} directories for {category}</Text>
      </View>

      <FlatList
        data={recommendations}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `recommendation-${item.id}`}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <DirectoryCard
              directory={item}
              onPress={() => {}}
              showPriorityScore={true}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingVertical: 8,
  },
  cardContainer: {
    width: 280,
    marginRight: 12,
  },
});

export default PriorityRecommendations;
