import { Stripe } from '@stripe/stripe-react-native';
import { createPaymentIntent, confirmPaymentIntent } from './api/stripeApi';
import { updateOrderStatus, updatePaymentStatus } from '../lib/database';

export const calculateSplit = (order, splitType = 'equal', customRules = []) => {
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
  } else if (splitType === 'custom' && customRules.length > 0) {
    // Initialize participant amounts
    const participantAmounts = order.participants.reduce((acc, participant) => {
      acc[participant.id] = 0;
      return acc;
    }, {});

    // Process item-based rules first
    const itemRules = customRules.filter(rule => rule.items);
    const processedItems = new Set();

    itemRules.forEach(rule => {
      rule.items.forEach(itemName => {
        const matchingItems = order.items.filter(item =>
          item.name.toLowerCase().includes(itemName.toLowerCase()) &&
          !processedItems.has(item.id)
        );

        matchingItems.forEach(item => {
          const itemTotal = item.price * item.quantity;
          participantAmounts[rule.participantId] += itemTotal;
          processedItems.add(item.id);
        });
      });
    });

    // Process percentage rules
    const percentageRules = customRules.filter(rule => rule.percentage);
    const remainingTotal = grandTotal - Object.values(participantAmounts).reduce((sum, amount) => sum + amount, 0);

    percentageRules.forEach(rule => {
      participantAmounts[rule.participantId] += remainingTotal * rule.percentage;
    });

    // Distribute remaining amount equally among participants not covered by rules
    const coveredParticipants = new Set([
      ...itemRules.map(rule => rule.participantId),
      ...percentageRules.map(rule => rule.participantId)
    ]);

    const uncoveredParticipants = order.participants.filter(p => !coveredParticipants.has(p.id));
    const remainingAmount = grandTotal - Object.values(participantAmounts).reduce((sum, amount) => sum + amount, 0);

    if (uncoveredParticipants.length > 0) {
      const perPersonRemaining = remainingAmount / uncoveredParticipants.length;
      uncoveredParticipants.forEach(participant => {
        participantAmounts[participant.id] += perPersonRemaining;
      });
    }

    return {
      total: grandTotal,
      perPerson: grandTotal / order.participants.length,
      participants: order.participants.map(participant => ({
        ...participant,
        amount: participantAmounts[participant.id],
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

export const processPayments = async (order, splitType = 'equal', customRules = []) => {
  try {
    const split = calculateSplit(order, splitType, customRules);

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

export const processReimbursement = async (orderId) => {
  try {
    // Get order details from database
    const order = await getOrderById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Calculate reimbursement amounts
    const split = calculateSplit(order, order.splitType, order.customRules);

    // Process reimbursements for each participant
    for (const participant of split.participants) {
      if (!participant.isOrganizer) {
        // Create transfer to participant's bank account
        const transfer = await createTransfer(
          Math.round(participant.amount * 100),
          participant.stripeCustomerId
        );

        // Update payment status in database
        await updatePaymentStatus(orderId, participant.id, {
          status: 'reimbursed',
          transferId: transfer.id,
          amount: participant.amount
        });
      }
    }

    // Update order status to completed
    await updateOrderStatus(orderId, 'completed');

    return {
      success: true,
      message: 'Reimbursements processed successfully',
      orderId
    };
  } catch (error) {
    console.error('Error processing reimbursement:', error);
    throw error;
  }
};

const createTransfer = async (amount, destination) => {
  try {
    const response = await fetch('https://your-backend-api.com/create-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        destination,
        currency: 'usd',
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw error;
  }
};
