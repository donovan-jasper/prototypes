import { Stripe } from '@stripe/stripe-react-native';
import { createPaymentIntent, confirmPaymentIntent } from './api/stripeApi';

export const calculateSplit = (order, splitType) => {
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = total * 0.08;
  const tip = total * 0.15;
  const deliveryFee = 5.00;
  const grandTotal = total + tax + tip + deliveryFee;

  if (splitType === 'equal') {
    const perPerson = grandTotal / order.participants.length;
    return {
      total: grandTotal,
      perPerson,
      participants: order.participants.map(participant => ({
        ...participant,
        amount: perPerson,
      })),
    };
  }
  return null;
};

export const createPaymentIntents = async (order, participants) => {
  const paymentIntents = [];
  for (const participant of participants) {
    try {
      const paymentIntent = await createPaymentIntent(
        Math.round(participant.amount * 100),
        'usd',
        participant.id
      );
      paymentIntents.push(paymentIntent);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }
  return paymentIntents;
};

export const processPayments = async (order) => {
  try {
    const split = calculateSplit(order, 'equal');

    // Create payment intent for the organizer (who will pay upfront)
    const organizer = order.participants.find(p => p.isOrganizer);
    const paymentIntent = await createPaymentIntent(
      Math.round(split.total * 100),
      'usd',
      organizer.id
    );

    // Create ephemeral key for the customer
    const ephemeralKey = await createEphemeralKey(organizer.stripeCustomerId);

    return {
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: organizer.stripeCustomerId,
      amount: split.total
    };
  } catch (error) {
    console.error('Error processing payments:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentClientSecret, paymentMethodId) => {
  try {
    const paymentIntent = await confirmPaymentIntent(paymentIntentClientSecret, paymentMethodId);
    return paymentIntent;
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    throw error;
  }
};

export const createEphemeralKey = async (customerId) => {
  try {
    const response = await fetch('https://your-backend-api.com/create-ephemeral-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating ephemeral key:', error);
    throw error;
  }
};
