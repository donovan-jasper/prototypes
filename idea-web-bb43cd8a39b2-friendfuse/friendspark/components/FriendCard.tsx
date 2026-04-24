import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StreakBadge } from './StreakBadge';
import { calculateFriendshipScore } from '../lib/analytics';

interface FriendCardProps {
  friend: {
    id: string;
    name: string;
    avatar?: string;
    notificationPreference?: 'daily' | 'weekly' | 'monthly';
  };
  showStreak?: boolean;
  showScore?: boolean;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  showStreak = false,
  showScore = false
}) => {
  const router = useRouter();
  const [score, setScore] = React.useState<number | null>(null);

  React.useEffect(() => {
    const loadScore = async () => {
      if (showScore) {
        const result = await calculateFriendshipScore(friend.id, friend.notificationPreference);
        setScore(result.score);
      }
    };
    loadScore();
  }, [friend.id, friend.notificationPreference, showScore]);

  const handlePress = () => {
    router.push(`/friend/${friend.id}`);
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFC107'; // Yellow
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.avatarContainer}>
        {friend.avatar ? (
          <Image source={{ uri: friend.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{friend.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{friend.name}</Text>

        {showStreak && (
          <StreakBadge friendId={friend.id} />
        )}

        {showScore && score !== null && (
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBar, { width: `${score}%`, backgroundColor: getStatusColor(score) }]} />
            <Text style={styles.scoreText}>{score}/100</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreContainer: {
    marginTop: 8,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
