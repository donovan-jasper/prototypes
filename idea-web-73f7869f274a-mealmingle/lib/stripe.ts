import { createMockPaymentIntent, confirmMockPaymentIntent } from './mockStripe';

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
      const paymentIntent = createMockPaymentIntent(
        Math.round(participant.amount * 100),
        'usd'
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
    const paymentIntents = await createPaymentIntents(order, split.participants);

    // Simulate payment confirmation for all intents
    const confirmedIntents = await Promise.all(
      paymentIntents.map(intent => confirmMockPaymentIntent(intent.clientSecret))
    );

    return {
      status: 'success',
      paymentIntents: confirmedIntents,
      split
    };
  } catch (error) {
    console.error('Error processing payments:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentClientSecret, paymentMethodId) => {
  try {
    const paymentIntent = await confirmMockPaymentIntent(paymentIntentClientSecret);
    return paymentIntent;
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    throw error;
  }
};
