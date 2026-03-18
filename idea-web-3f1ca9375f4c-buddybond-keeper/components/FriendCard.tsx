import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Friend, HealthStatus } from '@/lib/types';
import { calculateHealthScore } from '@/lib/database';
import { formatDistanceToNow } from 'date-fns';

interface FriendCardProps {
  friend: Friend;
  onPress: () => void;
}

export default function FriendCard({ friend, onPress }: FriendCardProps) {
  const healthStatus = calculateHealthScore(friend);
  
  const getHealthColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'neglected':
        return '#F44336';
    }
  };

  const getLastContactedText = () => {
    if (!friend.lastContacted) {
      return 'Never contacted';
    }
    try {
      return formatDistanceToNow(new Date(friend.lastContacted), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {friend.photoUri ? (
          <Image source={{ uri: friend.photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={styles.photoPlaceholderText}>
              {friend.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View style={styles.info}>
          <Text style={styles.name}>{friend.name}</Text>
          <Text style={styles.lastContacted}>{getLastContactedText()}</Text>
        </View>

        <View style={[styles.healthIndicator, { backgroundColor: getHealthColor(healthStatus) }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
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
    alignItems: 'center',
    padding: 16,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  photoPlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#757575',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  lastContacted: {
    fontSize: 14,
    color: '#757575',
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
});
