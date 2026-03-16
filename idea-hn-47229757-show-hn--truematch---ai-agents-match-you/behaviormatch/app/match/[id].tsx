import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMatches } from '../../hooks/useMatches';
import BehaviorInsight from '../../components/BehaviorInsight';
import ConversationStarter from '../../components/ConversationStarter';
import Colors from '../../constants/Colors';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const { matches, loading, fetchMatches } = useMatches();
  const match = matches.find((m) => m.id === id);

  useEffect(() => {
    if (!match) {
      fetchMatches();
    }
  }, [match]);

  if (loading || !match) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{match.matchedUser.name}</Text>
        <Text style={styles.age}>{match.matchedUser.age}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compatibility Insights</Text>
        <BehaviorInsight match={match} detailed />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conversation Starters</Text>
        <ConversationStarter match={match} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  age: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
});
