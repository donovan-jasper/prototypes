import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Button, IconButton, Card, Divider } from 'react-native-paper';
import { format, differenceInDays, isToday } from 'date-fns';
import { useFriends, useInteractions, useChallenges } from '../../hooks';
import { InteractionType, Challenge } from '../../types';
import { calculateStreak, calculateFriendshipScore } from '../../lib/analytics';

const FriendDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { friends, loading: friendsLoading } = useFriends();
  const { interactions, addInteraction, loading: interactionsLoading } = useInteractions();
  const { challenges, addChallenge, loading: challengesLoading } = useChallenges();

  const [friend, setFriend] = useState<any>(null);
  const [friendInteractions, setFriendInteractions] = useState<any[]>([]);
  const [friendChallenges, setFriendChallenges] = useState<Challenge[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [friendshipScore, setFriendshipScore] = useState<number>(0);

  useEffect(() => {
    if (friends && id) {
      const foundFriend = friends.find(f => f.id === id);
      setFriend(foundFriend);
    }
  }, [friends, id]);

  useEffect(() => {
    if (interactions && friend) {
      const filtered = interactions.filter(i => i.friend_id === friend.id);
      setFriendInteractions(filtered);
      const calculatedStreak = calculateStreak(filtered);
      setStreak(calculatedStreak.current);
      const score = calculateFriendshipScore(filtered, friendChallenges);
      setFriendshipScore(score);
    }
  }, [interactions, friend, friendChallenges]);

  useEffect(() => {
    if (challenges && friend) {
      const filtered = challenges.filter(c => c.friend_id === friend.id);
      setFriendChallenges(filtered);
    }
  }, [challenges, friend]);

  const handleLogInteraction = useCallback(async (type: InteractionType) => {
    if (!friend) return;

    try {
      await addInteraction({
        friend_id: friend.id,
        type,
        timestamp: new Date().toISOString(),
        notes: ''
      });
      Alert.alert('Success', `Logged ${type} interaction`);
    } catch (error) {
      Alert.alert('Error', 'Failed to log interaction');
    }
  }, [friend, addInteraction]);

  const handleStartChallenge = () => {
    if (!friend) return;
    router.push({
      pathname: '/challenge/new',
      params: { friendId: friend.id }
    });
  };

  if (friendsLoading || interactionsLoading || challengesLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!friend) {
    return (
      <View style={styles.container}>
        <Text>Friend not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Friend Header */}
      <View style={styles.header}>
        <Avatar.Image size={80} source={{ uri: friend.avatar }} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{friend.name}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{friendshipScore}</Text>
              <Text style={styles.statLabel}>Friendship Score</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          mode="contained"
          onPress={() => handleLogInteraction('text')}
          icon="message-text"
          style={styles.actionButton}
        >
          Text
        </Button>
        <Button
          mode="contained"
          onPress={() => handleLogInteraction('call')}
          icon="phone"
          style={styles.actionButton}
        >
          Call
        </Button>
        <Button
          mode="contained"
          onPress={() => handleLogInteraction('hangout')}
          icon="account-group"
          style={styles.actionButton}
        >
          Hangout
        </Button>
      </View>

      {/* Connection Timeline */}
      <Card style={styles.section}>
        <Card.Title title="Connection Timeline" />
        <Card.Content>
          {friendInteractions.length === 0 ? (
            <Text style={styles.emptyState}>No interactions yet. Start logging your connections!</Text>
          ) : (
            <FlatList
              data={friendInteractions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineDate}>
                      {isToday(new Date(item.timestamp))
                        ? 'Today'
                        : format(new Date(item.timestamp), 'MMM d, yyyy')}
                    </Text>
                    <Text style={styles.timelineType}>{item.type}</Text>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </Card.Content>
      </Card>

      {/* Active Challenges */}
      <Card style={styles.section}>
        <Card.Title
          title="Active Challenges"
          right={() => (
            <Button mode="text" onPress={handleStartChallenge}>
              Start Challenge
            </Button>
          )}
        />
        <Card.Content>
          {friendChallenges.length === 0 ? (
            <Text style={styles.emptyState}>No active challenges. Start one to keep your friendship growing!</Text>
          ) : (
            <FlatList
              data={friendChallenges.filter(c => c.status === 'active')}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.challengeItem}>
                  <Text style={styles.challengeTitle}>{item.title}</Text>
                  <Text style={styles.challengeDescription}>{item.description}</Text>
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  headerText: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  section: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 10,
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontWeight: 'bold',
  },
  timelineType: {
    color: '#666',
  },
  challengeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  challengeTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  challengeDescription: {
    color: '#666',
  },
});

export default FriendDetailScreen;
