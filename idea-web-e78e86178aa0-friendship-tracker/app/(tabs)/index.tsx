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
import {
  Friend,
  Challenge,
  getAllFriends,
  getAllChallenges,
  initDatabase,
  updateChallenge,
  getInteractionsForFriend,
} from '@/lib/database';
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
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      const activeStreaks = updatedFriends.filter(
        friend => friend.lastContact && friend.lastContact >= sevenDaysAgoISO
      ).length;

      let totalInteractions = 0;
      for (const friend of allFriends) {
        const interactions = await getInteractionsForFriend(friend.id);
        const recentInteractions = interactions.filter(
          interaction => interaction.date >= sevenDaysAgoISO
        );
        totalInteractions += recentInteractions.length;
      }

      setStats({
        totalFriends: allFriends.length,
        activeStreaks,
        interactionsThisWeek: totalInteractions,
      });

      const sortedByScore = [...updatedFriends].sort(
        (a, b) => a.connectionScore - b.connectionScore
      );
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

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleMarkChallengeComplete = async (challengeId: number) => {
    try {
      await updateChallenge(challengeId, { completed: true, progress: 100 });
      loadDashboardData();
    } catch (error) {
      console.error('Error marking challenge complete:', error);
    }
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalFriends}</Text>
        <Text style={styles.statLabel}>Total Friends</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.activeStreaks}</Text>
        <Text style={styles.statLabel}>Active Streaks</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.interactionsThisWeek}</Text>
        <Text style={styles.statLabel}>This Week</Text>
      </View>
    </View>
  );

  const renderFriendsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Friends to Check In With</Text>
      {friendsToCheckIn.length === 0 ? (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No friends to check in with</Text>
          <Text style={styles.emptySubtext}>Add friends to get started</Text>
        </View>
      ) : (
        friendsToCheckIn.map(friend => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onPress={() => {}}
            onInteractionLogged={loadDashboardData}
          />
        ))
      )}
    </View>
  );

  const renderChallengeItem = ({ item }: { item: Challenge }) => {
    const progressPercentage = (item.progress / item.targetCount) * 100;

    return (
      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>{item.title}</Text>
            <Text style={styles.challengeDescription}>{item.description}</Text>
          </View>
          <View style={styles.challengeType}>
            <Text style={styles.challengeTypeText}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progressPercentage, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.progress} / {item.targetCount}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleMarkChallengeComplete(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.completeButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChallengesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Today's Challenges</Text>
      {challenges.length === 0 ? (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No active challenges</Text>
          <Text style={styles.emptySubtext}>Check back later for new challenges</Text>
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderChallengeItem}
          scrollEnabled={false}
        />
      )}
    </View>
  );

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
      data={[{ key: 'content' }]}
      renderItem={() => (
        <>
          {renderStatsCard()}
          {renderFriendsSection()}
          {renderChallengesSection()}
        </>
      )}
      keyExtractor={(item) => item.key}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
    paddingVertical: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
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
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeInfo: {
    flex: 1,
    marginRight: 12,
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
  },
  challengeType: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  challengeTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
