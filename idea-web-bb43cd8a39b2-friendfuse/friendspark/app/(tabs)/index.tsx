import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFriends } from '../../hooks/useFriends';
import { useStreaks } from '../../hooks/useStreaks';
import FriendCard from '../../components/FriendCard';
import { Link } from 'expo-router';

const FriendsListScreen = () => {
  const { friends, isLoading: friendsLoading, refreshFriends } = useFriends();
  const { streaks, isLoading: streaksLoading, refreshStreaks } = useStreaks();

  const isLoading = friendsLoading || streaksLoading;

  const refreshData = async () => {
    await Promise.all([refreshFriends(), refreshStreaks()]);
  };

  // Sort friends: at-risk streaks first, then by current streak length
  const sortedFriends = [...friends].sort((a, b) => {
    const streakA = streaks[a.id];
    const streakB = streaks[b.id];

    if (!streakA && !streakB) return 0;
    if (!streakA) return 1;
    if (!streakB) return -1;

    // At-risk streaks first
    if (streakA.status === 'at-risk' && streakB.status !== 'at-risk') return -1;
    if (streakB.status === 'at-risk' && streakA.status !== 'at-risk') return 1;

    // Then by streak length
    return streakB.current - streakA.current;
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/friend/${item.id}`} asChild>
            <FriendCard
              friend={item}
              streak={streaks[item.id]}
            />
          </Link>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
});

export default FriendsListScreen;
