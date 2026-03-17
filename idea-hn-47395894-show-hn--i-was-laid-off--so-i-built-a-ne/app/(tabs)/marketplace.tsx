import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LIQUIDITY_PROVIDERS } from '../../lib/constants';

export default function Marketplace() {
  const router = useRouter();

  const renderProvider = ({ item }: { item: any }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/provider/${item.id}`)}
    >
      <Card.Title
        title={item.name}
        subtitle={`${item.feePercentage}% fee | ${item.payoutDays} days`}
        left={(props) => <Avatar.Image {...props} source={{ uri: item.logo }} />}
      />
      <Card.Content>
        <Text variant="bodyMedium" numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.ratingContainer}>
          <Text variant="bodySmall">Rating: {item.rating}/5</Text>
          <Text variant="bodySmall">Min: {item.minimumShares} shares</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Liquidity Providers
      </Text>
      <FlatList
        data={LIQUIDITY_PROVIDERS}
        renderItem={renderProvider}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
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
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  }
});
