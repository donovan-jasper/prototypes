import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import ChallengeCard from '../../components/ChallengeCard';
import { useChallenges } from '../../hooks/useChallenges';
import { useFriends } from '../../hooks/useFriends';
import { CHALLENGES } from '../../constants/challenges';
import { updateChallengeStatus } from '../../lib/database';

export default function ChallengesScreen() {
  const { challenges, refreshChallenges } = useChallenges();
  const { friends } = useFriends();
  const [activeTab, setActiveTab] = useState('active');
  const [displayChallenges, setDisplayChallenges] = useState([]);

  useEffect(() => {
    loadChallenges();
  }, [challenges, activeTab, friends]);

  const loadChallenges = () => {
    if (activeTab === 'active') {
      const activeChallenges = challenges
        .filter(c => c.status === 'active')
        .map(c => {
          const friend = friends.find(f => f.id === c.friend_id);
          return { ...c, friend };
        });
      setDisplayChallenges(activeChallenges);
    } else if (activeTab === 'available') {
      const startedChallengeTypes = challenges.map(c => c.challenge_type);
      const available = CHALLENGES.filter(c => !startedChallengeTypes.includes(c.title));
      setDisplayChallenges(available);
    } else if (activeTab === 'completed') {
      const completedChallenges = challenges
        .filter(c => c.status === 'completed')
        .map(c => {
          const friend = friends.find(f => f.id === c.friend_id);
          return { ...c, friend };
        });
      setDisplayChallenges(completedChallenges);
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    await updateChallengeStatus(challengeId, 'completed');
    await refreshChallenges();
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={displayChallenges}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ChallengeCard 
            challenge={item} 
            onComplete={activeTab === 'active' ? handleCompleteChallenge : null}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {activeTab === 'active' && 'No active challenges'}
              {activeTab === 'available' && 'No available challenges'}
              {activeTab === 'completed' && 'No completed challenges'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
