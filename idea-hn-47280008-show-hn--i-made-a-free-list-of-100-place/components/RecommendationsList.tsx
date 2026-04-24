import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import DirectoryCard from './DirectoryCard';
import { getTopDirectories } from '@/lib/directories';
import { Directory } from '@/lib/database';

interface RecommendationsListProps {
  category: string;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ category }) => {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const topDirectories = await getTopDirectories(category, 10);
        setRecommendations(topDirectories);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [category]);

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
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recommendations available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Priority Recommendations</Text>
      <Text style={styles.subtitle}>Top 10 directories for your category</Text>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DirectoryCard
            directory={item}
            onPress={() => handleDirectoryPress(item.id)}
            showPriorityScore
          />
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        nestedScrollEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default RecommendationsList;
