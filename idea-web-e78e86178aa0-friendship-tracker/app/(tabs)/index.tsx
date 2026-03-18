import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Friend, Challenge, getAllFriends, getAllChallenges, initDatabase } from '@/lib/database';
import { calculateConnectionScore } from '@/lib/scoring';
import FriendCard from '@/components/FriendCard';

interface DashboardStats {
  totalFriends: number;
  activeStreaks: number;
  interactionsThisWeek: number;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFriends: 0,
    activeStreaks: 0,
    interactionsThisWeek: 0,
  });
  const [friendsToCheckIn, setFriendsToCheckIn] = useState<Friend[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      await initDatabase();
      
      const allFriends = await getAllFriends();
      const updatedFriends = allFriends.map(friend => ({
        ...friend,
        connectionScore: calculateConnectionScore(friend.lastContact),
      }));
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString();
      
      const activeStreaks = updatedFriends.filter(
        friend => friend.lastContact && friend.lastContact >= sevenDaysAgoStr
      ).length;
      
      const { getInteractionsForFriend } = await import('@/lib/database');
      let totalInteractions = 0;
      for (const friend of allFriends) {
        const interactions = await getInteractionsForFriend(friend.id);
        const recentInteractions = interactions.filter(
          interaction => interaction.date >= sevenDaysAgoStr
        );
        totalInteractions += recentInteractions.length;
      }
      
      setStats({
        totalFriends: allFriends.length,
        activeStreaks,
        interactionsThisWeek: totalInteractions,
      });
      
      const sortedByScore = [...updatedFriends].sort((a, b) => a.connectionScore - b.connectionScore);
      setFriendsToCheckIn(sortedByScore.slice(0, 3));
      
      const allChallenges = await getAllChallenges();
      const activeChallenges = allChallenges.filter(c => !c.completed);
      setChallenges(activeChallenges);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalFriends}</Text>
                <Text style={styles.statLabel}>Total Friends</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.activeStreaks}</Text>
                <Text style={styles.statLabel}>Active Streaks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.interactionsThisWeek}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friends to Check In With</Text>
            {friendsToCheckIn.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No friends to check in with yet</Text>
                <Text style={styles.emptySubtext}>Add some friends to get started</Text>
              </View>
            ) : null}
          </View>
        </>
      }
      data={friendsToCheckIn}
      keyExtractor={(item) => `friend-${item.id}`}
      renderItem={({ item }) => (
        <FriendCard
          friend={item}
          onPress={() => {}}
          onInteractionLogged={loadDashboardData}
        />
      )}
      ListFooterComponent={
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Challenges</Text>
          {challenges.length === 0 ? (
            <View style={styles.challengeCard}>
              <Text style={styles.challengePlaceholder}>No active challenges yet</Text>
              <Text style={styles.challengeSubtext}>Check back later for new challenges</Text>
            </View>
          ) : (
            challenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDescription}>{challenge.description}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            (challenge.progress / challenge.targetCount) * 100,
                            100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {challenge.progress} / {challenge.targetCount}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      }
    />
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
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  emptySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengePlaceholder: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  challengeSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 50,
    textAlign: 'right',
  },
});
