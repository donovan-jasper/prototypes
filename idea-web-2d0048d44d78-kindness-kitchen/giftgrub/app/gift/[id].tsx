import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';
import DeliveryTracker from '../../components/DeliveryTracker';

const GiftDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { gifts } = useGiftStore();
  const gift = gifts.find(g => g.id === id);

  if (!gift) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Gift not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gift Details</Text>
      <Text style={styles.recipient}>To: {gift.recipientName}</Text>
      <Text style={styles.restaurant}>From: {gift.restaurant}</Text>
      <Text style={styles.message}>Message: {gift.message}</Text>
      <Text style={styles.status}>Status: {gift.status}</Text>
      <DeliveryTracker status={gift.status} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recipient: {
    fontSize: 18,
    marginBottom: 10,
  },
  restaurant: {
    fontSize: 16,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default GiftDetailScreen;
