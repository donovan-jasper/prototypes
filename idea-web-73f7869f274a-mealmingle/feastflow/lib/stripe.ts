import { Stripe } from '@stripe/stripe-react-native';

const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');

export const calculateSplit = (order, splitType) => {
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (splitType === 'equal') {
    const perPerson = total / order.participants.length;
    return {
      total,
      perPerson,
      participants: order.participants.map(participant => ({
        ...participant,
        amount: perPerson,
      })),
    };
  }
  // Add custom split logic here
  return null;
};

export const createPaymentIntents = async (order, participants) => {
  const paymentIntents = [];
  for (const participant of participants) {
    const paymentIntent = await stripe.createPaymentIntent({
      amount: participant.amount * 100, // Stripe uses cents
      currency: 'usd',
      paymentMethodType: 'Card',
    });
    paymentIntents.push(paymentIntent);
  }
  return paymentIntents;
};

export const processPayments = async (order) => {
  const split = calculateSplit(order, 'equal');
  const paymentIntents = await createPaymentIntents(order, split.participants);
  // Process payments with Stripe
  // Update payment status in database
  return paymentIntents;
};
