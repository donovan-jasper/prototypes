import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Avatar } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { LIQUIDITY_PROVIDERS } from '../../lib/constants';
import { useWaitlistStore } from '../../store/waitlistStore';

export default function ProviderDetail() {
  const { id } = useLocalSearchParams();
  const provider = LIQUIDITY_PROVIDERS.find(p => p.id === id);
  const { joinWaitlist } = useWaitlistStore();

  if (!provider) {
    return (
      <View style={styles.container}>
        <Text variant="titleLarge">Provider not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Title
          title={provider.name}
          subtitle={`${provider.feePercentage}% fee | ${provider.payoutDays} days`}
          left={(props) => <Avatar.Image {...props} source={{ uri: provider.logo }} />}
        />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.description}>
            {provider.description}
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text variant="bodySmall">Rating</Text>
              <Text variant="bodyMedium">{provider.rating}/5</Text>
            </View>
            <View style={styles.stat}>
              <Text variant="bodySmall">Minimum Shares</Text>
              <Text variant="bodyMedium">{provider.minimumShares}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">About {provider.name}</Text>
          <Text variant="bodyMedium" style={styles.aboutText}>
            {provider.description} This provider specializes in connecting shareholders with
            liquidity opportunities in early-stage companies. Their platform offers
            transparent pricing, secure transactions, and dedicated support for
            both individual investors and institutional buyers.
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => joinWaitlist(provider.name)}
        style={styles.button}
      >
        Join Waitlist
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  headerCard: {
    margin: 16
  },
  description: {
    marginTop: 8
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16
  },
  stat: {
    alignItems: 'center'
  },
  card: {
    margin: 16,
    marginTop: 0
  },
  aboutText: {
    marginTop: 8,
    lineHeight: 22
  },
  button: {
    margin: 16
  }
});
