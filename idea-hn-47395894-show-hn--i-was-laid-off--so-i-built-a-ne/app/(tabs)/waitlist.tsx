import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useWaitlistStore } from '../../store/waitlistStore';

export default function Waitlist() {
  const router = useRouter();
  const { waitlists, joinWaitlist, leaveWaitlist } = useWaitlistStore();

  const renderWaitlist = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{item.companyName}</Text>
        <Text variant="bodyMedium">
          {item.participantCount} {item.participantCount === 1 ? 'person' : 'people'} waiting
        </Text>
        <Text variant="bodySmall" style={styles.date}>
          Joined: {item.joinedAt.toLocaleDateString()}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => leaveWaitlist(item.id)}>Leave</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Your Waitlists
      </Text>

      {waitlists.length > 0 ? (
        <FlatList
          data={waitlists}
          renderItem={renderWaitlist}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="bodyMedium">You haven't joined any waitlists yet</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/marketplace')}
            style={styles.button}
          >
            Browse Providers
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    marginBottom: 16
  },
  list: {
    paddingBottom: 16
  },
  card: {
    marginBottom: 12
  },
  date: {
    marginTop: 4,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  button: {
    marginTop: 16
  }
});
