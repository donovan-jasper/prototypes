import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSuggestedMatches } from '@/lib/matching';
import { User } from '@/lib/types';
import MatchCard from '@/components/MatchCard';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Array<User & { matchScore: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadMatches = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setError('Not logged in');
        return;
      }

      const suggestedMatches = await getSuggestedMatches(userId);
      setMatches(suggestedMatches);
      setError('');
    } catch (err) {
      console.error('Failed to load matches:', err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMatches();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>No matches yet</Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          Update your interests in your profile to find connections
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MatchCard user={item} matchScore={item.matchScore} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
  },
});
