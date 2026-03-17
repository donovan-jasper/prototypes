import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useStore } from '../store/useStore';
import {
  initializePaymentSheet,
  processPayment,
  calculateTotal,
  formatCurrency,
} from '../lib/payments';
import { createSentGift } from '../lib/gifts';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890'; // Replace with actual key

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cart, clearCart } = useStore();

  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  const giftId = params.giftId as string;
  const recipientId = params.recipientId as string;
  const message = params.message as string;
  const giftTitle = params.giftTitle as string;
  const giftPrice = parseFloat(params.giftPrice as string);
  const recipientName = params.recipientName as string;

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    setLoading(true);
    const { error } = await initializePaymentSheet(giftPrice, recipientName);

    if (error) {
      Alert.alert('Error', `Failed to initialize payment: ${error}`);
      setLoading(false);
      return;
    }

    setPaymentReady(true);
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!paymentReady) {
      Alert.alert('Error', 'Payment not ready. Please try again.');
      return;
    }

    setLoading(true);

    const { error, success } = await processPayment();

    if (error) {
      Alert.alert('Payment Failed', error);
      setLoading(false);
      return;
    }

    if (success) {
      try {
        // Save the sent gift to database
        await createSentGift({
          giftId: parseInt(giftId),
          recipientId: parseInt(recipientId),
          message: message || '',
          status: 'sent',
        });

        clearCart();

        Alert.alert(
          'Success!',
          `Your gift has been sent to ${recipientName}`,
          [
            {
              text: 'View History',
              onPress: () => router.replace('/(tabs)/history'),
            },
            {
              text: 'Send Another',
              onPress: () => router.replace('/(tabs)/'),
            },
          ]
        );
      } catch (error) {
        Alert.alert('Error', 'Payment succeeded but failed to save gift. Please contact support.');
      }
    }

    setLoading(false);
  };

  const subtotal = giftPrice;
  const processingFee = calculateTotal(giftPrice, 0.029) - giftPrice; // 2.9% Stripe fee
  const total = subtotal + processingFee;

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Review Your Gift</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gift Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Gift:</Text>
              <Text style={styles.value}>{giftTitle}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Recipient:</Text>
              <Text style={styles.value}>{recipientName}</Text>
            </View>
            {message && (
              <View style={styles.messageContainer}>
                <Text style={styles.label}>Message:</Text>
                <Text style={styles.messageText}>{message}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Subtotal:</Text>
              <Text style={styles.value}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Processing Fee:</Text>
              <Text style={styles.value}>{formatCurrency(processingFee)}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Your recipient will receive a link to claim their gift via SMS or email. No app
              download required.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.payButton, (!paymentReady || loading) && styles.buttonDisabled]}
            onPress={handlePayment}
            disabled={!paymentReady || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>Pay {formatCurrency(total)}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
    color: '#666',
  },
  value: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  messageContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginTop: 4,
    fontStyle: 'italic',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  payButton: {
    backgroundColor: '#007AFF',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
