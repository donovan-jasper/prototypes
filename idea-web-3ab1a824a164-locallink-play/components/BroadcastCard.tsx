import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistance } from '../lib/location';
import { formatTimeLeft } from '../lib/time';

interface Broadcast {
  id: string;
  userId: string;
  userName: string;
  activity: string;
  description?: string;
  groupSize: number;
  lat: number;
  lng: number;
  distance: number;
  expiresAt: string;
  createdAt: string;
  isPremium: boolean;
  interested?: boolean;
}

interface BroadcastCardProps {
  broadcast: Broadcast;
  onInterest: (broadcastId: string) => Promise<{ chatId: string; isUnlocked: boolean }>;
}

export default function BroadcastCard({ broadcast, onInterest }: BroadcastCardProps) {
  const timeLeft = formatTimeLeft(broadcast.expiresAt);
  const isExpired = new Date(broadcast.expiresAt) < new Date();

  const handleInterest = async () => {
    if (isExpired) return;
    await onInterest(broadcast.id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{broadcast.userName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{broadcast.userName}</Text>
            <Text style={styles.activity}>{broadcast.activity}</Text>
          </View>
        </View>
        {broadcast.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>

      {broadcast.description && (
        <Text style={styles.description}>{broadcast.description}</Text>
      )}

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.detailText}>Group: {broadcast.groupSize}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDistance(broadcast.distance)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.detailText}>{timeLeft}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.interestButton,
          (isExpired || broadcast.interested) && styles.disabledButton
        ]}
        onPress={handleInterest}
        disabled={isExpired || broadcast.interested}
      >
        <Text style={styles.interestButtonText}>
          {isExpired ? 'Expired' : broadcast.interested ? 'Interested' : 'Interested'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  activity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  premiumText: {
    color: '#854400',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666',
  },
  interestButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  interestButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
