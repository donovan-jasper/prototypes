import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { User } from '@/lib/types';

interface MatchCardProps {
  user: User;
  matchScore: number;
}

export default function MatchCard({ user, matchScore }: MatchCardProps) {
  const handleConnect = () => {
    console.log('Connect with', user.name);
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleLarge" style={styles.name}>{user.name}</Text>
            <Text variant="bodyMedium" style={styles.age}>{user.age} years old</Text>
          </View>
          {user.isPremium && (
            <Chip mode="flat" style={styles.premiumBadge}>Premium</Chip>
          )}
        </View>

        {user.bio && (
          <Text variant="bodyMedium" style={styles.bio}>{user.bio}</Text>
        )}

        <View style={styles.matchScore}>
          <Text variant="bodySmall" style={styles.matchScoreLabel}>Match Score:</Text>
          <Text variant="bodyMedium" style={styles.matchScoreValue}>
            {Math.round(matchScore)}%
          </Text>
        </View>

        {user.interests.length > 0 && (
          <View style={styles.interests}>
            <Text variant="bodySmall" style={styles.interestsLabel}>Shared Interests:</Text>
            <View style={styles.interestChips}>
              {user.interests.slice(0, 5).map((interest) => (
                <Chip key={interest} mode="outlined" style={styles.interestChip}>
                  {interest}
                </Chip>
              ))}
              {user.interests.length > 5 && (
                <Chip mode="outlined" style={styles.interestChip}>
                  +{user.interests.length - 5} more
                </Chip>
              )}
            </View>
          </View>
        )}
      </Card.Content>

      <Card.Actions>
        <Button mode="contained" onPress={handleConnect} style={styles.connectButton}>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
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
  },
  bio: {
    marginTop: 8,
    color: '#444',
  },
  matchScore: {
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
  },
});
