import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Chip, Avatar } from 'react-native-paper';
import { User } from '@/lib/types';

interface MatchCardProps {
  user: User;
  matchScore: number;
  onConnect: (userId: string) => void;
  isConnecting: boolean;
}

export default function MatchCard({ user, matchScore, onConnect, isConnecting }: MatchCardProps) {
  const sharedInterests = user.interests.slice(0, 3);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Avatar.Image
            size={64}
            source={user.photoUrl ? { uri: user.photoUrl } : require('@/assets/images/default-avatar.png')}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text variant="titleLarge" style={styles.name}>{user.name}</Text>
            <Text variant="bodyMedium" style={styles.age}>{user.age} years old</Text>
            {user.isPremium && (
              <Chip mode="flat" style={styles.premiumBadge}>Premium</Chip>
            )}
          </View>
        </View>

        {user.bio && (
          <Text variant="bodyMedium" style={styles.bio}>{user.bio}</Text>
        )}

        <View style={styles.matchScoreContainer}>
          <Text variant="bodySmall" style={styles.matchScoreLabel}>Match Score:</Text>
          <Text variant="bodyMedium" style={styles.matchScoreValue}>
            {Math.round(matchScore)}%
          </Text>
        </View>

        {sharedInterests.length > 0 && (
          <View style={styles.interests}>
            <Text variant="bodySmall" style={styles.interestsLabel}>Shared Interests:</Text>
            <View style={styles.interestChips}>
              {sharedInterests.map((interest) => (
                <Chip key={interest} mode="outlined" style={styles.interestChip}>
                  {interest}
                </Chip>
              ))}
              {user.interests.length > 3 && (
                <Chip mode="outlined" style={styles.interestChip}>
                  +{user.interests.length - 3} more
                </Chip>
              )}
            </View>
          </View>
        )}
      </Card.Content>

      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => onConnect(user.id)}
          loading={isConnecting}
          disabled={isConnecting}
          style={styles.connectButton}
        >
          Connect
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
  },
  age: {
    color: '#666',
    marginTop: 2,
  },
  premiumBadge: {
    backgroundColor: '#ffd700',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  bio: {
    marginTop: 8,
    color: '#444',
    lineHeight: 20,
  },
  matchScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  matchScoreLabel: {
    color: '#666',
    marginRight: 8,
  },
  matchScoreValue: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  interests: {
    marginTop: 12,
  },
  interestsLabel: {
    color: '#666',
    marginBottom: 8,
  },
  interestChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  connectButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 20,
  },
});
