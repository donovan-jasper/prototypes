import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useMatches } from '../../hooks/useMatches';
import { Link } from 'expo-router';
import Colors from '../../constants/Colors';

export default function ConversationsScreen() {
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
      <FlatList
        data={matches.filter((match) => match.status === 'accepted')}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link
            href={`/match/${item.id}`}
            style={styles.conversationItem}
          >
            <Text style={styles.conversationText}>
              {item.matchedUser.name}
            </Text>
          </Link>
        )}
      />
    </View>
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
  conversationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  conversationText: {
    fontSize: 16,
    color: Colors.text,
  },
});
