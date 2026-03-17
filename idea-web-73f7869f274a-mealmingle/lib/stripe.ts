import { Stripe } from '@stripe/stripe-react-native';

const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');

export const calculateSplit = (order, splitType) => {
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = total * 0.08; // Assuming 8% tax
  const tip = total * 0.15; // Assuming 15% tip
  const deliveryFee = 5.00; // Fixed delivery fee
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
  // Add custom split logic here
  return null;
};

export const createPaymentIntents = async (order, participants) => {
  const paymentIntents = [];
  for (const participant of participants) {
    try {
      const paymentIntent = await stripe.createPaymentIntent({
        amount: Math.round(participant.amount * 100), // Stripe uses cents
        currency: 'usd',
        paymentMethodType: 'Card',
      });
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

    // In a real app, you would confirm each payment intent with the payment method
    // and handle the responses

    // Update payment status in database
    return {
      status: 'success',
      paymentIntents,
      split
    };
  } catch (error) {
    console.error('Error processing payments:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentClientSecret, paymentMethodId) => {
  try {
    const { paymentIntent, error } = await stripe.confirmPaymentIntent({
      clientSecret: paymentIntentClientSecret,
      paymentMethodId: paymentMethodId,
    });

    if (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }

    return paymentIntent;
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    throw error;
  }
};
