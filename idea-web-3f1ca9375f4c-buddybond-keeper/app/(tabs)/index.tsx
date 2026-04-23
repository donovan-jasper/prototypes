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
import { Card, Avatar, Button, FAB, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import HealthIndicator from '@/components/HealthIndicator';

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

  const handleReminderPress = (friendId: string) => {
    router.push(`/friend/${friendId}`);
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

  const getReminderText = (reminder: Reminder) => {
    const dueDate = new Date(reminder.dueDate);
    const now = new Date();
    if (dueDate < now) {
      return 'Overdue!';
    }
    return `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
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
        {/* Summary Card */}
        <Card style={styles.statsCard} elevation={2}>
          <Card.Content>
            <Text style={styles.statsTitle}>Friendship Health Dashboard</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Avatar.Icon
                  size={48}
                  icon="account-group"
                  color="#6200EE"
                  style={styles.statIcon}
                />
                <Text style={styles.statValue}>{stats.totalFriends}</Text>
                <Text style={styles.statLabel}>Total Friends</Text>
              </View>
              <View style={styles.statItem}>
                <Avatar.Icon
                  size={48}
                  icon="alert-circle"
                  color="#FF9800"
                  style={styles.statIcon}
                />
                <Text style={[styles.statValue, styles.warningValue]}>{stats.friendsNeedingAttention}</Text>
                <Text style={styles.statLabel}>Need Attention</Text>
              </View>
              <View style={styles.statItem}>
                <Avatar.Icon
                  size={48}
                  icon="calendar-month"
                  color="#4CAF50"
                  style={styles.statIcon}
                />
                <Text style={styles.statValue}>{stats.interactionsThisMonth}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Friends Needing Attention */}
        {needsAttention.length > 0 && (
          <Card style={styles.sectionCard} elevation={2}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Friends Needing Attention</Text>
                <TouchableOpacity onPress={() => router.push('/friends')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              {needsAttention.map(friend => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => handleFriendPress(friend.id)}
                >
                  <Avatar.Image
                    size={40}
                    source={friend.photoUri ? { uri: friend.photoUri } : require('@/assets/images/default-avatar.png')}
                    style={styles.friendAvatar}
                  />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendLastContacted}>
                      Last contacted {getDaysSinceContactText(friend.daysSinceContact)}
                    </Text>
                  </View>
                  <HealthIndicator friend={friend} size={16} />
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <Card style={styles.sectionCard} elevation={2}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
                <TouchableOpacity onPress={() => router.push('/reminders')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              {upcomingReminders.map(reminder => (
                <TouchableOpacity
                  key={reminder.id}
                  style={styles.reminderItem}
                  onPress={() => handleReminderPress(reminder.friendId)}
                >
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderText}>
                      {reminder.friendName} - {getReminderText(reminder)}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            onPress={() => router.push('/log-interaction')}
            icon="message-text"
            style={styles.actionButton}
          >
            Log Interaction
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/add-friend')}
            icon="account-plus"
            style={styles.actionButton}
          >
            Add Friend
          </Button>
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddFriend}
        color="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    backgroundColor: 'transparent',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginTop: 8,
  },
  warningValue: {
    color: '#FF9800',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6200EE',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  friendAvatar: {
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  friendLastContacted: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderText: {
    fontSize: 16,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
});
