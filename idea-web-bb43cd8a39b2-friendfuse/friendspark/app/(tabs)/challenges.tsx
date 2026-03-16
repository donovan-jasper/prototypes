import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import ChallengeCard from '../../components/ChallengeCard';
import { useChallenges } from '../../hooks/useChallenges';

export default function ChallengesScreen() {
  const { challenges } = useChallenges();
  const [activeTab, setActiveTab] = useState('active');

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'active') return challenge.status === 'active';
    if (activeTab === 'available') return challenge.status === 'available';
    if (activeTab === 'completed') return challenge.status === 'completed';
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Text
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          Active
        </Text>
        <Text
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          Available
        </Text>
        <Text
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          Completed
        </Text>
      </View>
      <FlatList
        data={filteredChallenges}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ChallengeCard challenge={item} />}
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
    fontSize: 16,
    color: '#888',
  },
  activeTab: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
});
