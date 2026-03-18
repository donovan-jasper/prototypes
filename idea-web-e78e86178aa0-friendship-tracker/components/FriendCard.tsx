import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Friend } from '@/lib/database';
import { getConnectionColor, getDaysSinceLastContact } from '@/lib/scoring';

interface FriendCardProps {
  friend: Friend;
  onPress: () => void;
}

export default function FriendCard({ friend, onPress }: FriendCardProps) {
  const daysSince = getDaysSinceLastContact(friend.lastContact);
  const scoreColor = getConnectionColor(friend.connectionScore);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.name}>{friend.name}</Text>
          <Text style={styles.lastContact}>
            {friend.lastContact
              ? `${daysSince} ${daysSince === 1 ? 'day' : 'days'} ago`
              : 'Never contacted'}
          </Text>
        </View>
        <View style={[styles.scoreCircle, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreText}>{friend.connectionScore}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  lastContact: {
    fontSize: 14,
    color: '#666',
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
