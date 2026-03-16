import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useMatches } from '../../hooks/useMatches';
import BehaviorInsight from '../../components/BehaviorInsight';
import Colors from '../../constants/Colors';

export default function InsightsScreen() {
  const { matches, loading, fetchMatches } = useMatches();

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {matches.length > 0 ? (
        <BehaviorInsight match={matches[0]} />
      ) : (
        <Text style={styles.noMatchesText}>No matches yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  noMatchesText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
});
