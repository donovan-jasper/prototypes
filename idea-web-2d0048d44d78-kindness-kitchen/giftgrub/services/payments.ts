import { initStripe, presentPaymentSheet } from '@stripe/stripe-react-native';

const API_URL = 'https://your-api-url.com';

export const initializeStripe = async () => {
  await initStripe({
    publishableKey: 'your-publishable-key',
    merchantIdentifier: 'merchant.com.giftgrub',
  });
};

export const createPaymentIntent = async (amount) => {
  const response = await fetch(`${API_URL}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });
  const { clientSecret } = await response.json();
  return clientSecret;
};

export const handlePayment = async (amount) => {
  const clientSecret = await createPaymentIntent(amount);

  const { error } = await presentPaymentSheet({
    paymentIntentClientSecret: clientSecret,
    merchantDisplayName: 'GiftGrub',
  });

  if (error) {
    console.log('Payment failed:', error);
    return false;
  }

  console.log('Payment successful');
  return true;
};
