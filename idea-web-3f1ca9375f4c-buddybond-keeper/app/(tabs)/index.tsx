import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { initDatabase, getUpcomingReminders, calculateHealthScore } from '@/lib/database';
import { getDashboardStats, getFriendsNeedingAttention, FriendWithDaysSinceContact } from '@/lib/analytics';
import { Reminder } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalFriends: 0, friendsNeedingAttention: 0, interactionsThisMonth: 0 });
  const [needsAttention, setNeedsAttention] = useState<FriendWithDaysSinceContact[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [dashboardStats, friendsNeedingAttention, reminders] = await Promise.all([
        getDashboardStats(),
        getFriendsNeedingAttention(3),
        getUpcomingReminders(),
      ]);
      
      setStats(dashboardStats);
      setNeedsAttention(friendsNeedingAttention);
      setUpcomingReminders(reminders.slice(0, 2));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    initDatabase().then(() => {
      loadDashboardData();
    });
  }, [loadDashboardData]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleAddFriend = () => {
    router.push('/add-friend');
  };

  const handleFriendPress = (friendId: string) => {
    router.push(`/friend/${friendId}`);
  };

  const getHealthColor = (friend: FriendWithDaysSinceContact) => {
    const healthStatus = calculateHealthScore(friend);
    switch (healthStatus) {
      case 'healthy':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'neglected':
        return '#F44336';
    }
  };

  const getDaysSinceContactText = (days: number) => {
    if (days === Infinity) {
      return 'Never contacted';
    }
    if (days === 0) {
      return 'Today';
    }
    if (days === 1) {
      return '1 day ago';
    }
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6200EE']} />
        }
      >
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Friendship Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalFriends}</Text>
              <Text style={styles.statLabel}>Total Friends</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.warningValue]}>{stats.friendsNeedingAttention}</Text>
              <Text style={styles.statLabel}>Need Attention</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.interactionsThisMonth}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {needsAttention.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friends Needing Attention</Text>
            {needsAttention.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendItem}
                onPress={() => handleFriendPress(friend.id)}
                activeOpacity={0.7}
              >
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendSubtext}>{getDaysSinceContactText(friend.daysSinceContact)}</Text>
                </View>
                <View style={[styles.healthDot, { backgroundColor: getHealthColor(friend) }]} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {upcomingReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
            {upcomingReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderText}>Check in reminder</Text>
                  <Text style={styles.reminderDate}>
                    {formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {stats.totalFriends === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Welcome to KinKeeper</Text>
            <Text style={styles.emptyText}>
              Start building your circle by adding your first friend
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddFriend}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
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
    fontWeight: '700',
    color: '#6200EE',
    marginBottom: 4,
  },
  warningValue: {
    color: '#FF9800',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  friendSubtext: {
    fontSize: 14,
    color: '#757575',
  },
  healthDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  reminderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  reminderDate: {
    fontSize: 14,
    color: '#757575',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
});
