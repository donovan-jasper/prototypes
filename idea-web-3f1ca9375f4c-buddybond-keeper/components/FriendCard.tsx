import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import { Friend } from '@/lib/types';
import HealthIndicator from './HealthIndicator';

interface FriendCardProps {
  friend: Friend;
  onPress: () => void;
}

export default function FriendCard({ friend, onPress }: FriendCardProps) {
  const getLastContactedText = () => {
    if (!friend.lastContacted) return 'Never contacted';

    const lastContactedDate = new Date(friend.lastContacted);
    const now = new Date();

    // Handle invalid dates
    if (isNaN(lastContactedDate.getTime())) return 'Never contacted';

    const diffTime = Math.abs(now.getTime() - lastContactedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const getHealthStatusText = () => {
    const healthStatus = calculateHealthScore(friend);
    switch (healthStatus) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Needs Attention';
      case 'neglected':
        return 'At Risk';
      default:
        return 'Unknown';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Avatar.Image
        size={56}
        source={friend.photoUri ? { uri: friend.photoUri } : require('@/assets/images/default-avatar.png')}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{friend.name}</Text>
          <View style={styles.healthBadge}>
            <HealthIndicator friend={friend} size={12} />
            <Text style={styles.healthStatusText}>{getHealthStatusText()}</Text>
          </View>
        </View>
        <Text style={styles.lastContacted}>{getLastContactedText()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  avatar: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  lastContacted: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthStatusText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
});
