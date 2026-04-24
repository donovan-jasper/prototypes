import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Card, FAB, IconButton } from 'react-native-paper';
import { useFriends, useInteractions, useChallenges } from '../../hooks';
import { calculateStreak, calculateFriendshipScore } from '../../lib/streaks';
import * as Localization from 'expo-localization';

const FriendsListScreen = () => {
  const router = useRouter();
  const { friends, loading: friendsLoading } = useFriends();
  const { interactions, loading: interactionsLoading } = useInteractions();
  const { challenges, loading: challengesLoading } = useChallenges();

  const [friendsWithStats, setFriendsWithStats] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const calculateStats = useCallback(() => {
    if (!friends || !interactions || !challenges) return [];

    return friends.map(friend => {
      const friendInteractions = interactions.filter(i => i.friend_id === friend.id);
      const friendChallenges = challenges.filter(c => c.friend_id === friend.id);

      const streak = calculateStreak(friendInteractions, Localization.timezone);
      const score = calculateFriendshipScore(friendInteractions, friendChallenges);

      return {
        ...friend,
        streak,
        score
      };
    }).sort((a, b) => {
      // Sort by at-risk streaks first, then by score
      if (a.streak.status === 'at-risk' && b.streak.status !== 'at-risk') return -1;
      if (a.streak.status !== 'at-risk' && b.streak.status === 'at-risk') return 1;
      return b.score - a.score;
    });
  }, [friends, interactions, challenges]);

  useEffect(() => {
    setFriendsWithStats(calculateStats());
  }, [friends, interactions, challenges, calculateStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // In a real app, you would fetch fresh data here
    setFriendsWithStats(calculateStats());
    setRefreshing(false);
  }, [calculateStats]);

  const renderFriendItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push(`/friend/${item.id}`)}>
      <Card style={styles.friendCard}>
        <Card.Content style={styles.friendCardContent}>
          <Avatar.Image size={50} source={{ uri: item.avatar }} />
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{item.name}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.streak.current}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.score}</Text>
                <Text style={styles.statLabel}>Friendship Score</Text>
              </View>
            </View>
          </View>
          {item.streak.status === 'at-risk' && (
            <IconButton
              icon="alert-circle"
              color="#FF6B6B"
              size={20}
              style={styles.alertIcon}
            />
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (friendsLoading || interactionsLoading || challengesLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={friendsWithStats}
        keyExtractor={(item) => item.id}
        renderItem={renderFriendItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text>No friends yet. Add your first friend!</Text>
          </View>
        }
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => router.push('/friend/new')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  friendCard: {
    margin: 8,
    elevation: 2,
  },
  friendCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statItem: {
    marginRight: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  alertIcon: {
    marginLeft: 'auto',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default FriendsListScreen;
