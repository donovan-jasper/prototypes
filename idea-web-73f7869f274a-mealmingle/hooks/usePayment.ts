import { useState } from 'react';
import { createPayment, fetchPayments } from '../lib/database';
import { processPayments, confirmPayment } from '../lib/stripe';

export const usePayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const createNewPayment = async (payment) => {
    setLoading(true);
    return new Promise((resolve) => {
      createPayment(payment, (newPayment) => {
        setPayments([...payments, newPayment]);
        setLoading(false);
        resolve(newPayment);
      });
    });
  };

  const loadPayments = (orderId) => {
    setLoading(true);
    fetchPayments(orderId, (fetchedPayments) => {
      setPayments(fetchedPayments);
      setLoading(false);
    });
  };

  const processOrderPayment = async (order) => {
    setLoading(true);
    try {
      const result = await processPayments(order);

      // In a real app, you would:
      // 1. Save the payment intents to your database
      // 2. Update the order status
      // 3. Handle any errors that occur during payment processing

      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const confirmOrderPayment = async (paymentIntentClientSecret, paymentMethodId) => {
    setLoading(true);
    try {
      const paymentIntent = await confirmPayment(paymentIntentClientSecret, paymentMethodId);

      // In a real app, you would:
      // 1. Update the payment status in your database
      // 2. Handle the payment confirmation response

      setLoading(false);
      return paymentIntent;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const setupPaymentMethod = async (paymentMethodId) => {
    setLoading(true);
    try {
      // In a real app, you would:
      // 1. Save the payment method to your backend
      // 2. Associate it with the current user

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    payments,
    loading,
    createPayment: createNewPayment,
    fetchPayments: loadPayments,
    processPayment: processOrderPayment,
    confirmPayment: confirmOrderPayment,
    setupPaymentMethod,
  };
};
