import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Achievement } from '../../types';
import { loadAchievements } from '../../lib/storage';

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadAchievementsData();
  }, []);

  const loadAchievementsData = async () => {
    const loadedAchievements = await loadAchievements();
    setAchievements(loadedAchievements);
  };

  const renderAchievementItem = ({ item }: { item: Achievement }) => (
    <View style={[styles.achievementItem, item.earned && styles.achievementEarned]}>
      <View style={styles.achievementContent}>
        <Text style={[styles.achievementTitle, item.earned && styles.achievementTitleEarned]}>
          {item.title}
        </Text>
        <Text style={styles.achievementDescription}>{item.description}</Text>
        {item.earned && (
          <Text style={styles.achievementDate}>
            Earned on: {new Date(item.earned_at!).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View style={styles.achievementStatus}>
        {item.earned ? (
          <Image
            source={require('../../assets/images/trophy.png')}
            style={styles.trophyIcon}
          />
        ) : (
          <View style={styles.lockedIcon}>
            <Text style={styles.lockedText}>🔒</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Achievements</Text>
      <FlatList
        data={achievements}
        renderItem={renderAchievementItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.achievementList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  achievementList: {
    paddingBottom: 20,
  },
  achievementItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementEarned: {
    backgroundColor: '#e8f5e9',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#888',
    marginBottom: 5,
  },
  achievementTitleEarned: {
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
  },
  achievementStatus: {
    marginLeft: 10,
  },
  trophyIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFD700',
  },
  lockedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 12,
  },
});
