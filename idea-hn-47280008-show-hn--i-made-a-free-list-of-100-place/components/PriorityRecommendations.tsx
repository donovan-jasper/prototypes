import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getPriorityRecommendations } from '@/lib/directories';
import DirectoryCard from '@/components/DirectoryCard';
import { Category } from '@/constants/categories';

interface PriorityRecommendationsProps {
  category: Category;
  limit?: number;
}

const PriorityRecommendations: React.FC<PriorityRecommendationsProps> = ({
  category,
  limit = 10
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const results = await getPriorityRecommendations(category, limit);
        setRecommendations(results);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [category, limit]);

  const handleDirectoryPress = (id: string) => {
    router.push(`/directory/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading recommendations...</Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Priority Recommendations</Text>
      <Text style={styles.subtitle}>Top {limit} directories for {category}</Text>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <DirectoryCard
              directory={item}
              onPress={() => handleDirectoryPress(item.id)}
              showPriorityScore
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
    marginBottom: 20,
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
