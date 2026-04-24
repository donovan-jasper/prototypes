import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getFriendById, getInteractions, getChallenges } from '../../lib/database';
import { calculateFriendshipScore } from '../../lib/analytics';
import { calculateStreaks } from '../../lib/streaks';
import { ConnectionTimeline } from '../../components/ConnectionTimeline';
import { ChallengeCard } from '../../components/ChallengeCard';
import { StreakBadge } from '../../components/StreakBadge';
import { Ionicons } from '@expo/vector-icons';

export default function FriendDetailScreen() {
  const { id } = useLocalSearchParams();
  const [friend, setFriend] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const friendData = await getFriendById(id);
        const interactionsData = await getInteractions(id);
        const challengesData = await getChallenges(id);
        const scoreData = await calculateFriendshipScore(id, friendData?.notificationPreference);

        setFriend(friendData);
        setInteractions(interactionsData);
        setChallenges(challengesData);
        setScore(scoreData);
      } catch (error) {
        console.error('Error loading friend data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!friend) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Friend not found</Text>
      </View>
    );
  }

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{friend.name.charAt(0)}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.name}>{friend.name}</Text>
          <StreakBadge friendId={friend.id} />
        </View>
      </View>

      {score && (
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Friendship Score</Text>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBar, { width: `${score.score}%`, backgroundColor: getStatusColor(score.score) }]} />
            <Text style={styles.scoreText}>{score.score}/100</Text>
          </View>

          <View style={styles.scoreBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Frequency</Text>
              <View style={styles.breakdownBar}>
                <View style={[styles.breakdownFill, { width: `${score.breakdown.frequency * 100}%`, backgroundColor: '#FF6B6B' }]} />
              </View>
            </View>

            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Variety</Text>
              <View style={styles.breakdownBar}>
                <View style={[styles.breakdownFill, { width: `${score.breakdown.variety * 100}%`, backgroundColor: '#FF6B6B' }]} />
              </View>
            </View>

            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Challenges</Text>
              <View style={styles.breakdownBar}>
                <View style={[styles.breakdownFill, { width: `${score.breakdown.challengeCompletion * 100}%`, backgroundColor: '#FF6B6B' }]} />
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#FF6B6B" />
          <Text style={styles.actionText}>Log Text</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call-outline" size={24} color="#FF6B6B" />
          <Text style={styles.actionText}>Log Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="people-outline" size={24} color="#FF6B6B" />
          <Text style={styles.actionText}>Log Hangout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Timeline</Text>
        <ConnectionTimeline interactions={interactions} />
      </View>

      {activeChallenges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          {activeChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </View>
      )}

      {completedChallenges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Challenges</Text>
          {completedChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.startChallengeButton}>
        <Text style={styles.startChallengeText}>Start New Challenge</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStatusColor = (score: number) => {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#FFC107'; // Yellow
  if (score >= 40) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFE6E6',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreContainer: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  scoreBreakdown: {
    marginTop: 16,
  },
  breakdownItem: {
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  breakdownBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  startChallengeButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  startChallengeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
