import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useStore } from '../../store/useStore';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { userStats, isPremium, rewards } = useStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={60} color="#6c5ce7" />
        </View>
        <Text style={styles.levelText}>Level {userStats.level}</Text>
        <Text style={styles.pointsText}>{userStats.totalPoints} points</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rewards</Text>
        <View style={styles.rewardsContainer}>
          {rewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <Ionicons
                name={reward.unlocked ? 'trophy' : 'lock-closed'}
                size={30}
                color={reward.unlocked ? '#6c5ce7' : '#b2bec3'}
              />
              <Text style={styles.rewardName}>{reward.name}</Text>
              <Text style={styles.rewardPoints}>{reward.pointsRequired} pts</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notification Time</Text>
          <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Default Duration</Text>
          <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Voice Pack</Text>
          <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <View style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
          <Text style={styles.premiumText}>Unlock all features and support the app</Text>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  pointsText: {
    fontSize: 16,
    color: '#6c5ce7',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d3436',
  },
  rewardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: '30%',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  rewardName: {
    fontSize: 12,
    color: '#2d3436',
    textAlign: 'center',
  },
  rewardPoints: {
    fontSize: 10,
    color: '#636e72',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f6fa',
  },
  settingText: {
    fontSize: 16,
    color: '#2d3436',
  },
  premiumCard: {
    backgroundColor: '#6c5ce7',
    padding: 20,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  premiumText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  premiumButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  premiumButtonText: {
    color: '#6c5ce7',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
