import React, { useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { PaymentContext } from '../../contexts/PaymentContext';

export default function PaymentSetupScreen() {
  const router = useRouter();
  const { confirmSetupIntent } = useStripe();
  const { setupPaymentMethod } = useContext(PaymentContext);
  const [cardDetails, setCardDetails] = useState(null);

  const handleSetupPayment = async () => {
    if (!cardDetails?.complete) {
      alert('Please enter complete card details');
      return;
    }

    try {
      const { error, setupIntent } = await confirmSetupIntent({
        clientSecret: 'YOUR_SETUP_INTENT_CLIENT_SECRET',
      });

      if (error) {
        alert(error.message);
        return;
      }

      await setupPaymentMethod(setupIntent.paymentMethodId);
      router.push('/(tabs)/profile');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Add Payment Method</Text>
      <CardField
        postalCodeEnabled={false}
        onCardChange={cardDetails => setCardDetails(cardDetails)}
        style={styles.cardField}
      />
      <Button
        mode="contained"
        onPress={handleSetupPayment}
        disabled={!cardDetails?.complete}
        style={styles.button}
      >
        Save Payment Method
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 30,
  },
  button: {
    marginTop: 16,
  },
});
