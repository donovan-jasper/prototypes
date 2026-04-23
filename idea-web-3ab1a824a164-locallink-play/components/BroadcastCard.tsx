import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Broadcast } from '../types';
import { formatDistance } from '../lib/location';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useBroadcastStore } from '../store/broadcastStore';

interface BroadcastCardProps {
  broadcast: Broadcast;
}

export default function BroadcastCard({ broadcast }: BroadcastCardProps) {
  const { user } = useAuthStore();
  const { expressInterest } = useBroadcastStore();
  const [expressing, setExpressing] = useState(false);

  const isExpired = new Date(broadcast.expiresAt) < new Date();
  const timeLeft = getTimeLeft(broadcast.expiresAt);

  const handleInterest = async () => {
    if (!user || expressing || broadcast.interested) return;

    setExpressing(true);
    try {
      await expressInterest(broadcast.id);
    } catch (error) {
      console.error('Error expressing interest:', error);
    } finally {
      setExpressing(false);
    }
  };

  return (
    <View style={[styles.card, isExpired && styles.cardExpired]}>
      <View style={styles.header}>
        <View style={styles.activityContainer}>
          <Text style={styles.activity}>{broadcast.activity}</Text>
          {broadcast.groupSize > 1 && (
            <Text style={styles.groupSize}>Group of {broadcast.groupSize}</Text>
          )}
        </View>
        <View style={styles.timeContainer}>
          {broadcast.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
          <Text style={styles.timeLeft}>{isExpired ? 'Expired' : timeLeft}</Text>
        </View>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{broadcast.userName}</Text>
        <Text style={styles.distance}>{formatDistance(broadcast.distance)}</Text>
      </View>

      {broadcast.description && (
        <Text style={styles.description}>{broadcast.description}</Text>
      )}

      {!isExpired && broadcast.userId !== user?.id && (
        <TouchableOpacity
          style={[
            styles.interestButton,
            (expressing || broadcast.interested) && styles.interestButtonDisabled,
          ]}
          onPress={handleInterest}
          disabled={expressing || broadcast.interested}
        >
          {expressing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.interestButtonText}>
              {broadcast.interested ? 'Interest Sent' : 'Interested'}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {isExpired && (
        <View style={styles.expiredBadge}>
          <Text style={styles.expiredText}>Expired</Text>
        </View>
      )}
    </View>
  );
}

function getTimeLeft(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 0) return 'Expired';
  if (diffMins < 60) return `${diffMins}m left`;

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m left`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardExpired: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityContainer: {
    flex: 1,
  },
  activity: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  groupSize: {
    fontSize: 14,
    color: '#666666',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  timeLeft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  distance: {
    fontSize: 14,
    color: '#666666',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  interestButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  interestButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  interestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  expiredBadge: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  expiredText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
