import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { saveGift } from '../../services/database';

const CheckoutScreen = () => {
  const router = useRouter();
  const { gifts, updateGiftStatus } = useGiftStore();
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);

  const currentGift = gifts.find(g => g.status === 'pending');

  if (!currentGift) {
    return (
      <View style={styles.container}>
        <Text>No gift in progress</Text>
      </View>
    );
  }

  const handlePayment = async () => {
    setLoading(true);

    try {
      // In a real app, you would call your backend to create a PaymentIntent
      // For this prototype, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update gift status
      const updatedGift = {
        ...currentGift,
        status: 'processing',
        createdAt: new Date().toISOString(),
      };

      // Save to database
      await saveGift(updatedGift);

      // Update store
      updateGiftStatus(currentGift.id, 'processing');

      Alert.alert(
        'Payment Successful',
        'Your gift is being processed!',
        [
          {
            text: 'View Gift',
            onPress: () => router.push(`/gift/${currentGift.id}`),
          },
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/history'),
          },
        ]
      );
    } catch (error) {
      console.error('Payment failed:', error);
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Restaurant: {currentGift.restaurant.name}</Text>
        <Text style={styles.summaryText}>Recipient: {currentGift.recipientName}</Text>
        <Text style={styles.summaryText}>Message: {currentGift.message}</Text>
        <Text style={styles.summaryText}>Amount: ${currentGift.amount.toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Payment Information</Text>

      <CardField
        postalCodeEnabled={false}
        placeholders={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        }}
        style={styles.cardField}
      />

      <TouchableOpacity
        style={styles.payButton}
        onPress={handlePayment}
        disabled={loading}
      >
        <Text style={styles.payButtonText}>
          {loading ? 'Processing...' : `Pay $${currentGift.amount.toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  summaryContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginBottom: 24,
  },
  payButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
