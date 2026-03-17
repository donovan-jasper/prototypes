import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useIssuesStore } from '../../store/issuesStore';
import IssueCard from '../../components/IssueCard';
import { Issue } from '../../types';

const SmartMatchFeed = () => {
  const { matchedIssues, fetchMatches, claimIssue, loading, error } = useIssuesStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  const handleClaim = async (issue: Issue) => {
    await claimIssue(issue);
  };

  if (loading && matchedIssues.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Finding your perfect issues...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load issues. Please try again.</Text>
      </View>
    );
  }

  if (matchedIssues.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No matches found. Try refreshing or adjusting your filters.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={matchedIssues}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <IssueCard
          issue={item}
          onClaim={() => handleClaim(item)}
        />
      )}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
  },
});

export default SmartMatchFeed;
