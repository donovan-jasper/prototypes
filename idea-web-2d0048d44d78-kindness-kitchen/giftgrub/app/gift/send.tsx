import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import useGiftStore from '../../store/giftStore';
import RestaurantPicker from '../../components/RestaurantPicker';
import MessageComposer from '../../components/MessageComposer';
import { handlePayment } from '../../services/payments';

const SendGiftScreen = () => {
  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { addGift } = useGiftStore();
  const router = useRouter();

  const calculateAmount = () => {
    if (!restaurant) return 0;
    const baseAmounts = {
      '1': 35,
      '2': 28,
      '3': 42,
      '4': 48,
      '5': 32,
    };
    return baseAmounts[restaurant.id] || 30;
  };

  const deliveryFee = 5.99;
  const giftAmount = calculateAmount();
  const totalAmount = giftAmount + deliveryFee;

  const handleNext = async () => {
    if (step === 1 && recipientName) {
      setStep(2);
    } else if (step === 2 && restaurant) {
      setStep(3);
    } else if (step === 3 && message) {
      setStep(4);
    } else if (step === 4) {
      setLoading(true);
      try {
        const paymentSuccess = await handlePayment(Math.round(totalAmount * 100));
        
        if (!paymentSuccess) {
          Alert.alert(
            'Payment Failed',
            'Your payment could not be processed. Please check your payment method and try again.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }

        const newGift = {
          recipientName,
          restaurant: restaurant.name,
          message,
          amount: totalAmount,
          status: 'preparing',
        };
        await addGift(newGift);
        router.push('/(tabs)/history');
      } catch (error) {
        Alert.alert(
          'Error',
          error.message || 'Failed to send gift. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Send a Gift</Text>
      <Text style={styles.stepIndicator}>Step {step} of 4</Text>
      
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Recipient</Text>
          <TextInput
            style={styles.input}
            placeholder="Recipient's Name"
            value={recipientName}
            onChangeText={setRecipientName}
          />
        </View>
      )}
      
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Choose a Restaurant</Text>
          <RestaurantPicker onSelect={setRestaurant} />
          {restaurant && (
            <View style={styles.selectedRestaurant}>
              <Text style={styles.selectedText}>Selected: {restaurant.name}</Text>
            </View>
          )}
        </View>
      )}
      
      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Add a Message</Text>
          <MessageComposer onMessageChange={setMessage} />
        </View>
      )}
      
      {step === 4 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Recipient:</Text>
              <Text style={styles.summaryValue}>{recipientName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Restaurant:</Text>
              <Text style={styles.summaryValue}>{restaurant?.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Message:</Text>
              <Text style={styles.summaryValue}>{message}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gift Amount:</Text>
              <Text style={styles.summaryValue}>${giftAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee:</Text>
              <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity 
            style={[styles.button, styles.backButton]} 
            onPress={handleBack}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.button, styles.nextButton, loading && styles.buttonDisabled]} 
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : step === 4 ? 'Pay & Send Gift' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 10,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  stepContainer: {
    flex: 1,
    minHeight: 300,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  selectedRestaurant: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  selectedText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#757575',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SendGiftScreen;
