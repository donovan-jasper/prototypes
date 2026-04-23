import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';

const GiftDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { gifts } = useGiftStore();

  const gift = gifts.find((g) => g.id === id);

  if (!gift) {
    return (
      <View style={styles.container}>
        <Text>Gift not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: gift.restaurant.image }}
        style={styles.restaurantImage}
      />

      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[
            styles.statusText,
            gift.status === 'delivered' && styles.deliveredStatus,
            gift.status === 'pending' && styles.pendingStatus,
          ]}>
            {gift.status}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Recipient</Text>
        <Text style={styles.recipientName}>{gift.recipientName}</Text>

        <Text style={styles.sectionTitle}>Restaurant</Text>
        <Text style={styles.restaurantName}>{gift.restaurant.name}</Text>
        <Text style={styles.restaurantDetails}>
          {gift.restaurant.cuisine} • {gift.restaurant.rating} ★ • {gift.restaurant.deliveryTime} min
        </Text>

        <Text style={styles.sectionTitle}>Message</Text>
        <Text style={styles.message}>{gift.message}</Text>

        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Scheduled for:</Text>
          <Text style={styles.detailValue}>
            {new Date(gift.scheduledFor).toLocaleString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>${gift.amount.toFixed(2)}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/gift/send')}
          >
            <Text style={styles.buttonText}>Send Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back to History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  restaurantImage: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deliveredStatus: {
    color: '#4CAF50',
  },
  pendingStatus: {
    color: '#FF9800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  recipientName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 30,
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  secondaryButtonText: {
    color: '#333',
  },
});

export default GiftDetailScreen;
