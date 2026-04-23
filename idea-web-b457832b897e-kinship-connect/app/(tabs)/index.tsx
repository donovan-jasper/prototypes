import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import MatchCard from '../../components/MatchCard';
import { useMatches } from '../../hooks/useMatches';
import { AuthContext } from '../../contexts/AuthContext';

export default function MatchesScreen() {
  const { matches, loading, error, refreshMatches } = useMatches();
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const handleMatchPress = (match) => {
    router.push(`/match/${match.id}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load matches</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No matches found nearby</Text>
        <Text style={styles.suggestionText}>Try adjusting your location preferences</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={handleMatchPress}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshMatches}
            colors={['#6C63FF']}
            tintColor="#6C63FF"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  listContent: {
    padding: 16,
  },
});
